import { notFound } from 'next/navigation';
import { BrandOverview } from '@/components/dashboard/BrandOverview/BrandOverview';
import { publishedGuidelineBrands, type BrandId } from '@/lib/brands';
import { getNavigation } from '@/lib/strapi/navigation';

// Разводная страница бренда: карточки разделов, те же что в сайдбаре
// (Figma node 275:2146). Sidebar добавляет layout выше.
export function generateStaticParams() {
  return publishedGuidelineBrands.map((brand) => ({ brand }));
}

export default async function GuidelineBrandPage({
  params,
}: {
  readonly params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  if (!publishedGuidelineBrands.includes(brand as BrandId)) notFound();

  const groups = await getNavigation(brand as BrandId);

  return <BrandOverview brand={brand as BrandId} groups={groups} />;
}
