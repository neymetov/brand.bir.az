import 'server-only';
import { sidebarDirectory, type SidebarGroup } from '@/components/dashboard/Sidebar/sidebar.data';
import type { BrandId } from '@/lib/brands';
import { strapiFetch, isStrapiConfigured } from './client';

// Рубрики и разделы бренда. Редактируются в редакторе, хранятся в Strapi.
//
// Набор из кода (`sidebarDirectory`) остаётся значением по умолчанию: пока
// бренд не правили, сайт показывает его, а не пустой сайдбар. Это же спасает,
// когда CMS недоступна — навигация не должна умирать вместе с внешним
// сервисом.

interface StrapiNavigation {
  readonly documentId: string;
  readonly brand: BrandId;
  readonly groups?: readonly SidebarGroup[];
}

interface StrapiList<T> { readonly data: readonly T[] }
interface StrapiOne<T> { readonly data: T }

const POPULATE = 'populate[groups][populate]=*';

/** Навигация бренда: из CMS, иначе — набор по умолчанию из кода. */
export async function getNavigation(brand: BrandId): Promise<readonly SidebarGroup[]> {
  if (!isStrapiConfigured()) return sidebarDirectory[brand];

  try {
    const result = await strapiFetch<StrapiList<StrapiNavigation>>(
      `/brand-navigations?filters[brand][$eq]=${encodeURIComponent(brand)}&${POPULATE}`,
    );
    const groups = result.data[0]?.groups;
    return groups?.length ? groups : sidebarDirectory[brand];
  } catch {
    return sidebarDirectory[brand];
  }
}

/** Сохраняет навигацию бренда: обновляет запись или создаёт новую. */
export async function saveNavigation(
  brand: BrandId,
  groups: readonly SidebarGroup[],
): Promise<void> {
  const existing = await strapiFetch<StrapiList<StrapiNavigation>>(
    `/brand-navigations?filters[brand][$eq]=${encodeURIComponent(brand)}`,
    undefined,
    'write',
  );

  const body = JSON.stringify({ data: { brand, groups } });
  const current = existing.data[0];

  if (current) {
    await strapiFetch<StrapiOne<StrapiNavigation>>(
      `/brand-navigations/${current.documentId}`,
      { method: 'PUT', body },
      'write',
    );
    return;
  }

  await strapiFetch<StrapiOne<StrapiNavigation>>(
    '/brand-navigations',
    { method: 'POST', body },
    'write',
  );
}
