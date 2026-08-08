import Link from 'next/link';
import { sidebarDirectory } from '@/components/dashboard/Sidebar/sidebar.data';
import { brandDisplayName, publishedGuidelineBrands } from '@/lib/brands';
import styles from './page.module.scss';

// Список страниц, которые можно редактировать. Берётся из sidebarDirectory:
// навигация живёт в коде, Strapi хранит только содержимое (решение
// пользователя, 2026-08-08). Поэтому редактор открывает существующий раздел,
// а не создаёт страницы.
export default function AdminIndexPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Страницы</h1>
      <p className={styles.hint}>Выберите раздел, чтобы собрать его содержимое.</p>

      {publishedGuidelineBrands.map((brand) => (
        <section className={styles.brand} key={brand}>
          <h2 className={styles.brandName}>{brandDisplayName[brand]}</h2>

          {sidebarDirectory[brand].map((group) => (
            <div className={styles.group} key={group.label}>
              <h3 className={styles.groupName}>{group.label}</h3>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link className={styles.item} href={`/admin/${brand}/${item.slug}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
