'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor } from '@craftjs/core';
import { Icon } from '@/components/icons/Icon';
import type { BrandId } from '@/lib/brands';
import type { CraftTree } from '@/lib/craft/strapiMapping';
import styles from './EditorNav.module.scss';

// Панель редактора (Figma node 300:7376): логотип, что редактируется, выход.
//
// Два действия вместо одного (решение пользователя, 2026-08-09):
// «Publish» показывает страницу читателям сразу, «Save draft» откладывает.
// Раньше публиковать приходилось отдельно в админке Strapi — редактор умел
// только сохранять черновик.
//
// Черновик пишется в обоих случаях: публикация идёт вторым запросом уже
// сохранённой версией, поэтому неудачная публикация не теряет правку.

interface EditorNavProps {
  readonly brand: BrandId;
  readonly slug: string;
  readonly title: string;
}

type SaveState =
  | { readonly status: 'idle' }
  | { readonly status: 'busy'; readonly action: 'draft' | 'publish' }
  | { readonly status: 'error'; readonly message: string };

export function EditorNav({ brand, slug, title }: EditorNavProps) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({ status: 'idle' });

  // Сериализованное дерево берём у самого редактора: это единственный
  // источник правды о том, что сейчас на холсте.
  const { query } = useEditor();

  const submit = async (publish: boolean) => {
    setState({ status: 'busy', action: publish ? 'publish' : 'draft' });

    const tree = JSON.parse(query.serialize()) as CraftTree;
    const response = await fetch('/api/admin/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand, slug, tree, publish,
      }),
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

  const busy = state.status === 'busy';

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

        {/* Черновик — вторичное действие: он нужен, когда страница ещё не
            готова показываться людям. */}
        <button
          type="button"
          className={styles.draft}
          onClick={() => submit(false)}
          disabled={busy}
        >
          {busy && state.action === 'draft' ? 'Сохраняем…' : 'Save draft'}
        </button>

        <button
          type="button"
          className={styles.exit}
          onClick={() => submit(true)}
          disabled={busy}
        >
          <Icon name="floppy-disk" size={20} />
          <span>{busy && state.action === 'publish' ? 'Публикуем…' : 'Publish and exit'}</span>
        </button>
      </div>
    </nav>
  );
}
