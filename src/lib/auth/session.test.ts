import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { NextRequest } from 'next/server';
import {
  ABSOLUTE_LIFETIME_SECONDS,
  createSessionCookieValue,
  getSession,
  IDLE_TIMEOUT_SECONDS,
  needsRefresh,
  refreshSessionCookieValue,
  SESSION_COOKIE,
  sessionCookieOptions,
} from './session';

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
    await expect(getSession(request)).resolves.toMatchObject({ role: 'admin' });
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

// Время подменяется целиком, а не передаётся аргументом: срок «протухания»
// iron вшивает в значение по Date.now() в момент запечатывания. Передай мы
// момент только своим параметром — payload и подпись жили бы по разным часам,
// и проверка ничего бы не значила.
const T0 = 1_700_000_000_000;
const MINUTE = 60 * 1000;

function at(minutes: number): void {
  vi.setSystemTime(T0 + minutes * MINUTE);
}

describe('простой: час без запросов', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
    vi.useFakeTimers();
    at(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('незадолго до конца простоя сессия ещё жива', async () => {
    const value = await createSessionCookieValue('viewer');

    at(IDLE_TIMEOUT_SECONDS / 60 - 5);
    await expect(getSession(requestWithCookie(value))).resolves.toMatchObject({ role: 'viewer' });
  });

  it('после простоя перестаёт приниматься', async () => {
    const value = await createSessionCookieValue('admin');

    // Запас в пять минут: iron прощает расхождение часов (60 с по умолчанию),
    // поэтому ровно на границе значение ещё принимается.
    at(IDLE_TIMEOUT_SECONDS / 60 + 5);
    await expect(getSession(requestWithCookie(value))).resolves.toBeNull();
  });

  it('активность продлевает простой', async () => {
    // Смысл требования «каждая сессия начинается со ввода пароля»: час
    // отсчитывается от последнего запроса, а не от входа, иначе работающего
    // человека выкидывало бы посреди дела.
    const first = await createSessionCookieValue('viewer');

    at(40);
    const session = await getSession(requestWithCookie(first));
    expect(session).not.toBeNull();
    const refreshed = await refreshSessionCookieValue(session!);

    // Через 90 минут после ВХОДА, но через 50 после активности — жива.
    at(90);
    await expect(getSession(requestWithCookie(refreshed))).resolves.toMatchObject({
      role: 'viewer',
    });
  });

  it('без активности продление не спасает: час считается от последнего запроса', async () => {
    const first = await createSessionCookieValue('viewer');

    at(40);
    const session = await getSession(requestWithCookie(first));
    const refreshed = await refreshSessionCookieValue(session!);

    // 40 + 65 минут: с момента последней активности прошло больше часа.
    at(105);
    await expect(getSession(requestWithCookie(refreshed))).resolves.toBeNull();
  });
});

describe('общий предел: 12 часов от входа', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
    vi.useFakeTimers();
    at(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('предел больше простоя, иначе он ничего не ограничивает', () => {
    expect(ABSOLUTE_LIFETIME_SECONDS).toBeGreaterThan(IDLE_TIMEOUT_SECONDS);
  });

  it('продление НЕ сдвигает момент входа', async () => {
    // Иначе вкладка, которая сама себя обновляет, жила бы вечно и пароль
    // не спрашивался бы никогда.
    const value = await createSessionCookieValue('viewer');
    const session = await getSession(requestWithCookie(value));

    at(30);
    const refreshed = await refreshSessionCookieValue(session!);
    const after = await getSession(requestWithCookie(refreshed));

    expect(after?.startedAt).toBe(T0);
  });

  it('после предела сессия мертва, даже если активность не прерывалась', async () => {
    let value = await createSessionCookieValue('viewer');
    const limitMinutes = ABSOLUTE_LIFETIME_SECONDS / 60;

    // Имитируем непрерывную работу: запрос и продление каждые полчаса.
    for (let minutes = 30; minutes < limitMinutes; minutes += 30) {
      at(minutes);
      // eslint-disable-next-line no-await-in-loop -- продления идут по порядку
      const session = await getSession(requestWithCookie(value));
      expect(session, `сессия умерла раньше предела, на ${minutes} мин`).not.toBeNull();
      // eslint-disable-next-line no-await-in-loop
      value = await refreshSessionCookieValue(session!);
    }

    at(limitMinutes + 1);
    await expect(getSession(requestWithCookie(value))).resolves.toBeNull();
  });

  it('кука без отметки о входе не принимается', async () => {
    // Подпись у такой куки сойдётся (её печатали тем же секретом), но общий
    // предел по ней не проверить — доверять ей нельзя.
    const { sealData } = await import('iron-session');
    const legacy = await sealData({ role: 'admin' }, {
      password: SECRET,
      ttl: IDLE_TIMEOUT_SECONDS,
    });

    await expect(getSession(requestWithCookie(legacy))).resolves.toBeNull();
  });
});

describe('флаги cookie одинаковы при входе и продлении', () => {
  it('httpOnly и path заданы, срока хранения нет', () => {
    // Без maxAge/expires cookie сессионная: браузер обязан выбросить её при
    // закрытии. Появись здесь maxAge — сессия пережила бы перезапуск.
    const options = sessionCookieOptions();

    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe('/');
    expect(options.sameSite).toBe('lax');
    expect(options).not.toHaveProperty('maxAge');
    expect(options).not.toHaveProperty('expires');
  });
});

describe('перевыпуск не на каждом запросе', () => {
  it('сразу после выпуска обновлять не нужно', () => {
    const t0 = Date.now();
    expect(needsRefresh({ role: 'viewer', startedAt: t0, issuedAt: t0 }, t0 + 1000)).toBe(false);
  });

  it('после половины окна — пора', () => {
    // Перепечатывание — это шифрование, а через миддлварь проходит каждая
    // иконка на странице (№113).
    const t0 = Date.now();
    const half = (IDLE_TIMEOUT_SECONDS / 2) * 1000;
    expect(needsRefresh({ role: 'viewer', startedAt: t0, issuedAt: t0 }, t0 + half + 1)).toBe(true);
  });
});

describe('SESSION_SECRET (AUTH-008)', () => {
  it('без секрета создание сессии падает с внятной ошибкой', async () => {
    delete process.env.SESSION_SECRET;
    await expect(createSessionCookieValue('viewer')).rejects.toThrow(/SESSION_SECRET/);
    process.env.SESSION_SECRET = SECRET;
  });
});
