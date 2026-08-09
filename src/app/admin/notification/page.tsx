import { NotificationEditor } from '@/components/admin/NotificationEditor';
import { getNotification, MESSAGE_MAX_LENGTH } from '@/lib/strapi/notification';

// Отдельный экран, а не вкладка внутри бренда: объявление одно на весь сайт,
// и открывать его из-под конкретного бренда значило бы намекать, что у каждого
// бренда своё.
export default async function NotificationPage() {
  const initial = await getNotification();

  return <NotificationEditor initial={initial} maxLength={MESSAGE_MAX_LENGTH} />;
}
