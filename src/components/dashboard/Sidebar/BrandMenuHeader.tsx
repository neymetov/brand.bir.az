'use client';

import { useState } from 'react';
import {
  brandById, brandDisplayName, brandDirection, type BrandId,
} from '@/lib/brands';
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
  readonly brand: BrandId;
  readonly onSelectBrand: (brand: BrandId) => void;
}

export function BrandMenuHeader({ brand, onSelectBrand }: BrandMenuHeaderProps) {
  const [open, setOpen] = useState(false);

  const current = brandById(brand);
  const themed = current.theme === 'themed';
  const markSrc = current.mark === 'bir-sign'
    ? '/icons/dashboard/bir-sign.svg'
    : `/icons/dashboard/brand-marks/${current.mark}.svg`;

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
          {/* Знак берётся из реестра, а не захардкожен на bir-sign: у
              партнёрских брендов свой глиф и своя заливка — каскада
              --bb-brand-* у них нет, и на чёрном фоне они читались как Bir. */}
          <span
            className={styles.markSlot}
            data-brand={themed ? brand : undefined}
            style={{ background: themed ? 'var(--bb-brand-default)' : current.background }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- статичный ассет */}
            <img className={styles.markGlyph} src={markSrc} alt="" />
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
          {/* Кликабельны ВСЕ бренды: у каждого есть свой раздел гайдлайнов,
              даже если он пока пустой. Раньше partner/external показывались
              неактивными — им некуда было вести (№15, снято 2026-08-09). */}
          {brandDropdownEntries.map((entry) => {
            const isActive = entry.id === brand;

            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={[styles.listItem, isActive ? styles.listItemActive : ''].join(' ')}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => {
                    onSelectBrand(entry.id);
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
