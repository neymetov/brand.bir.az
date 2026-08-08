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

export function renderBlocks(content: readonly DynamicZoneItem[]) {
  const tree = dynamicZoneToCraft(content);

  return (tree[ROOT_ID]?.nodes ?? []).map((nodeId) => {
    const node = tree[nodeId];
    if (!node) return null;

    const key = node.type.resolvedName as BlockKey;
    const Block = PRESENTATIONAL[key];
    if (!Block) return null;

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading -- props приходят из CMS
      <Block key={nodeId} {...node.props} />
    );
  });
}

/** Ключи реестра и презентационные компоненты не должны расходиться. */
export const RENDERABLE_KEYS = Object.keys(blockRegistry) as BlockKey[];
