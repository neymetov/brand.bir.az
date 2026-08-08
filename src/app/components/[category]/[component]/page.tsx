// Живой playground конкретного компонента — client-side рендер настоящего
// React-компонента из @birds/ui, дропдаун бренда скоуплен локально на демо-блок,
// панель props, блок кода с build-time чтением исходника (§3.3).
// ComponentPlayground сам по себе — client component, см.
// src/components/playground/ComponentPlayground.tsx.
import { notFound } from 'next/navigation';
import { ComponentPlayground } from '@/components/playground/ComponentPlayground';
import { getComponentSource, isSafeSourceSegment } from '@/components/playground/getComponentSource';

export default async function ComponentPlaygroundPage({
  params,
}: {
  readonly params: Promise<{ category: string; component: string }>;
}) {
  const { category, component } = await params;

  // Сегменты приходят из URL. Всё, что не похоже на имя компонента, — это
  // опечатка или попытка выйти за пределы пакета ДС: 404, а не 500.
  if (!isSafeSourceSegment(category) || !isSafeSourceSegment(component)) notFound();

  const source = await getComponentSource(category, component);

  return (
    <main>
      <h1>{`${category} / ${component}`}</h1>
      <ComponentPlayground category={category} component={component} source={source} />
    </main>
  );
}
