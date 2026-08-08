'use client';

import { useEditor, Element } from '@craftjs/core';
import { blockRegistry } from '@/lib/craft/registry';
import styles from './Toolbox.module.scss';

// Тулбокс: список доступных блоков, перетаскиваются на холст. Наполняется
// из единого реестра — добавление блока в registry.ts автоматически
// показывает его здесь, отдельно поддерживать список не нужно.
export function Toolbox() {
  const { connectors } = useEditor();

  return (
    <div className={styles.toolbox}>
      <h2 className={styles.title}>Блоки</h2>
      {Object.entries(blockRegistry).map(([key, entry]) => {
        const BlockComponent = entry.component;
        return (
          <button
            key={key}
            type="button"
            className={styles.item}
            ref={(element) => {
              if (!element) return;
              connectors.create(element, <Element is={BlockComponent} canvas={false} />);
            }}
          >
            {entry.label}
          </button>
        );
      })}
      <p className={styles.hint}>Перетащите блок на страницу</p>
    </div>
  );
}
