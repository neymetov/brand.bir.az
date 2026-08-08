import type { DropdownEntry } from './brandDropdown.data';
import styles from './BrandDropdownMark.module.scss';

// Квадратный знак строки дропдауна. fintech-строки берут цвет из
// var(--bb-brand-default) СВОЕГО каскада (обёртка со своим data-brand — не
// трогает тему остального сайдбара), partner/external — из своего
// background (см. brandDropdown.data.ts). Скругление у всех одинаковое —
// см. комментарий в BrandDropdownMark.module.scss.
export function BrandDropdownMark({ entry }: { readonly entry: DropdownEntry }) {
  const markSrc = entry.mark === 'bir-sign'
    ? '/icons/dashboard/bir-sign.svg'
    : `/icons/dashboard/brand-marks/${entry.mark}.svg`;

  const isFintech = entry.kind === 'fintech';

  return (
    <span
      className={styles.mark}
      data-brand={isFintech ? entry.dataBrand : undefined}
      style={{ background: isFintech ? 'var(--bb-brand-default)' : entry.background }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- build-time статичный ассет */}
      <img className={styles.glyph} src={markSrc} alt="" />
    </span>
  );
}
