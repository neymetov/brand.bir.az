import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isStrapiConfigured } from '@/lib/strapi/client';
import { getFileById } from '@/lib/strapi/media';

// Отдача файла из медиатеки через свой домен.
//
// Решение пользователя (2026-08-09): файлы приватные. До этого адрес вида
// `<cms>/uploads/...` открывался кем угодно без пароля — проверено запросом
// без токена и сессии. Теперь путь один: сюда, и только с сессией.
//
// Заодно чинится скачивание: атрибут `download` работает только для файлов
// со своего домена, а с чужого браузер его игнорирует и просто открывает
// файл (docs/OPEN_QUESTIONS.md №27, №36, №69).

export async function GET(
  request: NextRequest,
  { params }: { readonly params: Promise<{ id: string }> },
) {
  const session = await getSession(request);
  // Читателю файлы нужны — картинки в гайдлайнах; закрываем только от тех,
  // кто вообще не вошёл.
  if (!session) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!isStrapiConfigured()) {
    return NextResponse.json({ error: 'strapi_not_configured' }, { status: 503 });
  }

  const { id } = await params;
  const fileId = Number(id);
  if (!Number.isInteger(fileId) || fileId <= 0) {
    return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  }

  try {
    const file = await getFileById(fileId);
    if (!file) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    // Адрес файла в хранилище known только серверу: с приватным бакетом это
    // будет presigned-ссылка, и перевыпустить её можно как раз по id.
    const upstream = await fetch(file.sourceUrl, { cache: 'no-store' });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'upstream_failed' }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': file.mime,
        // private: файл за паролем, и промежуточные кэши не должны его
        // хранить и раздавать другим.
        'Cache-Control': 'private, max-age=300',
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'upstream_failed' }, { status: 502 });
  }
}
