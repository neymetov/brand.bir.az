// Палитра цветов бренда (Figma node 254:2484 / 254:2641).
//
// Имя блока — ColorPalette, а не ColorPicker: «picker» в интерфейсе означает
// выбор значения (как MediaPicker выбирает файл), а здесь — витрина цветов
// с копированием их значений. В Figma слои тоже называются color-palette-*.

/** Размер карточек: big — сетка по 3, small — по 4 (как в макете). */
export type PaletteSize = 'big' | 'small';

/**
 * Одна запись значения цвета. Формат НЕ фиксирован набором HEX/PMS/CMYK:
 * админ заводит любые пары «подпись — значение», иначе добавление, скажем,
 * RAL или RGB требовало бы правки кода.
 */
export interface ColorFormat {
  /** Подпись формата: HEX, PMS, CMYK, RAL… */
  readonly label?: string;
  /** Значение в этом формате — оно и копируется по кнопке. */
  readonly value?: string;
}

export interface ColorSwatch {
  readonly name?: string;
  /** Заливка карточки. Любое валидное CSS-значение цвета. */
  readonly color?: string;
  readonly formats?: readonly ColorFormat[];
}

export interface ColorPaletteProps {
  readonly title?: string;
  readonly description?: string;
  readonly size?: PaletteSize;
  readonly colors?: readonly ColorSwatch[];
}

/** Изменяемая версия для immer-черновика craft.js (см. MediaBlock/types.ts). */
export interface ColorPaletteDraftProps {
  title?: string;
  description?: string;
  size?: PaletteSize;
  colors?: ColorSwatch[];
}

/**
 * Разбирает только hex — этого достаточно, потому что яркость нужна для
 * выбора контрастной подписи, а не для точного цвета. Для значений в других
 * нотациях (rgb(), color-mix()…) вернём null и оставим светлый текст:
 * лучше не угадывать, чем угадать неверно.
 */
function parseColor(value?: string): [number, number, number] | null {
  if (!value) return null;

  const hex = value.trim().replace(/^#/, '');
  const full = hex.length === 3
    ? hex.split('').map((char) => char + char).join('')
    : hex;

  if (!/^[0-9a-f]{6}$/i.test(full)) return null;

  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/**
 * Цвет подписей на карточке. В макете текст всегда белый, но там и образцы
 * тёмные; на светлом цвете (а «Birbank White» в палитре есть) белым по
 * белому не прочитать ничего. Поэтому цвет выбирается по яркости фона —
 * иначе часть палитры оказалась бы нечитаемой.
 *
 * Порог 0.6 по относительной яркости (WCAG-формула): выше — тёмный текст.
 */
export function readableTextColor(background?: string): 'light' | 'dark' {
  const rgb = parseColor(background);
  if (!rgb) return 'light';

  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? 'dark' : 'light';
}

/** Нормализует ввод админа: `ff0039` и `#ff0039` — одно и то же. */
export function normalizeColor(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(trimmed) ? `#${trimmed}` : trimmed;
}
