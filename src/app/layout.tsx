import type { ReactNode } from 'react';
import '@/styles/globals.scss';

// Единственное место с <html>/<body> во всём приложении — Next.js требует их
// именно в САМОМ ВЕРХНЕМ layout.
export default function RootLayout({ children }: { readonly children: ReactNode }) {
  // lang="en" — сайт только на английском, локализации нет (решение
  // пользователя, 2026-08-07). Раньше здесь стоял az как каноничная локаль.
  //
  // data-brand="ecosystem" — сам brand.bir.az живёт на домене bir.az и носит
  // бренд экосистемы (чёрный акцент), а не Birbank Retail. Без этого атрибута
  // весь UI брал бы дефолт с :root пакета birds-tokens, а там сознательно
  // прописан retail (красный) — трогать тот файл нельзя, он общий для всех
  // сайтов экосистемы. Бренд объявляется здесь, на корне своего приложения.
  //
  // Логотипы конкретных брендов при этом остаются в своих цветах: каждый
  // ставит собственный data-brand локально (см. BrandLogo/BrandDropdownMark).
  return (
    <html lang="en" data-brand="ecosystem">
      <body>{children}</body>
    </html>
  );
}
