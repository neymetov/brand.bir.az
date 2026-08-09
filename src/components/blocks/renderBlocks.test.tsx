import { describe, expect, it } from 'vitest';
import { createElement, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DynamicZoneItem } from '@/lib/craft/strapiMapping';
import { renderPage } from './renderBlocks';

// Якоря правой навигации собираются из заголовков блоков. Правило неочевидное
// и живёт в одном месте — без проверок его легко потерять при следующей правке
// рендера.

// renderToStaticMarkup принимает элемент, а renderPage отдаёт массив узлов —
// собираем его во фрагмент явно, без пустой JSX-обёртки.
function markup(nodes: ReactNode[]): string {
  return renderToStaticMarkup(createElement(Fragment, null, nodes));
}

function text(title: string, description = 'x'): DynamicZoneItem {
  return { __component: 'sections.text-block', title, description } as DynamicZoneItem;
}

function divider(): DynamicZoneItem {
  return { __component: 'sections.divider' } as DynamicZoneItem;
}

describe('якоря из заголовков', () => {
  it('каждый блок с заголовком даёт пункт навигации', () => {
    const { anchors } = renderPage([text('Main colors'), text('Typography')]);

    expect(anchors).toEqual([
      { id: 'main-colors', label: 'Main colors' },
      { id: 'typography', label: 'Typography' },
    ]);
  });

  it('блок без заголовка якоря не даёт', () => {
    // Перечислять его в правой навигации нечем.
    const { anchors } = renderPage([divider(), text('Colors')]);

    expect(anchors).toEqual([{ id: 'colors', label: 'Colors' }]);
  });

  it('пустой заголовок считается отсутствующим', () => {
    expect(renderPage([text('   ')]).anchors).toEqual([]);
  });

  it('одинаковые заголовки разводятся, а не схлопываются в один якорь', () => {
    // Иначе вторая ссылка вела бы на первый блок.
    const { anchors } = renderPage([text('Colors'), text('Colors'), text('Colors')]);

    expect(anchors.map((a) => a.id)).toEqual(['colors', 'colors-2', 'colors-3']);
  });

  it('заголовок без латиницы всё равно получает рабочий якорь', () => {
    const { anchors } = renderPage([text('Цвета'), text('Шрифты')]);

    expect(anchors.map((a) => a.id)).toEqual(['section', 'section-2']);
    expect(anchors.map((a) => a.label)).toEqual(['Цвета', 'Шрифты']);
  });
});

describe('разметка', () => {
  it('id якоря стоит на обёртке блока — иначе ссылке некуда вести', () => {
    const { blocks } = renderPage([text('Main colors')]);
    const html = markup(blocks);

    expect(html).toContain('id="main-colors"');
    expect(html).toContain('Main colors');
  });

  it('пустой контент не ломает рендер', () => {
    const { blocks, anchors } = renderPage([]);

    expect(anchors).toEqual([]);
    expect(markup(blocks)).toBe('');
  });
});
