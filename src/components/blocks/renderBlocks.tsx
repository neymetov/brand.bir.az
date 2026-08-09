import type { ComponentType } from 'react';
import { blockRegistry, type BlockKey } from '@/lib/craft/registry';
import { dynamicZoneToCraft, ROOT_ID, type DynamicZoneItem } from '@/lib/craft/strapiMapping';
import { TextBlock } from './TextBlock/TextBlock';
import { MediaBlock } from './MediaBlock/MediaBlock';
import { ColorPalette } from './ColorPalette/ColorPalette';
import { ActionButtons } from './ActionButtons/ActionButtons';
import { FontfaceViewer } from './FontfaceViewer/FontfaceViewer';
import { Divider } from './Divider/Divider';
import { AppScreenshots } from './AppScreenshots/AppScreenshots';
import { FileManager } from './FileManager/FileManager';
import { FileList } from './FileList/FileList';
import styles from './contentSection.module.scss';

// Рендер контента страницы из Dynamic Zone.
//
// Здесь ПРЕЗЕНТАЦИОННЫЕ компоненты, а не craft-обёртки из реестра: обёртки
// требуют контекста редактора и на публичной странице просто упадут. Сам
// разбор Dynamic Zone переиспользуется — тот же маппер, что кормит редактор,
// поэтому читатель и админ видят одно и то же.

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- блоки гетерогенны по props
const PRESENTATIONAL: Record<BlockKey, ComponentType<any>> = {
  text: TextBlock,
  media: MediaBlock,
  colorPalette: ColorPalette,
  actionButtons: ActionButtons,
  fontfaceViewer: FontfaceViewer,
  divider: Divider,
  appScreenshots: AppScreenshots,
  fileManager: FileManager,
  fileList: FileList,
};

/** Пункт правой навигации: якорь и подпись. */
export interface PageAnchor {
  readonly id: string;
  readonly label: string;
}

/**
 * Якорь из заголовка блока. Транслитерации нет: заголовки на сайте
 * английские, а всё нелатинское схлопнется в дефисы — тогда спасает
 * порядковый номер ниже.
 */
function anchorId(title: string, taken: Set<string>): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    // Два прохода вместо одного чередования: `^-+|-+$` заставляет движок
    // перебирать варианты и на длинной строке считается квадратично.
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'section';

  // Два блока с одинаковым заголовком — обычное дело («Colors» дважды).
  // Без разведения id ссылка вела бы всегда на первый.
  let id = base;
  let n = 2;
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  taken.add(id);
  return id;
}

/**
 * Контент страницы из Dynamic Zone: сами блоки и якоря к ним.
 *
 * Якорь получает каждый блок верхнего уровня с непустым заголовком — так же,
 * как на дашборде, где список собирается из заголовков секций. Блок без
 * заголовка в правой навигации перечислять нечем, поэтому он рендерится как
 * есть, без обёртки.
 */
export function renderPage(content: readonly DynamicZoneItem[]): {
  readonly blocks: React.ReactNode[];
  readonly anchors: readonly PageAnchor[];
} {
  const tree = dynamicZoneToCraft(content);
  const anchors: PageAnchor[] = [];
  const taken = new Set<string>();

  const blocks = (tree[ROOT_ID]?.nodes ?? []).map((nodeId) => {
    const node = tree[nodeId];
    if (!node) return null;

    const key = node.type.resolvedName as BlockKey;
    const Block = PRESENTATIONAL[key];
    if (!Block) return null;

    // eslint-disable-next-line react/jsx-props-no-spreading -- props приходят из CMS
    const element = <Block {...node.props} />;

    const rawTitle = (node.props as { title?: unknown }).title;
    const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
    if (!title) return <div key={nodeId}>{element}</div>;

    const id = anchorId(title, taken);
    anchors.push({ id, label: title });

    return (
      <section key={nodeId} id={id} className={styles.section}>
        {element}
      </section>
    );
  });

  return { blocks, anchors };
}

/** Ключи реестра и презентационные компоненты не должны расходиться. */
export const RENDERABLE_KEYS = Object.keys(blockRegistry) as BlockKey[];
