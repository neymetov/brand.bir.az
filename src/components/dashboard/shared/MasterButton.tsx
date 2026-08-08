import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type DashboardIconName } from '@/components/icons/Icon';
import styles from './MasterButton.module.scss';

// "[Master] Button" из Figma — один компонент, три фоновых варианта в
// макете дашборда: tertiary (brand-notification "Check it", с тенью),
// secondary (карточки карусели), ghost (Log out, без фона).
export type MasterButtonVariant = 'tertiary' | 'secondary' | 'ghost';

interface MasterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: MasterButtonVariant;
  readonly icon?: DashboardIconName;
  readonly iconPosition?: 'leading' | 'trailing';
  readonly children: ReactNode;
}

export function MasterButton({
  variant = 'secondary',
  icon,
  iconPosition = 'trailing',
  children,
  className,
  ...buttonProps
}: MasterButtonProps) {
  return (
    <button
      type="button"
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...buttonProps} // eslint-disable-line react/jsx-props-no-spreading
    >
      {icon && iconPosition === 'leading' ? <Icon name={icon} size={20} /> : null}
      <span className={styles.label}>{children}</span>
      {icon && iconPosition === 'trailing' ? <Icon name={icon} size={20} /> : null}
    </button>
  );
}
