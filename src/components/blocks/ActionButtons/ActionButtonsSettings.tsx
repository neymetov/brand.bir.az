'use client';

import { useNode } from '@craftjs/core';
import { Icon } from '@/components/icons/Icon';
import {
  actionIcons,
  type ActionButtonItem,
  type ActionButtonsDraftProps,
  type ActionButtonsProps,
  type ActionKind,
} from './types';
import styles from './ActionButtonsSettings.module.scss';

const KIND_LABELS: Record<ActionKind, string> = {
  download: 'Скачать файл',
  link: 'Перейти по ссылке',
  copy: 'Скопировать текст',
};

export function ActionButtonsSettings() {
  const {
    actions: { setProp },
    buttons,
    align,
  } = useNode<Required<ActionButtonsProps>>((node) => ({
    buttons: node.data.props.buttons ?? [],
    align: node.data.props.align ?? 'left',
  }));

  const updateButtons = (next: (current: ActionButtonItem[]) => ActionButtonItem[]) => {
    setProp((props: ActionButtonsDraftProps) => {
      // eslint-disable-next-line no-param-reassign
      props.buttons = next([...(props.buttons ?? [])]);
    });
  };

  const patch = (index: number, changes: Partial<ActionButtonItem>) => {
    updateButtons((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...changes };
      return next;
    });
  };

  return (
    <div className={styles.panel}>
      <fieldset className={styles.field}>
        <legend className={styles.legend}>Выравнивание</legend>
        <div className={styles.choices}>
          {(['left', 'right'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={[styles.choice, align === value ? styles.choiceActive : ''].join(' ')}
              onClick={() => setProp((props: ActionButtonsDraftProps) => {
                // eslint-disable-next-line no-param-reassign
                props.align = value;
              })}
            >
              {value === 'left' ? 'Слева' : 'Справа'}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.field}>
        <span className={styles.legend}>{`Кнопки (${buttons.length})`}</span>

        {buttons.map((button, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={styles.button} key={index}>
            <div className={styles.row}>
              <input
                className={styles.input}
                value={button.label ?? ''}
                placeholder="Подпись"
                onChange={(event) => patch(index, { label: event.target.value })}
                aria-label={`Подпись кнопки ${index + 1}`}
              />
              <button
                type="button"
                className={styles.remove}
                onClick={() => updateButtons((c) => c.filter((_, i) => i !== index))}
                aria-label={`Удалить кнопку ${index + 1}`}
              >
                ×
              </button>
            </div>

            <label className={styles.subField} htmlFor={`action-kind-${index}`}>
              <span className={styles.legend}>Действие</span>
              <select
                id={`action-kind-${index}`}
                className={styles.input}
                value={button.kind ?? 'link'}
                onChange={(event) => patch(index, { kind: event.target.value as ActionKind })}
              >
                {(Object.keys(KIND_LABELS) as ActionKind[]).map((kind) => (
                  <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>
                ))}
              </select>
            </label>

            {button.kind === 'copy' ? (
              <label className={styles.subField} htmlFor={`action-value-${index}`}>
                <span className={styles.legend}>Текст для копирования</span>
                <textarea
                  id={`action-value-${index}`}
                  className={styles.input}
                  rows={3}
                  value={button.value ?? ''}
                  onChange={(event) => patch(index, { value: event.target.value })}
                />
              </label>
            ) : (
              <label className={styles.subField} htmlFor={`action-href-${index}`}>
                <span className={styles.legend}>
                  {button.kind === 'download' ? 'Ссылка на файл' : 'Адрес'}
                </span>
                <input
                  id={`action-href-${index}`}
                  className={styles.input}
                  value={button.href ?? ''}
                  placeholder="https://… или /guidelines/retail"
                  onChange={(event) => patch(index, { href: event.target.value })}
                />
              </label>
            )}

            <div className={styles.subField}>
              <span className={styles.legend}>Иконка</span>
              <div className={styles.icons}>
                <button
                  type="button"
                  className={[styles.iconChoice, !button.icon ? styles.iconChoiceActive : ''].join(' ')}
                  onClick={() => patch(index, { icon: undefined })}
                  title="Без иконки"
                >
                  —
                </button>
                {actionIcons.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={[
                      styles.iconChoice,
                      button.icon === option.name ? styles.iconChoiceActive : '',
                    ].join(' ')}
                    onClick={() => patch(index, { icon: option.name })}
                    title={option.title}
                    aria-label={option.title}
                  >
                    <Icon name={option.name} size={16} />
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.toggle} htmlFor={`action-trailing-${index}`}>
              <input
                id={`action-trailing-${index}`}
                type="checkbox"
                checked={button.iconPosition === 'trailing'}
                onChange={(event) => patch(index, {
                  iconPosition: event.target.checked ? 'trailing' : 'leading',
                })}
              />
              <span>Иконка справа</span>
            </label>

            {button.kind !== 'copy' ? (
              <label className={styles.toggle} htmlFor={`action-newtab-${index}`}>
                <input
                  id={`action-newtab-${index}`}
                  type="checkbox"
                  checked={button.newTab ?? false}
                  onChange={(event) => patch(index, { newTab: event.target.checked })}
                />
                <span>Открывать в новой вкладке</span>
              </label>
            ) : null}
          </div>
        ))}

        <button
          type="button"
          className={styles.add}
          onClick={() => updateButtons((current) => [
            ...current,
            {
              label: 'Download',
              kind: 'download',
              icon: 'download-04',
              iconPosition: 'leading',
            },
          ])}
        >
          + Добавить кнопку
        </button>
      </div>
    </div>
  );
}
