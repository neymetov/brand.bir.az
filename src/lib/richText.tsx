import type { ReactNode } from 'react';
import parse, {
  domToReact,
  Element,
  Text,
  type DOMNode,
  type HTMLReactParserOptions,
} from 'html-react-parser';

// Рендер форматированного текста из CMS.
//
// Здесь НЕ используется dangerouslySetInnerHTML — даже с санитизацией.
// Вместо этого HTML разбирается в дерево, и в React попадают только теги из
// белого списка ниже; всё остальное (script, style, iframe, on*-атрибуты,
// произвольные классы) отбрасывается на уровне разбора. Так безопасность не
// зависит от того, прошли ли данные через наш редактор: контент может
// прийти прямо из Strapi, из импорта или из чужой правки в CMS.
//
// §1 ТЗ допускает и вариант «санитизировать DOMPurify», но DOMPurify
// требует DOM и на сервере тянет jsdom; разбор парсером изоморфен.

/** Теги, которые разрешено выводить. Всё прочее превращается в текст. */
const ALLOWED_TAGS = new Set([
  'p', 'br',
  'strong', 'em', 'u', 's', 'code',
  'a',
  'ul', 'ol', 'li',
]);

/**
 * Теги, которые выбрасываются вместе с содержимым. Для остальных
 * неразрешённых тегов содержимое сохраняется (это обычно текст), но здесь
 * внутри — код, и показывать его как текст незачем.
 */
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript']);

/** Синонимы, которые execCommand и вставка из Word/Google Docs оставляют. */
const TAG_ALIASES: Record<string, string> = {
  b: 'strong',
  i: 'em',
  strike: 's',
  del: 's',
  ins: 'u',
  div: 'p',
};

/**
 * Разрешённые схемы ссылок. Без этой проверки в href мог бы оказаться
 * `javascript:` — классический способ выполнить код по клику.
 */
function safeHref(href?: string): string | undefined {
  if (!href) return undefined;
  const value = href.trim();

  // Относительные и якорные ссылки безопасны и нужны для переходов внутри сайта.
  if (value.startsWith('/') || value.startsWith('#')) return value;

  return /^(https?:|mailto:|tel:)/i.test(value) ? value : undefined;
}

function isExternal(href: string): boolean {
  return /^https?:/i.test(href);
}

const options: HTMLReactParserOptions = {
  replace: (node) => {
    if (!(node instanceof Element)) return undefined;

    const tag = TAG_ALIASES[node.name] ?? node.name;

    // Пустой фрагмент = ничего не рендерить; replace обязан вернуть элемент.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    if (DROP_WITH_CONTENT.has(node.name)) return <></>;

    // Неразрешённый тег не удаляем целиком — иначе пропал бы текст внутри;
    // отдаём только его содержимое.
    if (!ALLOWED_TAGS.has(tag)) {
      // Фрагмент здесь обязателен: replace должен вернуть элемент, а не
      // произвольный ReactNode.
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return <>{domToReact(node.children as DOMNode[], options)}</>;
    }

    if (tag === 'a') {
      const href = safeHref(node.attribs?.href);
      const children = domToReact(node.children as DOMNode[], options);

      // Ссылка с недопустимой схемой становится обычным текстом.
      // eslint-disable-next-line react/jsx-no-useless-fragment
      if (!href) return <>{children}</>;

      const external = isExternal(href);

      return (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          // noopener обязателен: без него открытая вкладка получает доступ
          // к window.opener и может подменить исходную страницу.
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    }

    // Все атрибуты отбрасываются: у разрешённых тегов нет ни одного, который
    // был бы нужен контенту, а style/class/on* — как раз то, чем злоупотребляют.
    const Tag = tag as keyof JSX.IntrinsicElements;
    if (tag === 'br') return <br />;

    return <Tag>{domToReact(node.children as DOMNode[], options)}</Tag>;
  },
};

/** Есть ли в строке разметка — чтобы отличить её от старого plain-текста. */
export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/**
 * Одиночные переносы внутри абзаца — это <br>, а не пробел.
 *
 * HTML схлопывает любой перенос строки в пробел, поэтому в обычном тексте
 * (вставка из письма, импорт, контент старого формата) разбиение на строки
 * пропадало: пустая строка давала абзац, а одиночный Enter — ничего.
 */
function withLineBreaks(paragraph: string): ReactNode[] {
  return paragraph.split('\n').flatMap((line, index) => (
    // Строки внутри абзаца не переставляются — индекс устойчивее содержимого.
    /* eslint-disable react/no-array-index-key */
    index === 0 ? [line] : [<br key={`br-${index}`} />, line]
    /* eslint-enable react/no-array-index-key */
  ));
}

/**
 * Превращает сохранённый текст в React-дерево.
 *
 * Поддерживает оба формата: разметку из редактора и обычный текст, который
 * блок хранил раньше (абзацы разделены пустой строкой). Иначе весь уже
 * введённый контент слипся бы в один абзац.
 */
export function renderRichText(value?: string): ReactNode {
  if (!value) return null;

  if (!looksLikeHtml(value)) {
    return value
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      // Абзацы обычного текста не переупорядочиваются и могут повторяться —
      // индекс здесь устойчивее ключа из содержимого.
      // eslint-disable-next-line react/no-array-index-key
      .map((paragraph, index) => <p key={index}>{withLineBreaks(paragraph)}</p>);
  }

  return parse(value, options);
}

/** Текст без разметки — для мест, где формат неуместен (например, alt). */
export function richTextToPlain(value?: string): string {
  if (!value) return '';
  if (!looksLikeHtml(value)) return value;

  let plain = '';
  parse(value, {
    replace: (node) => {
      if (node instanceof Text) plain += node.data;
      return undefined;
    },
  });
  return plain.trim();
}
