'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { MediaBlock } from './MediaBlock';
import { MediaBlockSettings } from './MediaBlockSettings';
import type { MediaBlockProps } from './types';

// Craft-обёртка: НЕ дублирует вёрстку, а рендерит настоящий <MediaBlock> и
// добавляет только то, что нужно редактору — ref для выделения/перетаскивания
// и static-конфиг craft (§3.5). Публичный рендер этот файл не импортирует.
function MediaBlockCraftComponent(props: MediaBlockProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(element) => {
        if (element) connect(drag(element));
      }}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading --
          обёртка обязана пробросить в блок ровно то, чем управляет редактор */}
      <MediaBlock {...props} />
    </div>
  );
}

MediaBlockCraftComponent.craft = {
  displayName: 'Изображения',
  props: {
    layout: 'wide',
    carousel: false,
    images: [],
  } satisfies MediaBlockProps,
  related: {
    settings: MediaBlockSettings,
  },
};

export const MediaBlockCraft: UserComponent<MediaBlockProps> = MediaBlockCraftComponent;
