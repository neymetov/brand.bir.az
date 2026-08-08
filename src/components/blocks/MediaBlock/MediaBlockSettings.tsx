'use client';

import { useNode } from '@craftjs/core';
import type {
  MediaBlockDraftProps,
  MediaBlockProps,
  MediaImage,
  MediaLayout,
} from './types';
import { MediaPicker } from './MediaPicker';
import styles from './MediaBlockSettings.module.scss';

// Панель настроек блока в редакторе. Своя, не готовая — craft.js даёт только
// движок, весь UI строится с нуля и стилизуется токенами --bb-* самого
// brand.bir.az (§3.5).
export function MediaBlockSettings() {
  const {
    actions: { setProp },
    layout,
    carousel,
    images,
  } = useNode<Required<MediaBlockProps>>((node) => ({
    layout: node.data.props.layout ?? 'wide',
    carousel: node.data.props.carousel ?? false,
    images: node.data.props.images ?? [],
  }));

  const updateImage = (index: number, image: MediaImage) => {
    setProp((props: MediaBlockDraftProps) => {
      const next = [...(props.images ?? [])];
      next[index] = image;
      // eslint-disable-next-line no-param-reassign
      props.images = next;
    });
  };

  const addImage = () => {
    setProp((props: MediaBlockDraftProps) => {
      // eslint-disable-next-line no-param-reassign
      props.images = [...(props.images ?? []), {}];
    });
  };

  const removeImage = (index: number) => {
    setProp((props: MediaBlockDraftProps) => {
      // eslint-disable-next-line no-param-reassign
      props.images = (props.images ?? []).filter((_, i) => i !== index);
    });
  };

  return (
    <div className={styles.panel}>
      <fieldset className={styles.field}>
        <legend className={styles.legend}>Формат</legend>
        <div className={styles.choices}>
          {(['wide', 'pair'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={[styles.choice, layout === value ? styles.choiceActive : ''].join(' ')}
              onClick={() => setProp((props: MediaBlockDraftProps) => {
                // eslint-disable-next-line no-param-reassign
                props.layout = value as MediaLayout;
              })}
            >
              {value === 'wide' ? '16:9' : 'Два 1:1'}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.toggle} htmlFor="media-carousel">
        <input
          id="media-carousel"
          type="checkbox"
          checked={carousel}
          onChange={(event) => setProp((props: MediaBlockDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.carousel = event.target.checked;
          })}
        />
        <span>Карусель с индикаторами</span>
      </label>

      <div className={styles.field}>
        <span className={styles.legend}>
          {`Изображения (${images.length})`}
        </span>
        {images.map((image, index) => (
          <MediaPicker
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            index={index}
            value={image}
            onChange={(next) => updateImage(index, next)}
            onRemove={() => removeImage(index)}
          />
        ))}
        <button type="button" className={styles.add} onClick={addImage}>
          + Добавить изображение
        </button>
      </div>
    </div>
  );
}
