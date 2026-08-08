import { notFound } from 'next/navigation';
import { publishedGuidelineBrands, type FintechBrand } from '@/lib/brands';

// Per-brand — тон СИЛЬНО различается между брендами, НЕ единый голос
// с нюансами (§3.1).
export function generateStaticParams() {
  return publishedGuidelineBrands.map((brand) => ({ brand }));
}

export default async function ToneOfVoiceBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  if (!publishedGuidelineBrands.includes(brand as FintechBrand)) notFound();

  return (
    <main>
      <h1>{`Tone of voice / ${brand}`}</h1>
    </main>
  );
}
