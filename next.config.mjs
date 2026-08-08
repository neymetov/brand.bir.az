/**
 * Источники медиа берутся из env, а не хардкодятся: у dev/qa/preprod/prod
 * разные Strapi и бакеты, и захардкоженный домен молча ломал бы картинки на
 * всех окружениях, кроме одного.
 */
function mediaOrigins() {
  return [process.env.STRAPI_API_URL, process.env.S3_ENDPOINT, process.env.S3_PUBLIC_URL]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value);
      } catch {
        // Кривое значение в env не должно ронять сборку целиком —
        // такой источник просто не попадёт в разрешённые.
        return null;
      }
    })
    .filter(Boolean);
}

function remotePatterns() {
  return mediaOrigins().map((origin) => ({
    protocol: origin.protocol.replace(':', ''),
    hostname: origin.hostname,
    ...(origin.port ? { port: origin.port } : {}),
  }));
}

/**
 * CSP. Источник медиа обязан быть в img-src/media-src (§1 ТЗ), иначе в проде
 * картинки из CMS блокируются браузером.
 *
 * В dev правила мягче: Next.js использует eval и inline-стили для HMR, со
 * строгой политикой дев-режим просто не работает. Строгая версия применяется
 * там, где она и нужна, — в проде.
 */
function contentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== 'production';
  const media = mediaOrigins().map((origin) => origin.origin);

  return [
    "default-src 'self'",
    // 'unsafe-inline' для стилей — требование самого Next.js (инлайнит
    // критический CSS); убрать можно только вместе с nonce-пайплайном.
    "style-src 'self' 'unsafe-inline'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'",
    // data: — для inline-SVG-плейсхолдеров; blob: — для превью в редакторе.
    ['img-src', "'self'", 'data:', 'blob:', ...media].join(' '),
    ['media-src', "'self'", ...media].join(' '),
    ['connect-src', "'self'", ...media].join(' '),
    // Медиа-источники обязаны быть и здесь: FontfaceViewer подгружает файлы
    // шрифтов из CMS через FontFace API, и без этого браузер их заблокирует.
    ['font-src', "'self'", 'data:', ...media].join(' '),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  images: {
    // Медиа Strapi (S3-совместимое хранилище): публичный бакет отдаётся
    // напрямую, приватный — через image-proxy (docs/PROMPT.md §3, CMS/медиа).
    remotePatterns: remotePatterns(),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy() },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
