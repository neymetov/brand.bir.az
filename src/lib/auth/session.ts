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

// Требование пользователя (2026-08-10): каждая сессия должна начинаться со
// ввода пароля. У cookie нет maxAge — она сессионная и должна умирать вместе с
// браузером, но одного этого мало: Chrome и Firefox с настройкой «продолжить с
// того же места» ВОССТАНАВЛИВАЮТ сессионные cookie после перезапуска. Значит
// «новый запуск браузера = новый вход» браузером не гарантируется, и опираться
// приходится на время.
//
// Отсюда два срока:
//
// 1) Простой. Если запросов не было дольше часа — вход заново. Срок вшит в
//    запечатанное значение, а само значение перевыпускается по ходу работы,
//    поэтому счёт идёт от последней активности, а не от входа.
export const IDLE_TIMEOUT_SECONDS = 60 * 60;

// 2) Общий предел. Иначе открытая вкладка, которая сама себя обновляет,
//    продлевала бы сессию бесконечно и пароль не спрашивался бы никогда.
//    Считается от входа и никакой активностью не сдвигается.
export const ABSOLUTE_LIFETIME_SECONDS = 12 * 60 * 60;

interface SessionPayload {
  role: Role;
  /** Момент ввода пароля. Общий предел считается от него и не продлевается. */
  startedAt: number;
  /** Момент последнего перевыпуска — по нему решаем, пора ли обновлять. */
  issuedAt: number;
}

export interface Session {
  readonly role: Role;
  readonly startedAt: number;
  readonly issuedAt: number;
}

/**
 * Флаги cookie сессии. Одни и те же при входе и при продлении: разойдись они
 * хоть в одном поле — продление тихо сняло бы httpOnly или secure, и защита
 * ослабла бы посреди работы, а не при входе, где это заметили бы тесты.
 *
 * Функция, а не константа: `secure` зависит от NODE_ENV, и вычислять его при
 * загрузке модуля значит намертво зафиксировать то, что было на импорте.
 *
 * maxAge/expires нет намеренно — cookie сессионная и должна исчезать вместе с
 * браузером (см. комментарий к срокам выше).
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  } as const;
}

function getSessionPassword(): string {
  const password = process.env.SESSION_SECRET;
  if (!password) {
    throw new Error('SESSION_SECRET is not set — see .env.example');
  }
  return password;
}

function seal(payload: SessionPayload): Promise<string> {
  return sealData(payload, {
    password: getSessionPassword(),
    ttl: IDLE_TIMEOUT_SECONDS,
  });
}

/**
 * Новая сессия: сразу после успешного ввода пароля.
 *
 * `now` задаёт только отметки внутри значения (общий предел считается по ним).
 * Срок простоя им не сдвинуть: его iron вшивает в значение по собственным
 * часам в момент запечатывания. Подделать «давно неактивную» сессию, передав
 * прошлое время, нельзя — это выяснилось на проверке и стоит помнить.
 */
export async function createSessionCookieValue(
  role: Role,
  now: number = Date.now(),
): Promise<string> {
  return seal({ role, startedAt: now, issuedAt: now });
}

/**
 * Продлевает простой, не трогая общий предел: `startedAt` переносится как
 * есть. Иначе активный пользователь никогда бы не упёрся в предел, и тот
 * ничего бы не ограничивал.
 */
export async function refreshSessionCookieValue(
  session: Session,
  now: number = Date.now(),
): Promise<string> {
  return seal({ role: session.role, startedAt: session.startedAt, issuedAt: now });
}

/**
 * Пора ли перевыпускать. Не на каждом запросе: перепечатывание — это
 * шифрование, а после закрытия иконок гейтом (№113) через миддлварь проходит
 * каждый значок на странице.
 *
 * Плата за это — размытая граница: если последний запрос пришёл раньше
 * половины окна, простой отсчитывается не от него, а от прошлого перевыпуска.
 * То есть фактический простой лежит между получасом и часом, а не ровно час.
 */
export function needsRefresh(session: Session, now: number = Date.now()): boolean {
  return now - session.issuedAt > (IDLE_TIMEOUT_SECONDS / 2) * 1000;
}

/** Читает и валидирует сессию из cookie запроса. null — не залогинен. */
export async function getSession(
  request: NextRequest,
  now: number = Date.now(),
): Promise<Session | null> {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const data = await unsealData<SessionPayload>(raw, {
      password: getSessionPassword(),
      ttl: IDLE_TIMEOUT_SECONDS,
    });

    // На просроченном значении unsealData не бросает, а возвращает пустой
    // объект — поэтому проверка роли здесь и есть проверка простоя.
    if (!data.role) return null;

    // Куки без startedAt быть не может: её выпускает только этот модуль.
    // Если такая пришла — значит значение собрано не нами, и доверять ему
    // нельзя, даже если подпись сошлась (например, старый формат после
    // выката, где общего предела ещё не было).
    if (typeof data.startedAt !== 'number' || typeof data.issuedAt !== 'number') {
      return null;
    }

    if (now - data.startedAt > ABSOLUTE_LIFETIME_SECONDS * 1000) return null;

    return { role: data.role, startedAt: data.startedAt, issuedAt: data.issuedAt };
  } catch {
    // подделанная кука — трактуем как разлогин
    return null;
  }
}
