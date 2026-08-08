import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { codeToHtml } from 'shiki';

// Build-time чтение исходника из реального файла компонента ДС (§3.3) —
// НЕ хранится вручную в Strapi, чтобы не расходиться с кодом.
//
// ⚠️ PLACEHOLDER: путь до packages/ui и имя пакета — не подтверждены (§3.6,
// §6 явно просят свериться с реальной структурой monorepo прежде чем
// использовать). UI_PACKAGE_ROOT ниже — заглушка, поменять на реальный путь
// до birds-tokens/monorepo packages/ui, когда он будет известен.
const UI_PACKAGE_ROOT = path.resolve(process.cwd(), '../../packages/ui/src');

/**
 * `category` и `component` приходят из сегментов URL, то есть это ввод
 * пользователя, который попадает прямо в путь на диске. Без проверки адрес
 * вида `/components/..%2f..%2f..%2fetc/passwd` читал бы файлы за пределами
 * пакета ДС.
 *
 * Сейчас дыра «спит»: UI_PACKAGE_ROOT — заглушка, каталога не существует, и
 * чтение падает раньше. Но починить это надо ДО того, как путь подключат к
 * настоящему monorepo, иначе баг оживёт вместе с ним.
 */
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-]*$/;

export function isSafeSourceSegment(value: string): boolean {
  return SAFE_SEGMENT.test(value);
}

export async function getComponentSource(
  category: string,
  component: string,
): Promise<{ raw: string; highlightedHtml: string }> {
  // Проверка живёт здесь, а не только в маршруте: следующий вызывающий может
  // забыть про неё, а последствия — чтение произвольного файла.
  if (!isSafeSourceSegment(category) || !isSafeSourceSegment(component)) {
    throw new Error(`Unsafe component path: ${category}/${component}`);
  }

  const filePath = path.resolve(UI_PACKAGE_ROOT, category, component, `${component}.tsx`);

  // Вторая линия: даже если шаблон выше однажды ослабят, за пределы корня
  // выйти не дадим.
  if (!filePath.startsWith(`${UI_PACKAGE_ROOT}${path.sep}`)) {
    throw new Error(`Resolved path escapes UI package root: ${filePath}`);
  }

  const raw = await readFile(filePath, 'utf-8');
  const highlightedHtml = await codeToHtml(raw, {
    lang: 'tsx',
    theme: 'github-dark',
  });

  return { raw, highlightedHtml };
}
