# strapi-schemas

Схемы контент-типов и компонентов Strapi, которые нужны сайту `brand.bir.az`.

**Это артефакты для переноса, а не рабочая конфигурация.** Сам Strapi живёт
отдельным сервисом на своём домене; файлы отсюда кладутся в его репозиторий
(`src/components/...`, `src/api/...`) и применяются его миграциями.

## Правило согласованности

Каждый компонент здесь обязан соответствовать записи в
`src/lib/craft/registry.ts` — реестр объявляет имя Strapi-компонента, из него
же собирается `allowedComponents` для Dynamic Zone. Если поле появилось в
блоке, но не появилось в схеме (или наоборот) — контент и редактор разойдутся
на первом же сохранении.

| Файл | Strapi-компонент | Блок в коде |
| --- | --- | --- |
| `components/sections/text-block.json` | `sections.text-block` | `TextBlock` |
| `components/sections/media.json` | `sections.media` | `MediaBlock` |
| `components/sections/color-palette.json` | `sections.color-palette` | `ColorPalette` |
| `components/sections/action-buttons.json` | `sections.action-buttons` | `ActionButtons` |
| `components/shared/action-button.json` | `shared.action-button` | вложен в `action-buttons` |
| `components/sections/fontface-viewer.json` | `sections.fontface-viewer` | `FontfaceViewer` |
| `components/shared/font-specimen.json` | `shared.font-specimen` | вложен в `fontface-viewer` |
| `components/sections/divider.json` | `sections.divider` | `Divider` |
| `components/sections/app-screenshots.json` | `sections.app-screenshots` | `AppScreenshots` |
| `components/sections/file-manager.json` | `sections.file-manager` | `FileManager` |
| `components/sections/file-list.json` | `sections.file-list` | `FileList` |
| `components/shared/file-tab.json` | `shared.file-tab` | вложен в `file-manager` |
| `components/shared/file-folder.json` | `shared.file-folder` | вложен в `file-tab` |
| `components/shared/file-subfolder.json` | `shared.file-subfolder` | вложен в `file-folder` |
| `components/shared/file-entry.json` | `shared.file-entry` | вложен в папки, рубрики и в `file-list` |
| `components/shared/color-swatch.json` | `shared.color-swatch` | вложен в `color-palette` |
| `components/shared/color-format.json` | `shared.color-format` | вложен в `color-swatch` |

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

Поле `images` — нативное media-поле Strapi. Оно возвращает и `id`, и `url`
каждого файла, поэтому блок хранит оба: `id` нужен, чтобы перезапросить
ссылку, если бакет приватный и presigned URL протух; `url` работает как есть,
когда бакет публичный.

## Чего здесь пока нет

- контент-типа гайд-страницы с Dynamic Zone, куда этот компонент вкладывается
  (ждёт ответа на вопрос о вложенности блоков — `docs/OPEN_QUESTIONS.md` №1);
- локализации: компоненты по умолчанию НЕ локализованы, `localized`
  задаётся на атрибуте родителя (§1 ТЗ) — решается при создании родительского
  контент-типа.
