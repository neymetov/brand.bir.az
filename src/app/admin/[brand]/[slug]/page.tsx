import { notFound } from 'next/navigation';
import { BlockEditorClient } from '@/components/admin/BlockEditorClient';
import { getNavigation } from '@/lib/strapi/navigation';
import { publishedGuidelineBrands, type FintechBrand } from '@/lib/brands';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { getPage } from '@/lib/strapi/pages';
import { dynamicZoneToCraft, type CraftTree } from '@/lib/craft/strapiMapping';

// Редактор конкретной страницы: /admin/[brand]/[slug] — зеркало публичного
// /guidelines/[brand]/[slug]. Адресом, а не выбором внутри редактора: ссылку
// можно прислать коллеге, и «назад» работает.
//
// Навигация живёт в коде (решение пользователя, 2026-08-08), поэтому набор
// допустимых адресов берётся из sidebarDirectory, а Strapi хранит только
// содержимое.
export default async function AdminPageEditor({
  params,
}: {
  readonly params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand, slug } = await params;

  if (!publishedGuidelineBrands.includes(brand as FintechBrand)) notFound();

  const groups = await getNavigation(brand as FintechBrand);
  const item = groups
    .flatMap((group) => group.items)
    .find((entry) => entry.slug === slug);

  if (!item) notFound();

  // Редактор открывает ЧЕРНОВИК: правки не должны показываться читателям до
  // публикации. Если CMS недоступна, редактор всё равно открывается пустым —
  // иначе внешний сервис блокировал бы работу целиком.
  let initialTree: CraftTree | null = null;
  if (isStrapiConfigured()) {
    try {
      const page = await getPage(brand as FintechBrand, slug, { draft: true });
      if (page?.content?.length) initialTree = dynamicZoneToCraft(page.content);
    } catch {
      initialTree = null;
    }
  }

  return (
    <BlockEditorClient
      brand={brand as FintechBrand}
      slug={slug}
      title={item.label}
      initialTree={initialTree}
    />
  );
}
