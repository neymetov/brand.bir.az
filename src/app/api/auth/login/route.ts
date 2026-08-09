import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSessionCookieValue, SESSION_COOKIE, type Role } from '@/lib/auth/session';
import { recordFailure, recordSuccess, retryAfterSeconds } from '@/lib/auth/loginAttempts';

// §4: viewer-пароль — общий доступ, admin-пароль — более строгий, даёт доступ
// и к /admin, и ко всему остальному. Хэши сравниваются в порядке от более
// строгой роли к менее строгой, чтобы один пароль не мог случайно совпасть
// с обоими хэшами и всегда получал самую сильную применимую роль.

// Адрес обращающегося. В Next.js 15 у запроса больше нет `ip`, остаются только
// заголовки — а их подделывает кто угодно. Поэтому на этот ключ полагается
// лишь предел «на адрес»; от подделки страхует общий предел (см. loginAttempts).
function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  const client = clientKey(request);

  // Проверка предела стоит перед разбором тела и сверкой хэша: bcrypt считается
  // намеренно медленно, и пропускать до него поток попыток — значит оставлять
  // способ загрузить процессор досуха.
  const retryAfter = retryAfterSeconds(client);
  if (retryAfter !== null) {
    // Ответ одинаков и для верного пароля: подсказывать, что угадали, нельзя.
    return NextResponse.json(
      { error: 'too many attempts' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const { password } = (await request.json()) as { password?: string };

  if (!password) {
    return NextResponse.json({ error: 'password required' }, { status: 400 });
  }

  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const viewerHash = process.env.VIEWER_PASSWORD_HASH;

  let role: Role | null = null;
  if (adminHash && (await bcrypt.compare(password, adminHash))) {
    role = 'admin';
  } else if (viewerHash && (await bcrypt.compare(password, viewerHash))) {
    role = 'viewer';
  }

  if (!role) {
    recordFailure(client);
    // Единственный след неудачного входа: без него подбор шёл бы совсем
    // незаметно. Пароль сюда не попадает — ни целиком, ни частями.
    // Отдельного логгера в проекте нет, поэтому пишем в поток сервера.
    // eslint-disable-next-line no-console -- намеренная запись события безопасности
    console.warn(`[auth] неверный пароль, адрес ${client}, ${new Date().toISOString()}`);
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }

  recordSuccess(client);

  const cookieValue = await createSessionCookieValue(role);
  const response = NextResponse.json({ role });
  response.cookies.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
