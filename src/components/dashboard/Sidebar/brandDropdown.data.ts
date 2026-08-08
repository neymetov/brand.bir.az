import type { FintechBrand, PartnerBrand } from '@/lib/brands';

// Полный список дропдауна — из Figma node 230:6974 (10 строк, порядок как в
// макете): Kapital Bank, bir, birmarket, birbonus, birbank, birbank biznes,
// birbank invest, birbank private, m10, Million.
//
// Три категории строк:
// - fintech: полная тема через каскад data-brand (см. _colors.scss), логотип
//   либо bir-sign (retail/business/invest/private), либо отдельный
//   ecosystem-знак (bir/ecosystem — другой глиф, не bir-sign)
// - partner: плоский --bb-partner-* акцент, БЕЗ каскада (§3.2) — фон строки
//   берётся из акцентного токена напрямую
// - external: Kapital Bank — материнский банк, вообще вне системы токенов
//   BirDS, единственное место в приложении, где цвет — сырой хекс осознанно
//
// Кликабельны в дропдауне СЕЙЧАС только fintech-строки — только они умеют
// менять тему/список сайдбара. partner/external показаны для полноты списка
// из макета, но отрисовываются disabled (см. BrandMenuHeader.tsx) — ни у
// birmarket/m10/million (отложены, §3.1), ни у birbonus/Kapital Bank пока
// нет назначения (куда вести переключение) — см. docs/OPEN_QUESTIONS.md #15.
export type DropdownBrandId = FintechBrand | PartnerBrand | 'kapital-bank';

interface DropdownEntryBase {
  readonly id: DropdownBrandId;
  readonly label: string;
  /** Файл-иконка в public/icons/dashboard/brand-marks/, кроме bir-sign (в корне) */
  readonly mark: string;
}

export interface FintechDropdownEntry extends DropdownEntryBase {
  readonly kind: 'fintech';
  readonly dataBrand: FintechBrand;
}

export interface PartnerDropdownEntry extends DropdownEntryBase {
  readonly kind: 'partner';
  readonly background: string;
}

export interface ExternalDropdownEntry extends DropdownEntryBase {
  readonly kind: 'external';
  readonly background: string;
}

export type DropdownEntry = FintechDropdownEntry | PartnerDropdownEntry | ExternalDropdownEntry;

export const brandDropdownEntries: readonly DropdownEntry[] = [
  {
    kind: 'external',
    id: 'kapital-bank',
    label: 'Kapital Bank',
    mark: 'kapital-bank',
    background: '#b5202e',
  },
  {
    kind: 'fintech',
    id: 'ecosystem',
    label: 'bir',
    dataBrand: 'ecosystem',
    mark: 'ecosystem',
  },
  {
    kind: 'partner',
    id: 'birmarket',
    label: 'birmarket',
    mark: 'birmarket',
    background: 'var(--bb-partner-birmarket-neon-pink)',
  },
  {
    kind: 'partner',
    id: 'birbonus',
    label: 'birbonus',
    mark: 'birbonus',
    // Фон — нейтральный (не акцентный) в самом макете, мультицветный знак
    // достаточен сам по себе.
    background: 'var(--bb-bg-primary)',
  },
  {
    kind: 'fintech', id: 'retail', label: 'birbank', dataBrand: 'retail', mark: 'bir-sign',
  },
  {
    kind: 'fintech', id: 'business', label: 'birbank biznes', dataBrand: 'business', mark: 'bir-sign',
  },
  {
    kind: 'fintech', id: 'invest', label: 'birbank invest', dataBrand: 'invest', mark: 'bir-sign',
  },
  {
    kind: 'fintech', id: 'private', label: 'birbank private', dataBrand: 'private', mark: 'bir-sign',
  },
  {
    kind: 'partner',
    id: 'm10',
    label: 'm10',
    mark: 'm10',
    // ⚠️ В Figma фон строки m10 — #19d2c3, что совпадает с
    // --bb-partner-birbonus-mint, а НЕ с --bb-partner-m10-bright-cyan
    // (#00f0ca). Похоже на путаницу токенов в самом макете — используем
    // правильный m10-токен, не то, что буквально в Figma. Сверить с
    // дизайнерами (docs/OPEN_QUESTIONS.md #14).
    background: 'var(--bb-partner-m10-bright-cyan)',
  },
  {
    kind: 'partner',
    id: 'million',
    label: 'Million',
    mark: 'million',
    background: 'var(--bb-partner-million-accent-red)',
  },
];
