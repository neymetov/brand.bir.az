'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { FileManager } from './FileManager';
import { FileManagerSettings } from './FileManagerSettings';
import type { FileManagerProps } from './types';

// Обёртка над настоящим блоком: только ref для выделения/перетаскивания и
// craft-конфиг, вёрстку не дублирует (§3.5).
function FileManagerCraftComponent(props: FileManagerProps) {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode();
  const { viewTab, viewPath } = props;

  return (
    <div
      ref={(element) => {
        if (element) connect(drag(element));
      }}
    >
      <FileManager
        /* eslint-disable-next-line react/jsx-props-no-spreading --
           обёртка обязана пробросить в блок ровно то, чем управляет редактор */
        {...props}
        viewTab={viewTab ?? 0}
        viewPath={viewPath ?? []}
        // Переход по холсту переставляет и панель настроек: иначе админ
        // правил бы одну рубрику, а видел другую.
        onViewChange={(tab, path) => setProp((draft: FileManagerProps) => {
          // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
          Object.assign(draft, { viewTab: tab, viewPath: path });
        })}
      />
    </div>
  );
}

FileManagerCraftComponent.craft = {
  displayName: 'Файловый менеджер',
  // Одна пустая рубрика по умолчанию: блок должен что-то показывать сразу
  // после перетаскивания, до того как админ его заполнил.
  props: {
    title: 'Documents',
    description: '',
    tabs: [{ label: 'Documents', folders: [], files: [] }],
    viewTab: 0,
    viewPath: [],
  } satisfies FileManagerProps,
  related: {
    settings: FileManagerSettings,
  },
};

export const FileManagerCraft: UserComponent<FileManagerProps> = FileManagerCraftComponent;
