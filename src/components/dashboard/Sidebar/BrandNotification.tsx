import { BrandLogo } from '@/components/dashboard/shared/BrandLogo';
import { MasterButtonLink } from '@/components/dashboard/shared/MasterButton';
import { brandDisplayName, type BrandId } from '@/lib/brands';
import styles from './BrandNotification.module.scss';

// Карточка апдейта в нижней (зафиксированной) части сайдбара. Бренд и текст
// задаёт редактор (/admin/notification), кнопка ведёт на разводную этого
// бренда — то есть объявление одно на весь сайт и не зависит от того, какой
// бренд читатель смотрит сейчас.
// Форма объявления живёт здесь, а не в lib/strapi/notification: тот модуль
// server-only, а сайдбар клиентский. Иначе клиент импортировал бы тип из
// серверного модуля — сейчас это сходит с рук (тип стирается при сборке), но
// одна опечатка без `type` утащила бы в браузер весь клиент Strapi.
export interface SidebarNotification {
  readonly brand: BrandId;
  readonly message: string;
}

/**
 * Что показывать, пока объявление не завели. Раньше этот текст был вшит в
 * сайдбар; оставлен как значение по умолчанию, чтобы карточка не пропадала из
 * макета на пустой CMS и чтобы сайт выглядел как до появления редактора.
 */
export function defaultNotification(brand: BrandId): SidebarNotification {
  return {
    brand,
    message: `We've updated the data in the ${brandDisplayName[brand]} section.`,
  };
}

export function BrandNotification({ brand, message }: SidebarNotification) {
  return (
    <div className={styles.notification}>
      <BrandLogo brand={brand} />
      <p className={styles.message}>{message}</p>
      <MasterButtonLink variant="tertiary" href={`/guidelines/${brand}`}>
        Check it
      </MasterButtonLink>
    </div>
  );
}
