'use client';

import { useNode } from '@craftjs/core';
import { MediaPicker } from '@/components/blocks/MediaBlock/MediaPicker';
import type {
  AppScreenshotsDraftProps,
  AppScreenshotsProps,
  Screenshot,
} from './types';
import styles from './AppScreenshotsSettings.module.scss';

// Выбор файлов — тем же MediaPicker, что и в MediaBlock: скриншот это тот
// же файл медиатеки, и второй пикер с той же логикой (сеть, состояния CMS,
// ручной ввод URL) пришлось бы чинить дважды.
export function AppScreenshotsSettings() {
  const {
    actions: { setProp },
    title,
    description,
    screenshots,
    // interactive сюда не входит: это рантайм-флаг редактора, а не
    // настройка контента (см. types.ts).
  } = useNode<Required<Omit<AppScreenshotsProps, 'interactive'>>>((node) => ({
    title: node.data.props.title ?? '',
    description: node.data.props.description ?? '',
    screenshots: node.data.props.screenshots ?? [],
  }));

  const update = (next: (current: Screenshot[]) => Screenshot[]) => {
    setProp((props: AppScreenshotsDraftProps) => {
      // eslint-disable-next-line no-param-reassign
      props.screenshots = next([...(props.screenshots ?? [])]);
    });
  };

  return (
    <div className={styles.panel}>
      <label className={styles.field} htmlFor="screens-title">
        <span className={styles.legend}>Заголовок</span>
        <input
          id="screens-title"
          className={styles.input}
          value={title}
          onChange={(event) => setProp((props: AppScreenshotsDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.title = event.target.value;
          })}
        />
      </label>

      <label className={styles.field} htmlFor="screens-description">
        <span className={styles.legend}>Описание</span>
        <textarea
          id="screens-description"
          className={styles.textarea}
          rows={3}
          value={description}
          onChange={(event) => setProp((props: AppScreenshotsDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.description = event.target.value;
          })}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.legend}>{`Скриншоты (${screenshots.length})`}</span>

        {screenshots.map((screenshot, index) => (
          <MediaPicker
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            index={index}
            value={screenshot}
            onChange={(next) => update((current) => {
              const list = [...current];
              list[index] = next;
              return list;
            })}
            onRemove={() => update((current) => current.filter((_, i) => i !== index))}
          />
        ))}

        <button
          type="button"
          className={styles.add}
          onClick={() => update((current) => [...current, {}])}
        >
          + Добавить скриншот
        </button>
      </div>
    </div>
  );
}
