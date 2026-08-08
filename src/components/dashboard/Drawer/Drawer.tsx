import { ContentDrawer } from './ContentDrawer';
import { AnchorList } from './AnchorList';
import { contentSections, anchorLinks } from './content.data';
import styles from './Drawer.module.scss';

// Белая карточка справа от сайдбара: content-drawer (редактируемый craft.js
// контент) + anchor-list (правая навигация-якорь). Контент сейчас берётся
// из плейсхолдера content.data.ts — реальные данные придут из Strapi.
export function Drawer() {
  return (
    <section className={styles.drawer}>
      <ContentDrawer sections={contentSections} />
      <AnchorList links={anchorLinks} />
    </section>
  );
}
