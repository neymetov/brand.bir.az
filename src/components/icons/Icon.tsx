import styles from './Icon.module.scss';

// Иконки скачаны как статичные SVG из Figma-макета дашборда в
// public/icons/dashboard/ — временная замена build-time чтению из
// @birds/ui/icons (§3.4 ждёт доступа к репозиторию ДС, см.
// docs/OPEN_QUESTIONS.md #10). Рендерятся через CSS mask, а не инлайново —
// цвет наследуется из currentColor/токена, не нужен DOMPurify (не
// пользовательский контент, свой ассет).
export type DashboardIconName =
  | 'chevron-down'
  | 'chevron-down-small'
  | 'crowdfunding'
  | 'voice-id'
  | 'star-circle'
  | 'pie-chart-square'
  | 'colors'
  | 'text-creation'
  | 'presentation-07'
  | 'credit-card'
  | 'layout-table-02'
  | 'image-02'
  | 'motion-02'
  | 'nano-technology'
  | 'screen-add-to-home'
  | 'pencil'
  | 'star-square'
  | 'arrow-left-03-round'
  | 'arrow-right-02-round'
  | 'chevron-up'
  // Иконки кнопок действия (ActionButtons). Набор заведомо неполный —
  // добавление новой вариации кнопки = положить SVG в public/icons/dashboard
  // и дописать имя сюда, без правки самих компонентов.
  | 'download-04'
  | 'java-script'
  | 'svg-02'
  | 'pdf-02'
  | 'png-02'
  | 'ppt-02'
  | 'adobe-illustrator'
  | 'figma'
  | 'google-drive'
  | 'copy-01'
  // Иконки увеличенного просмотра (AppScreenshots/Lightbox)
  | 'arrow-left-01-sharp'
  | 'arrow-right-01-sharp'
  | 'cancel-01'
  // Экран логина: показать/скрыть пароль
  | 'view'
  | 'view-off'
  // Шапка сайдбара: указатель выбора бренда
  | 'scroll-select'
  // Типы файлов в файловом менеджере (остальные уже есть выше)
  | 'jpg-02'
  | 'mp4-02'
  | 'file-02'
  // Панель редактора
  | 'floppy-disk';

interface IconProps {
  readonly name: DashboardIconName;
  readonly size?: number;
  readonly className?: string;
  /**
   * Как вписывать глиф в коробку.
   *
   * `natural` (по умолчанию) — натуральный размер из SVG: ассеты обрезаны по
   * глифу, и это единственный способ сохранить заложенные в макет пропорции
   * на мелких иконках.
   *
   * `contain` — растянуть до коробки с сохранением пропорций. Нужно там, где
   * рядом стоят иконки, экспортированные из РАЗНЫХ по размеру коробок: у
   * pdf-02 натуральный размер ~16px (её рисовали для коробки 20), у jpg-02 —
   * ~35px (коробка 42). При `natural` в одном ряду они выглядят как иконки
   * разного кегля, хотя в макете одинаковы.
   */
  readonly fit?: 'natural' | 'contain';
}

export function Icon({
  name, size = 20, className, fit = 'natural',
}: IconProps) {
  return (
    <span
      className={[styles.icon, className].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        maskImage: `url(/icons/dashboard/${name}.svg)`,
        WebkitMaskImage: `url(/icons/dashboard/${name}.svg)`,
        maskSize: fit === 'contain' ? 'contain' : undefined,
        WebkitMaskSize: fit === 'contain' ? 'contain' : undefined,
      }}
      aria-hidden="true"
    />
  );
}
