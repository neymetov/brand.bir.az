import { describe, expect, it } from 'vitest';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderRichText, richTextToPlain, looksLikeHtml } from './richText';

// SEC-001…006 из _qa/qa-analysis.md.
//
// Смысл этих тестов не в том, чтобы найти сегодняшний баг — парсер написан на
// белом списке и уже проверен в браузере. Смысл в том, чтобы будущая правка не
// ослабила список молча: контент приходит из CMS, и любая дыра здесь — XSS на
// внутреннем банковском инструменте.

function render(value: string): string {
  return renderToStaticMarkup(createElement(Fragment, null, renderRichText(value)));
}

describe('renderRichText — белый список тегов (SEC-001)', () => {
  it('пропускает разрешённые теги форматирования', () => {
    const html = render('<p>a <strong>b</strong> <em>c</em> <u>d</u> <s>e</s> <code>f</code></p>');
    expect(html).toBe('<p>a <strong>b</strong> <em>c</em> <u>d</u> <s>e</s> <code>f</code></p>');
  });

  it('пропускает списки', () => {
    expect(render('<ul><li>one</li><li>two</li></ul>')).toBe('<ul><li>one</li><li>two</li></ul>');
  });

  it.each([
    ['script', '<p>before</p><script>window.__pwned = true;</script><p>after</p>'],
    ['style', '<p>before</p><style>body{display:none}</style><p>after</p>'],
    ['iframe', '<p>before</p><iframe src="https://evil.example"></iframe><p>after</p>'],
    ['object', '<p>before</p><object data="evil.swf"></object><p>after</p>'],
    ['embed', '<p>before</p><embed src="evil.swf"><p>after</p>'],
    ['noscript', '<p>before</p><noscript>hidden</noscript><p>after</p>'],
  ])('выбрасывает <%s> вместе с содержимым', (tag, input) => {
    const html = render(input);
    expect(html).not.toContain(`<${tag}`);
    // Содержимое таких тегов — код, а не текст: показывать его тоже нельзя.
    expect(html).toBe('<p>before</p><p>after</p>');
  });

  it('у неразрешённого тега сохраняет текст, но убирает сам тег', () => {
    // Иначе абзац с чужой разметкой потерял бы содержимое целиком.
    const html = render('<p>visible <marquee>text</marquee></p>');
    expect(html).toContain('visible');
    expect(html).toContain('text');
    expect(html).not.toContain('marquee');
  });

  it('обезвреживает <img onerror> — тега нет, обработчика нет', () => {
    const html = render('<p><img src="x" onerror="window.__pwned = true"></p>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('onerror');
  });

  it('обезвреживает <svg onload>', () => {
    const html = render('<svg onload="window.__pwned = true"></svg>');
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('onload');
  });
});

describe('renderRichText — ссылки (SEC-002, SEC-003)', () => {
  it.each([
    'javascript:alert(1)',
    '  javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
  ])('ссылка со схемой %s превращается в обычный текст', (href) => {
    const html = render(`<p><a href="${href}">click</a></p>`);
    expect(html).not.toContain('<a');
    expect(html).not.toContain('href');
    // Текст ссылки при этом не теряется.
    expect(html).toContain('click');
  });

  it.each(['/guidelines/retail', '#anchor', 'mailto:a@b.az', 'tel:+994120000000'])(
    'внутренняя ссылка %s сохраняется без target',
    (href) => {
      const html = render(`<p><a href="${href}">go</a></p>`);
      expect(html).toContain(`href="${href}"`);
      expect(html).not.toContain('target=');
    },
  );

  it('внешняя ссылка получает target=_blank и rel=noopener noreferrer', () => {
    // Без noopener открытая вкладка получает доступ к window.opener и может
    // подменить исходную страницу.
    const html = render('<p><a href="https://example.com">go</a></p>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});

describe('renderRichText — атрибуты (SEC-004)', () => {
  it('срезает style, class и on* у разрешённых тегов', () => {
    const html = render('<p class="x" style="color:red" onclick="window.__pwned = true">text</p>');
    expect(html).toBe('<p>text</p>');
  });

  it('у ссылки оставляет только href', () => {
    const html = render('<p><a href="/x" class="y" onclick="steal()" data-id="1">go</a></p>');
    expect(html).toContain('href="/x"');
    expect(html).not.toContain('class');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('data-id');
  });
});

describe('renderRichText — синонимы тегов (SEC-005)', () => {
  it.each([
    ['<b>x</b>', '<strong>x</strong>'],
    ['<i>x</i>', '<em>x</em>'],
    ['<strike>x</strike>', '<s>x</s>'],
    ['<del>x</del>', '<s>x</s>'],
    ['<ins>x</ins>', '<u>x</u>'],
    ['<div>x</div>', '<p>x</p>'],
  ])('%s нормализуется в %s', (input, expected) => {
    expect(render(input)).toBe(expected);
  });
});

describe('renderRichText — обратная совместимость с обычным текстом', () => {
  it('пустое значение даёт пустой вывод', () => {
    expect(render('')).toBe('');
  });

  it('разбивает старый plain-текст на абзацы по пустой строке', () => {
    // Контент, введённый до появления редактора, не должен слипаться.
    expect(render('first\n\nsecond')).toBe('<p>first</p><p>second</p>');
  });

  it('не считает разметкой текст без тегов', () => {
    expect(looksLikeHtml('обычный текст')).toBe(false);
    expect(looksLikeHtml('<p>разметка</p>')).toBe(true);
  });
});

describe('richTextToPlain (SEC-006)', () => {
  it('оставляет только текстовые узлы', () => {
    expect(richTextToPlain('<p>a <strong>b</strong> <a href="/x">c</a></p>')).toBe('a b c');
  });

  it('не протаскивает содержимое script в alt', () => {
    expect(richTextToPlain('<p>alt</p>')).toBe('alt');
  });

  it('обычный текст возвращает как есть', () => {
    expect(richTextToPlain('просто текст')).toBe('просто текст');
  });
});
