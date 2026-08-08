import { renderRichText } from '@/lib/richText';
import type { TextBlockProps } from './types';
import styles from './TextBlock.module.scss';

// Презентационный блок — как MediaBlock и ColorPalette, ничего не знает про
// craft.js и Strapi (§3.5). Заголовок здесь h2: блок живёт внутри секции
// страницы, а не открывает документ.
export function TextBlock({ title, description, body }: TextBlockProps) {
  // Разметка не вставляется в DOM строкой: renderRichText разбирает её и
  // пропускает только разрешённые теги (см. lib/richText.tsx).
  const content = renderRichText(body);

  return (
    <div className={styles.block}>
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}

      {content ? <div className={styles.body}>{content}</div> : null}
    </div>
  );
}
