'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useEditor } from '@craftjs/core';
import { Icon } from '@/components/icons/Icon';
import type { BrandId } from '@/lib/brands';
import type { CraftTree } from '@/lib/craft/strapiMapping';
import styles from './EditorNav.module.scss';

// Панель редактора (Figma node 300:7376): логотип, что редактируется, действия.
//
// Три действия (решение пользователя, 2026-08-10):
// «Save draft» — отложить, «Publish» — показать читателям, «Preview» — открыть
// страницу в новой вкладке.
//
// НИ ОДНО из них не уводит со страницы. Раньше и сохранение, и публикация
// возвращали на дашборд, и продолжить правку можно было только зайдя заново;
// сохранить «по ходу дела» было нельзя вовсе.
//
// Черновик пишется в обоих случаях: публикация идёт вторым запросом уже
// сохранённой версией, поэтому неудачная публикация не теряет правку.

interface EditorNavProps {
  readonly brand: BrandId;
  readonly slug: string;
  readonly title: string;
}

type Action = 'draft' | 'publish';

type SaveState =
  | { readonly status: 'idle' }
  | { readonly status: 'busy'; readonly action: Action }
  | { readonly status: 'done'; readonly action: Action }
  | { readonly status: 'error'; readonly message: string };

export function EditorNav({ brand, slug, title }: EditorNavProps) {
  const [state, setState] = useState<SaveState>({ status: 'idle' });

  // Сериализованное дерево берём у самого редактора: это единственный
  // источник правды о том, что сейчас на холсте.
  const { query } = useEditor();

  const pagePath = `/guidelines/${brand}/${slug}`;

  const submit = async (action: Action) => {
    setState({ status: 'busy', action });

    const tree = JSON.parse(query.serialize()) as CraftTree;
    const response = await fetch('/api/admin/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand, slug, tree, publish: action === 'publish',
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const detail = response
        ? ((await response.json().catch(() => ({}))) as { error?: string })
        : {};
      setState({ status: 'error', message: detail.error ?? 'CMS недоступна' });
      return;
    }

    // Раз со страницы никуда не уходим, об успехе надо сказать словами: иначе
    // после нажатия ничего не меняется и непонятно, сохранилось ли.
    setState({ status: 'done', action });
  };

  // «Сохранено» через полчаса на экране — это уже неправда: с тех пор холст
  // могли двадцать раз поменять. Сообщение живёт несколько секунд.
  useEffect(() => {
    if (state.status !== 'done') return undefined;

    const timer = setTimeout(() => setState({ status: 'idle' }), 4000);
    return () => clearTimeout(timer);
  }, [state]);

  const busy = state.status === 'busy';

  return (
    <nav className={styles.nav} aria-label="Editor">
      {/* Единственный путь из редактора обратно к списку страниц: раньше им
          была кнопка «Publish and exit», а она уводила ещё и с несохранённой
          правкой в кармане. */}
      <Link className={styles.home} href="/admin" title="Все страницы">
        {/* Логотип отдаём картинкой, а не CSS-маской как иконки: маска красит
            глиф в один цвет, а логотип — брендовый ассет и должен оставаться
            собой. Тот же файл, что на экране логина. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- статичный ассет */}
        <img className={styles.logo} src="/icons/dashboard/logo-bir.svg" alt="Все страницы" width={72} height={36} />
      </Link>

      {/* Какая именно страница правится — иначе по адресу не видно. */}
      <span className={styles.target}>{title}</span>

      <div className={styles.actions}>
        {state.status === 'error' ? (
          <span className={styles.error} role="alert">{`Не сохранилось: ${state.message}`}</span>
        ) : null}

        {/* <output> — это и есть role="status" родным тегом: экранные читалки
            объявляют его надёжнее, чем span с ролью. */}
        {state.status === 'done' ? (
          <output className={styles.done}>
            {state.action === 'publish' ? 'Опубликовано' : 'Черновик сохранён'}
          </output>
        ) : null}

        {/* Ссылка, а не кнопка с window.open: всплывающие окна режут блокировщики,
            а обычную ссылку с target можно открыть и средним кликом.
            rel обязателен — без noopener открытая вкладка получает доступ к
            window.opener этой. */}
        <a
          className={styles.secondary}
          href={pagePath}
          target="_blank"
          rel="noopener noreferrer"
        >
          Preview
        </a>

        {/* Черновик — вторичное действие: он нужен, когда страница ещё не
            готова показываться людям. */}
        <button
          type="button"
          className={styles.secondary}
          onClick={() => submit('draft')}
          disabled={busy}
        >
          {busy && state.action === 'draft' ? 'Сохраняем…' : 'Save draft'}
        </button>

        <button
          type="button"
          className={styles.primary}
          onClick={() => submit('publish')}
          disabled={busy}
        >
          <Icon name="floppy-disk" size={20} />
          <span>{busy && state.action === 'publish' ? 'Публикуем…' : 'Publish'}</span>
        </button>
      </div>
    </nav>
  );
}
