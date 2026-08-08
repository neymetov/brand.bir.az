// Единый реестр брендов. Отсюда берут данные сайдбар, дропдаун, маршруты,
// разводные страницы, редактор и enum брендов в Strapi.
//
// Добавить бренд = добавить одну запись сюда (плюс SVG-знак в
// public/icons/dashboard/brand-marks/ и, если нужно, свой список разделов
// в sidebar.data.ts). Раньше списки жили в двух файлах с разным составом:
// дропдаун показывал 10 брендов, а маршруты знали 5, и партнёрские страницы
// отдавали 404 (docs/OPEN_QUESTIONS.md №99).

/**
 * Как бренд получает цвет.
 *
 * `themed` — полная тема через каскад `data-brand` (`--bb-brand-default` и
 * семантика text/bg/border). `partner` — только плоский акцентный токен, без
 * каскада. `external` — Kapital Bank, материнский банк вне системы токенов
 * BirDS: единственное место, где цвет задан сырым хексом осознанно (§3.2).
 */
export type BrandTheme = 'themed' | 'partner' | 'external';

interface BrandEntry {
  readonly id: string;
  /** Подпись в дропдауне — как в макете, строчными (Figma node 230:6974). */
  readonly label: string;
  /** Полное имя в шапке сайдбара и заголовках. */
  readonly displayName: string;
  /** Вторая строка в шапке сайдбара (Figma node 287:4898). */
  readonly direction: string;
  readonly theme: BrandTheme;
  /** Файл в public/icons/dashboard/brand-marks/, кроме bir-sign (в корне). */
  readonly mark: string;
  /** Заливка знака для partner/external — у них нет каскада токенов. */
  readonly background?: string;
}

// Порядок — как в макете дропдауна (Figma node 230:6974).
export const brands = [
  {
    id: 'kapital-bank',
    label: 'Kapital Bank',
    displayName: 'Kapital Bank',
    direction: 'Parent Bank',
    theme: 'external',
    mark: 'kapital-bank',
    background: '#b5202e',
  },
  {
    id: 'ecosystem',
    label: 'bir',
    displayName: 'Bir',
    direction: 'Ecosystem',
    theme: 'themed',
    mark: 'ecosystem',
  },
  {
    id: 'birmarket',
    label: 'birmarket',
    displayName: 'Birmarket',
    direction: 'Partner Brand',
    theme: 'partner',
    mark: 'birmarket',
    background: 'var(--bb-partner-birmarket-neon-pink)',
  },
  {
    id: 'birbonus',
    label: 'birbonus',
    displayName: 'Birbonus',
    direction: 'Partner Brand',
    theme: 'partner',
    mark: 'birbonus',
    background: 'var(--bb-bg-primary)',
  },
  {
    id: 'retail',
    label: 'birbank',
    displayName: 'Birbank',
    direction: 'Fintech Vertical',
    theme: 'themed',
    mark: 'bir-sign',
  },
  {
    id: 'business',
    label: 'birbank biznes',
    displayName: 'Birbank Business',
    direction: 'Fintech Vertical',
    theme: 'themed',
    mark: 'bir-sign',
  },
  {
    id: 'invest',
    label: 'birbank invest',
    displayName: 'Birbank Invest',
    direction: 'Fintech Vertical',
    theme: 'themed',
    mark: 'bir-sign',
  },
  {
    id: 'private',
    label: 'birbank private',
    displayName: 'Birbank Private',
    direction: 'Fintech Vertical',
    theme: 'themed',
    mark: 'bir-sign',
  },
  {
    id: 'm10',
    label: 'm10',
    displayName: 'm10',
    direction: 'Partner Brand',
    theme: 'partner',
    mark: 'm10',
    background: 'var(--bb-partner-m10-bright-cyan)',
  },
  {
    id: 'million',
    label: 'Million',
    displayName: 'Million',
    direction: 'Partner Brand',
    theme: 'partner',
    mark: 'million',
    background: 'var(--bb-partner-million-accent-red)',
  },
] as const satisfies readonly BrandEntry[];

export type BrandId = (typeof brands)[number]['id'];

/** Бренды с полным каскадом токенов — только им можно ставить data-brand. */
export type ThemedBrand = Extract<(typeof brands)[number], { theme: 'themed' }>['id'];

const byId = new Map(brands.map((entry) => [entry.id, entry]));

export function brandById(id: BrandId) {
  return byId.get(id)!;
}

export function isBrandId(value: string): value is BrandId {
  return byId.has(value as BrandId);
}

export function isThemedBrand(id: BrandId): boolean {
  return brandById(id).theme === 'themed';
}

/** Все бренды имеют раздел гайдлайнов — даже если он пока пустой. */
export const publishedGuidelineBrands: BrandId[] = brands.map((entry) => entry.id);

export const defaultBrand: BrandId = 'retail';

export const brandDisplayName = Object.fromEntries(
  brands.map((entry) => [entry.id, entry.displayName]),
) as Record<BrandId, string>;

export const brandDirection = Object.fromEntries(
  brands.map((entry) => [entry.id, entry.direction]),
) as Record<BrandId, string>;

// Совместимость со старыми именами типов: `FintechBrand` раньше означал
// «бренд, у которого есть страницы». Теперь страницы есть у всех.
export type FintechBrand = BrandId;
export type BrandKey = BrandId;
