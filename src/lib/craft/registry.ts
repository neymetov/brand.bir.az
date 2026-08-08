import type { ComponentType } from 'react';
import { TextBlockCraft } from '@/components/blocks/TextBlock/craft';
import { MediaBlockCraft } from '@/components/blocks/MediaBlock/craft';
import { ColorPaletteCraft } from '@/components/blocks/ColorPalette/craft';
import { ActionButtonsCraft } from '@/components/blocks/ActionButtons/craft';
import { FontfaceViewerCraft } from '@/components/blocks/FontfaceViewer/craft';
import { DividerCraft } from '@/components/blocks/Divider/craft';
import { AppScreenshotsCraft } from '@/components/blocks/AppScreenshots/craft';
import { FileManagerCraft } from '@/components/blocks/FileManager/craft';
import { FileListCraft } from '@/components/blocks/FileList/craft';

// Единый реестр блоков — источник правды и для resolver'а craft.js, и для
// allowedComponents Dynamic Zone в Strapi, чтобы два списка НИКОГДА не
// расходились вручную (§3.5).
//
// Dynamic Zone пока плоский: вложенности (блок внутри блока) нет, потому что
// вопрос о ней всё ещё открыт — docs/OPEN_QUESTIONS.md #1. Если ответ будет
// «нужна», сюда добавится признак контейнера, а блоки-контейнеры получат
// <Element canvas> внутри.
export interface BlockRegistryEntry {
  /** Имя Strapi-компонента в Dynamic Zone. */
  readonly strapiComponent: string;
  /** Подпись в тулбоксе редактора. */
  readonly label: string;
  /** Craft-обёртка над настоящим компонентом ДС. */
  // craft.js хранит в резолвере компоненты с разными формами props —
  // сузить до общего типа нельзя, реестр гетерогенный по определению.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly component: ComponentType<any>;
}

export const blockRegistry = {
  // Порядок = порядок в тулбоксе редактора: текст первым, он нужен чаще всего.
  text: {
    strapiComponent: 'sections.text-block',
    label: 'Текст',
    component: TextBlockCraft,
  },
  media: {
    strapiComponent: 'sections.media',
    label: 'Изображения',
    component: MediaBlockCraft,
  },
  colorPalette: {
    strapiComponent: 'sections.color-palette',
    label: 'Палитра цветов',
    component: ColorPaletteCraft,
  },
  actionButtons: {
    strapiComponent: 'sections.action-buttons',
    label: 'Кнопки действия',
    component: ActionButtonsCraft,
  },
  fontfaceViewer: {
    strapiComponent: 'sections.fontface-viewer',
    label: 'Витрина шрифта',
    component: FontfaceViewerCraft,
  },
  divider: {
    strapiComponent: 'sections.divider',
    label: 'Разделитель',
    component: DividerCraft,
  },
  appScreenshots: {
    strapiComponent: 'sections.app-screenshots',
    label: 'Скриншоты приложений',
    component: AppScreenshotsCraft,
  },
  fileManager: {
    strapiComponent: 'sections.file-manager',
    label: 'Файловый менеджер',
    component: FileManagerCraft,
  },
  fileList: {
    strapiComponent: 'sections.file-list',
    label: 'Файлы',
    component: FileListCraft,
  },
} as const satisfies Record<string, BlockRegistryEntry>;

export type BlockKey = keyof typeof blockRegistry;

/** Резолвер для <Editor resolver={...}> — собирается из реестра, не руками. */
export const craftResolver = Object.fromEntries(
  Object.entries(blockRegistry).map(([key, entry]) => [key, entry.component]),
);

/** Список для allowedComponents Dynamic Zone — тот же источник. */
export const strapiAllowedComponents = Object.values(blockRegistry).map(
  (entry) => entry.strapiComponent,
);
