import 'server-only';
import { strapiFetch } from './client';

// Работа с медиатекой Strapi (плагин upload). Формат ответа — нативный
// для Strapi v5 `/upload/files`.

/** Файл медиатеки в том виде, в каком его отдаёт Strapi. */
interface StrapiUploadFile {
  readonly id: number;
  readonly name: string;
  readonly url: string;
  readonly mime: string;
  readonly width?: number;
  readonly height?: number;
  readonly alternativeText?: string | null;
  readonly formats?: Record<string, { readonly url: string }> | null;
}

/** То, что нужно пикеру и блоку — без лишних полей Strapi. */
export interface MediaLibraryItem {
  readonly id: number;
  readonly name: string;
  readonly url: string;
  /** Уменьшенная версия для сетки пикера, если Strapi её сгенерировал. */
  readonly thumbnailUrl: string;
  readonly alt: string;
}

/**
 * Strapi отдаёт url либо абсолютным (когда провайдер — S3), либо
 * относительным (локальный провайдер). Второй случай нужно достроить до
 * абсолютного, иначе картинка не загрузится с другого домена.
 */
function absoluteUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.STRAPI_API_URL?.replace(/\/api\/?$/, '').replace(/\/$/, '') ?? '';
  return `${base}${url}`;
}

function toLibraryItem(file: StrapiUploadFile): MediaLibraryItem {
  return {
    id: file.id,
    name: file.name,
    url: absoluteUrl(file.url),
    thumbnailUrl: absoluteUrl(file.formats?.thumbnail?.url ?? file.url),
    alt: file.alternativeText ?? '',
  };
}

/**
 * Что показывать в пикере: картинки, файлы шрифтов или вообще любые файлы.
 *
 * `file` не фильтрует ничего: файловому менеджеру нужны PDF, AI, ZIP и что
 * угодно ещё, а перечислять допустимые расширения значило бы обновлять код
 * при каждом новом формате.
 */
export type MediaKind = 'image' | 'font' | 'file';

/**
 * Шрифты Strapi отдаёт с разными mime: `font/woff2`, но нередко и
 * `application/octet-stream` или `application/font-woff` — зависит от того,
 * что определил браузер при загрузке. Поэтому фильтруем ещё и по
 * расширению, иначе часть загруженных шрифтов просто не попадёт в список.
 */
const FONT_EXTENSIONS = /\.(woff2?|ttf|otf)$/i;

function matchesKind(file: StrapiUploadFile, kind: MediaKind): boolean {
  if (kind === 'file') return true;
  if (kind === 'image') return file.mime.startsWith('image/');
  return file.mime.startsWith('font/') || FONT_EXTENSIONS.test(file.name);
}

/** Список файлов медиатеки для пикера. */
export async function listFiles(
  kind: MediaKind = 'image',
  pageSize = 60,
): Promise<MediaLibraryItem[]> {
  const files = await strapiFetch<StrapiUploadFile[]>(
    `/upload/files?sort=createdAt:desc&pagination[pageSize]=${pageSize}`,
  );

  return files.filter((file) => matchesKind(file, kind)).map(toLibraryItem);
}

/**
 * Свежая ссылка на файл по его id — то, ради чего блок хранит id рядом с url.
 * У приватного бакета Strapi выдаёт presigned URL с конечным сроком, и после
 * его истечения сохранённый в контенте url перестаёт работать; этот запрос
 * возвращает актуальный.
 */
export async function resolveImageUrl(id: number): Promise<string> {
  const file = await strapiFetch<StrapiUploadFile>(`/upload/files/${id}`);
  return absoluteUrl(file.url);
}
