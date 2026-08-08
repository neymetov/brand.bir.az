'use client';

import type { ReactNode } from 'react';
import { useNode, type UserComponent } from '@craftjs/core';
import styles from './EditorCanvas.module.scss';

// Холст редактора — корневой droppable-контейнер. Визуально повторяет
// content-drawer дашборда (белая карточка, те же отступы), чтобы редактор
// показывал контент так же, как увидит читатель.
function EditorCanvasComponent({ children }: { readonly children?: ReactNode }) {
  const {
    connectors: { connect },
  } = useNode();

  return (
    <div
      ref={(element) => {
        if (element) connect(element);
      }}
      className={styles.canvas}
    >
      {children}
    </div>
  );
}

EditorCanvasComponent.craft = {
  displayName: 'Страница',
  rules: {
    // Корневой холст нельзя утащить или удалить — иначе редактор
    // остаётся без места, куда класть блоки.
    canDrag: () => false,
  },
};

export const EditorCanvas: UserComponent<{ readonly children?: ReactNode }> = EditorCanvasComponent;
