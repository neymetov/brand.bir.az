import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/dashboard/AppShell';
import { publishedGuidelineBrands, type BrandId } from '@/lib/brands';
import { getNavigation } from '@/lib/strapi/navigation';

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
  const groups = await getNavigation(brand as BrandId);

  return <AppShell brand={brand as BrandId} groups={groups}>{children}</AppShell>;
}
