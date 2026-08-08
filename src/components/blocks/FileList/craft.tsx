'use client';

import { useNode, type UserComponent } from '@craftjs/core';
import { FileList } from './FileList';
import { FileListSettings } from './FileListSettings';
import type { FileListProps } from './types';

// Обёртка над настоящим блоком: только ref для выделения/перетаскивания и
// craft-конфиг, вёрстку не дублирует (§3.5).
function FileListCraftComponent(props: FileListProps) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(element) => {
        if (element) connect(drag(element));
      }}
    >
      <FileList
        /* eslint-disable-next-line react/jsx-props-no-spreading --
           обёртка обязана пробросить в блок ровно то, чем управляет редактор */
        {...props}
      />
    </div>
  );
}

FileListCraftComponent.craft = {
  displayName: 'Файлы',
  props: {
    title: 'Files',
    description: '',
    files: [],
  } satisfies FileListProps,
  related: {
    settings: FileListSettings,
  },
};

export const FileListCraft: UserComponent<FileListProps> = FileListCraftComponent;
