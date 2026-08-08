'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { Divider } from './Divider';
import { DividerSettings } from './DividerSettings';
import type { DividerProps } from './types';

// Обёртка над настоящим блоком: только ref для выделения/перетаскивания и
// craft-конфиг, вёрстку не дублирует (§3.5).
//
// Обёртка-<div> здесь ещё и практическая: линия высотой 1px — слишком
// мелкая мишень, чтобы попасть в неё мышью. Обёртка даёт разделителю
// область клика по высоте отступов.
function DividerCraftComponent(props: DividerProps) {
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
      <Divider {...props} />
    </div>
  );
}

DividerCraftComponent.craft = {
  displayName: 'Разделитель',
  props: {
    spacing: 'compact',
    line: true,
  } satisfies DividerProps,
  related: {
    settings: DividerSettings,
  },
};

export const DividerCraft: UserComponent<DividerProps> = DividerCraftComponent;
