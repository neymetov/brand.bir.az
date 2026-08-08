'use client';

import { useNode } from '@craftjs/core';
import { LibraryFilePicker } from '@/components/blocks/shared/LibraryFilePicker';
import type {
  FileEntry,
  FileFolder,
  FileManagerDraftProps,
  FileTab,
} from './types';
import styles from './FileManagerSettings.module.scss';

// Панель настроек файлового менеджера.
//
// Дерево редактируется «по месту»: выбранная рубрика и открытая папка задают,
// что именно правится. Разворачивать всё дерево сразу нельзя — у рубрики с
// вложенными папками панель превратилась бы в нечитаемую простыню.

const PICKER_LABELS = {
  choose: 'Выбрать файл',
  chosen: 'Файл выбран',
  empty: 'В медиатеке нет файлов',
  placeholder: 'https://…/document.pdf',
};

/** Возвращает копию дерева с изменённой папкой по пути. */
function updateFolder(
  folders: readonly FileFolder[],
  path: readonly number[],
  update: (folder: FileFolder) => FileFolder,
): FileFolder[] {
  const [head, ...rest] = path;
  return folders.map((folder, index) => {
    if (index !== head) return folder;
    if (rest.length === 0) return update(folder);
    return { ...folder, folders: updateFolder(folder.folders ?? [], rest, update) };
  });
}

export function FileManagerSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as FileManagerDraftProps }));

  // Позиция (рубрика + путь) живёт в props блока, а не в локальном состоянии
  // панели: иначе панель правит одну рубрику, а холст показывает другую, и
  // добавленная папка выглядит пропавшей.
  const tabIndex = props.viewTab ?? 0;
  const path = props.viewPath ?? [];

  const setView = (nextTab: number, nextPath: readonly number[]) => {
    setProp((draft: FileManagerDraftProps) => {
      Object.assign(draft, { viewTab: nextTab, viewPath: nextPath });
    });
  };

  const setPath = (nextPath: readonly number[]) => setView(tabIndex, nextPath);

  const tabs = props.tabs ?? [];
  const tab = tabs[tabIndex];

  const patchTab = (update: (value: FileTab) => FileTab) => {
    setProp((draft: FileManagerDraftProps) => {
      // eslint-disable-next-line no-param-reassign -- draft это Immer-черновик craft.js
      draft.tabs = (draft.tabs ?? []).map((entry, index) => (
        index === tabIndex ? update(entry) : entry
      ));
    });
  };

  // Правка содержимого текущего места: корня рубрики или открытой папки.
  type TreeNode = { folders?: readonly FileFolder[]; files?: readonly FileEntry[] };

  const patchHere = (update: (node: TreeNode) => TreeNode) => {
    patchTab((entry) => {
      if (path.length === 0) return { ...entry, ...update(entry) };

      const folders = updateFolder(entry.folders ?? [], path, (folder) => ({
        ...folder,
        ...update(folder),
      }));

      return { ...entry, folders };
    });
  };

  const here = path.reduce<TreeNode | undefined>(
    (node: TreeNode | undefined, index: number) => node?.folders?.[index],
    tab,
  );

  const folders = here?.folders ?? [];
  const files = here?.files ?? [];

  // Имена открытых папок — для подписи «Содержимое: рубрика / папка».
  interface TrailAcc {
    readonly names: readonly string[];
    readonly level: readonly FileFolder[];
  }

  const trailNames = path.reduce<TrailAcc>(
    (acc: TrailAcc, index: number) => ({
      names: [...acc.names, acc.level[index]?.name || 'папка'],
      level: acc.level[index]?.folders ?? [],
    }),
    { names: [], level: tab?.folders ?? [] },
  ).names;

  return (
    <div className={styles.panel}>
      <label className={styles.field} htmlFor="fm-title">
        <span className={styles.legend}>Заголовок</span>
        <input
          id="fm-title"
          className={styles.input}
          value={props.title ?? ''}
          onChange={(event) => setProp((draft: FileManagerDraftProps) => {
            // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
            draft.title = event.target.value;
          })}
        />
      </label>

      <label className={styles.field} htmlFor="fm-description">
        <span className={styles.legend}>Описание</span>
        <textarea
          id="fm-description"
          className={styles.textarea}
          value={props.description ?? ''}
          onChange={(event) => setProp((draft: FileManagerDraftProps) => {
            // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
            draft.description = event.target.value;
          })}
        />
      </label>

      <fieldset className={styles.field}>
        <legend className={styles.legend}>Рубрика</legend>
        <div className={styles.choices}>
          {tabs.map((entry, index) => (
            <button
              key={entry.label ?? index}
              type="button"
              className={[styles.choice, index === tabIndex ? styles.choiceActive : ''].join(' ')}
              onClick={() => setView(index, [])}
            >
              {entry.label || `Рубрика ${index + 1}`}
            </button>
          ))}
          <button
            type="button"
            className={styles.addSmall}
            onClick={() => setProp((draft: FileManagerDraftProps) => {
              // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
              draft.tabs = [
                ...(draft.tabs ?? []),
                { label: 'Новая рубрика', folders: [], files: [] },
              ];
            })}
          >
            + рубрика
          </button>
        </div>
      </fieldset>

      {tab ? (
        <>
          <div className={styles.field}>
            {/* Подпись — span, а не label: рядом с полем стоит ещё и кнопка
                удаления, а клик по label дотягивался бы и до неё. Доступное
                имя поле получает через aria-label. */}
            <span className={styles.legend}>Название рубрики</span>
            <div className={styles.row}>
              <input
                className={styles.input}
                aria-label="Название рубрики"
                value={tab.label ?? ''}
                onChange={(event) => patchTab((entry) => ({ ...entry, label: event.target.value }))}
              />
              {/* Удаление рубрики живёт рядом с её названием, а не в списке
                  вкладок: там кнопка «×» на каждой вкладке ломала бы попадание
                  пальцем и путалась бы с выбором рубрики. */}
              <button
                type="button"
                className={styles.removeTab}
                aria-label={`Удалить рубрику ${tab.label || tabIndex + 1}`}
                title="Удалить рубрику"
                onClick={() => {
                  setProp((draft: FileManagerDraftProps) => {
                    // eslint-disable-next-line no-param-reassign -- Immer-черновик craft.js
                    draft.tabs = (draft.tabs ?? []).filter((_, i) => i !== tabIndex);
                  });
                  // Выделение сдвигаем на соседнюю рубрику, иначе панель и
                  // холст остались бы указывать на удалённый индекс.
                  setView(Math.max(0, tabIndex - 1), []);
                }}
              >
                Удалить рубрику
              </button>
            </div>
          </div>

          <div className={styles.crumbs}>
            <button type="button" className={styles.crumb} onClick={() => setPath([])}>
              {tab.label || 'Рубрика'}
            </button>
            {path.map((index, depth) => {
              const level = path.slice(0, depth).reduce<readonly FileFolder[]>(
                (list, step) => list[step]?.folders ?? [],
                tab.folders ?? [],
              );
              const folder = level[index];

              return (
                <button
                  // eslint-disable-next-line react/no-array-index-key -- шаг пути стабилен
                  key={depth}
                  type="button"
                  className={styles.crumb}
                  onClick={() => setPath(path.slice(0, depth + 1))}
                >
                  {`/ ${folder?.name || 'папка'}`}
                </button>
              );
            })}
          </div>

          {/* Явно называем место: раньше «Папки» и «Файлы» шли без указания
              рубрики, и было неочевидно, куда именно они добавляются. */}
          <p className={styles.scope}>
            {`Содержимое: ${[tab.label || 'рубрика', ...trailNames].join(' / ')}`}
          </p>

          <fieldset className={styles.field}>
            <legend className={styles.legend}>Папки</legend>
            {folders.map((folder, index) => (
              // eslint-disable-next-line react/no-array-index-key -- порядок задаёт админ
              <div className={styles.row} key={index}>
                <input
                  className={styles.input}
                  value={folder.name ?? ''}
                  aria-label={`Название папки ${index + 1}`}
                  onChange={(event) => patchHere((node) => ({
                    folders: (node.folders ?? []).map((item, i) => (
                      i === index ? { ...item, name: event.target.value } : item
                    )),
                  }))}
                />
                <button
                  type="button"
                  className={styles.open}
                  onClick={() => setPath([...path, index])}
                >
                  Открыть
                </button>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Удалить папку ${index + 1}`}
                  onClick={() => patchHere((node) => ({
                    folders: (node.folders ?? []).filter((_, i) => i !== index),
                  }))}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.add}
              onClick={() => patchHere((node) => ({
                folders: [...(node.folders ?? []), { name: 'Новая папка', folders: [], files: [] }],
              }))}
            >
              + папка
            </button>
          </fieldset>

          <fieldset className={styles.field}>
            <legend className={styles.legend}>Файлы</legend>
            {files.map((file, index) => (
              // eslint-disable-next-line react/no-array-index-key -- порядок задаёт админ
              <div className={styles.fileRow} key={index}>
                <input
                  className={styles.input}
                  value={file.name ?? ''}
                  aria-label={`Имя файла ${index + 1}`}
                  placeholder="Имя файла с расширением"
                  onChange={(event) => patchHere((node) => ({
                    files: (node.files ?? []).map((item, i) => (
                      i === index ? { ...item, name: event.target.value } : item
                    )),
                  }))}
                />
                <LibraryFilePicker
                  kind="file"
                  index={index}
                  url={file.url}
                  labels={PICKER_LABELS}
                  onSelect={(picked) => patchHere((node) => ({
                    files: (node.files ?? []).map((item, i) => (i === index ? {
                      ...item,
                      url: picked.url,
                      id: picked.id,
                      // Имя из медиатеки подставляем, только если админ его
                      // не вписал — иначе затрём осмысленное название.
                      name: item.name || picked.name,
                    } : item)),
                  }))}
                />
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Удалить файл ${index + 1}`}
                  onClick={() => patchHere((node) => ({
                    files: (node.files ?? []).filter((_, i) => i !== index),
                  }))}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.add}
              onClick={() => patchHere((node) => ({ files: [...(node.files ?? []), {}] }))}
            >
              + файл
            </button>
          </fieldset>
        </>
      ) : null}
    </div>
  );
}
