'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { MenuItem } from '@/components/dashboard/shared/MenuItem';
import styles from './AnchorList.module.scss';

interface AnchorLink {
  readonly id: string;
  readonly label: string;
}

function byTop(a: IntersectionObserverEntry, b: IntersectionObserverEntry) {
  return a.boundingClientRect.top - b.boundingClientRect.top;
}

// Ниже этой ширины список скрыт (см. AnchorList.module.scss). Держать
// значение в одном месте с CSS нельзя, поэтому оно продублировано здесь — при
// смене брейкпоинта править оба.
const HIDDEN_BELOW = '(width <= 767px)';

// Правая навигация content-drawer — переход по якорям + скролл-спай
// (подсветка текущего раздела через IntersectionObserver на скролле окна).
export function AnchorList({ links }: { readonly links: readonly AnchorLink[] }) {
  const [activeId, setActiveId] = useState<string>(links[0]?.id ?? '');
  // Скрыт ли список сейчас. Разметку это НЕ меняет — она одинакова на сервере
  // и клиенте, прячет CSS. Состояние нужно только чтобы не гонять
  // IntersectionObserver ради невидимого списка на каждом скролле телефона.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(HIDDEN_BELOW);
    const sync = () => setHidden(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (hidden) return undefined;

    const elements = links
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        const [topMost] = visible.toSorted(byTop);
        if (topMost) setActiveId(topMost.target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [links, hidden]);

  // Плавная прокрутка делается здесь, а не глобальным
  // `html { scroll-behavior: smooth }`: глобальное правило в App Router
  // распространяется и на смену страницы, из-за чего возврат наверх при
  // навигации превращается в долгую прокрутку через весь документ.
  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

    // Подсветку ставим сразу: IntersectionObserver догонит только к концу
    // прокрутки, и всё это время активным выглядел бы прежний пункт.
    setActiveId(id);

    // Адрес обновляем без History-записи: плавный переход внутри страницы —
    // не отдельный шаг навигации, и «назад» не должен отыгрывать его обратно.
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav className={styles.anchorList} aria-label="On this page">
      {links.map((link) => (
        <MenuItem
          key={link.id}
          href={`#${link.id}`}
          label={link.label}
          variant="anchor"
          active={link.id === activeId}
          onClick={(event) => handleAnchorClick(event, link.id)}
        />
      ))}
    </nav>
  );
}
