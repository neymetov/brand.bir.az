'use client';

import { useEffect, useState } from 'react';
import styles from './LibraryFilePicker.module.scss';

// Выбор файла из медиатеки Strapi списком — общий для блоков, которым нужен
// не образ, а именно файл: шрифт (FontfaceViewer) или документ (FileManager).
// Раньше это был FontPicker, привязанный к шрифтам; второй такой же пикер для
// документов пришлось бы чинить дважды.
//
// Как и MediaPicker, ходит не в CMS напрямую, а в свой route — токен Strapi
// остаётся на сервере. Когда CMS недоступна, остаётся ручной ввод ссылки:
// иначе редактор становился бы полностью нерабочим из-за внешнего сервиса.

export interface LibraryFile {
  readonly id: number;
  readonly name: string;
  readonly url: string;
}

type LibraryState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly items: readonly LibraryFile[] }
  | { readonly status: 'unavailable'; readonly reason: string };

interface LibraryFilePickerProps {
  /** Что показывать: 'font' — только шрифты, 'file' — любые файлы. */
  readonly kind: 'font' | 'file';
  readonly url?: string;
  readonly onSelect: (file: { id?: number; url: string; name?: string }) => void;
  /** Уникальная часть id для label/input — пикеров на панели бывает много. */
  readonly index: number;
  readonly labels: {
    readonly empty: string;
    readonly choose: string;
    readonly chosen: string;
    readonly placeholder: string;
  };
}

export function LibraryFilePicker({
  kind,
  url,
  onSelect,
  index,
  labels,
}: LibraryFilePickerProps) {
  const [library, setLibrary] = useState<LibraryState>({ status: 'loading' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || library.status !== 'loading') return undefined;

    let cancelled = false;

    fetch(`/api/media?kind=${kind}`)
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          setLibrary({
            status: 'unavailable',
            reason: data?.error === 'strapi_not_configured'
              ? 'Медиатека не подключена'
              : 'Медиатека недоступна',
          });
          return;
        }

        setLibrary({ status: 'ready', items: data.items ?? [] });
      })
      .catch(() => {
        if (!cancelled) setLibrary({ status: 'unavailable', reason: 'Медиатека недоступна' });
      });

    return () => {
      cancelled = true;
    };
  }, [open, library.status, kind]);

  return (
    <div className={styles.picker}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {url ? labels.chosen : labels.choose}
      </button>

      {open ? (
        <div className={styles.panel}>
          {library.status === 'loading' ? <p className={styles.hint}>Загрузка…</p> : null}

          {library.status === 'ready' ? (
            <div className={styles.list}>
              {library.items.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className={[styles.item, file.url === url ? styles.itemActive : ''].join(' ')}
                  onClick={() => {
                    onSelect({ id: file.id, url: file.url, name: file.name });
                    setOpen(false);
                  }}
                >
                  {file.name}
                </button>
              ))}
              {library.items.length === 0 ? <p className={styles.hint}>{labels.empty}</p> : null}
            </div>
          ) : null}

          {library.status === 'unavailable' ? (
            <p className={styles.hint}>{library.reason}</p>
          ) : null}

          <label className={styles.manual} htmlFor={`library-file-${kind}-${index}`}>
            <span>Или ссылка вручную</span>
            <input
              id={`library-file-${kind}-${index}`}
              className={styles.input}
              value={url ?? ''}
              placeholder={labels.placeholder}
              onChange={(event) => onSelect({ url: event.target.value })}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
