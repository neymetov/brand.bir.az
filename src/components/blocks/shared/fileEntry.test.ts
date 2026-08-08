import { describe, expect, it } from 'vitest';
import { fileIcon } from './fileEntry';

// Иконку выбирает расширение имени: mime в контенте не хранится.
describe('fileIcon', () => {
  it.each([
    ['Birbank-white-Logotype.pdf', 'pdf-02'],
    ['photo.PNG', 'png-02'],
    ['photo.jpeg', 'jpg-02'],
    ['mark.svg', 'svg-02'],
    ['deck.pptx', 'ppt-02'],
    ['promo.mp4', 'mp4-02'],
    ['source.ai', 'adobe-illustrator'],
    ['ui-kit.fig', 'figma'],
  ])('%s → %s', (name, icon) => {
    expect(fileIcon(name)).toBe(icon);
  });

  it.each([
    ['неизвестное расширение', 'archive.zip'],
    ['без расширения', 'README'],
    ['имени нет', undefined],
  ])('%s → обобщённый значок', (_label, name) => {
    expect(fileIcon(name)).toBe('file-02');
  });
});
