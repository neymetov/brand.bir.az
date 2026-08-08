import { describe, expect, it } from 'vitest';
import { getComponentSource, isSafeSourceSegment } from './getComponentSource';

// Страж для заплатки path traversal (OPEN_QUESTIONS #62). Сегменты приходят из
// URL и попадают в путь на диске; сейчас дыра «спит», потому что
// UI_PACKAGE_ROOT — заглушка, но оживёт вместе с подключением monorepo.

describe('isSafeSourceSegment — опасные сегменты', () => {
  it.each([
    ['выход вверх', '..'],
    ['выход вверх с путём', '../../etc'],
    ['слэш внутри', 'buttons/../../etc'],
    ['обратный слэш', 'buttons\\..\\etc'],
    ['абсолютный путь', '/etc/passwd'],
    ['точка в начале', '.hidden'],
    ['нулевой байт', 'button\0.tsx'],
    ['пробел', 'my button'],
    ['верхний регистр', 'Button'],
    ['пусто', ''],
  ])('%s отклоняется', (_label, segment) => {
    expect(isSafeSourceSegment(segment)).toBe(false);
  });
});

describe('isSafeSourceSegment — нормальные имена', () => {
  it.each(['button', 'buttons', 'input-field', 'card2', 'a'])('%s принимается', (segment) => {
    expect(isSafeSourceSegment(segment)).toBe(true);
  });
});

describe('getComponentSource — проверка внутри функции', () => {
  // Дублируется в маршруте, но обязана быть и здесь: следующий вызывающий
  // может о ней забыть, а цена ошибки — чтение произвольного файла.
  it.each([
    ['../../../../etc', 'passwd'],
    ['buttons', '../../../../etc/passwd'],
    ['', 'button'],
  ])('отказывает на %s/%s до обращения к диску', async (category, component) => {
    await expect(getComponentSource(category, component)).rejects.toThrow(/Unsafe component path/);
  });
});
