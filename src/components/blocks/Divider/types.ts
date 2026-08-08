// Разделитель между блоками (Figma node 264:3300). В макете — линия
// #D1D5DB (это токен --bb-border-quaternary) с отступом 8px сверху и снизу.

/** Сколько воздуха разделитель добавляет между соседними блоками. */
export type DividerSpacing = 'compact' | 'regular' | 'roomy';

export interface DividerProps {
  readonly spacing?: DividerSpacing;
  /**
   * Показывать саму линию. Выключенный вариант — просто пустой промежуток:
   * иногда между блоками нужен воздух, а не видимая граница, и заводить
   * ради этого второй блок было бы лишним.
   */
  readonly line?: boolean;
}

/** Изменяемая версия для immer-черновика craft.js (см. MediaBlock/types.ts). */
export interface DividerDraftProps {
  spacing?: DividerSpacing;
  line?: boolean;
}

export const SPACING_LABELS: Record<DividerSpacing, string> = {
  compact: 'Компактный',
  regular: 'Обычный',
  roomy: 'Просторный',
};
