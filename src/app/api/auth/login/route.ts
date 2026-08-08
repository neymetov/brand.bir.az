import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSessionCookieValue, SESSION_COOKIE, type Role } from '@/lib/auth/session';

// §4: viewer-пароль — общий доступ, admin-пароль — более строгий, даёт доступ
// и к /admin, и ко всему остальному. Хэши сравниваются в порядке от более
// строгой роли к менее строгой, чтобы один пароль не мог случайно совпасть
// с обоими хэшами и всегда получал самую сильную применимую роль.
export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: 'invalid password' }, { status: 401 });
  }

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
