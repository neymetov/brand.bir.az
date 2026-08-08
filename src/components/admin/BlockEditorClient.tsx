'use client';

import dynamic from 'next/dynamic';

// craft.js строит дерево узлов через DOM-рефы и падает при серверном
// пререндере ("Invariant failed"), поэтому редактор грузится только в
// браузере. Страница /admin от этого не страдает: она за логином и
// в статике всё равно не нужна.
const BlockEditor = dynamic(
  () => import('./BlockEditor').then((mod) => mod.BlockEditor),
  { ssr: false },
);

export function BlockEditorClient() {
  return <BlockEditor />;
}
