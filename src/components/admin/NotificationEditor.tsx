'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BrandNotification,
  defaultNotification,
  type SidebarNotification,
} from '@/components/dashboard/Sidebar/BrandNotification';
import { brandDisplayName, publishedGuidelineBrands, type BrandId } from '@/lib/brands';
import styles from './NotificationEditor.module.scss';

// Правка карточки апдейта внизу сайдбара. Полей всего два, поэтому отдельного
// черновика с историей здесь нет — правится состояние формы и сохраняется
// целиком.

interface NotificationEditorProps {
  /** Что лежит в CMS сейчас. `null` — ещё не заводили. */
  readonly initial: SidebarNotification | null;
  readonly maxLength: number;
}

type SaveState =
  | { readonly status: 'idle' | 'saving' }
  | { readonly status: 'error'; readonly message: string };

export function NotificationEditor({ initial, maxLength }: NotificationEditorProps) {
  const router = useRouter();
  // Пустую форму заполняем тем, что сайт показывает сам: админ видит текущее
  // состояние сайдбара и правит его, а не сочиняет с нуля.
  const start = initial ?? defaultNotification(publishedGuidelineBrands[0] as BrandId);
  const [brand, setBrand] = useState<BrandId>(start.brand);
  const [message, setMessage] = useState(start.message);
  const [state, setState] = useState<SaveState>({ status: 'idle' });

  const trimmed = message.trim();
  const tooLong = trimmed.length > maxLength;
  const canSave = trimmed.length > 0 && !tooLong && state.status !== 'saving';

  const save = async () => {
    setState({ status: 'saving' });

    const response = await fetch('/api/admin/notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, message: trimmed }),
    }).catch(() => null);

    if (!response?.ok) {
      const detail = response
        ? ((await response.json().catch(() => ({}))) as { error?: string })
        : {};
      setState({ status: 'error', message: detail.error ?? 'CMS недоступна' });
      return;
    }

    router.push('/admin');
  };

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Уведомление в сайдбаре</h1>
          <p className={styles.hint}>
            Одно на весь сайт: видно в любом бренде. Кнопка ведёт на разводную
            выбранного бренда.
          </p>
        </div>

        <div className={styles.actions}>
          {state.status === 'error' ? (
            <span className={styles.error} role="alert">{state.message}</span>
          ) : null}
          <Link className={styles.cancel} href="/admin">Отмена</Link>
          <button type="button" className={styles.save} onClick={save} disabled={!canSave}>
            {state.status === 'saving' ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.form}>
          <label className={styles.field} htmlFor="notification-brand">
            <span className={styles.label}>Бренд</span>
            <select
              id="notification-brand"
              className={styles.select}
              value={brand}
              onChange={(event) => setBrand(event.target.value as BrandId)}
            >
              {publishedGuidelineBrands.map((id) => (
                <option key={id} value={id}>{brandDisplayName[id]}</option>
              ))}
            </select>
            <span className={styles.note}>{`Ссылка: /guidelines/${brand}`}</span>
          </label>

          <label className={styles.field} htmlFor="notification-message">
            <span className={styles.label}>Текст</span>
            <textarea
              id="notification-message"
              className={styles.textarea}
              value={message}
              rows={3}
              onChange={(event) => setMessage(event.target.value)}
            />
            <span className={tooLong ? styles.noteOver : styles.note}>
              {`${trimmed.length} из ${maxLength} символов`}
            </span>
          </label>
        </div>

        {/* Предпросмотр тем же компонентом, что и на сайте: карточка узкая, и
            по одному полю ввода не видно, во сколько строк ляжет текст. */}
        <div className={styles.preview}>
          <span className={styles.previewLabel}>Так это выглядит в сайдбаре</span>
          <div className={styles.previewCard}>
            <BrandNotification brand={brand} message={trimmed || '…'} />
          </div>
        </div>
      </div>

      {initial ? null : (
        <p className={styles.hint}>
          Сейчас в CMS ничего нет — сайт показывает текст по умолчанию про
          открытый бренд. После сохранения он сменится на ваш.
        </p>
      )}
    </main>
  );
}
