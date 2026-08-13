import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isStrapiWritable, STRAPI_NOT_WRITABLE } from '@/lib/strapi/client';
import { saveNavigation } from '@/lib/strapi/navigation';
import type { SidebarGroup } from '@/components/dashboard/Sidebar/sidebar.data';
import { isBrandId } from '@/lib/brands';

// Сохранение рубрик и разделов бренда. Как и у страниц: пишет серверный роут,
// токен записи в браузер не уходит.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (session?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!isStrapiWritable()) {
    return NextResponse.json({ error: STRAPI_NOT_WRITABLE }, { status: 503 });
  }

  const { brand, groups } = (await request.json()) as {
    brand?: string; groups?: SidebarGroup[];
  };

  if (!brand || !isBrandId(brand) || !Array.isArray(groups)) {
    return NextResponse.json({ error: 'unknown_brand' }, { status: 400 });
  }

  // Слаг — часть адреса. Пустой или с пробелами он даст неоткрываемую
  // страницу, поэтому проверяется до сохранения, а не после.
  const badSlug = groups
    .flatMap((group) => group.items)
    .find((item) => !SLUG.test(item.slug ?? ''));

  if (badSlug) {
    return NextResponse.json(
      { error: `Плохой слаг: "${badSlug.slug}". Только строчные латинские буквы, цифры и дефис.` },
      { status: 400 },
    );
  }

  // Два раздела с одним слагом в пределах бренда — это две страницы по одному
  // адресу: вторая будет недостижима.
  const slugs = groups.flatMap((group) => group.items).map((item) => item.slug);
  const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index);

  if (duplicate) {
    return NextResponse.json(
      { error: `Слаг "${duplicate}" повторяется — адреса разделов должны быть разными.` },
      { status: 400 },
    );
  }

  try {
    await saveNavigation(brand, groups);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'save_failed' },
      { status: 502 },
    );
  }
}
