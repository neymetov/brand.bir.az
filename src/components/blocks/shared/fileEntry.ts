import type { DashboardIconName } from '@/components/icons/Icon';

// Файл и его иконка — общее для блоков, которые раздают файлы: файлового
// менеджера (папки внутри рубрик) и простого списка файлов.

export interface FileEntry {
  readonly name?: string;
  /** id файла в медиатеке — по нему ссылку можно перевыпустить (см. №20). */
  readonly id?: number;
  readonly url?: string;
}

/**
 * Иконка по расширению файла.
 *
 * Расширение, а не mime: mime приходит из медиатеки и в контенте не хранится,
 * а имя файла видно всегда — в том числе когда ссылку вписали руками.
 */
const ICON_BY_EXTENSION: Record<string, DashboardIconName> = {
  pdf: 'pdf-02',
  png: 'png-02',
  jpg: 'jpg-02',
  jpeg: 'jpg-02',
  svg: 'svg-02',
  ppt: 'ppt-02',
  pptx: 'ppt-02',
  mp4: 'mp4-02',
  mov: 'mp4-02',
  js: 'java-script',
  ai: 'adobe-illustrator',
  fig: 'figma',
};

export function fileIcon(name?: string): DashboardIconName {
  const extension = name?.split('.').pop()?.toLowerCase();
  // Неизвестный формат — обобщённый значок файла, а не пустое место: у
  // карточки должна быть узнаваемая шапка при любом расширении.
  return (extension && ICON_BY_EXTENSION[extension]) || 'file-02';
}
