import { notFound } from 'next/navigation';
import { TextBlock } from '@/components/blocks/TextBlock/TextBlock';
import { sidebarDirectory } from '@/components/dashboard/Sidebar/sidebar.data';
import { CarouselRecommendations } from '@/components/dashboard/CarouselRecommendations/CarouselRecommendations';
import { publishedGuidelineBrands, type FintechBrand } from '@/lib/brands';

// Страница раздела. Содержимое придёт из Strapi Dynamic Zone (§3.5) — тем же
// набором блоков, что собирает редактор; пока страница показывает заголовок
// раздела, чтобы карточки разводной вели на существующий адрес, а не в 404.
export default async function GuidelineSectionPage({
  params,
}: {
  readonly params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand, slug } = await params;
  if (!publishedGuidelineBrands.includes(brand as FintechBrand)) notFound();

  // Раздел должен существовать в реестре: адрес, которого нет в навигации,
  // — это опечатка или устаревшая ссылка, а не пустая страница.
  const item = sidebarDirectory[brand as FintechBrand]
    .flatMap((group) => group.items)
    .find((entry) => entry.slug === slug);

  if (!item) notFound();

  return (
    <>
      <TextBlock
        title={item.label}
        description="This section is empty — content will come from the CMS."
      />
      {/* Рекомендации именно здесь и обретают смысл «смежных»: пользователь
          стоит в разделе, и ему предлагаются соседние того же бренда. */}
      <CarouselRecommendations brand={brand as FintechBrand} currentSlug={slug} />
    </>
  );
}
