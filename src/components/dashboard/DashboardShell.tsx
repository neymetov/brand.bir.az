import type { BrandId } from '@/lib/brands';
import type { SidebarGroup } from './Sidebar/sidebar.data';
import type { SidebarNotification } from './Sidebar/BrandNotification';
import { AppShell } from './AppShell';
import { Drawer } from './Drawer/Drawer';

// Главная страница: та же оболочка с sidebar, что и у страниц бренда
// (AppShell), плюс контент дашборда — drawer.
// Реализует макет из Figma node 230:7792.
//
// Карусели рекомендаций здесь нет, хотя в макете она была: рекомендации
// привязаны к рубрике текущего раздела, а на дашборде пользователь не внутри
// раздела — рубрики нет. Показывать вместо этого все разделы бренда значило
// бы дублировать разводную страницу (решение пользователя, 2026-08-07).
export function DashboardShell({
  brand, groups, notification,
}: {
  readonly brand: BrandId;
  readonly groups: readonly SidebarGroup[];
  readonly notification?: SidebarNotification | null;
}) {
  return (
    <AppShell brand={brand} groups={groups} notification={notification}>
      <Drawer />
    </AppShell>
  );
}
