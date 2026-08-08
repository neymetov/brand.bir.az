import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import type { SidebarItem } from '@/components/dashboard/Sidebar/sidebar.data';
import type { FintechBrand } from '@/lib/brands';
import styles from './SectionCard.module.scss';

// Карточка раздела. Одна на весь сайт: её показывает и разводная страница
// бренда, и карусель рекомендаций. Раньше у карусели была своя карточка со
// своей вёрсткой — при любой правке дизайна карточки пришлось бы помнить про
// оба места, и они бы разъехались.
//
// Ширину компонент себе НЕ задаёт: на разводной её диктует колонка сетки, в
// карусели — фиксированная полоса. Иначе один из двух контейнеров пришлось бы
// переопределять поверх.
export function SectionCard({
  brand,
  item,
}: {
  readonly brand: FintechBrand;
  readonly item: SidebarItem;
}) {
  return (
    <Link className={styles.card} href={`/guidelines/${brand}/${item.slug}`}>
      {/* Обложек разделов пока нет — на их месте плейсхолдер с иконкой
          раздела, той же, что в сайдбаре. Так карточка узнаётся, даже пока
          картинки не залиты в CMS. */}
      <span className={styles.thumb}>
        <Icon name={item.icon} size={32} />
      </span>
      <span className={styles.title}>{item.label}</span>
    </Link>
  );
}
