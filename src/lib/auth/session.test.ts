import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { NextRequest } from 'next/server';
import { createSessionCookieValue, getSession, SESSION_COOKIE } from './session';

// AUTH-007, AUTH-008 из _qa/qa-analysis.md.

const SECRET = 'test-secret-at-least-32-characters-long!!';
const OTHER_SECRET = 'completely-different-secret-32-chars-long';

function requestWithCookie(value?: string): NextRequest {
  const request = new NextRequest('https://brand.bir.az/guidelines/retail');
  if (value !== undefined) request.cookies.set(SESSION_COOKIE, value);
  return request;
}

describe('getSession (AUTH-007)', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
  });

  afterEach(() => {
    process.env.SESSION_SECRET = SECRET;
  });

  it('читает роль из корректной cookie', async () => {
    const request = requestWithCookie(await createSessionCookieValue('admin'));
    await expect(getSession(request)).resolves.toEqual({ role: 'admin' });
  });

  it('без cookie возвращает null', async () => {
    await expect(getSession(requestWithCookie())).resolves.toBeNull();
  });

  it('на мусор в cookie возвращает null, а не бросает', async () => {
    // Если бы бросал — middleware отдавал бы 500 вместо мягкого разлогина.
    await expect(getSession(requestWithCookie('not-a-sealed-value'))).resolves.toBeNull();
  });

  it('cookie, запечатанная другим секретом, не принимается', async () => {
    process.env.SESSION_SECRET = OTHER_SECRET;
    const foreign = await createSessionCookieValue('admin');

    process.env.SESSION_SECRET = SECRET;
    await expect(getSession(requestWithCookie(foreign))).resolves.toBeNull();
  });

  it('подмена одного символа в cookie ломает подпись', async () => {
    const valid = await createSessionCookieValue('viewer');
    const tampered = `${valid.slice(0, -1)}${valid.at(-1) === 'a' ? 'b' : 'a'}`;
    await expect(getSession(requestWithCookie(tampered))).resolves.toBeNull();
  });
});

describe('SESSION_SECRET (AUTH-008)', () => {
  it('без секрета создание сессии падает с внятной ошибкой', async () => {
    delete process.env.SESSION_SECRET;
    await expect(createSessionCookieValue('viewer')).rejects.toThrow(/SESSION_SECRET/);
    process.env.SESSION_SECRET = SECRET;
  });
});
