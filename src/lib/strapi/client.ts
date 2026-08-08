import 'server-only';

// Тонкий серверный клиент Strapi. Живёт ТОЛЬКО на сервере: STRAPI_API_TOKEN
// даёт запись в CMS, в браузер он попасть не должен ни при каких условиях —
// поэтому нет ни NEXT_PUBLIC_-переменных, ни вызовов отсюда из компонентов
// с 'use client'. Браузер ходит в CMS через наши же route handlers
// (src/app/api/media), которые сначала проверяют сессию.

export class StrapiNotConfiguredError extends Error {
  constructor() {
    super('STRAPI_API_URL / STRAPI_API_TOKEN не заданы');
    this.name = 'StrapiNotConfiguredError';
  }
}

export function isStrapiConfigured(): boolean {
  return Boolean(process.env.STRAPI_API_URL && process.env.STRAPI_API_TOKEN);
}

/** Настроено ли сохранение — у записи свой токен, его может не быть. */
export function isStrapiWritable(): boolean {
  return Boolean(process.env.STRAPI_API_URL && process.env.STRAPI_WRITE_TOKEN);
}

/**
 * Запрос к REST API Strapi. `path` — от корня api, например
 * `/upload/files?pagination[pageSize]=50`.
 *
 * `mode: 'write'` берёт отдельный токен с правом записи. Разделение не
 * формальность: читающий токен раздаётся шире (им пользуется весь сайт), и
 * его утечка не должна давать возможность менять контент.
 */
export async function strapiFetch<T>(
  path: string,
  init?: RequestInit,
  mode: 'read' | 'write' = 'read',
): Promise<T> {
  const baseUrl = process.env.STRAPI_API_URL;
  const token = mode === 'write'
    ? process.env.STRAPI_WRITE_TOKEN
    : process.env.STRAPI_API_TOKEN;

  if (!baseUrl || !token) throw new StrapiNotConfiguredError();

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    // Медиатека меняется редакторами в реальном времени — кэшировать нельзя,
    // иначе пикер будет показывать устаревший список.
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Strapi ${response.status} на ${path}`);
  }

  return response.json() as Promise<T>;
}
