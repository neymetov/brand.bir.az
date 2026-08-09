import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Только Vitest, без Testing Library и jsdom.
//
// Покрываемые правила — это чистые функции и обработчики маршрутов; из UI
// проверяется разметка, которую достаточно отрендерить в строку через
// react-dom/server (renderRichText, карточка уведомления). Тащить jsdom и
// рендерер компонентов ради этого значило бы утяжелить установку без выигрыша:
// событий и состояния такие проверки не касаются.
export default defineConfig({
  // В tsconfig стоит `jsx: "preserve"` — его разбирает сам Next, а esbuild в
  // этом режиме выдаёт классический React.createElement, не импортируя React.
  // Тесты падали бы на `React is not defined`, поэтому трансформ задаётся явно.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    // .tsx — для проверок, где разметку удобнее записать самим JSX, чем
    // вручную через createElement.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // `server-only` — маркер Next.js, который валится при импорте вне
      // серверного окружения. В тестах серверный код и так исполняется в
      // Node, поэтому маркер подменяем пустышкой.
      'server-only': path.resolve(__dirname, 'src/test/server-only-stub.ts'),
    },
  },
});
