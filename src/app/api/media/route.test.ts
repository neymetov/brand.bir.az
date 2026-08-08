import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { NextRequest } from 'next/server';
import { createSessionCookieValue, SESSION_COOKIE, type Role } from '@/lib/auth/session';
import { GET } from './route';

// DATA-001, DATA-002 из _qa/qa-analysis.md.
//
// Прокси существует ради того, чтобы STRAPI_API_TOKEN не покидал сервер;
// значит, единственный, кто может им пользоваться, — admin.

async function get(role?: Role, query = ''): Promise<NextRequest> {
  const request = new NextRequest(`https://brand.bir.az/api/media${query}`);
  if (role) request.cookies.set(SESSION_COOKIE, await createSessionCookieValue(role));
  return request;
}

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long!!';
});

beforeEach(() => {
  delete process.env.STRAPI_API_URL;
  delete process.env.STRAPI_API_TOKEN;
});

describe('GET /api/media — доступ (DATA-001)', () => {
  it('без сессии → 403', async () => {
    const response = await GET(await get());
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'forbidden' });
  });

  it('роль viewer → 403', async () => {
    const response = await GET(await get('viewer'));
    expect(response.status).toBe(403);
  });

  it('403 отдаётся раньше, чем проверяется конфигурация Strapi', async () => {
    // Иначе по коду ответа посторонний узнавал бы, подключена ли CMS.
    const response = await GET(await get('viewer'));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.not.toHaveProperty('items');
  });
});

describe('GET /api/media — Strapi не подключён (DATA-002)', () => {
  it('admin получает 503 и признак, по которому пикер покажет ручной ввод', async () => {
    const response = await GET(await get('admin'));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'strapi_not_configured', items: [] });
  });
});
