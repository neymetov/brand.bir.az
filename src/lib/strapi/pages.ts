import 'server-only';
import type { DynamicZoneItem } from '@/lib/craft/strapiMapping';
import type { FintechBrand } from '@/lib/brands';
import { strapiFetch } from './client';
import { contentPopulateQuery } from './populate';

// Чтение и запись страниц гайдлайнов. Навигация (какие разделы существуют)
// живёт в коде — sidebarDirectory; Strapi хранит только содержимое страницы,
// найденное по паре бренд+слаг (решение пользователя, 2026-08-08).

export interface GuidelinePage {
  readonly documentId: string;
  readonly title?: string;
  readonly description?: string;
  readonly content?: readonly DynamicZoneItem[];
}

interface StrapiList<T> { readonly data: readonly T[] }
interface StrapiOne<T> { readonly data: T }

// Populate строится из схем — см. populate.ts. Проверено на живой CMS:
// одного `populate[content][populate]=*` не хватает, вложенные компоненты
// приходят пустыми, и редактор молча теряет контент.

export async function getPage(
  brand: FintechBrand,
  slug: string,
  options?: { readonly draft?: boolean },
): Promise<GuidelinePage | null> {
  const query = [
    `filters[brand][$eq]=${encodeURIComponent(brand)}`,
    `filters[slug][$eq]=${encodeURIComponent(slug)}`,
    contentPopulateQuery(),
    // Редактор правит черновик, читатель видит опубликованное.
    options?.draft ? 'status=draft' : 'status=published',
  ].join('&');

  const result = await strapiFetch<StrapiList<GuidelinePage>>(
    `/guideline-pages?${query}`,
    undefined,
    options?.draft ? 'write' : 'read',
  );

  return result.data[0] ?? null;
}

export interface SavePageInput {
  readonly brand: FintechBrand;
  readonly slug: string;
  readonly title: string;
  readonly content: readonly DynamicZoneItem[];
}

/**
 * Сохраняет черновик страницы: обновляет существующую или создаёт новую.
 *
 * Publish отдельным действием и не здесь: сохранение не должно
 * автоматически показывать незаконченную правку читателям.
 */
export async function savePage(input: SavePageInput): Promise<GuidelinePage> {
  const existing = await getPage(input.brand, input.slug, { draft: true });
  const body = JSON.stringify({
    data: {
      brand: input.brand,
      slug: input.slug,
      title: input.title,
      content: input.content,
    },
  });

  // ?status=draft обязателен: без него Strapi 5 публикует запись сразу, и
  // незаконченная правка немедленно уезжает читателям (проверено на живой
  // CMS — publishedAt проставлялся, read-токен видел страницу).
  const result = existing
    ? await strapiFetch<StrapiOne<GuidelinePage>>(
      `/guideline-pages/${existing.documentId}?status=draft`,
      { method: 'PUT', body },
      'write',
    )
    : await strapiFetch<StrapiOne<GuidelinePage>>(
      '/guideline-pages?status=draft',
      { method: 'POST', body },
      'write',
    );

  return result.data;
}
