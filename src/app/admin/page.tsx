import Link from 'next/link';
import { getNavigation } from '@/lib/strapi/navigation';
import { brandDisplayName, publishedGuidelineBrands } from '@/lib/brands';
import styles from './page.module.scss';

// Список страниц, которые можно редактировать. Берётся из sidebarDirectory:
// навигация живёт в коде, Strapi хранит только содержимое (решение
// пользователя, 2026-08-08). Поэтому редактор открывает существующий раздел,
// а не создаёт страницы.
export default async function AdminIndexPage() {
  // Навигация редактируемая: список берётся из CMS, а не из кода.
  const navigation = await Promise.all(
    publishedGuidelineBrands.map(async (brand) => ({
      brand,
      groups: await getNavigation(brand),
    })),
  );

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Страницы</h1>
      <p className={styles.hint}>Выберите раздел, чтобы собрать его содержимое.</p>

      {navigation.map(({ brand, groups }) => (
        <section className={styles.brand} key={brand}>
          <header className={styles.brandHead}>
            <h2 className={styles.brandName}>{brandDisplayName[brand]}</h2>
            {/* Правка рубрик и разделов — рядом с их списком, а не отдельным
                разделом меню: правят там же, где смотрят. */}
            <Link className={styles.editNav} href={`/admin/${brand}/navigation`}>
              Рубрики и разделы
            </Link>
          </header>

          {groups.map((group) => (
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
