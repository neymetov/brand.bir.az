'use client';

import { useNode } from '@craftjs/core';
import { LibraryFilePicker } from '@/components/blocks/shared/LibraryFilePicker';
import type { FileListDraftProps } from './types';
import styles from './FileListSettings.module.scss';

// Панель настроек блока «Файлы»: заголовок, описание и плоский список файлов.
// Рубрик и папок здесь нет — тем блок и отличается от файлового менеджера.

const PICKER_LABELS = {
  choose: 'Выбрать файл',
  chosen: 'Файл выбран',
  empty: 'В медиатеке нет файлов',
  placeholder: 'https://…/document.pdf',
};

export function FileListSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as FileListDraftProps }));

  const files = props.files ?? [];

  const patchFiles = (update: (list: FileListDraftProps['files']) => FileListDraftProps['files']) => {
    setProp((draft: FileListDraftProps) => {
      // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
      draft.files = update(draft.files ?? []);
    });
  };

  return (
    <div className={styles.panel}>
      <label className={styles.field} htmlFor="fl-title">
        <span className={styles.legend}>Заголовок</span>
        <input
          id="fl-title"
          className={styles.input}
          value={props.title ?? ''}
          onChange={(event) => setProp((draft: FileListDraftProps) => {
            // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
            draft.title = event.target.value;
          })}
        />
      </label>

      <label className={styles.field} htmlFor="fl-description">
        <span className={styles.legend}>Описание</span>
        <textarea
          id="fl-description"
          className={styles.textarea}
          value={props.description ?? ''}
          onChange={(event) => setProp((draft: FileListDraftProps) => {
            // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
            draft.description = event.target.value;
          })}
        />
      </label>

      <fieldset className={styles.field}>
        <legend className={styles.legend}>Файлы</legend>
        {files.map((file, index) => (
          // eslint-disable-next-line react/no-array-index-key -- порядок задаёт админ
          <div className={styles.fileRow} key={index}>
            <input
              className={styles.input}
              value={file.name ?? ''}
              aria-label={`Имя файла ${index + 1}`}
              placeholder="Имя файла с расширением"
              onChange={(event) => patchFiles((list) => list.map((item, i) => (
                i === index ? { ...item, name: event.target.value } : item
              )))}
            />
            <LibraryFilePicker
              kind="file"
              index={index}
              url={file.url}
              labels={PICKER_LABELS}
              onSelect={(picked) => patchFiles((list) => list.map((item, i) => (i === index ? {
                ...item,
                url: picked.url,
                id: picked.id,
                // Имя из медиатеки подставляем, только если админ его не
                // вписал — иначе затрём осмысленное название.
                name: item.name || picked.name,
              } : item)))}
            />
            <button
              type="button"
              className={styles.remove}
              aria-label={`Удалить файл ${index + 1}`}
              onClick={() => patchFiles((list) => list.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.add}
          onClick={() => patchFiles((list) => [...list, {}])}
        >
          + файл
        </button>
      </fieldset>
    </div>
  );
}
