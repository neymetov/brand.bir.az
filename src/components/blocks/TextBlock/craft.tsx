'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { TextBlock } from './TextBlock';
import { TextBlockSettings } from './TextBlockSettings';
import type { TextBlockProps } from './types';

// Обёртка над настоящим блоком: только ref для выделения/перетаскивания и
// craft-конфиг, вёрстку не дублирует (§3.5).
function TextBlockCraftComponent(props: TextBlockProps) {
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
      <TextBlock {...props} />
    </div>
  );
}

TextBlockCraftComponent.craft = {
  displayName: 'Текст',
  props: {
    title: 'Title',
    description: 'Short description',
    body: '',
  } satisfies TextBlockProps,
  related: {
    settings: TextBlockSettings,
  },
};

export const TextBlockCraft: UserComponent<TextBlockProps> = TextBlockCraftComponent;
