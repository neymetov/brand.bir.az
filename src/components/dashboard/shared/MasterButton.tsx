import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { Icon, type DashboardIconName } from '@/components/icons/Icon';
import styles from './MasterButton.module.scss';

// "[Master] Button" из Figma — один компонент, три фоновых варианта в
// макете дашборда: tertiary (brand-notification "Check it", с тенью),
// secondary (карточки карусели), ghost (Log out, без фона).
export type MasterButtonVariant = 'tertiary' | 'secondary' | 'ghost';

interface MasterButtonLook {
  readonly variant?: MasterButtonVariant;
  readonly icon?: DashboardIconName;
  readonly iconPosition?: 'leading' | 'trailing';
  readonly children: ReactNode;
  readonly className?: string;
}

function look({
  variant = 'secondary', icon, iconPosition = 'trailing', children, className,
}: MasterButtonLook) {
  return {
    rootClass: [styles.button, styles[variant], className].filter(Boolean).join(' '),
    body: (
      <>
        {icon && iconPosition === 'leading' ? <Icon name={icon} size={20} /> : null}
        <span className={styles.label}>{children}</span>
        {icon && iconPosition === 'trailing' ? <Icon name={icon} size={20} /> : null}
      </>
    ),
  };
}

interface MasterButtonProps
  extends MasterButtonLook, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {}

export function MasterButton({
  variant, icon, iconPosition, children, className, ...buttonProps
}: MasterButtonProps) {
  const { rootClass, body } = look({
    variant, icon, iconPosition, children, className,
  });

  return (
    <button
      type="button"
      className={rootClass}
      {...buttonProps} // eslint-disable-line react/jsx-props-no-spreading
    >
      {body}
    </button>
  );
}

// Ссылка с тем же видом. Отдельный компонент, а не проп `href` у кнопки:
// у ссылки и кнопки разный набор атрибутов, и при одном компоненте к ссылке
// можно было бы прицепить onClick, который тихо потеряется.
//
// Именно тег, а не <button> с router.push: по ссылке работают средний клик,
// «открыть в новой вкладке» и просмотр адреса в строке состояния.
export function MasterButtonLink({
  href, variant, icon, iconPosition, children, className,
}: MasterButtonLook & { readonly href: string }) {
  const { rootClass, body } = look({
    variant, icon, iconPosition, children, className,
  });

  return <Link className={rootClass} href={href}>{body}</Link>;
}
