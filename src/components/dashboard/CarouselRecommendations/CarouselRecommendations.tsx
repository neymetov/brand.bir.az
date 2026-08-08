import { relatedSections } from '@/components/dashboard/Sidebar/sidebar.data';
import { SectionCard } from '@/components/dashboard/shared/SectionCard';
import type { FintechBrand } from '@/lib/brands';
import styles from './CarouselRecommendations.module.scss';

// Рекомендации: соседние разделы ТОЙ ЖЕ рубрики, в которой сейчас находится
// пользователь. Карточка — общая с разводной страницей (SectionCard), чтобы
// одно и то же место сайта не выглядело в двух вариантах.
//
// Блок существует только на страницах разделов: рекомендации привязаны к
// рубрике, а на дашборде текущей рубрики нет (решение пользователя,
// 2026-08-07 — раньше он показывал там все разделы бренда).
//
// Раньше здесь лежал захардкоженный список из четырёх ссылок, часть которых
// вела на несуществующие разделы (`/guidelines/foundations/grids`). Теперь
// источник — тот же реестр, что у сайдбара и разводной, поэтому мёртвых
// ссылок не остаётся по построению.
//
// Горизонтальный скролл на переполнении — стрелки/точки-пагинация из макета не
// видны (см. docs/OPEN_QUESTIONS.md), пока просто overflow-x.
export function CarouselRecommendations({
  brand,
  currentSlug,
}: {
  readonly brand: FintechBrand;
  readonly currentSlug: string;
}) {
  const items = relatedSections(brand, currentSlug);

  // В рубрике может не остаться других разделов (например, она состоит из
  // одного). Пустой заголовок без карточек — мусор на странице, поэтому блок
  // просто не рендерится.
  if (items.length === 0) return null;

  return (
    <section className={styles.carousel}>
      <header className={styles.header}>
        <h2 className={styles.title}>See our creative principles at work</h2>
      </header>

      <div className={styles.cards}>
        {items.map((item) => (
          <div className={styles.slide} key={item.slug}>
            <SectionCard brand={brand} item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
