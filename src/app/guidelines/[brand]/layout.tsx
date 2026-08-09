import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/dashboard/AppShell';
import { publishedGuidelineBrands, type BrandId } from '@/lib/brands';
import { getNavigation } from '@/lib/strapi/navigation';
import { getNotification } from '@/lib/strapi/notification';

// Sidebar общий для разводной страницы бренда и страниц его разделов.
// Лежит внутри сегмента [brand], потому что бренд для sidebar берётся из
// URL — так адрес и содержимое навигации не могут разойтись.
export default async function BrandLayout({
  children,
  params,
}: {
  readonly children: ReactNode;
  readonly params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  if (!publishedGuidelineBrands.includes(brand as BrandId)) notFound();

  // Навигация редактируемая и лежит в CMS, поэтому её тянет серверный
  // layout: sidebar клиентский и сам запросить её не может.
  // Объявление в сайдбаре тоже из CMS и тоже одним запросом на страницу —
  // параллельно навигации, чтобы не складывать задержки друг с другом.
  const [groups, notification] = await Promise.all([
    getNavigation(brand as BrandId),
    getNotification(),
  ]);

  return (
    <AppShell brand={brand as BrandId} groups={groups} notification={notification}>
      {children}
    </AppShell>
  );
}
