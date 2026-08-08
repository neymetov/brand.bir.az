// Текстовый блок: заголовок, короткое описание, текст (Figma node 257:2978).
// Та же вёрстка, что была захардкожена в ContentDrawer, — теперь живёт
// здесь одним источником и переиспользуется публичной страницей и редактором.

export interface TextBlockProps {
  readonly title?: string;
  /** Короткое описание под заголовком. */
  readonly description?: string;
  /**
   * Текст с форматированием: жирный, курсив, подчёркивание, зачёркивание,
   * ссылки, списки. Хранится разметкой, но в DOM строкой не попадает —
   * renderRichText разбирает её и пропускает только теги из белого списка
   * (lib/richText.tsx), так что вредная разметка из CMS не выполнится.
   *
   * Обычный текст со старых версий блока (абзацы через пустую строку)
   * поддерживается тем же рендером — контент переписывать не нужно.
   */
  readonly body?: string;
}

/** Изменяемая версия для immer-черновика craft.js (см. MediaBlock/types.ts). */
export interface TextBlockDraftProps {
  title?: string;
  description?: string;
  body?: string;
}

/** Разбивает текст на абзацы по пустой строке. */
export function toParagraphs(body?: string): readonly string[] {
  if (!body) return [];
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
