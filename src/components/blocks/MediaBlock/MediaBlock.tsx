'use client';

import { useEffect, useState } from 'react';
import { toSlides, type MediaBlockProps } from './types';
import styles from './MediaBlock.module.scss';

// Презентационный блок — ничего не знает про craft.js и Strapi. Редактор
// оборачивает его (см. src/components/blocks/MediaBlock/craft.tsx), публичный
// рендер использует напрямую: одна и та же вёрстка в обоих случаях, как
// требует §3.5 (craft-блоки — обёртки над настоящими компонентами, а не их
// дублирующая копия).
export function MediaBlock({
  layout = 'wide',
  carousel = false,
  images = [],
}: MediaBlockProps) {
  const slides = toSlides(images, layout);
  const [active, setActive] = useState(0);

  // Смена раскладки/удаление изображений в редакторе может оставить активным
  // уже несуществующий слайд — возвращаемся к первому.
  useEffect(() => {
    if (active > slides.length - 1) setActive(0);
  }, [active, slides.length]);

  const activeIndex = Math.min(active, slides.length - 1);
  const frameClass = layout === 'wide' ? styles.wide : styles.square;

  // Без карусели остальные слайды не нужны даже в DOM.
  const rendered = carousel ? slides : slides.slice(0, 1);

  return (
    <div className={styles.block}>
      {/* Все слайды лежат в ряд, видно окно шириной в один слайд, а
          переключение — сдвиг ленты. Направление (влево/вправо) получается
          само из разницы индексов, отдельно его считать не нужно. */}
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {rendered.map((slide, slideIndex) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={slideIndex}
              className={styles.slide}
              aria-hidden={carousel && slideIndex !== activeIndex}
            >
              {slide.map((image, index) => (
                <div
                  // Изображения в слайде не переупорядочиваются, и src может
                  // повторяться/пустовать — индекс здесь стабильнее любого ключа.
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={[styles.frame, frameClass].join(' ')}
                >
                  {/* src приходит из Strapi (S3/presigned), под next/image
                      remotePatterns пока не настроены — см. next.config.mjs */}
                  {image.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.image} src={image.src} alt={image.alt ?? ''} />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {carousel && slides.length > 1 ? (
        <div className={styles.indicators}>
          {slides.map((_, index) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              type="button"
              className={[
                styles.indicator,
                index === activeIndex ? styles.indicatorActive : '',
              ].join(' ')}
              onClick={() => setActive(index)}
              aria-label={`Слайд ${index + 1}`}
              aria-current={index === activeIndex}
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
