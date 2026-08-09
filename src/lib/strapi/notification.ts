import 'server-only';
import { isBrandId } from '@/lib/brands';
import type { SidebarNotification } from '@/components/dashboard/Sidebar/BrandNotification';
import { strapiFetch, isStrapiConfigured } from './client';

// Карточка апдейта внизу сайдбара. В отличие от навигации, она НЕ привязана к
// бренду, в котором находится читатель: это одно объявление на весь сайт —
// «обновили вот этот бренд», — и видно его в любом сайдбаре. Поэтому в CMS
// заведён singleType, а не запись на бренд: двух объявлений сразу не бывает.
//
// Бренд выбирается редактором и определяет и логотип на карточке, и адрес
// кнопки: она ведёт на разводную выбранного бренда.

// Тип объявлен у компонента, который его рисует: сайдбар клиентский и не
// может импортировать ничего из этого server-only модуля.
export type { SidebarNotification };

// Карточка узкая и в макете рассчитана на две-три строки. Ограничение стоит и
// в схеме Strapi, и здесь: в CMS его можно обойти правкой схемы, а редактор
// должен упереться раньше, чем текст разъедет вёрстку.
export const MESSAGE_MAX_LENGTH = 120;

interface StrapiSingle<T> { readonly data: T | null }

interface StrapiNotification {
  readonly brand?: string;
  readonly message?: string;
}

/**
 * Объявление для сайдбара. `null` — показывать нечего: тогда сайдбар возьмёт
 * текст по умолчанию про текущий бренд (см. defaultNotification). Так сайт
 * выглядит как раньше, пока в CMS ничего не завели, и переживает недоступность
 * CMS — сайдбар не должен умирать вместе с внешним сервисом.
 */
export async function getNotification(): Promise<SidebarNotification | null> {
  if (!isStrapiConfigured()) return null;

  try {
    const { data } = await strapiFetch<StrapiSingle<StrapiNotification>>('/sidebar-notification');

    // Бренд сверяется с реестром, а не берётся как есть: список в CMS живёт
    // отдельным перечислением и может отстать от кода — например, если бренд
    // переименовали. Неизвестный бренд дал бы битую ссылку и пустой логотип.
    if (!data?.message || !data.brand || !isBrandId(data.brand)) return null;

    return { brand: data.brand, message: data.message };
  } catch {
    // Пока запись ни разу не сохраняли, Strapi отвечает 404 — это не ошибка,
    // а обычное «ещё не заполнено».
    return null;
  }
}

/** Сохраняет объявление. У singleType нет id: PUT всегда пишет в ту же запись. */
export async function saveNotification(notification: SidebarNotification): Promise<void> {
  await strapiFetch<StrapiSingle<StrapiNotification>>(
    '/sidebar-notification',
    { method: 'PUT', body: JSON.stringify({ data: notification }) },
    'write',
  );
}
