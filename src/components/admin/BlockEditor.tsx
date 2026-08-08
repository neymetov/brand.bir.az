'use client';

import { Editor, Frame, Element } from '@craftjs/core';
import { craftResolver } from '@/lib/craft/registry';
import { EditorNav } from './EditorNav';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { EditorCanvas } from './EditorCanvas';
import styles from './BlockEditor.module.scss';

// Визуальный редактор гайд-страниц. craft.js здесь только движок
// (состояние + drag-n-drop + сериализация) — весь UI свой, стилизован
// токенами --bb-* самого brand.bir.az (§3.5).
//
// Синхронизация со Strapi — snapshot-on-save, не live: правки живут в
// браузере до нажатия «Сохранить». Сам обмен со Strapi ещё не подключён,
// см. docs/OPEN_QUESTIONS.md — сейчас редактор работает на локальном
// состоянии, чтобы проверить блоки.
// Резолвер обязан знать ВСЕ компоненты дерева, включая сам холст, — иначе
// craft.js не может восстановить узел и падает с "Invariant failed".
const resolver = { ...craftResolver, EditorCanvas };

export function BlockEditor() {
  return (
    <Editor resolver={resolver}>
      {/* Панель вне сетки из трёх колонок: она тянется на всю ширину, а
          колонки под ней — тулбокс, холст, настройки. */}
      <div className={styles.shell}>
        <EditorNav />

        <div className={styles.layout}>
          <aside className={styles.side}>
            <Toolbox />
          </aside>

          <div className={styles.canvasArea}>
            <Frame>
              <Element is={EditorCanvas} canvas />
            </Frame>
          </div>

          <aside className={styles.side}>
            <SettingsPanel />
          </aside>
        </div>
      </div>
    </Editor>
  );
}
