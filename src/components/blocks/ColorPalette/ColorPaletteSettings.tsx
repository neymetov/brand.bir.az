'use client';

import { useNode } from '@craftjs/core';
import {
  normalizeColor,
  type ColorFormat,
  type ColorPaletteDraftProps,
  type ColorPaletteProps,
  type ColorSwatch,
  type PaletteSize,
} from './types';
import styles from './ColorPaletteSettings.module.scss';

// Панель настроек палитры: админ создаёт цвета и произвольные форматы
// значений. Набор форматов не зашит в код (HEX/PMS/CMYK — лишь то, что
// оказалось в макете) — иначе добавление RAL или RGB требовало бы релиза.
const DEFAULT_FORMATS: ColorFormat[] = [
  { label: 'HEX', value: '' },
  { label: 'PMS', value: '' },
  { label: 'CMYK', value: '' },
];

export function ColorPaletteSettings() {
  const {
    actions: { setProp },
    title,
    description,
    size,
    colors,
  } = useNode<Required<ColorPaletteProps>>((node) => ({
    title: node.data.props.title ?? '',
    description: node.data.props.description ?? '',
    size: node.data.props.size ?? 'big',
    colors: node.data.props.colors ?? [],
  }));

  const updateColors = (next: (current: ColorSwatch[]) => ColorSwatch[]) => {
    setProp((props: ColorPaletteDraftProps) => {
      // eslint-disable-next-line no-param-reassign
      props.colors = next([...(props.colors ?? [])]);
    });
  };

  const patchColor = (index: number, patch: Partial<ColorSwatch>) => {
    updateColors((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const patchFormat = (colorIndex: number, formatIndex: number, patch: Partial<ColorFormat>) => {
    updateColors((current) => {
      const next = [...current];
      const formats = [...(next[colorIndex]?.formats ?? [])];
      formats[formatIndex] = { ...formats[formatIndex], ...patch };
      next[colorIndex] = { ...next[colorIndex], formats };
      return next;
    });
  };

  return (
    <div className={styles.panel}>
      <label className={styles.field} htmlFor="palette-title">
        <span className={styles.legend}>Заголовок</span>
        <input
          id="palette-title"
          className={styles.input}
          value={title}
          placeholder="Main colors"
          onChange={(event) => setProp((props: ColorPaletteDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.title = event.target.value;
          })}
        />
      </label>

      <label className={styles.field} htmlFor="palette-description">
        <span className={styles.legend}>Описание</span>
        <textarea
          id="palette-description"
          className={styles.textarea}
          value={description}
          rows={3}
          onChange={(event) => setProp((props: ColorPaletteDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.description = event.target.value;
          })}
        />
      </label>

      <fieldset className={styles.field}>
        <legend className={styles.legend}>Размер карточек</legend>
        <div className={styles.choices}>
          {(['big', 'small'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={[styles.choice, size === value ? styles.choiceActive : ''].join(' ')}
              onClick={() => setProp((props: ColorPaletteDraftProps) => {
                // eslint-disable-next-line no-param-reassign
                props.size = value as PaletteSize;
              })}
            >
              {value === 'big' ? '3 в ряд' : '4 в ряд'}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.field}>
        <span className={styles.legend}>{`Цвета (${colors.length})`}</span>

        {colors.map((swatch, colorIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.color} key={colorIndex}>
            <div className={styles.colorHead}>
              <input
                type="color"
                className={styles.colorInput}
                value={normalizeColor(swatch.color) ?? '#000000'}
                onChange={(event) => patchColor(colorIndex, { color: event.target.value })}
                aria-label={`Цвет ${colorIndex + 1}`}
              />
              <input
                className={styles.input}
                value={swatch.name ?? ''}
                placeholder="Название цвета"
                onChange={(event) => patchColor(colorIndex, { name: event.target.value })}
                aria-label={`Название цвета ${colorIndex + 1}`}
              />
              <button
                type="button"
                className={styles.remove}
                onClick={() => updateColors(
                  (current) => current.filter((_, i) => i !== colorIndex),
                )}
                aria-label={`Удалить цвет ${colorIndex + 1}`}
              >
                ×
              </button>
            </div>

            {/* Значение цвета вводится и текстом: из color-input нельзя
                получить, скажем, PMS, а копировать админ хочет именно то,
                что напишет, а не пересчитанное нами. */}
            <input
              className={styles.input}
              value={swatch.color ?? ''}
              placeholder="#FF0039"
              onChange={(event) => patchColor(colorIndex, { color: event.target.value })}
              aria-label={`Значение заливки ${colorIndex + 1}`}
            />

            <div className={styles.formats}>
              {(swatch.formats ?? []).map((format, formatIndex) => (
                // eslint-disable-next-line react/no-array-index-key
                <div className={styles.formatRow} key={formatIndex}>
                  <input
                    className={styles.formatLabel}
                    value={format.label ?? ''}
                    placeholder="HEX"
                    onChange={(event) => patchFormat(colorIndex, formatIndex, {
                      label: event.target.value,
                    })}
                    aria-label={`Название формата ${formatIndex + 1}`}
                  />
                  <input
                    className={styles.input}
                    value={format.value ?? ''}
                    placeholder="FF0039"
                    onChange={(event) => patchFormat(colorIndex, formatIndex, {
                      value: event.target.value,
                    })}
                    aria-label={`Значение формата ${formatIndex + 1}`}
                  />
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => updateColors((current) => {
                      const next = [...current];
                      next[colorIndex] = {
                        ...next[colorIndex],
                        formats: (next[colorIndex]?.formats ?? []).filter(
                          (_, i) => i !== formatIndex,
                        ),
                      };
                      return next;
                    })}
                    aria-label={`Удалить формат ${formatIndex + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                className={styles.addSmall}
                onClick={() => updateColors((current) => {
                  const next = [...current];
                  next[colorIndex] = {
                    ...next[colorIndex],
                    formats: [...(next[colorIndex]?.formats ?? []), { label: '', value: '' }],
                  };
                  return next;
                })}
              >
                + Формат
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className={styles.add}
          onClick={() => updateColors((current) => [
            ...current,
            { name: '', color: '#000000', formats: DEFAULT_FORMATS.map((f) => ({ ...f })) },
          ])}
        >
          + Добавить цвет
        </button>
      </div>
    </div>
  );
}
