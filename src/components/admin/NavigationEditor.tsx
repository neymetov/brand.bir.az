'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, type DashboardIconName } from '@/components/icons/Icon';
import type { SidebarGroup, SidebarItem } from '@/components/dashboard/Sidebar/sidebar.data';
import { ICON_NAMES } from '@/components/icons/iconNames';
import type { BrandId } from '@/lib/brands';
import styles from './NavigationEditor.module.scss';

// Правка рубрик и разделов бренда.
//
// Правится копия в состоянии, а не CMS по каждому нажатию: перестановка и
// переименование — это черновая работа, и сохранять каждое промежуточное
// состояние значит засорять историю и ловить полусохранённую навигацию.

interface NavigationEditorProps {
  readonly brand: BrandId;
  readonly brandName: string;
  readonly initialGroups: readonly SidebarGroup[];
}

type Draft = { label: string; items: SidebarItem[] }[];

type SaveState =
  | { readonly status: 'idle' | 'saving' }
  | { readonly status: 'error'; readonly message: string };

/** Слаг из подписи: латиница как есть, всё прочее — в дефис. */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function NavigationEditor({ brand, brandName, initialGroups }: NavigationEditorProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<Draft>(
    initialGroups.map((group) => ({ label: group.label, items: [...group.items] })),
  );
  const [state, setState] = useState<SaveState>({ status: 'idle' });

  const patchGroup = (index: number, update: Partial<Draft[number]>) => {
    setGroups((current) => current.map((group, i) => (
      i === index ? { ...group, ...update } : group
    )));
  };

  const patchItem = (groupIndex: number, itemIndex: number, update: Partial<SidebarItem>) => {
    setGroups((current) => current.map((group, i) => (i === groupIndex ? {
      ...group,
      items: group.items.map((item, j) => (j === itemIndex ? { ...item, ...update } : item)),
    } : group)));
  };

  function move<T>(list: T[], from: number, to: number): T[] {
    if (to < 0 || to >= list.length) return list;
    const copy = [...list];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved!);
    return copy;
  }

  const save = async () => {
    setState({ status: 'saving' });

    const response = await fetch('/api/admin/navigation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, groups }),
    }).catch(() => null);

    if (!response?.ok) {
      const detail = response
        ? ((await response.json().catch(() => ({}))) as { error?: string })
        : {};
      setState({ status: 'error', message: detail.error ?? 'CMS недоступна' });
      return;
    }

    router.push('/admin');
  };

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>{`Рубрики: ${brandName}`}</h1>
          <p className={styles.hint}>
            Слаг — часть адреса раздела. Меняя его у заполненной страницы,
            вы отвязываете её от контента.
          </p>
        </div>

        <div className={styles.actions}>
          {state.status === 'error' ? (
            <span className={styles.error} role="alert">{state.message}</span>
          ) : null}
          <Link className={styles.cancel} href="/admin">Отмена</Link>
          <button
            type="button"
            className={styles.save}
            onClick={save}
            disabled={state.status === 'saving'}
          >
            {state.status === 'saving' ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </header>

      {groups.map((group, groupIndex) => (
        // eslint-disable-next-line react/no-array-index-key -- порядок задаёт админ
        <section className={styles.group} key={groupIndex}>
          <div className={styles.groupHead}>
            <input
              className={styles.groupInput}
              value={group.label}
              aria-label={`Название рубрики ${groupIndex + 1}`}
              onChange={(event) => patchGroup(groupIndex, { label: event.target.value })}
            />
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Поднять рубрику"
              onClick={() => setGroups((current) => move(current, groupIndex, groupIndex - 1))}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Опустить рубрику"
              onClick={() => setGroups((current) => move(current, groupIndex, groupIndex + 1))}
            >
              ↓
            </button>
            <button
              type="button"
              className={styles.remove}
              onClick={() => setGroups((current) => current.filter((_, i) => i !== groupIndex))}
            >
              Удалить рубрику
            </button>
          </div>

          {group.items.map((item, itemIndex) => (
            // eslint-disable-next-line react/no-array-index-key -- порядок задаёт админ
            <div className={styles.item} key={itemIndex}>
              <Icon name={item.icon} size={20} className={styles.itemIcon} />

              <input
                className={styles.input}
                value={item.label}
                aria-label={`Название раздела ${itemIndex + 1}`}
                placeholder="Название"
                onChange={(event) => {
                  const label = event.target.value;
                  // Слаг подставляется, пока его не правили руками: иначе
                  // переименование раздела ломало бы адрес заполненной страницы.
                  const slug = item.slug === slugify(item.label) ? slugify(label) : item.slug;
                  patchItem(groupIndex, itemIndex, { label, slug });
                }}
              />

              <input
                className={styles.slug}
                value={item.slug}
                aria-label={`Адрес раздела ${itemIndex + 1}`}
                placeholder="slug"
                onChange={(event) => patchItem(groupIndex, itemIndex, { slug: event.target.value })}
              />

              <select
                className={styles.select}
                value={item.icon}
                aria-label={`Иконка раздела ${itemIndex + 1}`}
                onChange={(event) => patchItem(groupIndex, itemIndex, {
                  icon: event.target.value as DashboardIconName,
                })}
              >
                {ICON_NAMES.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>

              <button
                type="button"
                className={styles.iconButton}
                aria-label="Поднять раздел"
                onClick={() => patchGroup(groupIndex, {
                  items: move(group.items, itemIndex, itemIndex - 1),
                })}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Опустить раздел"
                onClick={() => patchGroup(groupIndex, {
                  items: move(group.items, itemIndex, itemIndex + 1),
                })}
              >
                ↓
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Удалить раздел ${item.label}`}
                onClick={() => patchGroup(groupIndex, {
                  items: group.items.filter((_, j) => j !== itemIndex),
                })}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            className={styles.add}
            onClick={() => patchGroup(groupIndex, {
              items: [...group.items, { label: 'Новый раздел', slug: '', icon: 'star-circle' }],
            })}
          >
            + раздел
          </button>
        </section>
      ))}

      <button
        type="button"
        className={styles.add}
        onClick={() => setGroups((current) => [...current, { label: 'Новая рубрика', items: [] }])}
      >
        + рубрика
      </button>
    </main>
  );
}
