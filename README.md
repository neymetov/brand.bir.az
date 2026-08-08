# brand.bir.az

Внутренний сайт-документация дизайн-системы BirDS (гайдлайны, tone of voice,
живой каталог компонентов, changelog). Не публичный — доступ по паролю
(два shared-аккаунта, `viewer`/`admin`, см. `docs/PROMPT.md` §4).

Полное ТЗ: [`docs/PROMPT.md`](docs/PROMPT.md).
Открытые вопросы, требующие ответа перед реализацией отдельных разделов:
[`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md).

## Запуск локально

Полный стенд — сайт, CMS и база — поднимается двумя командами.

```bash
docker compose up -d      # PostgreSQL + Strapi в контейнерах
npm run dev               # сайт (env-cmd -f .env.dev next dev)
```

| Что | Адрес | Вход |
| --- | --- | --- |
| Сайт | http://localhost:3000 | пароль `viewer` или `admin` из `.env.dev` |
| Редактор блоков | http://localhost:3000/admin | только под паролем `admin` |
| Админка Strapi | http://localhost:1338/admin | учётка администратора CMS |

Порты 1338 и 5433, а не стандартные 1337/5432: последние занимает CMS
соседнего проекта (`birbank private`), и оба стенда должны работать
одновременно.

### Что можно проверить

1. **Читатель.** Вход `viewer`-паролем → дашборд → выбор бренда в сайдбаре →
   разводная с карточками → раздел.
2. **Редактор.** Вход `admin`-паролем ведёт сразу в `/admin` — список
   разделов. Открыть любой, перетащить блоки, заполнить.
3. **Публикация.** «Publish and exit» показывает страницу читателям сразу,
   «Save draft» откладывает — черновик читателю не виден.
4. **Рубрики.** На `/admin` у каждого бренда ссылка «Рубрики и разделы»:
   добавление, переименование, порядок, иконка, удаление.
5. **Медиатека.** Файлы загружаются только в Strapi (Media Library); в
   редакторе они появляются в пикере изображений и файлов.

### Ограничения локального стенда

- Стенд доступен только с этой машины — поделиться ссылкой с коллегами
  нельзя. Для этого нужен внешний хост (`docs/OPEN_QUESTIONS.md` №95–97).
- Загрузки лежат в томе контейнера. `docker compose down -v` удалит и
  медиатеку, и всю базу вместе с контентом.

## Статус

Работают: дашборд, разводные страницы всех 10 брендов, страницы разделов,
мобильная навигация, экран логина. Редактор на `/admin` читает и пишет в
Strapi: собирает страницу из девяти блоков, сохраняет черновик и публикует.
Рубрики и разделы бренда правятся там же (`/admin/[brand]/navigation`) и
хранятся в CMS; набор из кода остаётся значением по умолчанию.
Локализации нет — сайт только на английском (`docs/OPEN_QUESTIONS.md` №56).

Заготовками остаются `/tone-of-voice/[brand]`, `/components`, `/changelog` —
они ждут либо контента, либо ответа на открытый вопрос.

**Проверки:** `npm test` (165 тестов), `npm run build`, `tsc --noEmit`,
`npm run lint`, `npm run lint:styles` — чисто.

Репозиторий локальный: ремоут отключён намеренно, работа продолжается на
машине (`docs/OPEN_QUESTIONS.md` №105 и далее).

## Структура

```
docs/                          ТЗ и открытые вопросы
public/icons/dashboard/        иконки дашборда (временно — см. OPEN_QUESTIONS №10)
src/
  app/
    layout.tsx                 ЕДИНСТВЕННОЕ место с <html>/<body> во всём дереве
    login/                     форма логина (вне [locale])
    api/auth/                  login/logout — сверка bcrypt-хэшей, iron-session cookie
    page.tsx                   ДАШБОРД (DashboardShell)
    guidelines/[brand]/        разводная страница бренда
    guidelines/[brand]/[slug]/ страница раздела — контент из Strapi
      guidelines/foundations/
      tone-of-voice/[brand]/
      components/              каталог
      components/[category]/[component]/   живой playground
      changelog/                общий, не per-раздел
      admin/                    craft.js-редактор (свой роут, не Strapi admin)
  components/
    dashboard/                 Sidebar, Drawer (ContentDrawer+AnchorList),
                                CarouselRecommendations, shared/ (MenuItem,
                                MasterButton, BrandLogo) — см. OPEN_QUESTIONS
                                №9, №11, №12 по частично решённым вопросам
    icons/Icon.tsx              CSS-mask поверх public/icons/dashboard/*.svg
    playground/                ComponentPlayground/BrandSwitcher/CodeBlock/
                                PropsPanel/getComponentSource — написаны с нуля,
                                референс playground-demo/ из ТЗ отсутствовал
                                в исходной директории (см. OPEN_QUESTIONS №6)
  lib/
    auth/session.ts            iron-session (sealData/unsealData, edge-safe)
    strapi/                    серверный клиент CMS, чтение/запись страниц
    craft/registry.ts          единый реестр Strapi↔craft.js (9 блоков)
    craft/strapiMapping.ts     Dynamic Zone ↔ дерево craft.js
    brands.ts                  BrandKey/FintechBrand/PartnerBrand + brandDisplayName (§3.2)
  styles/
    tokens/                    _colors.scss, _primitives.scss (реальные) +
                                _radius.scss, _spacing.scss, _typography.scss
                                (переведены из сырых JSON при реализации
                                дашборда — см. tokens/README.md, только режим
                                Desktop, брейкпоинты не подтверждены)
    globals.scss
  middleware.ts                auth: роли admin/viewer, контент за паролем
cms/                           Strapi 5 (TypeScript + PostgreSQL)
strapi-schemas/                схемы компонентов и контент-типа для CMS
```

## Известные ограничения дашборда (см. `docs/OPEN_QUESTIONS.md` за деталями)

- Иконки — статичные SVG, скачанные из Figma (№10), не из `@birds/ui/icons`.
- Режим Mobile у токенов отступов включён, Tablet и Desktop+ — нет:
  подтверждающих макетов не было (№50).
- Сетка разводной страницы не адаптирована под телефон (№51).
- Публикация страницы — ручное действие в админке Strapi (№91).
- Медиа-провайдер S3 не настроен: загрузки лежат в контейнере (№97).

## Дальше

1. Разобрать `docs/OPEN_QUESTIONS.md` — часть разделов (`/changelog`,
   `/components`, `/tone-of-voice`) не сдвинутся дальше заглушки без ответов.
2. Свериться с реальным `birds-tokens`/`@birds/ui`, когда будет доступ к
   монорепо (пути импортов, брейкпоинты, недостающие модули токенов).
