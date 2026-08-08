import { describe, expect, it } from 'vitest';
import { countFiles, resolvePath } from './types';
import type { FileTab } from './types';

// Чистая логика дерева файлового менеджера. Ошибка здесь означает не кривой
// пиксель, а сломанную навигацию: не та папка, не тот счётчик, не та иконка.

describe('countFiles — счётчик на карточке папки', () => {
  it('считает и свои файлы, и вложенные', () => {
    // На карточке написано «Files N»: если бы считались только свои, папка с
    // подпапками показывала бы ноль при полном содержимом.
    const folder = {
      name: 'Logotypes',
      files: [{ name: 'a.pdf' }],
      folders: [
        { name: 'Latin', files: [{ name: 'b.svg' }, { name: 'c.svg' }] },
        { name: 'Cyrillic', folders: [{ name: 'Deep', files: [{ name: 'd.png' }] }] },
      ],
    };
    expect(countFiles(folder)).toBe(4);
  });

  it('пустая папка — ноль, а не undefined', () => {
    expect(countFiles({ name: 'Empty' })).toBe(0);
  });
});

const tab: FileTab = {
  label: 'Documents',
  files: [{ name: 'root.pdf' }],
  folders: [
    {
      name: 'Fonts',
      files: [{ name: 'font.zip' }],
      folders: [{ name: 'Latin', files: [{ name: 'inter.woff2' }] }],
    },
  ],
};

describe('resolvePath — спуск по дереву', () => {
  it('пустой путь даёт корень рубрики', () => {
    const view = resolvePath(tab, []);
    expect(view?.folders).toHaveLength(1);
    expect(view?.files).toHaveLength(1);
    expect(view?.trail).toHaveLength(0);
  });

  it('спускается на нужный уровень и собирает цепочку для крошек', () => {
    const view = resolvePath(tab, [0, 0]);
    expect(view?.files.map((f) => f.name)).toEqual(['inter.woff2']);
    expect(view?.trail.map((f) => f.name)).toEqual(['Fonts', 'Latin']);
  });

  it('несуществующий путь даёт null, а не падение', () => {
    // Так бывает, когда папку удалили в редакторе, пока она была открыта.
    expect(resolvePath(tab, [5])).toBeNull();
    expect(resolvePath(tab, [0, 0, 0])).toBeNull();
  });

  it('без рубрики возвращает null', () => {
    expect(resolvePath(undefined, [])).toBeNull();
  });
});
