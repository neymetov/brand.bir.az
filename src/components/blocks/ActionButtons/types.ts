import type { DashboardIconName } from '@/components/icons/Icon';

// Кнопка действия (Figma node 257:3008). В макете 10 вариаций — Download,
// Go to, Copy JSON, Copy SVG, Download PDF/PNG/AI/PPTX, Check Figma, Check
// Drive — и пользователь предупредил, что список будет расти.
//
// Поэтому вариации НЕ перечисляются типом. Любая из них раскладывается на
// три независимые характеристики:
//
//   поведение (что делает клик) × иконка × позиция иконки
//
// «Download PDF» = скачивание + pdf-02 слева; «Go to» = переход +
// arrow-right справа; «Copy SVG» = копирование + svg-02 слева. Новая
// вариация — это новая комбинация в редакторе, а не новый код.

/** Что происходит по клику. Поведений всего три, и они закрывают все 10 вариаций. */
export type ActionKind = 'download' | 'link' | 'copy';

export interface ActionButtonItem {
  readonly label?: string;
  readonly icon?: DashboardIconName;
  /** В макете иконка слева у всех, кроме «Go to» — там стрелка справа. */
  readonly iconPosition?: 'leading' | 'trailing';
  readonly kind?: ActionKind;
  /** Адрес файла или страницы — для download и link. */
  readonly href?: string;
  /** Текст, который кладётся в буфер, — для copy. */
  readonly value?: string;
  /** Открывать в новой вкладке (внешние ссылки: Figma, Drive). */
  readonly newTab?: boolean;
}

export interface ActionButtonsProps {
  readonly buttons?: readonly ActionButtonItem[];
  /** В макете панель прижата вправо, но левое выравнивание тоже нужно. */
  readonly align?: 'left' | 'right';
}

/** Изменяемая версия для immer-черновика craft.js (см. MediaBlock/types.ts). */
export interface ActionButtonsDraftProps {
  buttons?: ActionButtonItem[];
  align?: 'left' | 'right';
}

/**
 * Иконки, доступные кнопке. Список открытый: чтобы добавить вариацию,
 * достаточно положить SVG в public/icons/dashboard и дописать строку сюда.
 */
interface ActionIconOption {
  readonly name: DashboardIconName;
  readonly title: string;
}

export const actionIcons: readonly ActionIconOption[] = [
  { name: 'download-04', title: 'Скачивание' },
  { name: 'arrow-right-02-round', title: 'Стрелка' },
  { name: 'java-script', title: 'JSON' },
  { name: 'svg-02', title: 'SVG' },
  { name: 'pdf-02', title: 'PDF' },
  { name: 'png-02', title: 'PNG' },
  { name: 'ppt-02', title: 'PPTX' },
  { name: 'adobe-illustrator', title: 'Illustrator' },
  { name: 'figma', title: 'Figma' },
  { name: 'google-drive', title: 'Google Drive' },
  { name: 'copy-01', title: 'Копирование' },
];

/**
 * Внешняя ли ссылка. Внешним нужен rel="noopener noreferrer": без noopener
 * открытая вкладка получает доступ к window.opener и может подменить
 * исходную страницу.
 */
export function isExternalHref(href?: string): boolean {
  return Boolean(href && /^https?:\/\//i.test(href));
}
