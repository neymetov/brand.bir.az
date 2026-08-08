'use client';

import { useMemo, useState } from 'react';
import { renderRichText } from '@/lib/richText';
import { FileGrid } from '@/components/blocks/shared/FileGrid';
import { countFiles, resolvePath, type FileManagerProps } from './types';
import styles from './FileManager.module.scss';

/** Стабильная ссылка на пустой путь — чтобы не пересоздавать её каждый рендер. */
const EMPTY_PATH: readonly number[] = [];

// Файловый менеджер: рубрики-табы, папки, файлы со скачиванием
// (Figma 300:5940 и 300:7061). Внутри папки табы уступают место крошкам —
// это одно и то же место в разметке, поэтому переключение состояния
// не двигает остальной контент.

export function FileManager({
  title, description, tabs = [], viewTab, viewPath, onViewChange,
}: FileManagerProps) {
  // Позиция может быть управляемой (редактор — чтобы холст показывал ту же
  // рубрику, что правится в панели) или своей (публичная страница).
  const controlled = viewTab !== undefined;
  const [ownTab, setOwnTab] = useState(0);
  // Путь внутри рубрики — индексы папок от корня. Сбрасывается при смене
  // рубрики: папка из другой рубрики к новой не относится.
  const [ownPath, setOwnPath] = useState<readonly number[]>([]);

  const activeTab = controlled ? viewTab : ownTab;
  // Через useMemo, а не выражением: `viewPath ?? []` создавал бы новый массив
  // на каждый рендер, и мемоизация спуска по дереву ниже теряла бы смысл.
  const path = useMemo(
    () => (controlled ? viewPath ?? EMPTY_PATH : ownPath),
    [controlled, viewPath, ownPath],
  );

  const setView = (nextTab: number, nextPath: readonly number[]) => {
    if (controlled) {
      onViewChange?.(nextTab, nextPath);
      return;
    }
    setOwnTab(nextTab);
    setOwnPath(nextPath);
  };

  const setPath = (nextPath: readonly number[]) => setView(activeTab, nextPath);

  const tab = tabs[activeTab];
  const view = useMemo(() => resolvePath(tab, path), [tab, path]);

  // Путь мог устареть, если папку удалили в редакторе, пока она открыта, —
  // показываем корень рубрики, а не пустоту.
  const current = view ?? resolvePath(tab, []);
  const trail = current?.trail ?? [];

  const openTab = (index: number) => setView(index, []);

  return (
    <section className={styles.manager}>
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? (
            <div className={styles.description}>{renderRichText(description)}</div>
          ) : null}
        </header>
      ) : null}

      {trail.length === 0 ? (
        <div className={styles.tabs} role="tablist">
          {tabs.map((entry, index) => (
            <button
              key={entry.label ?? index}
              type="button"
              role="tab"
              aria-selected={index === activeTab}
              className={[styles.tab, index === activeTab ? styles.tabActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => openTab(index)}
            >
              {entry.label ?? `Tab ${index + 1}`}
            </button>
          ))}
        </div>
      ) : (
        <nav className={styles.breadcrumbs} aria-label="Folder path">
          <button type="button" className={styles.crumb} onClick={() => setPath([])}>
            {tab?.label ?? 'Documents'}
          </button>
          {trail.map((folder, depth) => (
            // eslint-disable-next-line react/no-array-index-key -- шаг пути стабилен
            <span className={styles.crumbGroup} key={depth}>
              <span className={styles.separator} aria-hidden="true">/</span>
              <button
                type="button"
                className={[styles.crumb, depth === trail.length - 1 ? styles.crumbCurrent : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setPath(path.slice(0, depth + 1))}
                aria-current={depth === trail.length - 1 ? 'page' : undefined}
              >
                {folder.name ?? 'Folder'}
              </button>
            </span>
          ))}
        </nav>
      )}

      {current && current.folders.length > 0 ? (
        <div className={styles.grid}>
          {current.folders.map((folder, index) => (
            <button
              type="button"
              className={styles.folderCard}
              // eslint-disable-next-line react/no-array-index-key -- порядок задаёт админ
              key={index}
              onClick={() => setPath([...path, index])}
            >
              <span className={styles.folderTitle}>{folder.name ?? 'Folder'}</span>
              <span className={styles.folderInfo}>
                <span className={styles.folderInfoLabel}>Files</span>
                <span className={styles.folderCount}>{countFiles(folder)}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {current && current.files.length > 0 ? <FileGrid files={current.files} /> : null}

      {current && current.folders.length === 0 && current.files.length === 0 ? (
        <p className={styles.empty}>This folder is empty.</p>
      ) : null}
    </section>
  );
}
