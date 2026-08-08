// §3.2 — реальные бренд-ключи. Fintech-бренды имеют полную тему
// (--bb-brand-default/hover/pressed/disabled + семантика text/bg/border),
// партнёрские — только плоские --bb-partner-* акцентные токены, без каскада.
// Списки поддерживаемых брендов — per-component, не единый список на все 5/9
// (см. §3.2) — эти массивы описывают домен бренда в целом, не то, какие
// бренды доступны у конкретного компонента.
export type FintechBrand = 'ecosystem' | 'retail' | 'business' | 'invest' | 'private';
export type PartnerBrand = 'birbonus' | 'birmarket' | 'm10' | 'million';
export type BrandKey = FintechBrand | PartnerBrand;

// /guidelines/[brand] и /tone-of-voice/[brand] — только готовые бренды.
// birmarket/m10/million отложены на дизайн-стороне (§3.1).
export const publishedGuidelineBrands: FintechBrand[] = [
  'ecosystem',
  'retail',
  'business',
  'invest',
  'private',
];

export const defaultBrand: FintechBrand = 'retail';

// Отображаемые названия — из макета дашборда (Figma node 230:7792) Retail
// подписан как "Birbank", не "Retail". Остальные — экстраполяция по той же
// схеме именования, не подтверждены дизайном.
export const brandDisplayName: Record<FintechBrand, string> = {
  retail: 'Birbank',
  business: 'Birbank Business',
  invest: 'Birbank Invest',
  private: 'Birbank Private',
  ecosystem: 'Bir',
};

// Вторая строка в шапке сайдбара (Figma node 287:4898). Дизайном подтверждён
// только Retail — «Fintech Vertical»; остальные fintech-бренды получают ту же
// подпись по типу (они и есть fintech-вертикали), а ecosystem — «Ecosystem»,
// потому что Bir это родитель экосистемы, а не вертикаль внутри неё.
// Экстраполяция, как и у brandDisplayName выше — см. docs/OPEN_QUESTIONS.md #60.
export const brandDirection: Record<FintechBrand, string> = {
  retail: 'Fintech Vertical',
  business: 'Fintech Vertical',
  invest: 'Fintech Vertical',
  private: 'Fintech Vertical',
  ecosystem: 'Ecosystem',
};
