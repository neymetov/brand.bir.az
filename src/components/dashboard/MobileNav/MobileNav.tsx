'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { MenuItem } from '@/components/dashboard/shared/MenuItem';
import { BrandDropdownMark } from '@/components/dashboard/Sidebar/BrandDropdownMark';
import { brandDropdownEntries } from '@/components/dashboard/Sidebar/brandDropdown.data';
import { sidebarDirectory } from '@/components/dashboard/Sidebar/sidebar.data';
import { brandDisplayName, type FintechBrand } from '@/lib/brands';
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
  readonly brand: FintechBrand;
  readonly onSelectBrand: (brand: FintechBrand) => void;
  readonly onLogout: () => void;
}

export function MobileNav({ brand, onSelectBrand, onLogout }: MobileNavProps) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const currentPath = usePathname();

  const groups = sidebarDirectory[brand];
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
            {brandDropdownEntries.map((entry) => {
              const isFintech = entry.kind === 'fintech';

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={styles.brandRow}
                    // Партнёрские бренды показаны для полноты списка, но у них
                    // нет своей навигации — как и в сайдбаре (№15).
                    disabled={!isFintech}
                    aria-disabled={!isFintech}
                    aria-current={isFintech && entry.dataBrand === brand ? 'true' : undefined}
                    onClick={() => {
                      if (!isFintech) return;
                      onSelectBrand(entry.dataBrand);
                      setSheet(null);
                    }}
                  >
                    <BrandDropdownMark entry={entry} />
                    <span>{entry.label}</span>
                  </button>
                </li>
              );
            })}
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
          <span className={styles.brandMark} data-brand={brand}>
            {/* eslint-disable-next-line @next/next/no-img-element -- статичный ассет */}
            <img className={styles.brandGlyph} src="/icons/dashboard/bir-sign.svg" alt="" />
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
