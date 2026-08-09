import type { ReactNode } from 'react';
import { AnchorList, type AnchorLink } from './AnchorList';
import styles from './ContentCard.module.scss';

// Белая карточка с содержимым и якорным списком справа.
//
// Раньше такая карточка была только на экране-дашборде, а страница раздела
// рендерила блоки голыми — без фона и без правой навигации. Дашборд с тех пор
// удалён (у корня нет своего содержимого), а карточка осталась здесь: это
// вёрстка страницы раздела.
//
// Якорный список показывается, только когда якоря есть: у страницы из одних
// картинок перечислять нечего, а пустая колонка съедала бы треть ширины.
export function ContentCard({
  anchors,
  children,
}: {
  readonly anchors: readonly AnchorLink[];
  readonly children: ReactNode;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.column}>{children}</div>
      {anchors.length > 0 ? <AnchorList links={anchors} /> : null}
    </section>
  );
}
