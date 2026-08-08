import type { DashboardIconName } from '@/components/icons/Icon';
import { brands, type BrandId } from '@/lib/brands';

// Данные сайдбара — из Figma-макета дашборда (node 230:7792/230:6974), НЕ из
// сгенерированных ранее заглушек guidelines/[brand]. Показывает более
// глубокую структуру внутри бренда (группы Brand/Digital Marketing/Birbank
// App/Subbrands, каждая — с набором тем), чем плоское "одна страница на
// бренд" из §3.1 — см. docs/OPEN_QUESTIONS.md #12. hrefs ниже — рабочее
// предположение (/guidelines/[brand]/[slug]), не подтверждённый роут.
export interface SidebarItem {
  readonly label: string;
  readonly slug: string;
  readonly icon: DashboardIconName;
}

export interface SidebarGroup {
  readonly label: string;
  readonly items: readonly SidebarItem[];
}

// Список групп/страниц МЕНЯЕТСЯ по бренду (подтверждено пользователем,
// 2026-08-05) — реестр per-brand, не единый плоский список. Figma даёт
// подтверждённое наполнение ТОЛЬКО для Birbank Retail; для остальных
// fintech-брендов ниже — сокращённый плейсхолдер (общие для всех брендов
// категории гайдлайнов: Logotype/Palette/Typography/Identity items), не
// подтверждённый дизайном — см. docs/OPEN_QUESTIONS.md #13.
const retailGroups: readonly SidebarGroup[] = [
  {
    label: 'Brand',
    items: [
      { label: 'Brand', slug: 'brand', icon: 'crowdfunding' },
      { label: 'Tone of Voice', slug: 'tone-of-voice', icon: 'voice-id' },
      { label: 'Logotype', slug: 'logotype', icon: 'star-circle' },
      { label: 'Identity items', slug: 'identity-items', icon: 'pie-chart-square' },
      { label: 'Palette', slug: 'palette', icon: 'colors' },
      { label: 'Typography', slug: 'typography', icon: 'text-creation' },
      { label: 'Presentations', slug: 'presentations', icon: 'presentation-07' },
      { label: 'Birbank Cards', slug: 'cards', icon: 'credit-card' },
    ],
  },
  {
    label: 'Digital Marketing',
    items: [
      { label: 'Layouts', slug: 'layouts', icon: 'layout-table-02' },
      { label: 'Tone of Voice', slug: 'dm-tone-of-voice', icon: 'voice-id' },
      { label: 'Typography', slug: 'dm-typography', icon: 'text-creation' },
      { label: 'Palette', slug: 'dm-palette', icon: 'colors' },
      { label: 'Illustrations and photos', slug: 'illustrations-photos', icon: 'image-02' },
      { label: 'Motion principles', slug: 'motion-principles', icon: 'motion-02' },
      { label: 'AI prompts', slug: 'ai-prompts', icon: 'nano-technology' },
    ],
  },
  {
    label: 'Birbank App',
    items: [
      { label: 'App Screens', slug: 'app-screens', icon: 'screen-add-to-home' },
      { label: 'Illustrations', slug: 'app-illustrations', icon: 'image-02' },
      { label: 'UI Icons', slug: 'ui-icons', icon: 'pencil' },
    ],
  },
  {
    label: 'Subbrands',
    items: [
      { label: 'Birbank Cashback', slug: 'cashback', icon: 'star-square' },
      { label: 'Böl-Ödə', slug: 'bol-ode', icon: 'star-square' },
      { label: 'Ninja', slug: 'ninja', icon: 'star-square' },
    ],
  },
];

// ⚠️ Плейсхолдер, НЕ подтверждено дизайном (docs/OPEN_QUESTIONS.md #13).
const genericBrandGroups: readonly SidebarGroup[] = [
  {
    label: 'Brand',
    items: [
      { label: 'Logotype', slug: 'logotype', icon: 'star-circle' },
      { label: 'Palette', slug: 'palette', icon: 'colors' },
      { label: 'Typography', slug: 'typography', icon: 'text-creation' },
      { label: 'Identity items', slug: 'identity-items', icon: 'pie-chart-square' },
    ],
  },
];

// Разделы есть у КАЖДОГО бренда: страница должна открываться, даже если она
// пока пустая (решение пользователя, 2026-08-09). Пока дизайн не дал свои
// списки, все бренды кроме Retail получают одинаковый набор-плейсхолдер.
//
// Собирается из реестра, а не перечислением: добавленный бренд сразу получает
// навигацию, и забыть про него нельзя.
export const sidebarDirectory = Object.fromEntries(
  brands.map((entry) => [entry.id, entry.id === 'retail' ? retailGroups : genericBrandGroups]),
) as Record<BrandId, readonly SidebarGroup[]>;

/**
 * Соседи текущего раздела по рубрике — для блока рекомендаций.
 *
 * ТОЛЬКО своя рубрика, а не весь бренд (уточнено пользователем 2026-08-07):
 * рядом с Typography уместна Palette из той же рубрики Brand, а не раздел из
 * Birbank App. Текущий раздел исключается — предлагать страницу, на которой
 * пользователь уже стоит, нечего.
 *
 * `currentSlug` обязателен: без него рубрики нет, а показывать «всё подряд»
 * — ровно то поведение, от которого отказались. Поэтому и карусель живёт
 * только на страницах разделов.
 *
 * Список НЕ обрезается: карусель прокручивается горизонтально, а любой предел
 * («первые шесть») был бы выдуманным правилом — реальный порядок и отбор
 * рекомендаций не определён (docs/OPEN_QUESTIONS.md #52).
 */
export function relatedSections(brand: BrandId, currentSlug: string): readonly SidebarItem[] {
  const hasCurrent = (group: SidebarGroup) => group.items.some((item) => item.slug === currentSlug);
  const currentGroup = sidebarDirectory[brand].find(hasCurrent);

  if (!currentGroup) return [];

  return currentGroup.items.filter((item) => item.slug !== currentSlug);
}
