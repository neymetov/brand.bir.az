import { renderRichText } from '@/lib/richText';
import { FileGrid } from '@/components/blocks/shared/FileGrid';
import type { FileListProps } from './types';
import styles from './FileList.module.scss';

// Плоский список скачиваемых файлов. Карточка и сетка — общие с файловым
// менеджером (FileGrid): один и тот же файл не должен выглядеть по-разному
// в зависимости от того, каким блоком его положили на страницу.
//
// Клиентского состояния здесь нет — в отличие от менеджера, где есть рубрики
// и путь по папкам, поэтому блок остаётся серверным компонентом.
export function FileList({ title, description, files = [] }: FileListProps) {
  return (
    <section className={styles.list}>
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? (
            <div className={styles.description}>{renderRichText(description)}</div>
          ) : null}
        </header>
      ) : null}

      {files.length > 0 ? (
        <FileGrid files={files} />
      ) : (
        <p className={styles.empty}>No files yet.</p>
      )}
    </section>
  );
}
