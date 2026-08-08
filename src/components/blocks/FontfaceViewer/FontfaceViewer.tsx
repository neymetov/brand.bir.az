'use client';

import { useState } from 'react';
import {
  cssFamilyName,
  DEFAULT_SAMPLE,
  specimenValues,
  type FontSpecimen,
  type FontfaceViewerProps,
} from './types';
import { useSpecimenFont } from './useSpecimenFont';
import styles from './FontfaceViewer.module.scss';

// Значение параметра. Копируется по клику — это и есть кнопка, а не просто
// плашка: пользователю нужно забрать число, а не любоваться им.
function ValueBadge({ label, value }: { readonly label: string; readonly value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Показать «скопировано», когда буфер недоступен, нельзя — человек
      // вставит не то, что ожидал.
      setCopied(false);
    }
  };

  return (
    <span className={styles.badge}>
      <span className={styles.badgeLabel}>{label}</span>
      <button
        type="button"
        className={styles.badgeValue}
        onClick={handleCopy}
        aria-label={`Копировать ${label} ${value}`}
        data-copied={copied || undefined}
      >
        {copied ? '✓' : value}
      </button>
    </span>
  );
}

function SpecimenRow({
  specimen,
  fallbackSample,
}: {
  readonly specimen: FontSpecimen;
  readonly fallbackSample: string;
}) {
  const status = useSpecimenFont(specimen);
  const family = cssFamilyName(specimen);
  const values = specimenValues(specimen);
  const sample = specimen.sample || fallbackSample;

  return (
    <div className={styles.item}>
      <div className={styles.infoBar}>
        {specimen.family ? <span className={styles.title}>{specimen.family}</span> : null}

        {specimen.family && specimen.styleName ? (
          <span className={styles.divider} aria-hidden="true">/</span>
        ) : null}

        {specimen.styleName ? <span className={styles.title}>{specimen.styleName}</span> : null}

        {values.map((entry, index) => (
          // Порядок фиксирован (кегль → интерлиньяж → трекинг), подписи
          // уникальны — но индекс здесь надёжнее на случай пустых значений.
          // eslint-disable-next-line react/no-array-index-key
          <span className={styles.group} key={index}>
            <span className={styles.divider} aria-hidden="true">/</span>
            <ValueBadge label={entry.label} value={entry.value} />
          </span>
        ))}

        {status === 'failed' ? (
          <span className={styles.warning}>Font failed to load</span>
        ) : null}
      </div>

      <div
        className={styles.fontface}
        style={{
          // Пока файл не загружен (или его нет), образец показывается
          // системным шрифтом — размеры и трекинг всё равно видно.
          fontFamily: family && status === 'ready' ? family : undefined,
          fontWeight: specimen.weight,
          fontSize: specimen.fontSize ? `${specimen.fontSize}px` : undefined,
          lineHeight: specimen.lineHeight ? `${specimen.lineHeight}px` : undefined,
          letterSpacing: specimen.letterSpacing != null
            ? `${specimen.letterSpacing / 100}em`
            : undefined,
        }}
      >
        {sample}
      </div>
    </div>
  );
}

// Презентационный блок — как остальные, ничего не знает про craft.js и
// Strapi (§3.5).
export function FontfaceViewer({ specimens = [], sample }: FontfaceViewerProps) {
  // Пустой блок должен оставаться видимой областью, иначе его не выделить
  // мышью сразу после добавления в редакторе.
  const rows = specimens.length > 0 ? specimens : [{}];
  const fallbackSample = sample || DEFAULT_SAMPLE;

  return (
    <div className={styles.viewer}>
      {rows.map((specimen, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <SpecimenRow key={index} specimen={specimen} fallbackSample={fallbackSample} />
      ))}
    </div>
  );
}
