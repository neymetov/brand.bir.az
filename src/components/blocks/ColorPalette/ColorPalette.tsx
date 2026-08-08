'use client';

import { CopyButton } from '@/components/blocks/shared/CopyButton';
import { normalizeColor, readableTextColor, type ColorPaletteProps } from './types';
import styles from './ColorPalette.module.scss';

// Презентационный блок палитры — как и MediaBlock, ничего не знает про
// craft.js и Strapi: редактор оборачивает его, публичная страница использует
// напрямую (§3.5).
export function ColorPalette({
  title,
  description,
  size = 'big',
  colors = [],
}: ColorPaletteProps) {
  // Пустой блок должен быть видимой областью, иначе его не выделить мышью
  // в редакторе сразу после добавления.
  const swatches = colors.length > 0 ? colors : [{}];

  return (
    <section className={styles.palette}>
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}

      <div className={[styles.grid, styles[size]].join(' ')}>
        {swatches.map((swatch, index) => {
          const color = normalizeColor(swatch.color);
          const tone = readableTextColor(color);
          // Формат без значения не показываем: копировать нечего, а на
          // публичной странице голая подпись «PMS» — мусор. Админ всё равно
          // видит все свои строки в панели настроек.
          const filled = (swatch.formats ?? []).filter((format) => format.value);

          return (
            <article
              // Цвета переупорядочиваются только в редакторе, а имя/значение
              // могут повторяться или пустовать — индекс тут устойчивее.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={styles.card}
              data-tone={tone}
              style={{ background: color ?? 'transparent' }}
            >
              <h3 className={styles.name}>{swatch.name || 'Без названия'}</h3>

              <dl className={styles.formats}>
                {/* Формат без значения не показываем: копировать нечего, а
                    на публичной странице голая подпись «PMS» — мусор.
                    Админ всё равно видит все свои строки в панели настроек. */}
                {filled.map((format, formatIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div className={styles.format} key={formatIndex}>
                    <dt className={styles.formatLabel}>{format.label}</dt>
                    <dd className={styles.formatValue}>{format.value}</dd>
                    <CopyButton
                      value={format.value ?? ''}
                      tone={tone}
                      label={`${swatch.name ?? 'цвет'} ${format.label ?? ''}`.trim()}
                    />
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
