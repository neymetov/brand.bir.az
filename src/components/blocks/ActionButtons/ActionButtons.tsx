'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { isExternalHref, type ActionButtonItem, type ActionButtonsProps } from './types';
import styles from './ActionButtons.module.scss';

// Презентационный блок — как остальные, ничего не знает про craft.js и
// Strapi (§3.5). Поведение кнопки определяется её kind, а не отдельным
// компонентом на каждую вариацию.
function ActionButton({ button }: { readonly button: ActionButtonItem }) {
  const [copied, setCopied] = useState(false);

  const label = button.label || 'Кнопка';
  const icon = button.icon ? (
    <Icon name={button.icon} size={20} />
  ) : null;

  const content = (
    <>
      {button.iconPosition !== 'trailing' ? icon : null}
      <span className={styles.label}>{copied ? 'Скопировано' : label}</span>
      {button.iconPosition === 'trailing' ? icon : null}
    </>
  );

  if (button.kind === 'copy') {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(button.value ?? '');
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } catch {
        // Тихо «скопировано» показывать нельзя — пользователь вставит не то.
        setCopied(false);
      }
    };

    return (
      <button type="button" className={styles.button} onClick={handleCopy}>
        {content}
      </button>
    );
  }

  // Пустая ссылка — не кнопка: клик по ней увёл бы на текущую страницу.
  // В редакторе такое состояние нормально (адрес ещё не введён), поэтому
  // показываем неактивный вид, а не прячем кнопку.
  if (!button.href) {
    return (
      <span className={[styles.button, styles.disabled].join(' ')} aria-disabled="true">
        {content}
      </span>
    );
  }

  const external = isExternalHref(button.href);
  const openInNewTab = button.newTab ?? external;

  return (
    <a
      className={styles.button}
      href={button.href}
      // download просит браузер сохранить файл, а не открывать его. Работает
      // для своего домена; для кросс-доменных ссылок браузер атрибут
      // игнорирует и просто откроет файл — это ограничение самого браузера.
      download={button.kind === 'download' ? '' : undefined}
      target={openInNewTab ? '_blank' : undefined}
      // noopener обязателен: без него открытая вкладка получает доступ к
      // window.opener и может подменить исходную страницу.
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {content}
    </a>
  );
}

export function ActionButtons({ buttons = [], align = 'left' }: ActionButtonsProps) {
  // Пустой блок должен оставаться видимой областью, иначе его не выделить
  // мышью сразу после добавления в редакторе.
  const items = buttons.length > 0 ? buttons : [{}];

  return (
    <div className={[styles.panel, styles[align]].join(' ')}>
      {items.map((button, index) => (
        // Кнопки не переупорядочиваются, подписи могут повторяться —
        // индекс здесь устойчивее любого ключа из содержимого.
        // eslint-disable-next-line react/no-array-index-key
        <ActionButton key={index} button={button} />
      ))}
    </div>
  );
}
