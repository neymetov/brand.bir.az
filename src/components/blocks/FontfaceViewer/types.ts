// Витрина шрифта (Figma node 259:3101): строка параметров + образец,
// набранный этим самым шрифтом. Значения параметров копируются по клику.

export interface FontSpecimen {
  /** Отображаемое имя семейства: «Hal Matex». */
  readonly family?: string;
  /** Название начертания: «Bold», «Regular». Только подпись, не CSS. */
  readonly styleName?: string;
  /**
   * Файл шрифта из медиатеки Strapi. Как и в MediaBlock, храним id рядом с
   * url: у приватного бакета presigned-ссылка протухает, и единственное
   * долговечное — идентификатор.
   */
  readonly fontId?: number;
  readonly fontUrl?: string;
  readonly weight?: number;
  readonly fontSize?: number;
  readonly lineHeight?: number;
  /** В процентах от кегля — так эта величина задаётся в макете («-3%»). */
  readonly letterSpacing?: number;
  /** Строка-образец. Пустая — берётся общая для блока. */
  readonly sample?: string;
}

export interface FontfaceViewerProps {
  readonly specimens?: readonly FontSpecimen[];
  /** Общий образец для всех строк, если у строки нет своего. */
  readonly sample?: string;
}

/** Изменяемая версия для immer-черновика craft.js (см. MediaBlock/types.ts). */
export interface FontfaceViewerDraftProps {
  specimens?: FontSpecimen[];
  sample?: string;
}

export const DEFAULT_SAMPLE = 'Cibdə varsa pul';

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0; // eslint-disable-line no-bitwise
  }
  return Math.abs(hash).toString(36);
}

/**
 * Имя CSS-семейства, под которым шрифт регистрируется в браузере.
 * Уникально по id/url: два начертания одного семейства (Bold и Regular) —
 * это разные файлы, и под общим именем второй бы затёр первый.
 */
export function cssFamilyName(specimen: FontSpecimen): string | undefined {
  if (!specimen.fontUrl) return undefined;
  const key = specimen.fontId ?? hashString(specimen.fontUrl);
  return `bb-specimen-${key}`;
}

/** Значения, которые показываются в строке параметров и копируются по клику. */
export function specimenValues(specimen: FontSpecimen): readonly {
  readonly label: string;
  readonly value: string;
}[] {
  const values: { label: string; value: string }[] = [];

  if (specimen.fontSize != null) {
    values.push({ label: 'Fontsize:', value: String(specimen.fontSize) });
  }
  if (specimen.lineHeight != null) {
    values.push({ label: 'Line height:', value: String(specimen.lineHeight) });
  }
  if (specimen.letterSpacing != null) {
    values.push({ label: 'Letter spacing', value: `${specimen.letterSpacing}%` });
  }

  return values;
}
