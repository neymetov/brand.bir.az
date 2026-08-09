import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { PER_CLIENT_LIMIT, resetAttempts } from '@/lib/auth/loginAttempts';
import { POST } from './route';

// AUTH-001…006 из _qa/qa-analysis.md.

const VIEWER_PASSWORD = 'viewer-password';
const ADMIN_PASSWORD = 'admin-password';
const SHARED_PASSWORD = 'matches-both-hashes';

// Каждый тест ходит со своего адреса: счётчик попыток общий на весь модуль,
// и без этого соседние тесты запирали бы друг друга.
let clientCounter = 0;

function post(body: unknown, client = `10.9.0.${(clientCounter += 1)}`): NextRequest {
  return new NextRequest('https://brand.bir.az/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': client },
    body: JSON.stringify(body),
  });
}

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long!!';
  process.env.VIEWER_PASSWORD_HASH = bcrypt.hashSync(VIEWER_PASSWORD, 4);
  process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 4);
});

beforeEach(() => {
  resetAttempts();
  // Неудачные входы пишутся в консоль — в выводе тестов это лишний шум.
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/auth/login — роли (AUTH-002, AUTH-003)', () => {
  it('пароль администратора даёт роль admin', async () => {
    const response = await POST(post({ password: ADMIN_PASSWORD }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ role: 'admin' });
  });

  it('пароль viewer даёт роль viewer', async () => {
    const response = await POST(post({ password: VIEWER_PASSWORD }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ role: 'viewer' });
  });
});

describe('POST /api/auth/login — порядок проверки (AUTH-004)', () => {
  it('пароль, подходящий обоим хэшам, даёт самую сильную роль', async () => {
    // Хэши разные, но пароль подходит к обоим — так проверяется, что admin
    // сверяется первым, а не то, что совпали строки.
    const savedViewer = process.env.VIEWER_PASSWORD_HASH;
    const savedAdmin = process.env.ADMIN_PASSWORD_HASH;
    process.env.VIEWER_PASSWORD_HASH = bcrypt.hashSync(SHARED_PASSWORD, 4);
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(SHARED_PASSWORD, 4);

    const response = await POST(post({ password: SHARED_PASSWORD }));
    await expect(response.json()).resolves.toEqual({ role: 'admin' });

    process.env.VIEWER_PASSWORD_HASH = savedViewer;
    process.env.ADMIN_PASSWORD_HASH = savedAdmin;
  });
});

describe('POST /api/auth/login — отказы (AUTH-001, AUTH-005)', () => {
  it.each([
    ['пустой пароль', { password: '' }],
    ['без поля password', {}],
  ])('%s → 400 без cookie', async (_label, body) => {
    const response = await POST(post(body));
    expect(response.status).toBe(400);
    expect(response.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it('неверный пароль → 401 и cookie не ставится', async () => {
    const response = await POST(post({ password: 'wrong' }));
    expect(response.status).toBe(401);
    expect(response.cookies.get(SESSION_COOKIE)).toBeUndefined();
    expect(response.headers.get('set-cookie')).toBeNull();
  });
});

// Попытки здесь намеренно идут одна за другой: проверяется счётчик, а он
// считает последовательность. Параллельный Promise.all проверял бы другое.
/* eslint-disable no-await-in-loop */
describe('POST /api/auth/login — ограничение попыток', () => {
  const CLIENT = '203.0.113.7';

  async function guess(password: string) {
    return POST(post({ password }, CLIENT));
  }

  it(`после ${PER_CLIENT_LIMIT} промахов подряд отвечает 429`, async () => {
    for (let i = 0; i < PER_CLIENT_LIMIT; i += 1) {
      expect((await guess(`wrong-${i}`)).status).toBe(401);
    }

    const response = await guess('wrong-again');
    expect(response.status).toBe(429);
    expect(Number(response.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('верный пароль под запретом тоже отбивается — и не выдаёт, что угадан', async () => {
    // Иначе перебор всё равно достигал бы цели: 429 на неверный и 200 на
    // верный сам по себе сообщал бы ответ.
    for (let i = 0; i < PER_CLIENT_LIMIT; i += 1) await guess(`wrong-${i}`);

    const response = await guess(ADMIN_PASSWORD);
    expect(response.status).toBe(429);
    expect(response.cookies.get(SESSION_COOKIE)).toBeUndefined();
  });

  it('пароль не проверяется, пока запрет действует', async () => {
    // Смысл предела в том числе в нагрузке: bcrypt считается намеренно
    // медленно, и допускать до него поток попыток нельзя.
    const compare = vi.spyOn(bcrypt, 'compare');
    for (let i = 0; i < PER_CLIENT_LIMIT; i += 1) await guess(`wrong-${i}`);
    compare.mockClear();

    await guess('wrong-again');
    expect(compare).not.toHaveBeenCalled();
  });

  it('удачный вход снимает накопленные промахи', async () => {
    for (let i = 0; i < PER_CLIENT_LIMIT - 1; i += 1) {
      expect((await guess(`wrong-${i}`)).status).toBe(401);
    }
    expect((await guess(VIEWER_PASSWORD)).status).toBe(200);

    for (let i = 0; i < PER_CLIENT_LIMIT - 1; i += 1) {
      expect((await guess(`wrong-again-${i}`)).status).toBe(401);
    }
  });

  it('промах записывается в журнал, но без пароля', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await guess('super-secret-guess');

    expect(warn).toHaveBeenCalledTimes(1);
    const line = String(warn.mock.calls[0]?.[0]);
    expect(line).toContain(CLIENT);
    expect(line).not.toContain('super-secret-guess');
  });
});
/* eslint-enable no-await-in-loop */

describe('POST /api/auth/login — флаги cookie (AUTH-006)', () => {
  it('cookie httpOnly, sameSite=lax, path=/', async () => {
    const response = await POST(post({ password: VIEWER_PASSWORD }));
    const cookie = response.cookies.get(SESSION_COOKIE);

    expect(cookie).toBeDefined();
    // httpOnly — чтобы сессию нельзя было прочитать из JS при XSS.
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
    expect(cookie?.path).toBe('/');
  });

  it('secure выключен вне production — иначе локальный вход по http не работает', async () => {
    const response = await POST(post({ password: VIEWER_PASSWORD }));
    expect(response.cookies.get(SESSION_COOKIE)?.secure).toBe(false);
  });

  it('в cookie лежит не сам пароль и не открытая роль', async () => {
    const response = await POST(post({ password: ADMIN_PASSWORD }));
    const value = response.cookies.get(SESSION_COOKIE)?.value ?? '';

    expect(value).not.toContain(ADMIN_PASSWORD);
    // Значение запечатано iron-session: роль внутри, но не текстом.
    expect(value.startsWith('Fe26.2')).toBe(true);
  });
});
