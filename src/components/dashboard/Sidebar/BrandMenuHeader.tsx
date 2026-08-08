'use client';

import { useState } from 'react';
import { brandDisplayName, brandDirection, type FintechBrand } from '@/lib/brands';
import { Icon } from '@/components/icons/Icon';
import { BrandDropdownMark } from './BrandDropdownMark';
import { brandDropdownEntries } from './brandDropdown.data';
import styles from './BrandMenuHeader.module.scss';

// "brands-list-menu" — зафиксирован сверху сайдбара (Figma node 230:6974).
// Полный список — весь экосистемный дропдаун (fintech + partner + Kapital
// Bank), но реально переключить сайдбар можно только на fintech-бренд —
// только они имеют полную тему/собственную навигацию сегодня (§3.2).
// Partner/external строки показаны (полнота списка из макета важна), но
// неактивны — см. docs/OPEN_QUESTIONS.md #15.
interface BrandMenuHeaderProps {
  readonly brand: FintechBrand;
  readonly onSelectBrand: (brand: FintechBrand) => void;
}

export function BrandMenuHeader({ brand, onSelectBrand }: BrandMenuHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={[styles.trigger, open ? styles.triggerOpen : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Switch brand"
      >
        <span className={styles.title}>
          <span className={styles.markSlot} data-brand={brand} style={{ background: 'var(--bb-brand-default)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- build-time статичный ассет */}
            <img className={styles.markGlyph} src="/icons/dashboard/bir-sign.svg" alt="" />
          </span>
          {/* Две строки: название бренда и его направление. Раньше была одна
              строка названия — см. Figma node 287:4898. */}
          <span className={styles.text}>
            <span className={styles.name}>{brandDisplayName[brand]}</span>
            <span className={styles.direction}>{brandDirection[brand]}</span>
          </span>
        </span>
        {/* Иконка одна на оба состояния: это указатель «здесь выбирают», а не
            стрелка направления, поэтому переворачивать её при открытии нечего. */}
        <span className={styles.iconSlot}>
          <Icon name="scroll-select" size={20} />
        </span>
      </button>

      {open ? (
        <ul className={styles.list}>
          {brandDropdownEntries.map((entry) => {
            const isFintech = entry.kind === 'fintech';
            const isActive = isFintech && entry.dataBrand === brand;
            const disabled = !isFintech;

            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={[styles.listItem, isActive ? styles.listItemActive : ''].join(' ')}
                  disabled={disabled}
                  aria-disabled={disabled}
                  onClick={() => {
                    if (!isFintech) return;
                    onSelectBrand(entry.dataBrand);
                    setOpen(false);
                  }}
                >
                  <BrandDropdownMark entry={entry} />
                  <span>{entry.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
