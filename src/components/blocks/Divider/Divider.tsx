import type { DividerProps } from './types';
import styles from './Divider.module.scss';

// Презентационный блок — как остальные, ничего не знает про craft.js и
// Strapi (§3.5).
export function Divider({ spacing = 'compact', line = true }: DividerProps) {
  // <hr> — это тематический разрыв, а не «горизонтальная линия»: скринридер
  // объявит его как смену темы. Когда линии нет, разрыва тоже нет — это
  // просто воздух, и элемент должен остаться немым.
  if (!line) {
    return <div className={[styles.gap, styles[spacing]].join(' ')} aria-hidden="true" />;
  }

  return <hr className={[styles.divider, styles[spacing]].join(' ')} />;
}
