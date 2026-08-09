import { sealData, unsealData } from 'iron-session';
import type { NextRequest } from 'next/server';

// §4: два shared-аккаунта (viewer / admin), bcrypt-хэши в env/keystore,
// signed httpOnly cookie после логина. Никакой таблицы пользователей, никакого
// полноценного audit trail — осознанно (команда маленькая, ≤2 редактора).
//
// sealData/unsealData (а не getIronSession) — работает и в edge middleware,
// и в route handlers без необходимости заранее иметь Response-объект.
export type Role = 'viewer' | 'admin';

export const SESSION_COOKIE = 'bb_session';

// Умолчание iron-session — 14 дней. Это слишком долго: отозвать одно
// запечатанное значение нельзя, и утёкшая кука работала бы две недели. Отобрать
// доступ можно только сменой SESSION_SECRET, а она выкидывает сразу всех.
// Двое суток — компромисс: заходящий каждый день вводит пароль примерно раз в
// два дня, а окно у украденной куки сокращается в семь раз.
//
// Срок вшит в само значение при запечатывании, поэтому одного числа хватает и
// на выпуск, и на проверку. У cookie при этом намеренно нет maxAge: она
// сессионная и умирает вместе с закрытым браузером — то есть на деле живёт
// не дольше этого срока, а обычно меньше.
export const SESSION_TTL_SECONDS = 2 * 24 * 60 * 60;

interface SessionPayload {
  role: Role;
}

function getSessionPassword(): string {
  const password = process.env.SESSION_SECRET;
  if (!password) {
    throw new Error('SESSION_SECRET is not set — see .env.example');
  }
  return password;
}

export async function createSessionCookieValue(role: Role): Promise<string> {
  return sealData({ role } satisfies SessionPayload, {
    password: getSessionPassword(),
    ttl: SESSION_TTL_SECONDS,
  });
}

/** Читает и валидирует сессию из cookie запроса. null — не залогинен. */
export async function getSession(
  request: NextRequest,
): Promise<{ role: Role } | null> {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const data = await unsealData<SessionPayload>(raw, {
      password: getSessionPassword(),
      ttl: SESSION_TTL_SECONDS,
    });
    // На просроченном значении unsealData не бросает, а возвращает пустой
    // объект — поэтому проверка роли здесь и есть проверка срока.
    return data.role ? { role: data.role } : null;
  } catch {
    // подделанная кука — трактуем как разлогин
    return null;
  }
}
