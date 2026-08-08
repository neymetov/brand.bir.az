'use client';

import type { BrandKey } from './types/brand';

// Дропдаун (НЕ таб — список брендов на компонент растёт со временем),
// скоуплен локально на один демо-блок, не влияет на другие демо на странице
// и не трогает html/body (§3.3).
interface BrandSwitcherProps {
  brands: BrandKey[];
  value: BrandKey;
  onChange: (brand: BrandKey) => void;
}

export function BrandSwitcher({ brands, value, onChange }: BrandSwitcherProps) {
  return (
    <select
      className="brand-switcher"
      value={value}
      onChange={(event) => onChange(event.target.value as BrandKey)}
      aria-label="Brand"
    >
      {brands.map((brand) => (
        <option key={brand} value={brand}>
          {brand}
        </option>
      ))}
    </select>
  );
}
