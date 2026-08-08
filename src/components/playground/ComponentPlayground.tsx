'use client';

import { useState } from 'react';
import { BrandSwitcher } from './BrandSwitcher';
import { CodeBlock } from './CodeBlock';
import { PropsPanel } from './PropsPanel';
import type { BrandKey } from './types/brand';

// Живой демо-блок одного компонента: client-side рендер настоящего
// React-компонента из @birds/ui (НЕ iframe/песочница), бренд скоуплен
// локально через data-brand на обёртке, props независимы от бренда (§3.3).
//
// ⚠️ Список поддерживаемых брендов — заглушка (['retail']). По §3.2 он
// должен быть per-component, не единым списком на 5/9 — брать из реального
// компонента ДС, когда появится доступ к @birds/ui.
interface ComponentPlaygroundProps {
  readonly category: string;
  readonly component: string;
  readonly source: { raw: string; highlightedHtml: string };
}

const DEFAULT_BRAND: BrandKey = 'retail';
const FALLBACK_BRANDS: BrandKey[] = [DEFAULT_BRAND];

export function ComponentPlayground({ category, component, source }: ComponentPlaygroundProps) {
  const [brand, setBrand] = useState<BrandKey>(DEFAULT_BRAND);
  const [props, setProps] = useState<Record<string, unknown>>({});

  return (
    <section className="component-playground">
      <div className="component-playground__toolbar">
        <BrandSwitcher brands={FALLBACK_BRANDS} value={brand} onChange={setBrand} />
      </div>

      <div className="component-playground__stage" data-brand={brand}>
        {/* TODO: рендер настоящего <Component {...props} /> из @birds/ui,
            резолвится по category/component после подтверждения путей монорепо */}
        <p>{`${category}/${component} — превью появится после подключения @birds/ui`}</p>
      </div>

      <PropsPanel defaultValues={props} onChange={setProps} />

      <CodeBlock raw={source.raw} highlightedHtml={source.highlightedHtml} />
    </section>
  );
}
