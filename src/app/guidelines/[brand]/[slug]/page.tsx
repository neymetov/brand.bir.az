import { notFound } from 'next/navigation';
import { TextBlock } from '@/components/blocks/TextBlock/TextBlock';
import { renderBlocks } from '@/components/blocks/renderBlocks';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { getPage } from '@/lib/strapi/pages';
import { getNavigation } from '@/lib/strapi/navigation';
import { CarouselRecommendations } from '@/components/dashboard/CarouselRecommendations/CarouselRecommendations';
import { publishedGuidelineBrands, type FintechBrand } from '@/lib/brands';

// Страница раздела. Содержимое приходит из Strapi Dynamic Zone и рендерится
// тем же набором блоков, что собирает редактор (§3.5). Пока раздел не
// наполнили — показывается заголовок, чтобы карточки разводной вели на
// существующий адрес, а не в 404.
export default async function GuidelineSectionPage({
  params,
}: {
  readonly params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand, slug } = await params;
  if (!publishedGuidelineBrands.includes(brand as FintechBrand)) notFound();

  // Раздел должен существовать в реестре: адрес, которого нет в навигации,
  // — это опечатка или устаревшая ссылка, а не пустая страница.
  const groups = await getNavigation(brand as FintechBrand);
  const item = groups
    .flatMap((group) => group.items)
    .find((entry) => entry.slug === slug);

  if (!item) notFound();

  // Читателю показывается только опубликованное: черновик редактора остаётся
  // невидимым, пока его не опубликуют в админке Strapi.
  let content: ReturnType<typeof renderBlocks> | null = null;
  if (isStrapiConfigured()) {
    try {
      const page = await getPage(brand as FintechBrand, slug);
      if (page?.content?.length) content = renderBlocks(page.content);
    } catch {
      // CMS недоступна — страница всё равно открывается, а не падает:
      // внешний сервис не должен ронять сайт.
      content = null;
    }
  }

  return (
    <>
      {content ?? (
        <TextBlock
          title={item.label}
          description="This section is empty — content will come from the CMS."
        />
      )}
      {/* Рекомендации именно здесь и обретают смысл «смежных»: пользователь
          стоит в разделе, и ему предлагаются соседние того же бренда. */}
      <CarouselRecommendations
        brand={brand as FintechBrand}
        currentSlug={slug}
        groups={groups}
      />
    </>
  );
}
