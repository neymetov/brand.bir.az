'use client';

import { useNode } from '@craftjs/core';
import { LibraryFilePicker } from '@/components/blocks/shared/LibraryFilePicker';
import {
  DEFAULT_SAMPLE,
  type FontSpecimen,
  type FontfaceViewerDraftProps,
  type FontfaceViewerProps,
} from './types';
import styles from './FontfaceViewerSettings.module.scss';

// Числовые поля: пустая строка должна означать «не задано», а не 0 —
// иначе очищенный кегль схлопнул бы образец.
function toNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function FontfaceViewerSettings() {
  const {
    actions: { setProp },
    specimens,
    sample,
  } = useNode<Required<FontfaceViewerProps>>((node) => ({
    specimens: node.data.props.specimens ?? [],
    sample: node.data.props.sample ?? '',
  }));

  const update = (next: (current: FontSpecimen[]) => FontSpecimen[]) => {
    setProp((props: FontfaceViewerDraftProps) => {
      // eslint-disable-next-line no-param-reassign
      props.specimens = next([...(props.specimens ?? [])]);
    });
  };

  const patch = (index: number, changes: Partial<FontSpecimen>) => {
    update((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...changes };
      return next;
    });
  };

  return (
    <div className={styles.panel}>
      <label className={styles.field} htmlFor="font-sample">
        <span className={styles.legend}>Образец текста</span>
        <input
          id="font-sample"
          className={styles.input}
          value={sample}
          placeholder={DEFAULT_SAMPLE}
          onChange={(event) => setProp((props: FontfaceViewerDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.sample = event.target.value;
          })}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.legend}>{`Начертания (${specimens.length})`}</span>

        {specimens.map((specimen, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.specimen} key={index}>
            <div className={styles.row}>
              <input
                className={styles.input}
                value={specimen.family ?? ''}
                placeholder="Hal Matex"
                onChange={(event) => patch(index, { family: event.target.value })}
                aria-label={`Семейство ${index + 1}`}
              />
              <button
                type="button"
                className={styles.remove}
                onClick={() => update((c) => c.filter((_, i) => i !== index))}
                aria-label={`Удалить начертание ${index + 1}`}
              >
                ×
              </button>
            </div>

            <LibraryFilePicker
              kind="font"
              index={index}
              url={specimen.fontUrl}
              labels={{
                choose: 'Выбрать файл шрифта',
                chosen: 'Файл шрифта выбран',
                empty: 'В медиатеке нет файлов шрифтов',
                placeholder: 'https://…/font.woff2',
              }}
              onSelect={(file) => patch(index, {
                fontUrl: file.url,
                fontId: file.id,
                // Имя семейства подставляем из файла только если админ его
                // ещё не вписал — иначе затрём осмысленное название.
                family: specimen.family || file.name?.replace(/\.[^.]+$/, ''),
              })}
            />

            <div className={styles.grid}>
              <label className={styles.subField} htmlFor={`font-style-${index}`}>
                <span className={styles.legend}>Начертание</span>
                <input
                  id={`font-style-${index}`}
                  className={styles.input}
                  value={specimen.styleName ?? ''}
                  placeholder="Bold"
                  onChange={(event) => patch(index, { styleName: event.target.value })}
                />
              </label>

              <label className={styles.subField} htmlFor={`font-weight-${index}`}>
                <span className={styles.legend}>Жирность</span>
                <input
                  id={`font-weight-${index}`}
                  className={styles.input}
                  type="number"
                  value={specimen.weight ?? ''}
                  placeholder="700"
                  onChange={(event) => patch(index, { weight: toNumber(event.target.value) })}
                />
              </label>

              <label className={styles.subField} htmlFor={`font-size-${index}`}>
                <span className={styles.legend}>Кегль, px</span>
                <input
                  id={`font-size-${index}`}
                  className={styles.input}
                  type="number"
                  value={specimen.fontSize ?? ''}
                  placeholder="96"
                  onChange={(event) => patch(index, { fontSize: toNumber(event.target.value) })}
                />
              </label>

              <label className={styles.subField} htmlFor={`font-line-${index}`}>
                <span className={styles.legend}>Интерлиньяж, px</span>
                <input
                  id={`font-line-${index}`}
                  className={styles.input}
                  type="number"
                  value={specimen.lineHeight ?? ''}
                  placeholder="104"
                  onChange={(event) => patch(index, { lineHeight: toNumber(event.target.value) })}
                />
              </label>

              <label className={styles.subField} htmlFor={`font-tracking-${index}`}>
                <span className={styles.legend}>Трекинг, %</span>
                <input
                  id={`font-tracking-${index}`}
                  className={styles.input}
                  type="number"
                  value={specimen.letterSpacing ?? ''}
                  placeholder="-3"
                  onChange={(event) => patch(index, {
                    letterSpacing: toNumber(event.target.value),
                  })}
                />
              </label>
            </div>

            <label className={styles.subField} htmlFor={`font-sample-${index}`}>
              <span className={styles.legend}>Свой образец (необязательно)</span>
              <input
                id={`font-sample-${index}`}
                className={styles.input}
                value={specimen.sample ?? ''}
                onChange={(event) => patch(index, { sample: event.target.value })}
              />
            </label>
          </div>
        ))}

        <button
          type="button"
          className={styles.add}
          onClick={() => update((current) => [
            ...current,
            {
              family: '',
              styleName: 'Regular',
              weight: 400,
              fontSize: 48,
              lineHeight: 56,
              letterSpacing: 0,
            },
          ])}
        >
          + Добавить начертание
        </button>
      </div>
    </div>
  );
}
