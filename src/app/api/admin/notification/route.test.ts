import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { NextRequest } from 'next/server';
import { createSessionCookieValue, SESSION_COOKIE, type Role } from '@/lib/auth/session';
import { MESSAGE_MAX_LENGTH } from '@/lib/strapi/notification';
import { POST } from './route';

// Сохранение уведомления. Сам вызов CMS подменён: проверяется роут, а не Strapi.
const saveNotification = vi.hoisted(() => vi.fn());

vi.mock('@/lib/strapi/notification', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/strapi/notification')>()),
  saveNotification,
}));

async function post(body: unknown, role?: Role): Promise<NextRequest> {
  const request = new NextRequest('https://brand.bir.az/api/admin/notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (role) request.cookies.set(SESSION_COOKIE, await createSessionCookieValue(role));
  return request;
}

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long!!';
});

beforeEach(() => {
  process.env.STRAPI_API_URL = 'http://cms.test/api';
  process.env.STRAPI_WRITE_TOKEN = 'write-token';
  saveNotification.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('доступ', () => {
  it.each([
    ['без сессии', undefined],
    ['с ролью viewer', 'viewer' as Role],
  ])('%s → 403 и в CMS ничего не уходит', async (_label, role) => {
    const response = await POST(await post({ brand: 'retail', message: 'Hi' }, role));

    expect(response.status).toBe(403);
    expect(saveNotification).not.toHaveBeenCalled();
  });

  it('admin сохраняет', async () => {
    const response = await POST(await post({ brand: 'm10', message: 'Updated' }, 'admin'));

    expect(response.status).toBe(200);
    expect(saveNotification).toHaveBeenCalledWith({ brand: 'm10', message: 'Updated' });
  });
});

describe('проверка данных', () => {
  it('неизвестный бренд отклоняется', async () => {
    // Бренд задаёт адрес кнопки: чужое значение дало бы ссылку в никуда.
    const response = await POST(await post({ brand: 'tinkoff', message: 'Hi' }, 'admin'));

    expect(response.status).toBe(400);
    expect(saveNotification).not.toHaveBeenCalled();
  });

  it.each(['', '   ', '\n\t'])('пустой текст (%j) отклоняется', async (message) => {
    const response = await POST(await post({ brand: 'retail', message }, 'admin'));

    expect(response.status).toBe(400);
    expect(saveNotification).not.toHaveBeenCalled();
  });

  it('слишком длинный текст отклоняется', async () => {
    // Ограничение браузера обходится запросом мимо формы, а Strapi ответил бы
    // на это невнятной ошибкой валидации.
    const message = 'a'.repeat(MESSAGE_MAX_LENGTH + 1);
    const response = await POST(await post({ brand: 'retail', message }, 'admin'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining(String(MESSAGE_MAX_LENGTH)),
    });
    expect(saveNotification).not.toHaveBeenCalled();
  });

  it('текст ровно по границе принимается', async () => {
    const message = 'a'.repeat(MESSAGE_MAX_LENGTH);
    const response = await POST(await post({ brand: 'retail', message }, 'admin'));

    expect(response.status).toBe(200);
  });

  it('пробелы по краям обрезаются до сохранения', async () => {
    await POST(await post({ brand: 'retail', message: '  Updated  ' }, 'admin'));

    expect(saveNotification).toHaveBeenCalledWith({ brand: 'retail', message: 'Updated' });
  });
});

describe('CMS недоступна', () => {
  it('без токена записи — 503, а не молчаливый успех', async () => {
    delete process.env.STRAPI_WRITE_TOKEN;
    const response = await POST(await post({ brand: 'retail', message: 'Hi' }, 'admin'));

    expect(response.status).toBe(503);
  });

  it('ошибка сохранения доходит до редактора, а не теряется', async () => {
    saveNotification.mockRejectedValue(new Error('Strapi 500'));
    const response = await POST(await post({ brand: 'retail', message: 'Hi' }, 'admin'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ error: 'Strapi 500' });
  });
});
