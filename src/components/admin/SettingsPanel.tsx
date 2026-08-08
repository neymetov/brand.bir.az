'use client';

import { useEditor } from '@craftjs/core';
import styles from './SettingsPanel.module.scss';

// Панель настроек выделенного блока. Сама ничего не знает про конкретные
// блоки — показывает `related.settings` выделенного узла, который каждый
// блок объявляет у себя (см. MediaBlock/craft.tsx).
export function SettingsPanel() {
  const { selected, actions } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected;
    if (!currentNodeId) return { selected: undefined };

    const node = state.nodes[currentNodeId];
    if (!node) return { selected: undefined };

    return {
      selected: {
        id: currentNodeId,
        name: node.data.displayName ?? node.data.name,
        settings: node.related?.settings,
        deletable: query.node(currentNodeId).isDeletable(),
      },
    };
  });

  if (!selected) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Выделите блок, чтобы настроить его</p>
      </div>
    );
  }

  const Settings = selected.settings;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{selected.name}</h2>
      {Settings ? <Settings /> : null}
      {selected.deletable ? (
        <button
          type="button"
          className={styles.delete}
          onClick={() => actions.delete(selected.id)}
        >
          Удалить блок
        </button>
      ) : null}
    </div>
  );
}
