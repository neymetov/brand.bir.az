import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isStrapiWritable } from '@/lib/strapi/client';
import { MESSAGE_MAX_LENGTH, saveNotification } from '@/lib/strapi/notification';
import { isBrandId } from '@/lib/brands';

// Сохранение объявления в сайдбаре. Как и у страниц с навигацией: пишет
// серверный роут, токен записи в браузер не уходит.
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (session?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!isStrapiWritable()) {
    return NextResponse.json({ error: 'strapi_not_writable' }, { status: 503 });
  }

  const { brand, message } = (await request.json()) as {
    brand?: string; message?: string;
  };

  // Бренд определяет и логотип, и адрес кнопки: незнакомый дал бы битую
  // ссылку, поэтому сверяется с реестром до сохранения.
  if (!brand || !isBrandId(brand)) {
    return NextResponse.json({ error: 'unknown_brand' }, { status: 400 });
  }

  const text = message?.trim() ?? '';

  if (!text) {
    return NextResponse.json(
      { error: 'Текст объявления не может быть пустым.' },
      { status: 400 },
    );
  }

  // То же ограничение, что в схеме Strapi. Проверяем здесь тоже: браузерный
  // maxlength обходится обычным запросом мимо формы, а Strapi ответил бы на
  // это невнятной ошибкой валидации.
  if (text.length > MESSAGE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Слишком длинный текст: ${text.length} символов из ${MESSAGE_MAX_LENGTH}.` },
      { status: 400 },
    );
  }

  try {
    await saveNotification({ brand, message: text });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'save_failed' },
      { status: 502 },
    );
  }
}
