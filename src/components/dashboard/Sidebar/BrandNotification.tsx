import { BrandLogo } from '@/components/dashboard/shared/BrandLogo';
import { MasterButton } from '@/components/dashboard/shared/MasterButton';
import type { FintechBrand } from '@/lib/brands';
import styles from './BrandNotification.module.scss';

// Карточка апдейта в нижней (зафиксированной) части сайдбара. Текст —
// плейсхолдер из Figma; реальный источник (Strapi? changelog?) не определён.
interface BrandNotificationProps {
  readonly brand: FintechBrand;
  readonly message: string;
  readonly onCheck?: () => void;
}

export function BrandNotification({ brand, message, onCheck }: BrandNotificationProps) {
  return (
    <div className={styles.notification}>
      <BrandLogo brand={brand} />
      <p className={styles.message}>{message}</p>
      <MasterButton variant="tertiary" onClick={onCheck}>
        Check it
      </MasterButton>
    </div>
  );
}
