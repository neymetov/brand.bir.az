import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// §4: /admin/* требует роль admin, всё остальное — минимум viewer. admin
// даёт доступ и туда, и туда. /admin здесь — собственный роут ЭТОГО
// Next.js-приложения, не Strapi admin panel.
//
// Локализации нет: сайт только на английском (решение пользователя,
// 2026-08-07). Раньше здесь после auth стоял next-intl, который уводил
// запросы на /az/... — вместе с ним ушла и вся возня с префиксами локали.

// Ассеты самого экрана логина. Их запрашивает страница, которую видит ещё не
// авторизованный пользователь, поэтому они обязаны проходить гейт — иначе
// уходят в редирект на /login и экран остаётся без фона.
//
// Список точечный, а не «пропускать всё из public/»: за паролем прячется
// именно содержимое (гайдлайны, макеты, шрифты, PDF), и открывать его целиком
// ради одной картинки нельзя.
const loginAssets = new Set(['/images/login-background.jpg']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') || loginAssets.has(pathname)) {
    return NextResponse.next();
  }

  const session = await getSession(request);

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = /^\/admin(?:\/|$)/.test(pathname);
  if (isAdminRoute && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/).*)'],
};
