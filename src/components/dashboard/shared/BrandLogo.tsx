import type { FintechBrand } from '@/lib/brands';
import styles from './BrandLogo.module.scss';

// Квадратный логотип бренда. Ставит СВОЙ data-brand, а не наследует его из
// каскада: интерфейс сайта живёт в бренде экосистемы (чёрный, см.
// app/layout.tsx), а логотип обязан оставаться в цвете своего бренда —
// иначе логотип Birbank почернел бы вместе с UI.
//
// Знак "bir" внутри — фиксированно белый (fill="white" в самом ассете, не
// через currentColor/mask), общий для всех fintech-брендов, меняется только
// фон. Размер/скругление одинаковые во всех местах — см. BrandLogo.module.scss.
export function BrandLogo({ brand }: { readonly brand: FintechBrand }) {
  return (
    <span className={styles.logo} data-brand={brand}>
      {/* eslint-disable-next-line @next/next/no-img-element --
          build-time статичный ассет, не подходит под next/image remotePatterns */}
      <img className={styles.mark} src="/icons/dashboard/bir-sign.svg" alt="" />
    </span>
  );
}
