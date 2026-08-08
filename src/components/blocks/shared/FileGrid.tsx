import { Icon } from '@/components/icons/Icon';
import { fileIcon, type FileEntry } from './fileEntry';
import styles from './FileGrid.module.scss';

// Сетка карточек файлов (Figma 300:5940 / 300:7061) — одна на два блока:
// файловый менеджер показывает ею содержимое папки, блок «Файлы» — весь свой
// список. Своя копия карточки в каждом блоке разошлась бы при первой же
// правке дизайна.

export function FileCard({ file }: { readonly file: FileEntry }) {
  return (
    <article className={styles.card}>
      {/* fit="contain": иконки типов экспортированы из разных по размеру
          коробок, в натуральную величину они выглядели бы разного кегля. */}
      <Icon name={fileIcon(file.name)} size={42} fit="contain" className={styles.icon} />

      <div className={styles.footer}>
        <h3 className={styles.name}>{file.name ?? 'Untitled'}</h3>
        {/* download на <a> — просьба к браузеру сохранить файл, а не открыть.
            Для файла с чужого домена браузер её проигнорирует и просто
            откроет ссылку: это ограничение самого атрибута, не ошибка. */}
        <a className={styles.download} href={file.url ?? '#'} download>
          <Icon name="download-04" size={20} />
          <span>Download</span>
        </a>
      </div>
    </article>
  );
}

export function FileGrid({ files }: { readonly files: readonly FileEntry[] }) {
  return (
    <div className={styles.grid}>
      {files.map((file, index) => (
        // eslint-disable-next-line react/no-array-index-key -- порядок задаёт админ
        <FileCard key={index} file={file} />
      ))}
    </div>
  );
}
