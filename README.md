# brand.bir.az

Внутренний сайт-документация дизайн-системы BirDS (гайдлайны, tone of voice,
живой каталог компонентов, changelog). Не публичный — доступ по паролю
(два shared-аккаунта, `viewer`/`admin`, см. `docs/PROMPT.md` §4).

Полное ТЗ: [`docs/PROMPT.md`](docs/PROMPT.md).
Открытые вопросы, требующие ответа перед реализацией отдельных разделов:
[`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md).

## Статус

Каркас + рабочий дашборд (`src/app/[locale]/page.tsx`, реализация Figma node
`230:7792`, 2026-08-05) — собирается, линтится, типизируется и провалидирован
визуально (Playwright-скриншот сверен с макетом). Остальные разделы
(`/guidelines/[brand]`, `/tone-of-voice/[brand]`, `/components`, `/changelog`,
`/admin`) — по-прежнему заготовки, ждут либо контента, либо ответа на
открытый вопрос из `docs/OPEN_QUESTIONS.md`.

**Проверено `npm run build` (env-cmd -f .env.dev next build):** компиляция,
ESLint (airbnb + airbnb-typescript + jsx-a11y + risxss + xss + no-unsanitized),
`tsc --noEmit`, генерация 51 статической страницы — всё чисто.

## Структура

```
docs/                          ТЗ и открытые вопросы
public/icons/dashboard/        иконки дашборда (временно — см. OPEN_QUESTIONS №10)
src/
  app/
    layout.tsx                 ЕДИНСТВЕННОЕ место с <html>/<body> во всём дереве
    login/                     форма логина (вне [locale])
    api/auth/                  login/logout — сверка bcrypt-хэшей, iron-session cookie
    [locale]/                  az | en | ru
      layout.tsx               NextIntlClientProvider (без html/body — см. выше)
      page.tsx                 ДАШБОРД — реализован (DashboardShell)
      guidelines/[brand]/      ecosystem|retail|business|invest|private — заготовка
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
    i18n/request.ts            next-intl: missing key → throw, не fallback
    craft/registry.ts          единый реестр Strapi↔craft.js — пуст, ждёт §7.1
    brands.ts                  BrandKey/FintechBrand/PartnerBrand + brandDisplayName (§3.2)
  messages/{az,en,ru}.json
  styles/
    tokens/                    _colors.scss, _primitives.scss (реальные) +
                                _radius.scss, _spacing.scss, _typography.scss
                                (переведены из сырых JSON при реализации
                                дашборда — см. tokens/README.md, только режим
                                Desktop, брейкпоинты не подтверждены)
    globals.scss
  middleware.ts                auth (role admin/viewer) + next-intl routing
                                (редирект '/' → '/az' и т.п.), в этом порядке
```

## Известные ограничения дашборда (см. `docs/OPEN_QUESTIONS.md` за деталями)

- Иконки — статичные SVG, скачанные из Figma (№10), не из `@birds/ui/icons`.
- Переключение бренда в сайдбаре не завязано на реальный роут состояния (№12).
- Сайдбар ссылается на `/guidelines/[brand]/[slug]` — сегмента `[slug]` ещё
  нет в дереве роутов, поэтому эти переходы 404-ят (ожидаемо, не регресс).
- `<html lang>` захардкожен на `az` в корневом layout (за пределами
  `[locale]`) — см. TODO в `src/app/layout.tsx`.
- Брейкпоинты Mobile/Tablet/Desktop+ не реализованы в токенах (№9) —
  дашборд адаптирован только под Desktop-макет (1440px).

## Дальше

1. Разобрать `docs/OPEN_QUESTIONS.md` — часть разделов (`/admin`,
   `/changelog`, вложенные guideline-топики) не сдвинутся дальше заглушки
   без ответов.
2. Свериться с реальным `birds-tokens`/`@birds/ui`, когда будет доступ к
   монорепо (пути импортов, брейкпоинты, недостающие модули токенов).
