'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { BrandId } from '@/lib/brands';
import type { SidebarGroup } from './Sidebar/sidebar.data';
import { Sidebar } from './Sidebar/Sidebar';
import { MobileNav } from './MobileNav/MobileNav';
import styles from './AppShell.module.scss';

// Оболочка раздела документации: зафиксированный слева sidebar и область
// контента справа. Вынесена отдельно, потому что sidebar нужен всем
// страницам раздела (дашборд, разводная бренда, сама страница раздела) —
// иначе его пришлось бы повторять в каждом layout и чинить в нескольких
// местах.
interface AppShellProps {
  /** Бренд, открытый сейчас: приходит из URL, а не хранится в sidebar. */
  readonly brand: BrandId;
  /**
   * Рубрики бренда. Приходят сверху, из серверного компонента: навигация
   * теперь редактируется и живёт в CMS, а sidebar — клиентский и сам
   * запросить её не может.
   */
  readonly groups: readonly SidebarGroup[];
  readonly children: ReactNode;
}

export function AppShell({ brand, groups, children }: AppShellProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  // Смена бренда — это переход, а не переключатель внутри страницы:
  // у каждого бренда свой адрес, поэтому ссылку можно отправить коллеге,
  // а «назад» возвращает к предыдущему бренду.
  const handleSelectBrand = (next: BrandId) => {
    router.push(`/guidelines/${next}`);
  };

  return (
    <div className={styles.shell}>
      {/* Два представления одной навигации: боковое меню на широком экране и
          плавающая панель на узком (Figma node 289:5851). Какое из них видно,
          решает CSS — переключение по ширине через JS дало бы разъезд разметки
          между сервером и клиентом на первом рендере. */}
      <Sidebar
        brand={brand}
        groups={groups}
        onSelectBrand={handleSelectBrand}
        onLogout={handleLogout}
      />
      <MobileNav
        brand={brand}
        groups={groups}
        onSelectBrand={handleSelectBrand}
        onLogout={handleLogout}
      />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
