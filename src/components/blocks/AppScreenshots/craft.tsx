'use client';

import { useEditor, useNode, type UserComponent } from '@craftjs/core';
import { AppScreenshots } from './AppScreenshots';
import { AppScreenshotsSettings } from './AppScreenshotsSettings';
import type { AppScreenshotsProps } from './types';

// Обёртка над настоящим блоком: только ref для выделения/перетаскивания и
// craft-конфиг, вёрстку не дублирует (§3.5).
function AppScreenshotsCraftComponent(props: AppScreenshotsProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  // В режиме редактирования лайтбокс отключён: клик по карточке должен
  // выделять блок, иначе админ не может открыть его настройки — просмотр
  // перехватывает клик и накрывает весь редактор.
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  return (
    <div
      ref={(element) => {
        if (element) connect(drag(element));
      }}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading --
          обёртка обязана пробросить в блок ровно то, чем управляет редактор */}
      <AppScreenshots {...props} interactive={!enabled} />
    </div>
  );
}

AppScreenshotsCraftComponent.craft = {
  displayName: 'Скриншоты приложений',
  props: {
    title: '',
    description: '',
    screenshots: [],
  } satisfies AppScreenshotsProps,
  related: {
    settings: AppScreenshotsSettings,
  },
};

export const AppScreenshotsCraft: UserComponent<AppScreenshotsProps> = AppScreenshotsCraftComponent;
