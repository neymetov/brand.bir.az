import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  needsRefresh,
  refreshSessionCookieValue,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth/session';

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
// ради одной картинки нельзя. Здесь ровно то, что видно до входа: фон, логотип
// и два глаза у поля пароля. Добавлять сюда что-то ещё можно, только если оно
// действительно рисуется на экране логина.
const loginAssets = new Set([
  '/images/login-background.jpg',
  '/images/login-background.mp4',
  '/icons/dashboard/logo-bir.svg',
  '/icons/dashboard/view.svg',
  '/icons/dashboard/view-off.svg',
]);

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

  const response = NextResponse.next();

  // Продление простоя живёт здесь, а не в каждом роуте: миддлварь — то
  // единственное место, через которое проходит любой запрос, и только так
  // «час без запросов» считается от реальной активности, а не от входа.
  if (needsRefresh(session)) {
    response.cookies.set(
      SESSION_COOKIE,
      await refreshSessionCookieValue(session),
      sessionCookieOptions(),
    );
  }

  return response;
}

// Исключено только то, без чего не отрисуется сам экран логина: сборка Next.js
// (`_next/*`) и иконка вкладки. `icons/` отсюда убран сознательно — под ним
// лежат марки брендов и глифы дизайн-системы, то есть тоже содержимое, а
// исключение в matcher отдавало их вообще без проверки сессии (проверено
// запросом без куки: 200). Нужные экрану логина файлы теперь проходят через
// loginAssets поимённо.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
