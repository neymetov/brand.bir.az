---
last_analyzed_commit: none
analyzed_at: 2026-08-06
scope: full
---

# QA Analysis Report — brand.bir.az

> Анализ собран для передачи в Claude Code. Ничего в проекте не менялось:
> ни исходный код, ни тесты, ни конфиги. Этот файл — единственный артефакт.
> Тестов в проекте нет вообще (нет ни тест-фреймворка в `package.json`, ни
> файлов `*.test.*`/`*.spec.*`, ни `__tests__/`), поэтому колонки Unit/Integ/E2E
> ниже почти сплошь `missing` — это не регресс, а стартовая точка.

## Summary

- **Strategy: A/B (doc-driven + aggregation).** Есть настоящая спецификация
  (`docs/PROMPT.md` — архитектурное ТЗ) и подробный журнал решений/ограничений
  (`docs/OPEN_QUESTIONS.md`), но они архитектурные, а не сценарные — из них
  нельзя вытащить готовые «GIVEN/WHEN/THEN». Ассерты выведены из кода и сверены
  со спекой. Уверенность: **medium** (спека подтверждает намерение, но
  ожидаемые значения выведены из реализации).
- **Scope:** full (исходников < 50 значимых `.ts/.tsx` с логикой; UI-разметка
  без логики не ассертилась).
- **Total assertions:** 34
- **Coverage:** 0 / 34 ассертов имеют хоть один тест (тестовой инфраструктуры нет).
- **Critical gaps:** 10 ассертов с risk=critical и нулевым покрытием
  (AUTH-002/003/005/006/007, MW-001/002, SEC-001/002, DATA-001) — вся
  авторизация + санитизация rich-text + прокси медиатеки.
- **Стек:** Next.js 15 (App Router) + TypeScript strict, next-intl (az/en/ru),
  iron-session, bcryptjs, craft.js, Strapi v5 (ещё не подключён), SCSS-токены.

## Completeness Self-Check

| Source | Что в источнике | Assertions extracted | Комментарий |
|--------|-----------------|----------------------|-------------|
| `docs/PROMPT.md` §4 (auth) | 5 правил доступа | 8 | Каждое правило дало >1 ассерта (роль, редирект, cookie-флаги). |
| `docs/PROMPT.md` §1/§3.4 (security) | санитизация rich-text, CSP, токен Strapi | 6 | |
| `src/lib/**` (data/i18n/brands) | чистая логика | 9 | |
| `src/components/blocks/**` (pure helpers) | контраст, шрифт, tracking | 8 | Только функции с логикой; презентационные `.tsx` пропущены. |
| `src/middleware.ts` | маршрутизация+auth | 3 | |
| **Итого** | | **34** | Соотношение к «сценариям» спеки ≈ 1.3 — без переизбытка. |

Разделы `/admin` (craft-редактор), `/changelog`, вложенные guideline-топики
намеренно остаются заглушками (см. `OPEN_QUESTIONS.md` #1, #2, #16–#18) — по
ним ассертов не выводилось, тестировать пока нечего.

## Input Sources Detected

- **Spec / ТЗ:** `docs/PROMPT.md` (§1–§7), `docs/OPEN_QUESTIONS.md` (#1–#38),
  `README.md`, `strapi-schemas/*.json` (7 компонентов секций).
- **Code:** `src/` — 25 `.ts`, 63 `.tsx`. Логика сосредоточена в `src/lib/`,
  `src/middleware.ts`, `src/app/api/`, и в `types.ts`/хуках блоков.
- **Tests:** отсутствуют полностью.
- **Git:** репозиторий инициализирован, но коммитов нет (`main` без истории) →
  `last_analyzed_commit: none`. Для инкрементального режима сделайте первый
  коммит, тогда следующий прогон сможет диффать.

---

## Assertion Checklist

### Категория A — Авторизация и доступ (§4, middleware, session)

| ID | Rule | Source | Confidence | Risk | Unit | Integ | E2E |
|----|------|--------|------------|------|------|-------|-----|
| AUTH-001 | Пустой/отсутствующий пароль на `/api/auth/login` → 400 | code:`api/auth/login/route.ts:12` | high | high | missing | missing | N/A |
| AUTH-002 | Пароль совпал с admin-хэшем → роль `admin` | code:`login/route.ts:20` + spec §4 | high | critical | missing | missing | missing |
| AUTH-003 | Пароль совпал только с viewer-хэшем → роль `viewer` | code:`login/route.ts:22` | high | critical | missing | missing | missing |
| AUTH-004 | admin проверяется ДО viewer (один пароль → самая сильная роль) | code:`login/route.ts:19-24` + spec §4 | high | high | missing | missing | N/A |
| AUTH-005 | Неверный пароль → 401, cookie не ставится | code:`login/route.ts:26-28` | high | critical | missing | missing | missing |
| AUTH-006 | Session-cookie: `httpOnly`, `sameSite=lax`, `secure` в prod, `path=/` | code:`login/route.ts:32-37` + spec §4 | high | critical | missing | missing | N/A |
| AUTH-007 | Подделанная/просроченная cookie → `getSession` = null (не throw) | code:`auth/session.ts:44-47` | high | critical | missing | missing | N/A |
| AUTH-008 | Нет `SESSION_SECRET` → `getSessionPassword` бросает ошибку | code:`auth/session.ts:20-22` | high | medium | missing | missing | N/A |
| MW-001 | Без сессии любой не-`/login`/`/api/auth` путь → redirect на `/login?from=<path>` | code:`middleware.ts:28-32` | high | critical | missing | missing | missing |
| MW-002 | `/admin` (или `/<locale>/admin`) при роли viewer → redirect на `/<defaultLocale>` | code:`middleware.ts:26,34-36` + spec §4 | high | critical | missing | missing | missing |
| MW-003 | `/api/*` и файлы (сегмент с точкой) минуют next-intl, но НЕ auth | code:`middleware.ts:38-48` + OQ #38 | high | high | missing | missing | missing |

> **AUTH-004 details** — precondition: заданы оба хэша, пароль случайно матчит
> оба. Action: POST `/api/auth/login`. Expected: роль `admin` (проверка admin
> идёт первой). Тест должен подать пароль, чей bcrypt-хэш стоит в ОБОИХ env, и
> убедиться, что вернулась `admin`.
>
> **AUTH-007 details** — precondition: cookie `bb_session` содержит мусор или
> запечатана другим секретом. Action: `getSession(request)`. Expected: `null`,
> без исключения (иначе middleware упадёт 500 вместо мягкого разлогина).
>
> **MW-002 details** — precondition: валидная сессия role=viewer. Action: GET
> `/az/admin`. Expected: 307/302 redirect на `/az`. Проверить и `/admin` без
> локали, и с локалью — regex `^\/(?:[a-z]{2}\/)?admin(?:\/|$)`.
>
> **MW-003 details** — риск: важно, что бай-пасс локали (для ассетов из
> `public/` и `/api/*`) выполняется ПОСЛЕ проверки `!session` (строки 28-32),
> то есть медиа остаётся за логином (это и подтверждает OQ #38). Тест: без
> сессии GET `/screens/x.png` → redirect на `/login`, НЕ отдача файла.

### Категория B — Безопасность контента (§1, §3.4)

| ID | Rule | Source | Confidence | Risk | Unit | Integ | E2E |
|----|------|--------|------------|------|------|-------|-----|
| SEC-001 | `renderRichText` пропускает только теги из белого списка; `<script>/<style>/<iframe>` отбрасываются, текст внутри сохраняется | code:`richText.tsx:23-28,66-68` | high | critical | missing | N/A | N/A |
| SEC-002 | `<a href="javascript:...">` → ссылка становится обычным текстом | code:`richText.tsx:44-52,70-76` | high | critical | missing | N/A | N/A |
| SEC-003 | Внешняя `http(s)` ссылка получает `target=_blank rel="noopener noreferrer"` | code:`richText.tsx:54-56,80-82` | high | high | missing | N/A | N/A |
| SEC-004 | Все атрибуты (`style/class/on*`) у разрешённых тегов отбрасываются | code:`richText.tsx:89-94` | high | high | missing | N/A | N/A |
| SEC-005 | Теги-синонимы нормализуются: `b→strong, i→em, strike/del→s, ins→u, div→p` | code:`richText.tsx:31-38,62` | high | medium | missing | N/A | N/A |
| SEC-006 | `richTextToPlain` возвращает только текстовые узлы (для alt) | code:`richText.tsx:128-140` | medium | medium | missing | N/A | N/A |

> **SEC-001/002 — это ядро защиты от XSS в контенте из CMS.** Приоритет №1 для
> qa-cover: таблица «злых» входов (`<img onerror>`, `<a href="javascript:...">`,
> `<svg/onload>`, вложенный `<script>`) → на выходе ни атрибута-обработчика, ни
> опасной схемы. `looksLikeHtml`/`renderRichText` чисты (изоморфный парсер, без
> `dangerouslySetInnerHTML`) — но именно поэтому их надо зафиксировать тестом,
> чтобы будущая правка не ослабила белый список.

### Категория C — Слой данных Strapi и медиа (§3, §3.4)

| ID | Rule | Source | Confidence | Risk | Unit | Integ | E2E |
|----|------|--------|------------|------|------|-------|-----|
| DATA-001 | `GET /api/media` при роли ≠ admin → 403 | code:`api/media/route.ts:10-13` | high | critical | missing | missing | missing |
| DATA-002 | Strapi не сконфигурен → 503 + `{error:'strapi_not_configured', items:[]}` | code:`api/media/route.ts:17-22` | high | medium | missing | missing | N/A |
| DATA-003 | `?kind=font` → только шрифты; иначе (в т.ч. мусор) → изображения | code:`api/media/route.ts:26-27` + `media.ts:61-64` | high | medium | missing | missing | N/A |
| DATA-004 | Шрифты матчатся по mime `font/*` ИЛИ расширению `.woff2?/.ttf/.otf` | code:`media.ts:59-64` | high | medium | missing | N/A | N/A |
| DATA-005 | Относительный url файла достраивается до абсолютного (base без `/api`) | code:`media.ts:34-38` | high | medium | missing | N/A | N/A |
| DATA-006 | `thumbnailUrl` = формат `thumbnail`, иначе фолбэк на основной url | code:`media.ts:45` | medium | low | missing | N/A | N/A |
| DATA-007 | `strapiFetch` без URL/токена → `StrapiNotConfiguredError`; при `!ok` → Error со статусом | code:`strapi/client.ts:28,42-44` | high | medium | missing | missing | N/A |
| DATA-008 | Токен Strapi не утекает в браузер (`server-only`, нет `NEXT_PUBLIC_`) | code:`strapi/client.ts:1` + spec §3 | high | high | N/A | missing | missing |

### Категория D — i18n, бренды, реестр блоков

| ID | Rule | Source | Confidence | Risk | Unit | Integ | E2E |
|----|------|--------|------------|------|------|-------|-----|
| I18N-001 | Локаль не из `['az','en','ru']` → `notFound()` (404) | code:`i18n/request.ts:13-14` | high | high | missing | missing | missing |
| I18N-002 | Отсутствующий ключ перевода → throw в prod (краш, НЕ fallback) | code:`i18n/request.ts:26-28` + spec §1 | high | high | missing | missing | missing |
| BRAND-001 | `publishedGuidelineBrands` = 5 fintech-брендов (без партнёрских) | code:`brands.ts:13-19` + spec §3.1 | high | medium | missing | N/A | N/A |
| BRAND-002 | `defaultBrand` = `retail`; `brandDisplayName.retail` = `Birbank` | code:`brands.ts:21,26-32` + spec §3.2 | high | low | missing | N/A | N/A |
| REG-001 | `craftResolver` и `strapiAllowedComponents` строятся из одного `blockRegistry` (не расходятся) | code:`craft/registry.ts:72-78` + spec §3.5 | high | high | missing | N/A | N/A |
| REG-002 | Каждый `strapiComponent` в реестре имеет реальную схему в `strapi-schemas/` с совпадающими полями | code:`registry.ts:30-67` vs `strapi-schemas/` | high | high | partial | N/A | N/A |

> **REG-002 — на сегодня covered-by-existence, но без теста-стража.** Все 7
> `strapiComponent` из реестра имеют файл схемы (`text-block`, `media`,
> `color-palette`, `action-buttons`, `fontface-viewer`, `divider`,
> `app-screenshots`). Сверил `media.json`: поля `layout`(wide/pair) /
> `carousel`(bool) / `images`(media) точно совпадают с `MediaBlockProps` — то
> есть **OQ #16 («схема медиа-блока не заведена») устарел, файл уже есть.**
> Остаётся риск ручного рассинхрона в будущем: нужен тест, что множество ключей
> реестра == множество файлов схем И поля совпадают (сейчас проверял только
> media; qa-cover пусть сверит остальные 6). Помечено `partial`, а не `covered`:
> совпадение обеспечено вручную, не тестом.

### Категория E — Чистые хелперы блоков (контраст, шрифт, форматы)

| ID | Rule | Source | Confidence | Risk | Unit | Integ | E2E |
|----|------|--------|------------|------|------|-------|-----|
| PAL-001 | `readableTextColor`: WCAG-яркость > 0.6 → `dark`, иначе `light` | code:`ColorPalette/types.ts:75-86` | high | medium | missing | N/A | N/A |
| PAL-002 | `parseColor` понимает `#fff` и `#ffffff`; невалид/`rgb()` → null → light | code:`ColorPalette/types.ts:50-65` | high | medium | missing | N/A | N/A |
| PAL-003 | `normalizeColor`: `ff0039`→`#ff0039`, но не-hex строка возвращается как есть | code:`ColorPalette/types.ts:89-92` | high | low | missing | N/A | N/A |
| FONT-001 | `cssFamilyName` уникален по `fontId`, иначе по хэшу url; без url → undefined | code:`FontfaceViewer/types.ts:52-56` | high | medium | missing | N/A | N/A |
| FONT-002 | `specimenValues` включает поле только если оно `!= null` (0 показывается) | code:`FontfaceViewer/types.ts:59-75` | high | low | missing | N/A | N/A |
| FONT-003 | `useSpecimenFont`: уже загруженное семейство → `ready` без повторной загрузки; ошибка → `failed` | code:`useSpecimenFont.ts:30-57` | medium | medium | missing | missing | N/A |
| ACT-001 | `isExternalHref`: только `http(s)://` → true (для rel=noopener) | code:`ActionButtons/types.ts:73-75` | high | medium | missing | N/A | N/A |
| CFG-001 | CSP prod: `script-src` без `unsafe-eval`; media-источники из env в img/media/font/connect-src | code:`next.config.mjs:41-65` | high | high | missing | missing | N/A |

---

## Coverage Gaps (Ranked by Risk)

| Priority | ID | Rule | Risk | Current | Missing | Recommendation |
|----------|-----|------|------|---------|---------|----------------|
| 1 | SEC-001 | Белый список тегов rich-text | critical | none | unit | qa-cover: таблица XSS-входов → чистый выход |
| 2 | SEC-002 | `javascript:` href → текст | critical | none | unit | qa-cover: набор опасных схем |
| 3 | AUTH-002/003 | Пароль → корректная роль | critical | none | unit+integ | Замокать bcrypt/env, проверить обе роли |
| 4 | AUTH-005 | Неверный пароль → 401, без cookie | critical | none | unit+integ | Проверить отсутствие `Set-Cookie` |
| 5 | AUTH-006 | Флаги session-cookie | critical | none | unit | Проверить httpOnly/secure/sameSite/path |
| 6 | AUTH-007 | Битая cookie → null | critical | none | unit | Подать мусор и чужой секрет |
| 7 | MW-001 | Без сессии → /login | critical | none | integ+e2e | Тест middleware/маршрутов |
| 8 | MW-002 | viewer на /admin → redirect | critical | none | integ+e2e | Обе формы пути (с локалью и без) |
| 9 | DATA-001 | /api/media не-admin → 403 | critical | none | integ | Сессии viewer/none/admin |
| 10 | DATA-008 | Токен Strapi не в браузере | high | none | integ | Грепнуть бандл на токен/статикой |
| 11 | MW-003 | Ассеты минуют i18n, но не auth | high | none | integ | `/screens/x.png` без сессии → /login |
| 12 | I18N-002 | Missing key → краш в prod | high | none | unit | Замокать NODE_ENV=production |
| 13 | I18N-001 | Кривая локаль → 404 | high | none | unit | `getRequestConfig` с `xx` |
| 14 | REG-001/002 | Реестр ↔ Strapi-схемы | high | none | unit | Сверить ключи с `strapi-schemas/` |
| 15 | CFG-001 | Строгая prod-CSP | high | none | unit | Вызвать `contentSecurityPolicy()` в prod |
| 16 | SEC-003/004 | rel=noopener, срезание атрибутов | high | none | unit | В той же XSS-таблице |
| 17 | AUTH-001 | Пустой пароль → 400 | high | none | unit | |
| 18 | AUTH-004 | admin раньше viewer | high | none | unit | Пароль, матчащий оба хэша |
| 19 | PAL-001/002, FONT-001, ACT-001, DATA-003/004/005 | Чистые хелперы | medium | none | unit | Дешёвые табличные unit-тесты — быстрый выигрыш покрытия |

---

## Spec Issues Found

### Ambiguities (решает человек — см. `docs/OPEN_QUESTIONS.md`)

- **OQ #1** — нужна ли вложенность секций (колонки внутри секции). Блокирует
  `craft/registry.ts` и `/admin`. Пока реестр плоский.
- **OQ #2** — источник changelog (build-time парсинг vs webhook). Блокирует
  `/changelog`.
- **OQ #16 — устарел:** файл `strapi-schemas/.../media.json` уже существует и его
  поля `layout/carousel/images` совпадают с `MediaBlockProps`. Осталось сверить
  парность полей для остальных 6 блоков (см. REG-002) и обновить OQ #16.
- **OQ #4/#5** — семантика spacing-токена (скачок 16→189→341) и немасштабируемые
  Label/Caption. Влияет на будущие токен-тесты, не на текущий код.

### Undocumented Behaviors (код делает, спека молчит)

- **`richText.tsx` TAG_ALIASES** (`div→p` и т.д.) — разумно, но в §1 не описано.
  Подтвердить, что `div→p` — желаемое поведение (SEC-005).
- **`api/media` 502 c `error.message`** (`route.ts:31-35`) — тело ответа отдаёт
  текст ошибки Strapi клиенту (admin-only, риск низкий, но это info-disclosure).
- **`login/page.tsx:36`** — `router.replace(searchParams.get('from') ?? …)`
  подставляет `from` из URL напрямую. Middleware кладёт туда относительный
  `pathname`, но пользователь может вручную задать `from`. Проверьте на
  **open-redirect** (например `?from=//evil.com` или `https://…`). НЕ ассерчено
  как правило — вынесено сюда как флаг для решения.

### Possible Mismatches (код ≠ спека — вероятные баги)

- **`getComponentSource.ts:13-19` — потенциальный path traversal.**
  `category`/`component` приходят из URL-параметров маршрута
  (`[category]/[component]/page.tsx:14-15`) и без валидации попадают в
  `path.join(UI_PACKAGE_ROOT, category, component, …)`. Сейчас `UI_PACKAGE_ROOT`
  — заглушка (§6, OQ #7), путь не существует, поэтому маршрут всё равно кидает
  ошибку — но как только путь подключат к реальному monorepo, значение вроде
  `../../../etc` даст чтение произвольного файла. **Рекомендация Claude Code:**
  добавить allowlist категорий/компонентов или `path.normalize` + проверку, что
  результат внутри `UI_PACKAGE_ROOT`, ПЕРЕД тем как включать реальный путь.
- **`i18n/request.ts:21-25` vs spec §1** — `onError` в НЕ-production просто
  логирует, не бросает; краш «отсутствующий ключ» происходит только в prod
  (сборка идёт с `NODE_ENV=production`, так что ТЗ формально соблюдено). Убедитесь,
  что QA-сборки (`build:qa`/`build:preprod`) идут с `NODE_ENV=production`, иначе
  пропущенный ключ не завалит их.

---

## Random Audit Sample (спот-чек качества извлечения)

1. **AUTH-006** (cookie-флаги) — открыть `login/route.ts:32-37`, убедиться, что
   `secure` завязан на `NODE_ENV==='production'`: на dev по http cookie должна
   ставиться (иначе локальный логин не работает), в prod — только по https.
2. **SEC-002** (`javascript:` href) — проверить `safeHref` (`richText.tsx:44-52`):
   относительные `/…` и `#…` разрешены, схемы кроме http/mailto/tel — режутся.
   Убедиться, что `  javascript:alert(1)` с ведущими пробелами тоже режется
   (в коде есть `.trim()` — да).
3. **DATA-005** (absoluteUrl) — `media.ts:34-38`: для локального провайдера
   Strapi отдаёт `/uploads/x.png`; base берётся из `STRAPI_API_URL` с обрезанным
   `/api`. Проверить кейс, когда `STRAPI_API_URL` не задан (base = '') — url
   останется относительным.
4. **REG-001** (единый реестр) — `registry.ts:72-78`: и resolver, и
   allowedComponents строятся из `blockRegistry`. Это covered-by-construction, но
   тест-снапшот ключей защитит от ручного рассинхрона в будущем.
5. **PAL-001** (контраст) — граничный кейс: чисто-белый `#ffffff` → luminance=1
   > 0.6 → `dark` (тёмный текст на белом — верно); чёрный → `light`.

---

## Next Steps

| Category | Item | Кто |
|----------|------|-----|
| **Decide** | OQ #1 вложенность секций; OQ #2 источник changelog; OQ #16 поля Strapi-схемы медиа | Human (Elshan / дизайн) |
| **Decide** | Open-redirect на `login/page.tsx:36` — какое поведение для внешнего `from`? | Human/архитектор |
| **Decide** | Path-traversal в `getComponentSource` — allowlist или проверка границ пути перед подключением реального monorepo | Human/архитектор |
| **Implement** | Валидация `category/component` в `getComponentSource`; sanity на `from` в login | Developer |
| **Implement** | (после ответов) Strapi-обмен в `/admin`, схема медиа-блока (OQ #16-#18) | Developer |
| **Test** | Завести тест-фреймворк (Vitest + Testing Library; Playwright для middleware/e2e — уже в devDeps косвенно нет, добавить) | qa-cover |
| **Test** | Приоритеты 1-9 из «Coverage Gaps»: rich-text санитизация, auth-роли, middleware-гейты, /api/media 403 | qa-cover |
| **Test** | Чистые хелперы (PAL/FONT/ACT/DATA-*) — дешёвые табличные unit-тесты, быстрый подъём покрытия | qa-cover |

---

### Замечания для Claude Code (кратко)

1. **Тестов нет — начните с инфраструктуры.** В `package.json` нет ни Vitest/Jest,
   ни Playwright. Первый шаг qa-cover — добавить runner + первый «дымовой» тест.
2. **Три ассерта критичнее всего для безопасности:** SEC-001/002 (XSS в
   rich-text), AUTH-*/MW-* (гейты доступа), DATA-001/008 (прокси медиатеки и
   утечка токена). Это банковский внутренний инструмент — начните отсюда.
3. **Два реальных потенциальных бага** (не покрыты как ассерты, требуют решения):
   open-redirect в форме логина и path-traversal в `getComponentSource`.
   Оба — «спит, пока не подключат реальные данные», но чинить лучше сейчас.
4. **Много кода — заглушки по дизайну** (`/admin`, `/changelog`, per-brand
   сайдбар, Strapi-обмен). Не тестируйте их как готовые — сверяйтесь с
   `OPEN_QUESTIONS.md`, там явно помечено, что ждёт ответа.
5. Для инкрементального режима следующего прогона — **сделайте первый git-коммит**,
   тогда анализ сможет диффать изменения.
