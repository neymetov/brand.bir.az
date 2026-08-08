# strapi-schemas

Схемы контент-типов и компонентов Strapi, которые нужны сайту `brand.bir.az`.

**Это артефакты для переноса, а не рабочая конфигурация.** Сам Strapi живёт
отдельным сервисом на своём домене; файлы отсюда кладутся в его репозиторий
и применяются его миграциями.

## Правило согласованности

Каждый компонент здесь обязан соответствовать записи в
`src/lib/craft/registry.ts` — реестр объявляет имя Strapi-компонента, из него
же собирается `allowedComponents` для Dynamic Zone. Если поле появилось в
блоке, но не появилось в схеме (или наоборот) — контент и редактор разойдутся
на первом же сохранении.

**Это проверяется тестом**, а не аккуратностью: `src/lib/craft/schemas.test.ts`
сверяет реестр, файлы схем, набор полей каждого блока, ссылки на вложенные
компоненты и список компонентов Dynamic Zone. Тест падает, если что-то
разошлось. Запуск — `npm test`.

---

## Установка: порядок действий

### 1. Перенести схемы в репозиторий Strapi

| Отсюда | Туда |
| --- | --- |
| `components/sections/*.json` | `src/components/sections/` |
| `components/shared/*.json` | `src/components/shared/` |
| `api/guideline-page/**` | `src/api/guideline-page/` |

Порядок важен: `sections.*` ссылаются на `shared.*`, а `guideline-page`
ссылается на все `sections.*`. Strapi проверяет ссылки при старте.

### 2. Поднять Strapi и убедиться, что типы применились

В админке должны появиться 9 компонентов в группе **sections**, 8 в **shared**
и коллекция **Guideline page** с Dynamic Zone из тех же 9 блоков.

### 3. Настроить медиа-провайдер (S3)

Загрузки идут в S3-совместимый бакет. Нужны `S3_ENDPOINT`, `S3_BUCKET`,
`S3_REGION`, ключи доступа — см. `.env.example` в корне сайта.
**TLS-проверку отключать нельзя** (§1 ТЗ).

Не решено, приватный бакет или публичный (`docs/OPEN_QUESTIONS.md` №20).
Блоки хранят и `id`, и `url` файла именно поэтому: при приватном бакете
presigned-ссылка протухает, и по `id` её можно перевыпустить.

### 4. Выпустить API-токен

Тип **Read-only** достаточно: сайт только читает контент. Токен кладётся в
`STRAPI_API_TOKEN` на стороне сайта и **не должен попадать в браузер** — все
запросы идут через серверный клиент (`src/lib/strapi/client.ts`, помечен
`server-only`) и прокси `/api/media`.

### 5. Прописать переменные на стороне сайта

```
STRAPI_API_URL=https://<домен-strapi>/api
STRAPI_API_TOKEN=<read-only токен>
S3_ENDPOINT=…
S3_PUBLIC_URL=…       # если медиа отдаётся напрямую, без прокси
```

Все три источника (`STRAPI_API_URL`, `S3_ENDPOINT`, `S3_PUBLIC_URL`)
автоматически попадают в CSP (`img-src`/`media-src`) и в
`images.remotePatterns` — см. `next.config.mjs`. Без них прод заблокирует
картинки из CMS.

### 6. Проверить связь

- `GET /api/media` под ролью `admin` → список файлов вместо `503
  strapi_not_configured`;
- пикер медиатеки в редакторе (`/admin`) показывает файлы, а не «Медиатека
  не подключена».

### 7. Что останется дописать в коде

Обмен со Strapi ещё не подключён — это единственное, чего не хватает после
установки:

- чтение страницы: `GET /guideline-pages?filters[brand]&filters[slug]` →
  Dynamic Zone → props блоков;
- сохранение из редактора: `query.serialize()` → `PUT`, **вырезав рантаймовые
  props** (`interactive`, `viewTab`, `viewPath` — `OPEN_QUESTIONS.md` №75);
- включение кнопки «Save and exit»: флаг `SAVE_IS_WIRED` в
  `src/components/admin/EditorNav.tsx` (№77).

---

## Соответствие файлов и блоков

| Файл | Strapi-компонент | Блок в коде |
| --- | --- | --- |
| `api/guideline-page/**` | `api::guideline-page.guideline-page` | страница `/guidelines/[brand]/[slug]` |
| `components/sections/text-block.json` | `sections.text-block` | `TextBlock` |
| `components/sections/media.json` | `sections.media` | `MediaBlock` |
| `components/sections/color-palette.json` | `sections.color-palette` | `ColorPalette` |
| `components/sections/action-buttons.json` | `sections.action-buttons` | `ActionButtons` |
| `components/sections/fontface-viewer.json` | `sections.fontface-viewer` | `FontfaceViewer` |
| `components/sections/divider.json` | `sections.divider` | `Divider` |
| `components/sections/app-screenshots.json` | `sections.app-screenshots` | `AppScreenshots` |
| `components/sections/file-manager.json` | `sections.file-manager` | `FileManager` |
| `components/sections/file-list.json` | `sections.file-list` | `FileList` |
| `components/shared/action-button.json` | `shared.action-button` | вложен в `action-buttons` |
| `components/shared/font-specimen.json` | `shared.font-specimen` | вложен в `fontface-viewer` |
| `components/shared/color-swatch.json` | `shared.color-swatch` | вложен в `color-palette` |
| `components/shared/color-format.json` | `shared.color-format` | вложен в `color-swatch` |
| `components/shared/file-tab.json` | `shared.file-tab` | вложен в `file-manager` |
| `components/shared/file-folder.json` | `shared.file-folder` | вложен в `file-tab` |
| `components/shared/file-subfolder.json` | `shared.file-subfolder` | вложен в `file-folder` |
| `components/shared/file-entry.json` | `shared.file-entry` | вложен в папки, рубрики и в `file-list` |

## Как media-поля превращаются в props

Strapi отдаёт файл объектом, а блоки хранят пару `url` + `id`:

| Схема | Props блока | Зачем оба |
| --- | --- | --- |
| `shared.file-entry.file` | `url`, `id` | `url` работает как есть у публичного бакета; `id` нужен, чтобы перевыпустить presigned-ссылку у приватного |
| `shared.font-specimen.font` | `fontUrl`, `fontId` | то же |
| `sections.media.images` | `images[].src`, `images[].id` | то же |
| `sections.app-screenshots.screenshots` | `screenshots[].src`, `screenshots[].id` | то же |

Раскладку делает адаптер при чтении страницы (п. 7 выше) — он ещё не написан.

## `sections.text-block`

| Поле | Тип | Соответствие props блока |
| --- | --- | --- |
| `title` | string | `title` |
| `description` | string | `description` |
| `body` | **text**, не richtext | `body` |

`body` хранит **разметку** (жирный, курсив, подчёркивание, зачёркивание,
ссылки, списки), но тип остаётся `text`, а не `richtext`: `richtext` в
Strapi — это markdown-редактор, а блок работает с HTML из своего редактора.

Разметка **не вставляется в DOM строкой**: `renderRichText`
(`src/lib/richText.tsx`) разбирает её парсером и пропускает только теги из
белого списка — `p, br, strong, em, u, s, code, a, ul, ol, li`. Все атрибуты
отбрасываются, кроме `href` у ссылок, и тот проверяется на схему
(`javascript:` не проходит). Поэтому вредный контент из CMS безопасен, даже
если попал туда мимо нашего редактора.

Старый формат (обычный текст, абзацы через пустую строку) поддерживается тем
же рендером — уже введённый контент переписывать не нужно.

## `sections.media`

| Поле | Тип | Соответствие props блока |
| --- | --- | --- |
| `layout` | enum `wide` / `pair` | `layout` |
| `carousel` | boolean | `carousel` |
| `images` | media, multiple, только изображения | `images` |

## Ограничения, о которых нужно знать до заполнения контентом

- **Папки вкладываются на два уровня, а не произвольно.** Компонент Strapi
  не может содержать сам себя, поэтому рекурсию не выразить: заведены
  `shared.file-folder` → `shared.file-subfolder`. Код при этом рекурсивен и
  выдержит любую глубину (`docs/OPEN_QUESTIONS.md` №68).
- **Локализации нет.** Сайт только на английском (№56), поэтому ни у одного
  компонента и контент-типа нет флагов i18n.
- **Вложенность блоков внутри секции не решена** (№1): Dynamic Zone плоская.
  Если понадобятся колонки с блоками внутри, переделка затронет и резолвер
  craft.js, и эту схему.
