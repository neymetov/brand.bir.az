import type { FileEntry } from '@/components/blocks/shared/fileEntry';

export type { FileEntry } from '@/components/blocks/shared/fileEntry';

// Блок «Файлы» — та же файловая часть, что у файлового менеджера, но без
// рубрик и папок: плоский список для раздела, где раскладывать нечего.
export interface FileListProps {
  readonly title?: string;
  readonly description?: string;
  readonly files?: readonly FileEntry[];
}

export interface FileListDraftProps {
  title: string;
  description: string;
  files: FileEntry[];
}
