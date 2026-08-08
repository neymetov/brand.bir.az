'use client';

import dynamic from 'next/dynamic';
import type { FintechBrand } from '@/lib/brands';
import type { CraftTree } from '@/lib/craft/strapiMapping';

// craft.js строит дерево узлов через DOM-рефы и падает при серверном
// пререндере ("Invariant failed"), поэтому редактор грузится только в
// браузере. Страница /admin от этого не страдает: она за логином и
// в статике всё равно не нужна.
const BlockEditor = dynamic(
  () => import('./BlockEditor').then((mod) => mod.BlockEditor),
  { ssr: false },
);

export interface EditorTarget {
  readonly brand: FintechBrand;
  readonly slug: string;
  readonly title: string;
  /** Черновик из CMS. null — страницу ещё не наполняли. */
  readonly initialTree: CraftTree | null;
}

export function BlockEditorClient(props: EditorTarget) {
  // eslint-disable-next-line react/jsx-props-no-spreading -- прозрачная обёртка
  return <BlockEditor {...props} />;
}
