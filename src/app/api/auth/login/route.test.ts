import {
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { POST } from './route';

// AUTH-001…006 из _qa/qa-analysis.md.

const VIEWER_PASSWORD = 'viewer-password';
const ADMIN_PASSWORD = 'admin-password';
const SHARED_PASSWORD = 'matches-both-hashes';

function post(body: unknown): NextRequest {
  return new NextRequest('https://brand.bir.az/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long!!';
  process.env.VIEWER_PASSWORD_HASH = bcrypt.hashSync(VIEWER_PASSWORD, 4);
  process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 4);
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
