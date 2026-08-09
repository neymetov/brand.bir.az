import type { DashboardIconName } from '@/components/icons/Icon';

// Обложка карточки раздела.
//
// Подбирается по ИКОНКЕ раздела, а не по слагу: иконку админ и так выбирает
// в редакторе навигации, поэтому новый раздел получает подходящую обложку
// сам, без правки кода. Для иконок без своей картинки — общая standart.
const COVER_BY_ICON: Partial<Record<DashboardIconName, string>> = {
  crowdfunding: 'brand',
  'voice-id': 'tone-of-voice',
  'star-circle': 'logotype',
  'pie-chart-square': 'identity',
  colors: 'palette',
  'text-creation': 'typography',
  'presentation-07': 'presentation',
  'layout-table-02': 'layout',
  'nano-technology': 'ai-prompts',
};

export function sectionCover(icon: DashboardIconName): string {
  return `/images/covers/${COVER_BY_ICON[icon] ?? 'standart'}.jpg`;
}
