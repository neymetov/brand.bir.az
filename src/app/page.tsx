import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { defaultBrand } from '@/lib/brands';
import { getNavigation } from '@/lib/strapi/navigation';
import { getNotification } from '@/lib/strapi/notification';

// Дашборд — реализация Figma node 230:7792 (см. переписку с пользователем,
// 2026-08-05). Бренд пока захардкожен на defaultBrand — переключение
// бренда сайдбара ещё не завязано на роут/URL, см.
// docs/OPEN_QUESTIONS.md #12.
export default async function DashboardPage() {
  const [groups, notification] = await Promise.all([
    getNavigation(defaultBrand),
    getNotification(),
  ]);

  return <DashboardShell brand={defaultBrand} groups={groups} notification={notification} />;
}
