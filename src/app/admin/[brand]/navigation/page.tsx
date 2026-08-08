import { notFound } from 'next/navigation';
import { NavigationEditor } from '@/components/admin/NavigationEditor';
import { brandDisplayName, isBrandId, type BrandId } from '@/lib/brands';
import { getNavigation } from '@/lib/strapi/navigation';

// Правка рубрик и разделов бренда. Отдельная страница, а не вкладка в
// редакторе блоков: там правится содержимое одной страницы, здесь — состав
// навигации целиком, и смешивать эти два масштаба в одном экране путано.
export default async function BrandNavigationPage({
  params,
}: {
  readonly params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  if (!isBrandId(brand)) notFound();

  const groups = await getNavigation(brand as BrandId);

  return (
    <NavigationEditor
      brand={brand as BrandId}
      brandName={brandDisplayName[brand as BrandId]}
      initialGroups={groups}
    />
  );
}
