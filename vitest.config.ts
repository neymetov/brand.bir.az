import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Только Vitest, без Testing Library и jsdom.
//
// Покрываемые правила — это чистые функции и обработчики маршрутов; из UI
// проверяется единственная вещь, renderRichText, и её достаточно отрендерить
// в строку через react-dom/server. Тащить jsdom и рендерер компонентов ради
// одного модуля значило бы утяжелить установку без выигрыша.
export default defineConfig({
  // В tsconfig стоит `jsx: "preserve"` — его разбирает сам Next, а esbuild в
  // этом режиме выдаёт классический React.createElement, не импортируя React.
  // Тесты падали бы на `React is not defined`, поэтому трансформ задаётся явно.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
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
