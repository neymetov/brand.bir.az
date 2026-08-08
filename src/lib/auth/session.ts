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
    });
    return data.role ? { role: data.role } : null;
  } catch {
    // просроченная/подделанная кука — трактуем как разлогин
    return null;
  }
}
