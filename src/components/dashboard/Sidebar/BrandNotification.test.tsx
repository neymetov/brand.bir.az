import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { publishedGuidelineBrands } from '@/lib/brands';
import { BrandNotification, defaultNotification } from './BrandNotification';

// Разметка рендерится через react-dom/server: набор сознательно живёт без
// jsdom, а здесь нужно проверить именно вывод — что кнопка стала ссылкой и
// куда она ведёт.

function render(brand: Parameters<typeof defaultNotification>[0], message: string): string {
  return renderToStaticMarkup(<BrandNotification brand={brand} message={message} />);
}

describe('карточка уведомления', () => {
  it('«Check it» — ссылка на разводную выбранного бренда', () => {
    // Раньше это была кнопка без обработчика: нажатие не делало ничего.
    const markup = render('m10', 'Updated');

    expect(markup).toContain('href="/guidelines/m10"');
    expect(markup).toContain('Check it');
  });

  it('ведёт на выбранный бренд, а не на тот, что открыт сейчас', () => {
    // Объявление одно на весь сайт: читатель может смотреть Retail, а
    // объявление указывать на Invest.
    expect(render('invest', 'Updated')).toContain('href="/guidelines/invest"');
  });

  it('показывает заданный текст', () => {
    expect(render('retail', 'Мы обновили палитру')).toContain('Мы обновили палитру');
  });

  it.each(publishedGuidelineBrands)('%s: адрес совпадает с брендом', (brand) => {
    expect(render(brand, 'Updated')).toContain(`href="/guidelines/${brand}"`);
  });
});

describe('текст по умолчанию', () => {
  it.each(publishedGuidelineBrands)('%s: непустой и называет бренд', (brand) => {
    // Пока в CMS ничего нет, карточка не должна выглядеть сломанной.
    const { message, brand: linked } = defaultNotification(brand);

    expect(message.length).toBeGreaterThan(0);
    expect(linked).toBe(brand);
  });
});
