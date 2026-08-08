// Реэкспорт из lib/brands — единственный источник правды для brand-типов.
// (Прим.: §3.6 упоминает файл playground-demo/types/brand.ts как готовый
// референс, но в приложенной директории его не было — см.
// docs/PROMPT.md#playground-demo-missing. Этот файл написан с нуля по
// описанию §3.2-3.3, не адаптирован из референса.)
export type { BrandKey, FintechBrand, PartnerBrand } from '@/lib/brands';
