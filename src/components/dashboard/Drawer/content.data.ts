import type { MediaBlockProps } from '@/components/blocks/MediaBlock/types';
import type { ColorPaletteProps } from '@/components/blocks/ColorPalette/types';
import type { ActionButtonsProps } from '@/components/blocks/ActionButtons/types';
import type { FontfaceViewerProps } from '@/components/blocks/FontfaceViewer/types';
import type { DividerProps } from '@/components/blocks/Divider/types';
import type { AppScreenshotsProps } from '@/components/blocks/AppScreenshots/types';

// Плейсхолдер-контент content-drawer. В продакшне сюда будет приходить
// Strapi Dynamic Zone (§3.5) — то же дерево, что и craft.js-редактор
// сериализует на сохранении. Секции здесь — по одной на каждый пункт
// anchor-list из Figma-макета (только "Creative principles" имел реальный
// текст/картинку в макете, остальные — свой лорем, чтобы anchor-list было
// на чём проверить скролл-спай).
export interface ContentSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  /** Текст секции; пустая строка разделяет абзацы (см. TextBlock). */
  readonly body?: string;
  /** Медиа-блок под текстом секции (см. components/blocks/MediaBlock). */
  readonly media?: MediaBlockProps;
  /** Палитра цветов (см. components/blocks/ColorPalette). */
  readonly palette?: ColorPaletteProps;
  /** Кнопки действия (см. components/blocks/ActionButtons). */
  readonly actions?: ActionButtonsProps;
  /** Витрина шрифта (см. components/blocks/FontfaceViewer). */
  readonly fonts?: FontfaceViewerProps;
  /** Разделитель в конце секции (см. components/blocks/Divider). */
  readonly divider?: DividerProps;
  /** Галерея скриншотов (см. components/blocks/AppScreenshots). */
  readonly screenshots?: AppScreenshotsProps;
}

// Форматированный текст из редактора: TextBlock разбирает разметку и
// пропускает только разрешённые теги (lib/richText.tsx).
const bodyAsHtml = '<p>Lorem ipsum dolor sit amet <strong>consectetur adipiscing</strong> elit. '
  + 'Quisque faucibus ex sapien vitae <em>pellentesque sem placerat</em>. In id cursus mi '
  + 'pretium tellus duis convallis, <a href="/components">link to components</a>.</p>'
  + '<p><u>Underlined fragment</u>, <s>struck through</s> and <code>code</code>. UPPERCASE '
  + 'are supported too.</p>';

// Два абзаца одной строкой — старый формат, поддерживается тем же рендером.
const LOREM = [
  'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.',
  'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.',
].join('\n\n');

// По одному изображению на слайд/ячейку. src пустой — рисуется плейсхолдер,
// реальные URL придут из медиатеки Strapi.
const FOUR_IMAGES = [{}, {}, {}, {}];

export const contentSections: readonly ContentSection[] = [
  {
    id: 'brand-personality',
    title: 'Brand personality',
    // Демо-контент: строка разбирается renderRichText с белым списком
    // тегов и в DOM как HTML не вставляется (см. lib/richText.tsx).
    // eslint-disable-next-line xss/no-mixed-html
    body: bodyAsHtml,
    // №1 из макета: одно изображение 16:9
    media: { layout: 'wide' },
  },
  {
    id: 'creative-principles',
    title: 'Title',
    description: 'Short description',
    body: LOREM,
    // №2: два квадратных изображения
    media: { layout: 'pair', images: [{}, {}] },
  },
  {
    id: 'offbeat-optimists',
    title: 'Offbeat optimists',
    body: LOREM,
    // №3: карусель 16:9 с индикаторами
    media: { layout: 'wide', carousel: true, images: FOUR_IMAGES },
  },
  {
    id: 'strikingly-relevant',
    title: 'Strikingly relevant',
    body: LOREM,
    // №4: карусель пар 1:1 с индикаторами
    media: { layout: 'pair', carousel: true, images: FOUR_IMAGES },
  },
  {
    id: 'straight-up',
    title: 'Straight up',
    body: LOREM,
    // Три поведения кнопки разом: скачать, перейти наружу, скопировать.
    actions: {
      align: 'left',
      buttons: [
        {
          label: 'Download PDF', kind: 'download', icon: 'pdf-02', href: '/brandbook.pdf',
        },
        {
          label: 'Check Figma', kind: 'link', icon: 'figma', href: 'https://figma.com', newTab: true,
        },
        {
          label: 'Copy SVG',
          kind: 'copy',
          icon: 'svg-02',
          // Разметка здесь — данные для буфера обмена, а не HTML для вставки
          // в DOM: блок кладёт строку через clipboard.writeText и нигде её
          // не рендерит. Копирование SVG прямо предусмотрено §3.4 ТЗ.
          // eslint-disable-next-line xss/no-mixed-html
          value: '<svg xmlns="http://www.w3.org/2000/svg" />',
        },
        {
          label: 'Go to',
          kind: 'link',
          icon: 'arrow-right-02-round',
          iconPosition: 'trailing',
          href: '/components',
        },
      ],
    },
  },
  {
    id: 'typography',
    title: 'Typography',
    body: LOREM,
    // Файл шрифта не указан: пока Strapi не подключён, брать его неоткуда —
    // образец покажется системным шрифтом, а параметры и копирование
    // работают в любом случае.
    fonts: {
      sample: 'Cibdə varsa pul',
      specimens: [
        {
          family: 'Hal Matex', styleName: 'Bold', weight: 700, fontSize: 96, lineHeight: 104, letterSpacing: -3,
        },
        {
          family: 'Hal Matex', styleName: 'Medium', weight: 500, fontSize: 56, lineHeight: 64, letterSpacing: -2,
        },
        {
          family: 'Inter', styleName: 'Regular', weight: 400, fontSize: 32, lineHeight: 40, letterSpacing: 0,
        },
      ],
    },
    divider: { spacing: 'regular' },
  },
  {
    id: 'main-colors',
    title: 'Main colors',
    body: LOREM,
    // Значения — из реальных брендовых примитивов (_primitives.scss),
    // PMS/CMYK пока плейсхолдеры из макета: настоящих печатных значений
    // в токенах нет, их даст бренд-команда.
    palette: {
      size: 'big',
      colors: [
        {
          name: 'Birbank Red',
          color: '#ff0039',
          formats: [
            { label: 'HEX', value: 'FF0039' },
            { label: 'PMS', value: '244 C' },
            { label: 'CMYK', value: '00/41/01/00' },
          ],
        },
        {
          name: 'Birbank Business',
          color: '#009ff7',
          formats: [
            { label: 'HEX', value: '009FF7' },
            { label: 'PMS', value: '2925 C' },
            { label: 'CMYK', value: '80/24/00/00' },
          ],
        },
        {
          name: 'Birbank White',
          color: '#ffffff',
          formats: [
            { label: 'HEX', value: 'FFFFFF' },
            { label: 'CMYK', value: '00/00/00/00' },
          ],
        },
      ],
    },
  },
  {
    id: 'app-screens',
    title: 'App Screens',
    body: LOREM,
    // Файлы придут из медиатеки Strapi; пока пустые — рисуется плейсхолдер,
    // но увеличение, листание и клавиатура работают и на них.
    screenshots: {
      title: 'App Screens',
      description: 'App screens. Tap an image to enlarge it.',
      screenshots: [{}, {}, {}, {}, {}, {}],
    },
  },
];

export const anchorLinks = contentSections.map((section) => ({
  id: section.id,
  label: section.title === 'Title' ? 'Creative principles' : section.title,
}));
