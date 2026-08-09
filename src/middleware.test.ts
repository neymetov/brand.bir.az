import {
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';
import { NextRequest } from 'next/server';
import { createSessionCookieValue, SESSION_COOKIE, type Role } from '@/lib/auth/session';
import { config, middleware } from './middleware';

// MW-001…003 из _qa/qa-analysis.md.
//
// Пункты отчёта про префикс локали здесь не воспроизводятся: локализацию
// убрали 2026-08-07 (OPEN_QUESTIONS #56), путей вида /az/admin больше нет.

const ORIGIN = 'https://brand.bir.az';

async function request(pathname: string, role?: Role): Promise<NextRequest> {
  const nextRequest = new NextRequest(`${ORIGIN}${pathname}`);
  if (role) nextRequest.cookies.set(SESSION_COOKIE, await createSessionCookieValue(role));
  return nextRequest;
}

function location(response: Response): string {
  return new URL(response.headers.get('location') ?? '', ORIGIN).pathname;
}

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long!!';
});

describe('гейт без сессии (MW-001)', () => {
  it.each([
    '/',
    '/guidelines/retail',
    '/guidelines/retail/typography',
    '/admin',
    '/changelog',
  ])('%s → редирект на /login с исходным путём в from', async (pathname) => {
    const response = await middleware(await request(pathname));

    expect(response.status).toBe(307);
    expect(location(response)).toBe('/login');
    expect(new URL(response.headers.get('location') ?? '').searchParams.get('from')).toBe(pathname);
  });

  it.each(['/login', '/api/auth/login'])('%s доступен без сессии', async (pathname) => {
    const response = await middleware(await request(pathname));
    expect(response.headers.get('location')).toBeNull();
  });

  it.each([
    '/images/login-background.jpg',
    '/icons/dashboard/logo-bir.svg',
    '/icons/dashboard/view.svg',
    '/icons/dashboard/view-off.svg',
  ])('%s отдаётся без сессии: это видно на самом экране логина', async (pathname) => {
    // Иначе страница логина остаётся без фона, логотипа или глаза у пароля.
    const response = await middleware(await request(pathname));
    expect(response.headers.get('location')).toBeNull();
  });

  it('иконка, которой нет на экране логина, без сессии не отдаётся', async () => {
    // Проверяет, что список именно точечный: разрешён не каталог /icons/,
    // а перечисленные файлы.
    const response = await middleware(await request('/icons/dashboard/brand-marks/m10.svg'));
    expect(location(response)).toBe('/login');
  });
});

// Гейт состоит из двух частей, и вторую легко упустить: даже если функция
// разворачивает запрос, matcher может вообще не позвать её. Так и вышло —
// исключение `icons/` отдавало марки брендов без проверки сессии, а тесты
// функции при этом были зелёными.
describe('matcher доводит запрос до гейта', () => {
  const matcher = new RegExp(`^${config.matcher[0]}$`);

  it.each([
    '/',
    '/guidelines/retail/typography',
    '/images/covers/brand.jpg',
    '/icons/dashboard/brand-marks/m10.svg',
    '/api/media/file/1',
    '/downloads/brandbook.pdf',
  ])('%s проходит через миддлварь', (pathname) => {
    expect(matcher.test(pathname)).toBe(true);
  });

  it.each(['/_next/static/chunks/main.js', '/_next/image', '/favicon.ico'])(
    '%s минует её: это сборка, а не содержимое',
    (pathname) => {
      expect(matcher.test(pathname)).toBe(false);
    },
  );
});

describe('контент за паролем (MW-003)', () => {
  it.each([
    '/images/some-guideline-asset.png',
    '/fonts/secret.woff2',
    '/downloads/brandbook.pdf',
  ])('%s без сессии уходит на /login, а не отдаётся', async (pathname) => {
    // Смысл гейта — спрятать содержимое, а не только страницы.
    const response = await middleware(await request(pathname));
    expect(location(response)).toBe('/login');
  });

  it('файл отдаётся, когда сессия есть', async () => {
    const response = await middleware(await request('/downloads/brandbook.pdf', 'viewer'));
    expect(response.headers.get('location')).toBeNull();
  });
});

describe('/admin только для admin (MW-002)', () => {
  it.each(['/admin', '/admin/', '/admin/pages'])('viewer на %s → редирект на /', async (pathname) => {
    const response = await middleware(await request(pathname, 'viewer'));
    expect(location(response)).toBe('/');
  });

  it.each(['/admin', '/admin/pages'])('admin на %s проходит', async (pathname) => {
    const response = await middleware(await request(pathname, 'admin'));
    expect(response.headers.get('location')).toBeNull();
  });

  it('путь, лишь начинающийся на admin, не считается админским', async () => {
    // /administration — обычная страница; regex не должен цеплять её.
    const response = await middleware(await request('/administration', 'viewer'));
    expect(response.headers.get('location')).toBeNull();
  });
});

describe('обычные страницы для залогиненного', () => {
  it.each(['/', '/guidelines/retail', '/guidelines/retail/typography'])(
    '%s открывается с ролью viewer',
    async (pathname) => {
      const response = await middleware(await request(pathname, 'viewer'));
      expect(response.headers.get('location')).toBeNull();
    },
  );
});
