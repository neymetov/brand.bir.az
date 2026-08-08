import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isStrapiWritable } from '@/lib/strapi/client';
import { savePage } from '@/lib/strapi/pages';
import { craftToDynamicZone, type CraftTree } from '@/lib/craft/strapiMapping';
import { publishedGuidelineBrands, type FintechBrand } from '@/lib/brands';
import { sidebarDirectory } from '@/components/dashboard/Sidebar/sidebar.data';

// Сохранение страницы из редактора. Отдельный роут, а не запрос из браузера
// в CMS: токен записи не должен покидать сервер — утечка давала бы право
// менять контент кому угодно.

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (session?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!isStrapiWritable()) {
    return NextResponse.json({ error: 'strapi_not_writable' }, { status: 503 });
  }

  const {
    brand, slug, tree, publish,
  } = (await request.json()) as {
    brand?: string;
    slug?: string;
    tree?: CraftTree;
    publish?: boolean;
  };

  // Навигация живёт в коде, поэтому и адрес страницы проверяется по ней:
  // сохранить контент в раздел, которого нет в реестре, невозможно.
  const knownBrand = publishedGuidelineBrands.includes(brand as FintechBrand);
  const known = knownBrand && sidebarDirectory[brand as FintechBrand]
    .some((group) => group.items.some((entry) => entry.slug === slug));

  if (!known || !tree) {
    return NextResponse.json({ error: 'unknown_page' }, { status: 400 });
  }

  const item = sidebarDirectory[brand as FintechBrand]
    .flatMap((group) => group.items)
    .find((entry) => entry.slug === slug)!;

  try {
    const saved = await savePage({
      brand: brand as FintechBrand,
      slug: slug!,
      title: item.label,
      content: craftToDynamicZone(tree),
      publish: publish === true,
    });
    return NextResponse.json({ documentId: saved.documentId, published: publish === true });
  } catch (error) {
    // Текст ошибки нужен админу: без него непонятно, что именно не принял
    // Strapi. Роут admin-only, наружу это не уходит.
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'save_failed' },
      { status: 502 },
    );
  }
}
