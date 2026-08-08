'use client';

import { useState } from 'react';
import { Lightbox } from './Lightbox';
import { type AppScreenshotsProps } from './types';
import styles from './AppScreenshots.module.scss';

// Презентационный блок — как остальные, ничего не знает про craft.js и
// Strapi (§3.5).
export function AppScreenshots({
  title,
  description,
  screenshots = [],
  interactive = true,
}: AppScreenshotsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Пустой блок должен оставаться видимой областью, иначе его не выделить
  // мышью сразу после добавления в редакторе.
  const items = screenshots.length > 0 ? screenshots : [{}, {}, {}];

  return (
    <section className={styles.gallery}>
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}

      <div className={styles.grid}>
        {items.map((screenshot, index) => (
          <button
            // Скриншоты не переупорядочиваются, src может пустовать —
            // индекс здесь устойчивее любого ключа из содержимого.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            type="button"
            className={styles.card}
            onClick={() => interactive && setOpenIndex(index)}
            aria-label={screenshot.alt || `Открыть скриншот ${index + 1}`}
          >
            {screenshot.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.image} src={screenshot.src} alt={screenshot.alt ?? ''} />
            ) : null}
          </button>
        ))}
      </div>

      {interactive && openIndex !== null ? (
        <Lightbox
          screenshots={items}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </section>
  );
}
