'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor } from '@craftjs/core';
import { Icon } from '@/components/icons/Icon';
import type { FintechBrand } from '@/lib/brands';
import type { CraftTree } from '@/lib/craft/strapiMapping';
import styles from './EditorNav.module.scss';

// Панель редактора (Figma node 300:7376): логотип, что редактируется, выход.
//
// «Save and exit» сохраняет ЧЕРНОВИК: правка не должна становиться видимой
// читателям в момент нажатия кнопки. Публикация — отдельное действие в
// админке Strapi.

interface EditorNavProps {
  readonly brand: FintechBrand;
  readonly slug: string;
  readonly title: string;
}

type SaveState =
  | { readonly status: 'idle' }
  | { readonly status: 'saving' }
  | { readonly status: 'error'; readonly message: string };

export function EditorNav({ brand, slug, title }: EditorNavProps) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({ status: 'idle' });

  // Сериализованное дерево берём у самого редактора: это единственный
  // источник правды о том, что сейчас на холсте.
  const { query } = useEditor();

  const handleSave = async () => {
    setState({ status: 'saving' });

    const tree = JSON.parse(query.serialize()) as CraftTree;
    const response = await fetch('/api/admin/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, slug, tree }),
    }).catch(() => null);

    if (!response?.ok) {
      const detail = response
        ? ((await response.json().catch(() => ({}))) as { error?: string })
        : {};
      // Уводить со страницы после неудачи нельзя: собранное пропадёт.
      setState({ status: 'error', message: detail.error ?? 'CMS недоступна' });
      return;
    }

    router.push(`/guidelines/${brand}/${slug}`);
  };

  return (
    <nav className={styles.nav} aria-label="Editor">
      {/* Логотип отдаём картинкой, а не CSS-маской как иконки: маска красит
          глиф в один цвет, а логотип — брендовый ассет и должен оставаться
          собой. Тот же файл, что на экране логина. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- статичный ассет */}
      <img className={styles.logo} src="/icons/dashboard/logo-bir.svg" alt="bir" width={72} height={36} />

      {/* Какая именно страница правится — иначе по адресу не видно. */}
      <span className={styles.target}>{title}</span>

      <div className={styles.actions}>
        {state.status === 'error' ? (
          <span className={styles.error} role="alert">{`Не сохранилось: ${state.message}`}</span>
        ) : null}

        <button
          type="button"
          className={styles.exit}
          onClick={handleSave}
          disabled={state.status === 'saving'}
        >
          <Icon name="floppy-disk" size={20} />
          <span>{state.status === 'saving' ? 'Сохраняем…' : 'Save and exit'}</span>
        </button>
      </div>
    </nav>
  );
}
