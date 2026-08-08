'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { MenuItem } from '@/components/dashboard/shared/MenuItem';
import { BrandDropdownMark } from '@/components/dashboard/Sidebar/BrandDropdownMark';
import { brandDropdownEntries } from '@/components/dashboard/Sidebar/brandDropdown.data';
import type { SidebarGroup } from '@/components/dashboard/Sidebar/sidebar.data';
import { brandById, brandDisplayName, type BrandId } from '@/lib/brands';
import styles from './MobileNav.module.scss';

// Мобильная навигация (Figma node 289:5851): плавающая панель из трёх кнопок
// вместо бокового меню — бренд, текущий раздел, выход. Первые две открывают
// лист поверх контента: со списком брендов и со списком разделов.
//
// Данные те же, что у сайдбара (brandDropdownEntries, sidebarDirectory), и
// строка раздела — тот же MenuItem: мобильная навигация не должна показывать
// другой набор пунктов, чем десктопная.

type Sheet = 'brands' | 'sections';

interface MobileNavProps {
  readonly brand: BrandId;
  readonly groups: readonly SidebarGroup[];
  readonly onSelectBrand: (brand: BrandId) => void;
  readonly onLogout: () => void;
}

export function MobileNav({
  brand, groups, onSelectBrand, onLogout,
}: MobileNavProps) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const currentPath = usePathname();

  const brandEntry = brandById(brand);
  const brandMarkSrc = brandEntry.mark === 'bir-sign'
    ? '/icons/dashboard/bir-sign.svg'
    : `/icons/dashboard/brand-marks/${brandEntry.mark}.svg`;

  const currentItem = groups
    .flatMap((group) => group.items)
    .find((item) => currentPath === `/guidelines/${brand}/${item.slug}`);

  // Escape и клик мимо — стандартный способ закрыть слой; без них лист на
  // телефоне закрывается только повторным попаданием в ту же кнопку.
  useEffect(() => {
    if (!sheet) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheet(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setSheet(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [sheet]);

  // Переход внутри листа должен его закрывать: адрес поменялся, показывать
  // поверх новой страницы старый список незачем.
  useEffect(() => {
    setSheet(null);
  }, [currentPath]);

  const toggle = (next: Sheet) => setSheet((current) => (current === next ? null : next));

  return (
    <div className={styles.root} ref={barRef}>
      {sheet === 'brands' ? (
        <div className={styles.sheet} id="mobile-nav-brands">
          <ul className={styles.brandList}>
            {/* Кликабельны все бренды — как и в сайдбаре. */}
            {brandDropdownEntries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className={styles.brandRow}
                  aria-current={entry.id === brand ? 'true' : undefined}
                  onClick={() => {
                    onSelectBrand(entry.id);
                    setSheet(null);
                  }}
                >
                  <BrandDropdownMark entry={entry} />
                  <span>{entry.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {sheet === 'sections' ? (
        <div className={styles.sheet} id="mobile-nav-sections">
          {/* Показываются ВСЕ рубрики, а не одна: в макете лист нарисован с
              единственным заголовком, но прятать остальные разделы значило бы
              дать мобильному пользователю меньше навигации, чем десктопному. */}
          {groups.map((group) => (
            <section className={styles.group} key={group.label}>
              <h2 className={styles.groupLabel}>{group.label}</h2>
              {group.items.map((item) => {
                const href = `/guidelines/${brand}/${item.slug}`;

                return (
                  <MenuItem
                    key={item.slug}
                    href={href}
                    label={item.label}
                    icon={item.icon}
                    active={currentPath === href}
                  />
                );
              })}
            </section>
          ))}
        </div>
      ) : null}

      <nav className={styles.bar} aria-label="Brand navigation">
        <button
          type="button"
          className={[styles.tab, sheet === 'brands' ? styles.tabOpen : ''].filter(Boolean).join(' ')}
          onClick={() => toggle('brands')}
          aria-expanded={sheet === 'brands'}
          aria-controls="mobile-nav-brands"
        >
          {/* Знак из реестра — у партнёрских брендов свой глиф и заливка. */}
          <span
            className={styles.brandMark}
            data-brand={brandEntry.theme === 'themed' ? brand : undefined}
            style={brandEntry.theme === 'themed' ? undefined : { background: brandEntry.background }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- статичный ассет */}
            <img className={styles.brandGlyph} src={brandMarkSrc} alt="" />
          </span>
          <span className={styles.tabLabelStrong}>{brandDisplayName[brand]}</span>
        </button>

        <button
          type="button"
          className={[styles.tab, sheet === 'sections' ? styles.tabOpen : ''].filter(Boolean).join(' ')}
          onClick={() => toggle('sections')}
          aria-expanded={sheet === 'sections'}
          aria-controls="mobile-nav-sections"
        >
          {/* Вне раздела (дашборд, разводная) показывать нечего — кнопка
              называется по своему действию, а не по несуществующей странице. */}
          <Icon name={currentItem?.icon ?? 'layout-table-02'} size={24} />
          <span className={styles.tabLabel}>{currentItem?.label ?? 'Sections'}</span>
        </button>

        <button type="button" className={styles.tab} onClick={onLogout}>
          <Icon name="arrow-left-03-round" size={24} className={styles.logoutIcon} />
          <span className={styles.tabLabel}>Log Out</span>
        </button>
      </nav>
    </div>
  );
}
