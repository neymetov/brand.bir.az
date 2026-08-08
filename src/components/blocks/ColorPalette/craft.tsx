'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { ColorPalette } from './ColorPalette';
import { ColorPaletteSettings } from './ColorPaletteSettings';
import type { ColorPaletteProps } from './types';

// Обёртка над настоящим блоком: добавляет только ref для выделения/
// перетаскивания и craft-конфиг, вёрстку не дублирует (§3.5).
function ColorPaletteCraftComponent(props: ColorPaletteProps) {
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
      <ColorPalette {...props} />
    </div>
  );
}

ColorPaletteCraftComponent.craft = {
  displayName: 'Палитра цветов',
  props: {
    title: '',
    description: '',
    size: 'big',
    colors: [],
  } satisfies ColorPaletteProps,
  related: {
    settings: ColorPaletteSettings,
  },
};

export const ColorPaletteCraft: UserComponent<ColorPaletteProps> = ColorPaletteCraftComponent;
