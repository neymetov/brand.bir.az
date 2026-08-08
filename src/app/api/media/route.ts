import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { listFiles, type MediaKind } from '@/lib/strapi/media';

// Прокси медиатеки Strapi для редактора. Нужен именно прокси, а не прямой
// запрос из браузера: STRAPI_API_TOKEN даёт запись в CMS и не должен покидать
// сервер. Заодно здесь проверяется роль — список файлов видит только admin.
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (session?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Пока Strapi не подключён, редактор должен честно об этом сообщать, а не
  // падать: 503 + флаг, по которому пикер покажет ручной ввод URL.
  if (!isStrapiConfigured()) {
    return NextResponse.json(
      { error: 'strapi_not_configured', items: [] },
      { status: 503 },
    );
  }

  try {
    // ?kind=font — шрифты для FontfaceViewer, ?kind=file — любые файлы для
    // файлового менеджера, по умолчанию картинки. Неизвестное значение
    // трактуем как картинки, а не как «всё»: расширять доступ по опечатке в
    // параметре — не то поведение, которое хочется по умолчанию.
    const requested = request.nextUrl.searchParams.get('kind');
    const kind: MediaKind = requested === 'font' || requested === 'file' ? requested : 'image';

    const items = await listFiles(kind);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'strapi_error', items: [] },
      { status: 502 },
    );
  }
}
