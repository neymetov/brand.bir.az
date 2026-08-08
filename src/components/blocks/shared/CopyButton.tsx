'use client';

import { useEffect, useState } from 'react';
import styles from './CopyButton.module.scss';

// Копирование значения в буфер. Общая для блоков: §3.3 ТЗ требует такую же
// кнопку у блоков кода и у отдельных токенов, так что дублировать её в
// каждом блоке смысла нет.
interface CopyButtonProps {
  readonly value: string;
  /** Что именно копируется — попадает в aria-label. */
  readonly label: string;
  /** Тон подложки под кнопкой: на светлом фоне hover должен темнеть. */
  readonly tone?: 'light' | 'dark';
  readonly className?: string;
}

export function CopyButton({
  value,
  label,
  tone = 'light',
  className,
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  // Возврат к исходному виду после показа результата.
  useEffect(() => {
    if (state === 'idle') return undefined;
    const timer = setTimeout(() => setState('idle'), 1600);
    return () => clearTimeout(timer);
  }, [state]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      // clipboard недоступен без https или без разрешения — молча «скопировано»
      // показывать нельзя, иначе пользователь вставит не то, что ожидал.
      setState('failed');
    }
  };

  return (
    <button
      type="button"
      className={[styles.button, className].filter(Boolean).join(' ')}
      onClick={handleCopy}
      aria-label={state === 'copied' ? `${label} скопировано` : `Копировать ${label}`}
      title={state === 'failed' ? 'Не удалось скопировать' : 'Копировать'}
      data-state={state}
      data-tone={tone}
    >
      <span className={styles.icon} aria-hidden="true" />
      {/* Результат озвучивается скринридеру: у иконочной кнопки визуальной
          обратной связи (смена фона) для незрячих не существует. */}
      <output className={styles.srOnly}>
        {state === 'copied' ? 'Скопировано' : ''}
        {state === 'failed' ? 'Не удалось скопировать' : ''}
      </output>
    </button>
  );
}
