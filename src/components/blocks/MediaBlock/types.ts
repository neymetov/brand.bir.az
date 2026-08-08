// Единый медиа-блок вместо четырёх отдельных: все варианты из макета
// (Figma node 247:2020) — это комбинация двух независимых переключателей,
// поэтому редактор меняет вид блока настройкой, а не пересозданием.
//
//              одиночный          карусель
//   16:9       wide-image         carousel-wide-images
//   два 1:1    separate-images    carousel-rectangular-images

/** Раскладка одного слайда: одно широкое изображение или пара квадратных. */
export type MediaLayout = 'wide' | 'pair';

export interface MediaImage {
  /**
   * id файла в медиатеке Strapi. Хранится ВСЕГДА, даже когда известен url:
   * у приватного бакета ссылка presigned и протухает, поэтому единственное
   * долговечное, что можно положить в контент, — это идентификатор, по
   * которому ссылку всегда можно перевыпустить (см. lib/strapi/media.ts).
   */
  readonly id?: number;
  /**
   * Ссылка на файл. Для публичного бакета — постоянная и достаточна сама по
   * себе; для приватного — снимок presigned-ссылки на момент сохранения,
   * годный только как быстрый путь, пока не истёк. Пустая — плейсхолдер.
   */
  readonly src?: string;
  /** Пустая строка = декоративное изображение (осознанно, не забытый alt). */
  readonly alt?: string;
}

export interface MediaBlockProps {
  readonly layout?: MediaLayout;
  /** Показывать индикаторы-номера и листать слайды. */
  readonly carousel?: boolean;
  /**
   * Плоский список — на слайды режется по layout (wide → по 1, pair → по 2).
   * Так редактору достаточно пополнять одну коллекцию, а смена раскладки
   * не требует перекладывать изображения между слайдами.
   */
  readonly images?: readonly MediaImage[];
}

/**
 * Та же форма, но изменяемая: craft.js правит props через immer-черновик
 * (`setProp((props) => { props.x = ... })`), поэтому readonly-версия там не
 * подходит. Публичный MediaBlockProps остаётся readonly.
 */
export interface MediaBlockDraftProps {
  layout?: MediaLayout;
  carousel?: boolean;
  images?: MediaImage[];
}

export const imagesPerSlide: Record<MediaLayout, number> = {
  wide: 1,
  pair: 2,
};

/** Режет плоский список изображений на слайды по текущей раскладке. */
export function toSlides(
  images: readonly MediaImage[],
  layout: MediaLayout,
): readonly (readonly MediaImage[])[] {
  const perSlide = imagesPerSlide[layout];
  const slides: MediaImage[][] = [];

  for (let i = 0; i < images.length; i += perSlide) {
    slides.push(images.slice(i, i + perSlide));
  }

  // Пустой блок (только что добавлен в редакторе) всё равно должен что-то
  // показывать — иначе его не видно и не выделить мышью.
  return slides.length > 0 ? slides : [Array.from({ length: perSlide }, () => ({}))];
}
