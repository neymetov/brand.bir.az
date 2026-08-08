import { brands, type BrandId } from '@/lib/brands';

// Строки дропдауна выводятся из общего реестра брендов (lib/brands.ts) —
// раньше это был отдельный список, и он разошёлся с маршрутами: дропдаун
// показывал 10 брендов, а страницы существовали у 5.
//
// Теперь кликабельны ВСЕ строки: у каждого бренда есть свой раздел
// гайдлайнов, даже если он пока пустой (решение пользователя, 2026-08-09).

export type DropdownBrandId = BrandId;

export interface DropdownEntry {
  readonly id: BrandId;
  readonly label: string;
  /** Файл-иконка в public/icons/dashboard/brand-marks/, кроме bir-sign. */
  readonly mark: string;
  /** Тема бренда: у themed есть каскад токенов, у остальных — плоская заливка. */
  readonly kind: 'themed' | 'partner' | 'external';
  /** Заливка знака для partner/external. */
  readonly background?: string;
}

export const brandDropdownEntries: readonly DropdownEntry[] = brands.map((entry) => ({
  id: entry.id,
  label: entry.label,
  mark: entry.mark,
  kind: entry.theme,
  background: 'background' in entry ? entry.background : undefined,
}));
