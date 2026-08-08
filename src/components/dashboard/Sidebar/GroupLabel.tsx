'use client';

import { Icon } from '@/components/icons/Icon';
import styles from './GroupLabel.module.scss';

// "menu-items" в Figma — заголовок группы, сворачивается/разворачивается
// (подтверждено сравнением node 230:7048 — свёрнутые группы — и 230:7792 —
// развёрнутые). Стрелка: вправо, когда группа закрыта, вниз — когда открыта
// (классический disclosure triangle, поворот на 90°).
//
// Размер стрелки — 16px (подтверждено пользователем 2026-08 — предыдущая
// правка на 20px была ошибочной, откачена).
interface GroupLabelProps {
  readonly label: string;
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly controlsId: string;
}

export function GroupLabel({
  label,
  open,
  onToggle,
  controlsId,
}: GroupLabelProps) {
  return (
    <button
      type="button"
      className={styles.groupLabel}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controlsId}
    >
      <Icon name="chevron-down-small" size={16} className={open ? undefined : styles.chevronClosed} />
      <span>{label}</span>
    </button>
  );
}
