'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { ActionButtons } from './ActionButtons';
import { ActionButtonsSettings } from './ActionButtonsSettings';
import type { ActionButtonsProps } from './types';

// Обёртка над настоящим блоком: только ref для выделения/перетаскивания и
// craft-конфиг, вёрстку не дублирует (§3.5).
function ActionButtonsCraftComponent(props: ActionButtonsProps) {
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
      <ActionButtons {...props} />
    </div>
  );
}

ActionButtonsCraftComponent.craft = {
  displayName: 'Кнопки действия',
  props: {
    align: 'left',
    buttons: [
      {
        label: 'Download',
        kind: 'download',
        icon: 'download-04',
        iconPosition: 'leading',
      },
    ],
  } satisfies ActionButtonsProps,
  related: {
    settings: ActionButtonsSettings,
  },
};

export const ActionButtonsCraft: UserComponent<ActionButtonsProps> = ActionButtonsCraftComponent;
