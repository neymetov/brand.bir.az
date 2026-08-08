'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import styles from './EditorNav.module.scss';

// Навигационная панель редактора (Figma node 300:7376): логотип и выход.
//
// Кнопка в макете называется «Save and exit», но сохранять пока некуда:
// обмен со Strapi не подключён, правки живут только в состоянии браузера
// (docs/OPEN_QUESTIONS.md #63 и раздел «Что ещё не сделано»). Молча увести
// со страницы по кнопке с таким названием — значит пообещать сохранение,
// которого не было, и потерять работу админа без предупреждения.
//
// Поэтому до подключения CMS кнопка честно предупреждает, что уносит
// несохранённое. Когда появится реальное сохранение, здесь останется
// вызвать его и убрать подтверждение.
const SAVE_IS_WIRED = false;

const WARNING = 'Сохранение ещё не подключено — всё, что собрано в редакторе, будет потеряно. Выйти?';

export function EditorNav() {
  const router = useRouter();

  const handleExit = () => {
    // До подключения CMS это единственная защита от молчаливой потери правок;
    // уйдёт вместе с заглушкой.
    // eslint-disable-next-line no-alert
    if (!SAVE_IS_WIRED && !window.confirm(WARNING)) return;
    router.push('/');
  };

  return (
    <nav className={styles.nav} aria-label="Editor">
      {/* Логотип отдаём картинкой, а не CSS-маской как иконки: маска красит
          глиф в один цвет, а логотип — брендовый ассет и должен оставаться
          собой. Тот же файл, что на экране логина. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- статичный ассет */}
      <img className={styles.logo} src="/icons/dashboard/logo-bir.svg" alt="bir" width={72} height={36} />

      <button type="button" className={styles.exit} onClick={handleExit}>
        <Icon name="floppy-disk" size={20} />
        <span>Save and exit</span>
      </button>
    </nav>
  );
}
