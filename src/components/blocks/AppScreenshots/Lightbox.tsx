'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/icons/Icon';
import { downloadName, type Screenshot } from './types';
import styles from './Lightbox.module.scss';

interface LightboxProps {
  readonly screenshots: readonly Screenshot[];
  readonly index: number;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
}

// Увеличенный просмотр (Figma node 270:2424): изображение по центру, под ним
// строка — стрелки слева, «Download» справа; кнопка закрытия отдельно,
// справа от изображения.
//
// Рендерится порталом в <body>, а не на месте: контент-дровер и его предки
// имеют собственные overflow/сложенные контексты, внутри которых оверлей
// на весь экран обрезался бы или уезжал под соседние блоки.
export function Lightbox({
  screenshots,
  index,
  onIndexChange,
  onClose,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Куда вернуть фокус: клавиатурный пользователь должен оказаться там же,
  // откуда открыл просмотр, а не в начале страницы.
  const returnFocusRef = useRef<Element | null>(null);

  const total = screenshots.length;
  const current = screenshots[index];

  const goTo = useCallback((next: number) => {
    // По кругу: с последнего вперёд — на первый. В просмотре из шести
    // экранов упираться в край неудобно.
    onIndexChange((next + total) % total);
  }, [onIndexChange, total]);

  useEffect(() => {
    returnFocusRef.current = document.activeElement;
    dialogRef.current?.focus();

    // Фон не должен прокручиваться под оверлеем.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus();
      }
    };
  }, []);

  // Клавиши слушаем на документе, а не на самом оверлее: иначе Escape и
  // стрелки перестают работать, как только фокус переходит на кнопку внутри.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowRight') {
        goTo(index + 1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        goTo(index - 1);
        return;
      }

      // Ловушка фокуса: без неё Tab уводит в страницу под оверлеем, и
      // клавиатурный пользователь «проваливается» в невидимый интерфейс.
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [goTo, index, onClose]);

  if (!current) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Просмотр скриншота ${index + 1} из ${total}`}
      tabIndex={-1}
      ref={dialogRef}
    >
      {/* Клик мимо изображения закрывает просмотр — привычное поведение
          лайтбокса. Это настоящая кнопка под содержимым, а не обработчик на
          подложке: иначе действие недоступно с клавиатуры и невидимо для
          вспомогательных технологий. */}
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Close viewer"
        tabIndex={-1}
      />

      <div className={styles.content}>
        <div className={styles.item}>
          <div className={styles.frame}>
            {current.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.image} src={current.src} alt={current.alt ?? ''} />
            ) : (
              <div className={styles.placeholder} aria-hidden="true" />
            )}
          </div>

          <div className={styles.bar}>
            <div className={styles.nav}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => goTo(index - 1)}
                aria-label="Previous screenshot"
                // Одно изображение листать некуда, но кнопки из макета
                // остаются на месте — чтобы строка не перестраивалась.
                disabled={total < 2}
              >
                <Icon name="arrow-left-01-sharp" size={24} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => goTo(index + 1)}
                aria-label="Next screenshot"
                disabled={total < 2}
              >
                <Icon name="arrow-right-01-sharp" size={24} />
              </button>
            </div>

            {current.src ? (
              <a
                className={styles.download}
                href={current.src}
                download={downloadName(current, index)}
              >
                <Icon name="download-04" size={24} />
                <span>Download</span>
              </a>
            ) : (
              // Файла нет — кнопка остаётся, но неактивна: пустая ссылка
              // увела бы на текущую страницу.
              <span className={[styles.download, styles.disabled].join(' ')} aria-disabled="true">
                <Icon name="download-04" size={24} />
                <span>Download</span>
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={[styles.iconButton, styles.close].join(' ')}
          onClick={onClose}
          aria-label="Close viewer"
        >
          <Icon name="cancel-01" size={24} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
