import Link from 'next/link';
import type { SidebarItem } from '@/components/dashboard/Sidebar/sidebar.data';
import type { BrandId } from '@/lib/brands';
import { sectionCover } from './sectionCover';
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
  readonly brand: BrandId;
  readonly item: SidebarItem;
}) {
  return (
    <Link className={styles.card} href={`/guidelines/${brand}/${item.slug}`}>
      {/* Обложка подбирается по иконке раздела (см. sectionCover): у иконок
          без своей картинки — общая standart, поэтому новый раздел не
          остаётся с пустым местом. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- статичный ассет */}
      <img className={styles.thumb} src={sectionCover(item.icon)} alt="" loading="lazy" />
      <span className={styles.title}>{item.label}</span>
    </Link>
  );
}
