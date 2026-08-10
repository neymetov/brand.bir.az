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
    // Пароль общий, и сохранять его в браузере не должны (требование
    // пользователя, 2026-08-10). Полной управы у сайта тут нет: `autocomplete`
    // для полей пароля браузеры намеренно игнорируют — Chrome, Firefox и Safari
    // перестали слушаться `off` как раз потому, что сайты им злоупотребляли.
    // Ниже — всё, что реально действует: подсказки браузеру и менеджерам
    // паролей. Гарантией это не является, см. OPEN_QUESTIONS №116.
    <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
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
          // Не `current-password`: то значение прямо просит браузер подставить
          // сохранённый пароль. `new-password` — единственное, что Chrome и
          // Safari сегодня уважают: подстановки сохранённого не будет.
          autoComplete="new-password"
          // Подсказки популярным менеджерам паролей, каждый со своим атрибутом:
          // 1Password, LastPass, Bitwarden, Dashlane.
          data-1p-ignore=""
          data-lpignore="true"
          data-bwignore="true"
          data-form-type="other"
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
      {/* Фоновый ролик. autoPlay работает только у беззвучного видео — без
          muted браузеры автовоспроизведение запрещают; звуковой дорожки в
          файле и нет. playsInline обязателен для iOS: иначе Safari открывает
          видео на весь экран поверх формы.
          poster — та же картинка, что лежит фоном: первый кадр появляется
          мгновенно, не дожидаясь загрузки.
          aria-hidden и отсутствие controls: это оформление, а не содержание,
          и в озвучке скринридера ему делать нечего. */}
      <video
        className={styles.video}
        src="/images/login-background.mp4"
        poster="/images/login-background.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />

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
