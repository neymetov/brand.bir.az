import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/dashboard/AppShell';
import { publishedGuidelineBrands, type FintechBrand } from '@/lib/brands';

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
  if (!publishedGuidelineBrands.includes(brand as FintechBrand)) notFound();

  return <AppShell brand={brand as FintechBrand}>{children}</AppShell>;
}
