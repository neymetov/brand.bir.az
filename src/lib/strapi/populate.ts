import 'server-only';

// Строка populate для Dynamic Zone — собирается из самих схем компонентов.
//
// Иначе её пришлось бы писать руками: Strapi раскрывает вложенные компоненты
// только по явному запросу, причём на каждый уровень отдельно. Проверено на
// живой CMS: без этого у палитры не приходят форматы цвета, а у файлового
// менеджера — содержимое подпапок, и редактор молча теряет контент.
//
// Схемы импортируются, а не читаются с диска: так они попадают в сборку и
// не зависят от того, что лежит рядом с приложением в проде.

import sectionsActionButtons from '@/../strapi-schemas/components/sections/action-buttons.json';
import sectionsAppScreenshots from '@/../strapi-schemas/components/sections/app-screenshots.json';
import sectionsColorPalette from '@/../strapi-schemas/components/sections/color-palette.json';
import sectionsDivider from '@/../strapi-schemas/components/sections/divider.json';
import sectionsFileList from '@/../strapi-schemas/components/sections/file-list.json';
import sectionsFileManager from '@/../strapi-schemas/components/sections/file-manager.json';
import sectionsFontfaceViewer from '@/../strapi-schemas/components/sections/fontface-viewer.json';
import sectionsMedia from '@/../strapi-schemas/components/sections/media.json';
import sectionsTextBlock from '@/../strapi-schemas/components/sections/text-block.json';
import sharedActionButton from '@/../strapi-schemas/components/shared/action-button.json';
import sharedColorFormat from '@/../strapi-schemas/components/shared/color-format.json';
import sharedColorSwatch from '@/../strapi-schemas/components/shared/color-swatch.json';
import sharedFileEntry from '@/../strapi-schemas/components/shared/file-entry.json';
import sharedFileFolder from '@/../strapi-schemas/components/shared/file-folder.json';
import sharedFileSubfolder from '@/../strapi-schemas/components/shared/file-subfolder.json';
import sharedFileTab from '@/../strapi-schemas/components/shared/file-tab.json';
import sharedFontSpecimen from '@/../strapi-schemas/components/shared/font-specimen.json';

interface ComponentSchema {
  readonly attributes: Record<string, { readonly type: string; readonly component?: string }>;
}

const SCHEMAS: Record<string, ComponentSchema> = {
  'sections.action-buttons': sectionsActionButtons as ComponentSchema,
  'sections.app-screenshots': sectionsAppScreenshots as ComponentSchema,
  'sections.color-palette': sectionsColorPalette as ComponentSchema,
  'sections.divider': sectionsDivider as ComponentSchema,
  'sections.file-list': sectionsFileList as ComponentSchema,
  'sections.file-manager': sectionsFileManager as ComponentSchema,
  'sections.fontface-viewer': sectionsFontfaceViewer as ComponentSchema,
  'sections.media': sectionsMedia as ComponentSchema,
  'sections.text-block': sectionsTextBlock as ComponentSchema,
  'shared.action-button': sharedActionButton as ComponentSchema,
  'shared.color-format': sharedColorFormat as ComponentSchema,
  'shared.color-swatch': sharedColorSwatch as ComponentSchema,
  'shared.file-entry': sharedFileEntry as ComponentSchema,
  'shared.file-folder': sharedFileFolder as ComponentSchema,
  'shared.file-subfolder': sharedFileSubfolder as ComponentSchema,
  'shared.file-tab': sharedFileTab as ComponentSchema,
  'shared.font-specimen': sharedFontSpecimen as ComponentSchema,
};

/**
 * Параметры populate для одного компонента.
 *
 * `seen` защищает от зацикливания, если компоненты когда-нибудь сошлются
 * друг на друга: сейчас дерево строгое, но падать на этом не хочется.
 */
function collect(uid: string, prefix: string, out: string[], seen: ReadonlySet<string>): void {
  if (seen.has(uid)) return;
  const schema = SCHEMAS[uid];
  if (!schema) return;

  const nested = new Set([...seen, uid]);
  let hasChildren = false;

  Object.entries(schema.attributes).forEach(([name, attribute]) => {
    if (attribute.type === 'media') {
      out.push(`${prefix}[populate][${name}]=true`);
      hasChildren = true;
    }
    if (attribute.type === 'component' && attribute.component) {
      collect(attribute.component, `${prefix}[populate][${name}]`, out, nested);
      hasChildren = true;
    }
  });

  // У листа вложенности нет — достаточно обычной звёздочки.
  if (!hasChildren) out.push(`${prefix}[populate]=*`);
}

/** Полный набор populate-параметров для поля `content` страницы. */
export function contentPopulateQuery(): string {
  const out: string[] = [];

  Object.keys(SCHEMAS)
    .filter((uid) => uid.startsWith('sections.'))
    .forEach((uid) => collect(uid, `populate[content][on][${uid}]`, out, new Set()));

  return out.join('&');
}
