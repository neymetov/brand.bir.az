import type { FintechBrand } from '@/lib/brands';
import { sidebarDirectory } from '@/components/dashboard/Sidebar/sidebar.data';
import { SectionCard } from '@/components/dashboard/shared/SectionCard';
import styles from './BrandOverview.module.scss';

// Разводная страница бренда (Figma node 275:2146): те же группы и разделы,
// что и в сайдбаре, но карточками.
//
// Источник — тот же sidebarDirectory, а не свой список: иначе сайдбар и
// разводная разошлись бы при первом же добавлении раздела, и пользователь
// видел бы в одном месте пункт, которого нет в другом. Сама карточка — общая
// с каруселью рекомендаций (SectionCard).
export function BrandOverview({ brand }: { readonly brand: FintechBrand }) {
  const groups = sidebarDirectory[brand];

  return (
    <div className={styles.overview}>
      {groups.map((group) => (
        <section className={styles.group} key={group.label}>
          <h2 className={styles.groupTitle}>{group.label}</h2>

          <div className={styles.cards}>
            {group.items.map((item) => (
              <SectionCard brand={brand} item={item} key={item.slug} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
