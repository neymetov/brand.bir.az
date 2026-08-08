import { describe, expect, it } from 'vitest';
import { safeReturnPath } from './returnPath';

// Страж для заплатки open redirect (OPEN_QUESTIONS #61). До неё
// `?from=https://evil.example` уводил с сайта сразу после ввода пароля —
// проверено в браузере 2026-08-07.

describe('safeReturnPath — внешние адреса отбрасываются', () => {
  it.each([
    ['абсолютный https', 'https://evil.example/x'],
    ['абсолютный http', 'http://evil.example/x'],
    ['protocol-relative', '//evil.example/x'],
    ['через обратный слэш', '/\\evil.example'],
    ['схема без слэшей', 'javascript:alert(1)'],
    ['относительный без слэша', 'evil.example'],
    ['пустая строка', ''],
  ])('%s → null', (_label, from) => {
    expect(safeReturnPath(from)).toBeNull();
  });

  it('отсутствующий параметр → null', () => {
    expect(safeReturnPath(null)).toBeNull();
  });
});

describe('safeReturnPath — внутренние пути проходят', () => {
  it.each([
    '/',
    '/admin',
    '/guidelines/retail',
    '/guidelines/retail/typography',
    '/guidelines/retail?tab=colors',
    '/guidelines/retail#anchor',
  ])('%s сохраняется как есть', (from) => {
    expect(safeReturnPath(from)).toBe(from);
  });
});
