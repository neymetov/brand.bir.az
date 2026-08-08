import type { FileEntry } from '@/components/blocks/shared/fileEntry';

// FileEntry и fileIcon живут в shared: их использует и блок «Файлы».
export type { FileEntry } from '@/components/blocks/shared/fileEntry';

// Файловый менеджер (Figma nodes 300:5940 — папки, 300:7061 — внутренность).
//
// Дерево: рубрика (таб) → папки → вложенные папки → файлы. Вложенность
// произвольной глубины: как только внутри папки появились крошки
// «Documents / Fonts / Fonts», ограничивать её одним уровнем стало нельзя.

export interface FileFolder {
  readonly name?: string;
  readonly folders?: readonly FileFolder[];
  readonly files?: readonly FileEntry[];
}

export interface FileTab {
  readonly label?: string;
  readonly folders?: readonly FileFolder[];
  readonly files?: readonly FileEntry[];
}

export interface FileManagerProps {
  readonly title?: string;
  readonly description?: string;
  readonly tabs?: readonly FileTab[];
  /**
   * Где сейчас «стоит» редактор: рубрика и путь по папкам.
   *
   * Нужны только в админке и в Strapi НЕ уезжают (как `interactive` у
   * AppScreenshots). Без них панель настроек и холст жили каждый со своим
   * выбором: админ выбирал рубрику в панели, добавлял папку — а на холсте
   * оставалась открытой другая рубрика, и папка «пропадала».
   */
  readonly viewTab?: number;
  readonly viewPath?: readonly number[];
  readonly onViewChange?: (tab: number, path: readonly number[]) => void;
}

export interface FileManagerDraftProps {
  title: string;
  description: string;
  tabs: FileTab[];
  /** Позиция редактора — см. FileManagerProps.viewTab. В CMS не уезжает. */
  viewTab: number;
  viewPath: readonly number[];
}

/** Сколько файлов внутри папки, вместе с вложенными. */
export function countFiles(folder: FileFolder): number {
  const own = folder.files?.length ?? 0;
  const nested = (folder.folders ?? []).reduce((sum, child) => sum + countFiles(child), 0);
  return own + nested;
}

export interface FolderView {
  readonly folders: readonly FileFolder[];
  readonly files: readonly FileEntry[];
  /** Цепочка открытых папок — из неё строятся крошки. */
  readonly trail: readonly FileFolder[];
}

/**
 * Спуск по дереву до открытой папки.
 *
 * Путь — массив индексов, а не имён: имена папок админ меняет, и «текущая
 * папка» не должна теряться от переименования. Возвращает null, если путь
 * больше не существует (папку удалили в редакторе, пока она была открыта).
 */
export function resolvePath(
  tab: FileTab | undefined,
  path: readonly number[],
): FolderView | null {
  if (!tab) return null;

  return path.reduce<FolderView | null>((view, index) => {
    if (!view) return null;
    const next = view.folders[index];
    if (!next) return null;

    return {
      folders: next.folders ?? [],
      files: next.files ?? [],
      trail: [...view.trail, next],
    };
  }, { folders: tab.folders ?? [], files: tab.files ?? [], trail: [] });
}
