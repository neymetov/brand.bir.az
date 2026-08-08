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

/**
 * Запрос к REST API Strapi. `path` — от корня api, например
 * `/upload/files?pagination[pageSize]=50`.
 */
export async function strapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.STRAPI_API_URL;
  const token = process.env.STRAPI_API_TOKEN;

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
