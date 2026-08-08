'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { FontfaceViewer } from './FontfaceViewer';
import { FontfaceViewerSettings } from './FontfaceViewerSettings';
import type { FontfaceViewerProps } from './types';

// Обёртка над настоящим блоком: только ref для выделения/перетаскивания и
// craft-конфиг, вёрстку не дублирует (§3.5).
function FontfaceViewerCraftComponent(props: FontfaceViewerProps) {
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
      <FontfaceViewer {...props} />
    </div>
  );
}

FontfaceViewerCraftComponent.craft = {
  displayName: 'Витрина шрифта',
  props: {
    sample: '',
    specimens: [
      {
        family: '',
        styleName: 'Regular',
        weight: 400,
        fontSize: 48,
        lineHeight: 56,
        letterSpacing: 0,
      },
    ],
  } satisfies FontfaceViewerProps,
  related: {
    settings: FontfaceViewerSettings,
  },
};

export const FontfaceViewerCraft: UserComponent<FontfaceViewerProps> = FontfaceViewerCraftComponent;
