'use client';

import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import styles from './RichTextEditor.module.scss';

// Минималистичный редактор форматированного текста для панели настроек.
//
// На contentEditable + document.execCommand, без сторонней библиотеки
// редактора: набор форматирования маленький (жирный, курсив, подчёркивание,
// зачёркивание, ссылка, код, регистр), а Tiptap/Slate/Lexical добавили бы
// сотни килобайт и собственную модель документа ради этого набора.
//
// execCommand формально помечен устаревшим, но поддерживается всеми
// браузерами и остаётся единственным способом форматировать выделение без
// своей модели документа. Грязь, которую он оставляет (<font>, style,
// вложенные <b>), отсекается дважды: DOMPurify на выходе редактора и белый
// список тегов при рендере (см. lib/richText.tsx).

// `div` в списке обязателен, хотя сам блок его не рисует. contentEditable по
// Enter строит именно <div> (проверено в Chrome: `one<div>two</div>`), а
// DOMPurify выбрасывает неразрешённый тег, СОХРАНЯЯ его содержимое — три
// абзаца превращались в одну слипшуюся строку. При рендере div всё равно
// становится <p> (см. TAG_ALIASES в lib/richText.tsx).
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'code', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href'],
};

interface RichTextEditorProps {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly id: string;
}

export function RichTextEditor({ value, onChange, id }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Что мы сами в последний раз отдали наружу. Нужно, чтобы отличить
  // «значение поменяли снаружи» от эха собственной правки — см. эффект ниже.
  const lastEmitted = useRef<string | null>(null);

  // По Enter contentEditable в Chrome создаёт <div>, а не абзац. Просим
  // абзац: тогда текст хранится так же, как его рисует блок, и не зависит от
  // того, попал ли div в белый список. Команда действует на весь документ,
  // поэтому вызывается один раз.
  useEffect(() => {
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }, []);

  // Содержимое задаётся напрямую в DOM, а не через React: если рендерить
  // value как children, React переписывал бы узлы на каждый ввод и курсор
  // прыгал бы в начало. Синхронизируем только когда значение изменилось
  // снаружи (выбрали другой блок, отменили правку).
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Значение вернулось эхом нашего же onChange — DOM трогать нельзя.
    // Раньше этой проверки не было, и любое расхождение между разметкой
    // браузера и результатом DOMPurify заставляло переписать innerHTML прямо
    // во время набора: каретка улетала в начало, и текст набирался задом
    // наперёд («ретья строкаВторая строкаТПервая строка»).
    if (value === lastEmitted.current) return;

    // Санитизация и на входе тоже: value может прийти из CMS, минуя наш
    // редактор, и тогда чужая разметка оказалась бы в DOM панели настроек.
    const safe = DOMPurify.sanitize(value, SANITIZE_CONFIG);
    if (editor.innerHTML !== safe) {
      // Значение уже прошло DOMPurify строкой выше; правило не отслеживает
      // санитизацию через промежуточную переменную.
      // eslint-disable-next-line no-unsanitized/property
      editor.innerHTML = safe;
    }
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = DOMPurify.sanitize(editor.innerHTML, SANITIZE_CONFIG);
    lastEmitted.current = html;
    onChange(html);
  };

  const exec = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emitChange();
  };

  const addLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      // Без выделения ссылке не к чему прикрепиться — молча ничего не делать
      // хуже, чем сказать почему.
      // eslint-disable-next-line no-alert
      window.alert('Выделите текст, который станет ссылкой');
      return;
    }

    // eslint-disable-next-line no-alert
    const href = window.prompt('Адрес ссылки', 'https://');
    if (!href) return;
    exec('createLink', href);
  };

  const toUpperCase = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    // Регистр меняем в самом тексте, а не стилем: text-transform не
    // переживёт копирование текста со страницы, а капс в документации
    // обычно нужен именно в содержимом.
    exec('insertText', selection.toString().toUpperCase());
  };

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.tool} onClick={() => exec('bold')} title="Жирный" aria-label="Жирный">
          <span className={styles.bold}>B</span>
        </button>
        <button type="button" className={styles.tool} onClick={() => exec('italic')} title="Курсив" aria-label="Курсив">
          <span className={styles.italic}>I</span>
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={() => exec('underline')}
          title="Подчёркнутый"
          aria-label="Подчёркнутый"
        >
          <span className={styles.underline}>U</span>
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={() => exec('strikeThrough')}
          title="Зачёркнутый"
          aria-label="Зачёркнутый"
        >
          <span className={styles.strike}>S</span>
        </button>

        <span className={styles.separator} aria-hidden="true" />

        <button type="button" className={styles.tool} onClick={addLink} title="Ссылка" aria-label="Ссылка">
          🔗
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={() => exec('insertUnorderedList')}
          title="Список"
          aria-label="Маркированный список"
        >
          ≡
        </button>
        <button type="button" className={styles.tool} onClick={toUpperCase} title="ПРОПИСНЫЕ" aria-label="Прописные">
          AA
        </button>

        <span className={styles.separator} aria-hidden="true" />

        <button
          type="button"
          className={styles.tool}
          onClick={() => exec('removeFormat')}
          title="Убрать форматирование"
          aria-label="Убрать форматирование"
        >
          Tx
        </button>
      </div>

      <div
        id={id}
        ref={editorRef}
        className={styles.surface}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Текст"
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        // Вставка из Word/страницы тащит стили и чужие теги — берём только
        // текст, форматирование пользователь наложит кнопками.
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
      />
    </div>
  );
}
