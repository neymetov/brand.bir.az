import Link from 'next/link';
import type { MouseEvent } from 'react';
import { Icon, type DashboardIconName } from '@/components/icons/Icon';
import styles from './MenuItem.module.scss';

// Общий пункт навигации — используется и в sidebar (brand-items-list, с
// иконкой), и в anchor-list (без иконки, со стрелкой у активного пункта).
// "vacancy" (внутреннее имя из Figma) — pill-обёртка с текстом.
interface MenuItemProps {
  readonly href: string;
  readonly label: string;
  readonly icon?: DashboardIconName;
  readonly active?: boolean;
  readonly variant?: 'nav' | 'anchor';
  /** Нужен anchor-list: он перехватывает переход ради плавной прокрутки. */
  readonly onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function MenuItem({
  href,
  label,
  icon,
  active = false,
  variant = 'nav',
  onClick,
}: MenuItemProps) {
  // Белый фон — подсказка только для зрячих. aria-current сообщает то же самое
  // скринридеру: 'page' — открытая страница, 'location' — текущее место на ней
  // (якорь).
  const currentKind = variant === 'nav' ? 'page' : 'location';

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[styles.item, styles[variant], active ? styles.active : ''].join(' ')}
      aria-current={active ? currentKind : undefined}
    >
      {variant === 'anchor' ? (
        <Icon
          name="arrow-right-02-round"
          size={20}
          className={[styles.arrow, active ? styles.arrowVisible : ''].join(' ')}
        />
      ) : null}
      {icon ? <Icon name={icon} size={20} /> : null}
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
