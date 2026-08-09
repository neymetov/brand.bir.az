import type { ReactNode } from 'react';
import { AnchorList, type AnchorLink } from './AnchorList';
import styles from './Drawer.module.scss';
import contentStyles from './ContentDrawer.module.scss';

// Белая карточка с содержимым и якорным списком справа.
//
// Вынесена из Drawer, потому что так же обязана выглядеть страница раздела:
// раньше карточка и якоря были только на дашборде, а раздел рендерил блоки
// голыми — без фона и без правой навигации (замечено пользователем,
// 2026-08-10). Если оставить две вёрстки, они разъедутся на первой же правке.
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
    <section className={styles.drawer}>
      <div className={contentStyles.contentDrawer}>{children}</div>
      {anchors.length > 0 ? <AnchorList links={anchors} /> : null}
    </section>
  );
}
