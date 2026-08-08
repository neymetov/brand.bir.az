'use client';

import { useNode } from '@craftjs/core';
import { RichTextEditor } from './RichTextEditor';
import type { TextBlockDraftProps, TextBlockProps } from './types';
import styles from './TextBlockSettings.module.scss';

export function TextBlockSettings() {
  const {
    actions: { setProp },
    title,
    description,
    body,
  } = useNode<Required<TextBlockProps>>((node) => ({
    title: node.data.props.title ?? '',
    description: node.data.props.description ?? '',
    body: node.data.props.body ?? '',
  }));

  return (
    <div className={styles.panel}>
      <label className={styles.field} htmlFor="text-title">
        <span className={styles.legend}>Заголовок</span>
        <input
          id="text-title"
          className={styles.input}
          value={title}
          placeholder="Title"
          onChange={(event) => setProp((props: TextBlockDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.title = event.target.value;
          })}
        />
      </label>

      <label className={styles.field} htmlFor="text-description">
        <span className={styles.legend}>Описание</span>
        <input
          id="text-description"
          className={styles.input}
          value={description}
          placeholder="Short description"
          onChange={(event) => setProp((props: TextBlockDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.description = event.target.value;
          })}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.legend}>Текст</span>
        <RichTextEditor
          id="text-body"
          value={body}
          onChange={(html) => setProp((props: TextBlockDraftProps) => {
            // eslint-disable-next-line no-param-reassign
            props.body = html;
          })}
        />
        <span className={styles.hint}>Выделите текст и примените форматирование</span>
      </div>
    </div>
  );
}
