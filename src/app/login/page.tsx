'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import type { Role } from '@/lib/auth/session';
import { safeReturnPath } from '@/lib/auth/returnPath';
import styles from './page.module.scss';

// Единая форма логина для обоих shared-аккаунтов (viewer/admin) — сервер сам
// решает роль по тому, какому хэшу совпал пароль (см. api/auth/login).
// useSearchParams() требует Suspense-границу при статической генерации
// (Next.js App Router) — вынесена в отдельный компонент.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    setPending(false);

    if (!response.ok) {
      setError('Wrong password');
      return;
    }

    // Куда приземлять, решает роль, а не общий дефолт: админ входит ради
    // редактора, и лишний переход дашборд → /admin он делал бы каждый раз.
    const { role } = (await response.json()) as { role: Role };

    // `from` важнее роли: он есть только когда пользователя развернули с
    // конкретной страницы, и вернуть его нужно именно туда. Подсунутый
    // внешний адрес отбрасывается — тогда работает обычное правило по роли.
    router.replace(safeReturnPath(searchParams.get('from')) ?? (role === 'admin' ? '/admin' : '/'));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        {/* Видимой подписи у поля в макете нет — плейсхолдер её заменяет
            визуально, но не для скринридера, поэтому aria-label обязателен. */}
        <input
          id="password"
          className={styles.input}
          type={revealed ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          aria-label="Password"
          autoComplete="current-password"
          required
        />
        {/* Иконка показывает не текущее состояние, а результат нажатия:
            пароль скрыт — открытый глаз («показать»), пароль виден —
            перечёркнутый («скрыть»). Так же читается aria-label. */}
        <button
          type="button"
          className={styles.reveal}
          onClick={() => setRevealed((current) => !current)}
          aria-pressed={revealed}
          aria-label={revealed ? 'Hide password' : 'Show password'}
        >
          <Icon name={revealed ? 'view-off' : 'view'} size={20} />
        </button>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={pending}>
        Login
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/* Логотип отдаём картинкой, а не CSS-маской как остальные иконки:
            маска красит глиф в один цвет, а логотип — брендовый ассет и
            должен оставаться собой. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.logo}
          src="/icons/dashboard/logo-bir.svg"
          alt="bir"
          width={80}
          height={40}
        />
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className={styles.note}>
          This website is for internal use only. Sharing information with third parties
          is punishable by criminal prosecution.
        </p>
      </div>
    </main>
  );
}
