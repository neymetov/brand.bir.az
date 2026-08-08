import type { MediaImage } from '@/components/blocks/MediaBlock/types';

// Галерея скриншотов приложений (Figma node 270:2402): сетка вертикальных
// экранов, увеличение в оверлее, листание и скачивание файла.
//
// Скриншот — это тот же MediaImage, что и в MediaBlock: id из медиатеки
// Strapi + url + alt. Заводить свой почти такой же тип значило бы чинить
// протухание presigned-ссылок дважды.
export type Screenshot = MediaImage;

export interface AppScreenshotsProps {
  readonly title?: string;
  readonly description?: string;
  readonly screenshots?: readonly Screenshot[];
  /**
   * Открывать ли просмотр по клику. В редакторе выключается: там клик по
   * карточке должен выделять блок для настройки, а не запускать лайтбокс
   * поверх интерфейса. Рантайм-флаг, в Strapi не хранится.
   */
  readonly interactive?: boolean;
}

/** Изменяемая версия для immer-черновика craft.js (см. MediaBlock/types.ts). */
export interface AppScreenshotsDraftProps {
  title?: string;
  description?: string;
  screenshots?: Screenshot[];
}

/**
 * Пропорции карточки из макета (262×567). Держим одним значением: и сетка,
 * и плейсхолдер пустой карточки должны совпадать.
 */
export const SCREENSHOT_RATIO = '262 / 567';

/**
 * Имя файла для скачивания. Из URL, потому что альтернативы нет: alt —
 * это описание для скринридера, оно может быть с пробелами и кириллицей.
 */
export function downloadName(screenshot: Screenshot, index: number): string {
  const fromUrl = screenshot.src?.split('/').pop()?.split('?')[0];
  return fromUrl || `screenshot-${index + 1}`;
}
