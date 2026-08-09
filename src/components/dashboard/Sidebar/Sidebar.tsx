'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { BrandId } from '@/lib/brands';
import { MenuItem } from '@/components/dashboard/shared/MenuItem';
import { MasterButton } from '@/components/dashboard/shared/MasterButton';
import { BrandMenuHeader } from './BrandMenuHeader';
import {
  BrandNotification,
  defaultNotification,
  type SidebarNotification,
} from './BrandNotification';
import { GroupLabel } from './GroupLabel';
import type { SidebarGroup } from './sidebar.data';
import styles from './Sidebar.module.scss';

// Фиксирован относительно вьюпорта, во всю высоту. Три зоны: brands-list-menu
// (сверху, зафиксирован), группы навигации (скроллится), brand-notification +
// Log out (снизу, зафиксирован).
//
// Выбранный бренд НЕ хранится здесь: он приходит из URL. Иначе адрес и
// содержимое сайдбара расходились бы — открыв ссылку на раздел Invest,
// пользователь видел бы в сайдбаре Retail, а «назад» не возвращал бы бренд.
interface SidebarProps {
  readonly brand: BrandId;
  /** Рубрики бренда — приходят сверху: навигация редактируется и живёт в CMS. */
  readonly groups: readonly SidebarGroup[];
  /**
   * Объявление внизу сайдбара — тоже из CMS. Его бренд не связан с текущим:
   * объявление одно на весь сайт. `null` — в CMS ещё не заводили, тогда
   * показываем текст по умолчанию про бренд, который открыт сейчас.
   */
  readonly notification?: SidebarNotification | null;
  readonly onSelectBrand?: (brand: BrandId) => void;
  readonly onLogout?: () => void;
}

export function Sidebar({
  brand, groups, notification, onSelectBrand, onLogout,
}: SidebarProps) {
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({});
  // Активный пункт определяется по адресу, а не по клику: иначе подсветка
  // терялась бы при переходе по ссылке из карусели, по «назад» и при открытии
  // ссылки, присланной коллегой. Адрес сравнивается с href напрямую —
  // префикса локали в путях больше нет.
  const currentPath = usePathname();

  const toggleGroup = (label: string) => {
    setClosedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    // Без data-brand: интерфейс сайдбара — в бренде сайта (экосистема,
    // чёрный акцент), выбранный бренд красит только собственные логотипы,
    // каждый из которых объявляет свой data-brand сам.
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <BrandMenuHeader brand={brand} onSelectBrand={onSelectBrand ?? (() => {})} />
      </div>

      <nav className={styles.scrollArea} aria-label="Brand sections">
        {groups.map((group) => {
          const groupId = `sidebar-group-${group.label.replace(/\s+/g, '-').toLowerCase()}`;
          const isOpen = !closedGroups[group.label];

          return (
            <div key={group.label} className={styles.group}>
              <GroupLabel
                label={group.label}
                open={isOpen}
                onToggle={() => toggleGroup(group.label)}
                controlsId={groupId}
              />
              {isOpen ? (
                <div id={groupId} className={styles.groupItems}>
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
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading --
            карточка целиком приходит одним объектом из CMS */}
        <BrandNotification {...(notification ?? defaultNotification(brand))} />
        <MasterButton variant="ghost" icon="arrow-left-03-round" iconPosition="leading" onClick={onLogout}>
          Log out
        </MasterButton>
      </div>
    </aside>
  );
}
