'use client';

import { useEffect, useState } from 'react';
import type { MediaImage } from './types';
import styles from './MediaPicker.module.scss';

interface MediaLibraryItem {
  readonly id: number;
  readonly name: string;
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly alt: string;
}

type LibraryState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly items: readonly MediaLibraryItem[] }
  | { readonly status: 'unavailable'; readonly reason: string };

// Выбор изображения из медиатеки Strapi. Ходит не в CMS напрямую, а в свой
// route (/api/media) — токен Strapi остаётся на сервере.
//
// Когда CMS недоступна (её ещё нет, упала, не настроена), пикер не блокирует
// работу: показывает причину и оставляет ручной ввод URL. Иначе редактор
// оказался бы полностью нерабочим из-за внешнего сервиса.
interface MediaPickerProps {
  readonly value: MediaImage;
  readonly onChange: (image: MediaImage) => void;
  readonly onRemove: () => void;
  readonly index: number;
}

export function MediaPicker({
  value,
  onChange,
  onRemove,
  index,
}: MediaPickerProps) {
  const [library, setLibrary] = useState<LibraryState>({ status: 'loading' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || library.status !== 'loading') return undefined;

    let cancelled = false;

    fetch('/api/media')
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          setLibrary({
            status: 'unavailable',
            reason: data.error === 'strapi_not_configured'
              ? 'Медиатека недоступна: Strapi ещё не подключён'
              : `Медиатека недоступна: ${data.error ?? response.status}`,
          });
          return;
        }

        setLibrary({ status: 'ready', items: data.items ?? [] });
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setLibrary({ status: 'unavailable', reason: `Медиатека недоступна: ${error.message}` });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, library.status]);

  return (
    <div className={styles.picker}>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.preview}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          {value.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.previewImage} src={value.src} alt="" />
          ) : (
            <span className={styles.previewEmpty}>Выбрать</span>
          )}
        </button>

        <div className={styles.meta}>
          <span className={styles.name}>
            {value.src ? value.alt || `Изображение ${index + 1}` : 'Не выбрано'}
          </span>
          {value.id ? <span className={styles.id}>{`id ${value.id}`}</span> : null}
        </div>

        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Удалить изображение ${index + 1}`}
        >
          ×
        </button>
      </div>

      {open ? (
        <div className={styles.panel}>
          {library.status === 'loading' ? <p className={styles.hint}>Загрузка…</p> : null}

          {library.status === 'ready' ? (
            <div className={styles.grid}>
              {library.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.tile}
                  title={item.name}
                  onClick={() => {
                    onChange({ id: item.id, src: item.url, alt: item.alt });
                    setOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.tileImage} src={item.thumbnailUrl} alt="" />
                </button>
              ))}
              {library.items.length === 0 ? (
                <p className={styles.hint}>В медиатеке пока нет изображений</p>
              ) : null}
            </div>
          ) : null}

          {library.status === 'unavailable' ? (
            <p className={styles.hint}>{library.reason}</p>
          ) : null}

          <label className={styles.manual} htmlFor={`media-url-${index}`}>
            <span>Или ссылка вручную</span>
            <input
              id={`media-url-${index}`}
              className={styles.input}
              value={value.src ?? ''}
              placeholder="https://…"
              onChange={(event) => onChange({ ...value, id: undefined, src: event.target.value })}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
