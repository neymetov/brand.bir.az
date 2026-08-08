'use client';

import { useNode } from '@craftjs/core';
import {
  SPACING_LABELS,
  type DividerDraftProps,
  type DividerProps,
  type DividerSpacing,
} from './types';
import styles from './DividerSettings.module.scss';

export function DividerSettings() {
  const {
    actions: { setProp },
    spacing,
    line,
  } = useNode<Required<DividerProps>>((node) => ({
    spacing: node.data.props.spacing ?? 'compact',
    line: node.data.props.line ?? true,
  }));

  return (
    <div className={styles.panel}>
      <fieldset className={styles.field}>
        <legend className={styles.legend}>Отступы</legend>
        <div className={styles.choices}>
          {(Object.keys(SPACING_LABELS) as DividerSpacing[]).map((value) => (
            <button
              key={value}
              type="button"
              className={[styles.choice, spacing === value ? styles.choiceActive : ''].join(' ')}
              onClick={() => setProp((props: DividerDraftProps) => {
                // eslint-disable-next-line no-param-reassign
                props.spacing = value;
              })}
            >
              {SPACING_LABELS[value]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.toggle} htmlFor="divider-line">
        <input
          id="divider-line"
          type="checkbox"
          checked={line}
          onChange={(event) => setProp((props: DividerDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.line = event.target.checked;
          })}
        />
        <span>Показывать линию</span>
      </label>
    </div>
  );
}
