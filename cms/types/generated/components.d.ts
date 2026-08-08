import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsActionButtons extends Struct.ComponentSchema {
  collectionName: 'components_sections_action_buttons';
  info: {
    description: '\u041F\u0430\u043D\u0435\u043B\u044C \u043A\u043D\u043E\u043F\u043E\u043A \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F: \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0444\u0430\u0439\u043B\u0430, \u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u043F\u043E \u0441\u0441\u044B\u043B\u043A\u0435, \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u0435\u043A\u0441\u0442\u0430. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 ActionButtons (src/components/blocks/ActionButtons).';
    displayName: 'Action buttons';
  };
  attributes: {
    align: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'left'>;
    buttons: Schema.Attribute.Component<'shared.action-button', true>;
  };
}

export interface SectionsAppScreenshots extends Struct.ComponentSchema {
  collectionName: 'components_sections_app_screenshots';
  info: {
    description: '\u0413\u0430\u043B\u0435\u0440\u0435\u044F \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u043E\u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0439: \u0441\u0435\u0442\u043A\u0430, \u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0438\u0435 \u0432 \u043E\u0432\u0435\u0440\u043B\u0435\u0435, \u043B\u0438\u0441\u0442\u0430\u043D\u0438\u0435 \u0438 \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 AppScreenshots.';
    displayName: 'App screenshots';
  };
  attributes: {
    description: Schema.Attribute.Text;
    screenshots: Schema.Attribute.Media<'images', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsColorPalette extends Struct.ComponentSchema {
  collectionName: 'components_sections_color_palettes';
  info: {
    description: '\u041F\u0430\u043B\u0438\u0442\u0440\u0430 \u0446\u0432\u0435\u0442\u043E\u0432 \u0431\u0440\u0435\u043D\u0434\u0430: \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u0441\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F\u043C\u0438 \u0432 \u0440\u0430\u0437\u043D\u044B\u0445 \u0444\u043E\u0440\u043C\u0430\u0442\u0430\u0445 \u0438 \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 ColorPalette (src/components/blocks/ColorPalette).';
    displayName: 'Color palette';
  };
  attributes: {
    colors: Schema.Attribute.Component<'shared.color-swatch', true>;
    description: Schema.Attribute.Text;
    size: Schema.Attribute.Enumeration<['big', 'small']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'big'>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsDivider extends Struct.ComponentSchema {
  collectionName: 'components_sections_dividers';
  info: {
    description: '\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C \u043C\u0435\u0436\u0434\u0443 \u0431\u043B\u043E\u043A\u0430\u043C\u0438: \u043B\u0438\u043D\u0438\u044F \u0441 \u043E\u0442\u0441\u0442\u0443\u043F\u0430\u043C\u0438 \u043B\u0438\u0431\u043E \u043F\u0440\u043E\u0441\u0442\u043E \u043F\u0440\u043E\u043C\u0435\u0436\u0443\u0442\u043E\u043A. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 Divider (src/components/blocks/Divider).';
    displayName: 'Divider';
  };
  attributes: {
    line: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    spacing: Schema.Attribute.Enumeration<['compact', 'regular', 'roomy']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'compact'>;
  };
}

export interface SectionsFileList extends Struct.ComponentSchema {
  collectionName: 'components_sections_file_list';
  info: {
    description: '\u041F\u043B\u043E\u0441\u043A\u0438\u0439 \u0441\u043F\u0438\u0441\u043E\u043A \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u0435\u043C\u044B\u0445 \u0444\u0430\u0439\u043B\u043E\u0432 \u2014 \u0442\u0430 \u0436\u0435 \u0444\u0430\u0439\u043B\u043E\u0432\u0430\u044F \u0447\u0430\u0441\u0442\u044C, \u0447\u0442\u043E \u0443 file-manager, \u043D\u043E \u0431\u0435\u0437 \u0440\u0443\u0431\u0440\u0438\u043A \u0438 \u043F\u0430\u043F\u043E\u043A. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 FileList.';
    displayName: 'File list';
  };
  attributes: {
    description: Schema.Attribute.Text;
    files: Schema.Attribute.Component<'shared.file-entry', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsFileManager extends Struct.ComponentSchema {
  collectionName: 'components_sections_file_manager';
  info: {
    description: '\u0424\u0430\u0439\u043B\u043E\u0432\u044B\u0439 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440: \u0440\u0443\u0431\u0440\u0438\u043A\u0438 (\u0442\u0430\u0431\u044B), \u043F\u0430\u043F\u043A\u0438 \u0438 \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u0435\u043C\u044B\u0435 \u0444\u0430\u0439\u043B\u044B. \u0412\u043D\u0443\u0442\u0440\u0438 \u043F\u0430\u043F\u043A\u0438 \u0442\u0430\u0431\u044B \u0437\u0430\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u043A\u0440\u043E\u0448\u043A\u0430\u043C\u0438. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 FileManager.';
    displayName: 'File manager';
  };
  attributes: {
    description: Schema.Attribute.Text;
    tabs: Schema.Attribute.Component<'shared.file-tab', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsFontfaceViewer extends Struct.ComponentSchema {
  collectionName: 'components_sections_fontface_viewers';
  info: {
    description: '\u0412\u0438\u0442\u0440\u0438\u043D\u0430 \u0448\u0440\u0438\u0444\u0442\u0430: \u0441\u0442\u0440\u043E\u043A\u0430 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432 (\u043A\u0435\u0433\u043B\u044C, \u0438\u043D\u0442\u0435\u0440\u043B\u0438\u043D\u044C\u044F\u0436, \u0442\u0440\u0435\u043A\u0438\u043D\u0433) \u0438 \u043E\u0431\u0440\u0430\u0437\u0435\u0446, \u043D\u0430\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u044D\u0442\u0438\u043C \u0448\u0440\u0438\u0444\u0442\u043E\u043C. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 FontfaceViewer.';
    displayName: 'Fontface viewer';
  };
  attributes: {
    sample: Schema.Attribute.String;
    specimens: Schema.Attribute.Component<'shared.font-specimen', true>;
  };
}

export interface SectionsMedia extends Struct.ComponentSchema {
  collectionName: 'components_sections_media';
  info: {
    description: '\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F: \u043E\u0434\u043D\u043E 16:9, \u043F\u0430\u0440\u0430 1:1, \u043B\u0438\u0431\u043E \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u044C \u0442\u043E\u0433\u043E \u0438 \u0434\u0440\u0443\u0433\u043E\u0433\u043E. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 MediaBlock (src/components/blocks/MediaBlock).';
    displayName: 'Media';
  };
  attributes: {
    carousel: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    images: Schema.Attribute.Media<'images', true>;
    layout: Schema.Attribute.Enumeration<['wide', 'pair']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'wide'>;
  };
}

export interface SectionsTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_blocks';
  info: {
    description: '\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A, \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0438 \u0442\u0435\u043A\u0441\u0442. \u0421\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0431\u043B\u043E\u043A\u0443 TextBlock (src/components/blocks/TextBlock).';
    displayName: 'Text block';
  };
  attributes: {
    body: Schema.Attribute.Text;
    description: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedActionButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_action_buttons';
  info: {
    description: '\u041E\u0434\u043D\u0430 \u043A\u043D\u043E\u043F\u043A\u0430: \u043F\u043E\u0434\u043F\u0438\u0441\u044C, \u043F\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435 (download/link/copy), \u0438\u043A\u043E\u043D\u043A\u0430 \u0438 \u0435\u0451 \u043F\u043E\u0437\u0438\u0446\u0438\u044F. \u0412\u0430\u0440\u0438\u0430\u0446\u0438\u0438 \u043A\u043D\u043E\u043F\u043A\u0438 \u041D\u0415 \u043F\u0435\u0440\u0435\u0447\u0438\u0441\u043B\u044F\u044E\u0442\u0441\u044F \u2014 \u043B\u044E\u0431\u0430\u044F \u0441\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0438\u0437 \u044D\u0442\u0438\u0445 \u043F\u043E\u043B\u0435\u0439.';
    displayName: 'Action button';
  };
  attributes: {
    href: Schema.Attribute.String;
    icon: Schema.Attribute.String;
    iconPosition: Schema.Attribute.Enumeration<['leading', 'trailing']> &
      Schema.Attribute.DefaultTo<'leading'>;
    kind: Schema.Attribute.Enumeration<['download', 'link', 'copy']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'link'>;
    label: Schema.Attribute.String;
    newTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    value: Schema.Attribute.Text;
  };
}

export interface SharedColorFormat extends Struct.ComponentSchema {
  collectionName: 'components_shared_color_formats';
  info: {
    description: '\u041F\u0430\u0440\u0430 \u00AB\u043F\u043E\u0434\u043F\u0438\u0441\u044C \u0444\u043E\u0440\u043C\u0430\u0442\u0430 \u2014 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435\u00BB: HEX/FF0039, PMS/244 C, CMYK/00/41/01/00. \u041D\u0430\u0431\u043E\u0440 \u0444\u043E\u0440\u043C\u0430\u0442\u043E\u0432 \u041D\u0415 \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D \u2014 \u0430\u0434\u043C\u0438\u043D \u0437\u0430\u0432\u043E\u0434\u0438\u0442 \u043B\u044E\u0431\u044B\u0435.';
    displayName: 'Color format';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface SharedColorSwatch extends Struct.ComponentSchema {
  collectionName: 'components_shared_color_swatches';
  info: {
    description: '\u041E\u0434\u0438\u043D \u0446\u0432\u0435\u0442 \u043F\u0430\u043B\u0438\u0442\u0440\u044B: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435, \u0437\u0430\u043B\u0438\u0432\u043A\u0430 \u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u043B\u044C\u043D\u044B\u0439 \u043D\u0430\u0431\u043E\u0440 \u0444\u043E\u0440\u043C\u0430\u0442\u043E\u0432 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F.';
    displayName: 'Color swatch';
  };
  attributes: {
    color: Schema.Attribute.String;
    formats: Schema.Attribute.Component<'shared.color-format', true>;
    name: Schema.Attribute.String;
  };
}

export interface SharedFileEntry extends Struct.ComponentSchema {
  collectionName: 'components_shared_file_entries';
  info: {
    description: '\u041E\u0434\u0438\u043D \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u0435\u043C\u044B\u0439 \u0444\u0430\u0439\u043B \u0432\u043D\u0443\u0442\u0440\u0438 \u043F\u0430\u043F\u043A\u0438 \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u0433\u043E \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430. name \u0445\u0440\u0430\u043D\u0438\u0442\u0441\u044F \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u043E\u0442 \u0441\u0430\u043C\u043E\u0433\u043E \u0444\u0430\u0439\u043B\u0430: \u0430\u0434\u043C\u0438\u043D \u043C\u043E\u0436\u0435\u0442 \u043F\u043E\u0434\u043F\u0438\u0441\u0430\u0442\u044C \u0435\u0433\u043E \u043F\u043E\u043D\u044F\u0442\u043D\u0435\u0435, \u0447\u0435\u043C \u043D\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0439 \u0444\u0430\u0439\u043B.';
    displayName: 'File entry';
  };
  attributes: {
    file: Schema.Attribute.Media<'files' | 'images' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
  };
}

export interface SharedFileFolder extends Struct.ComponentSchema {
  collectionName: 'components_shared_file_folders';
  info: {
    description: '\u041F\u0430\u043F\u043A\u0430 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F \u0432\u043D\u0443\u0442\u0440\u0438 \u0440\u0443\u0431\u0440\u0438\u043A\u0438 \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u0433\u043E \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430: \u0441\u0432\u043E\u0438 \u0444\u0430\u0439\u043B\u044B \u043F\u043B\u044E\u0441 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0435 \u043F\u0430\u043F\u043A\u0438 \u043E\u0434\u043D\u043E\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F.';
    displayName: 'File folder';
  };
  attributes: {
    files: Schema.Attribute.Component<'shared.file-entry', true>;
    folders: Schema.Attribute.Component<'shared.file-subfolder', true>;
    name: Schema.Attribute.String;
  };
}

export interface SharedFileSubfolder extends Struct.ComponentSchema {
  collectionName: 'components_shared_file_subfolders';
  info: {
    description: '\u0412\u043B\u043E\u0436\u0435\u043D\u043D\u0430\u044F \u043F\u0430\u043F\u043A\u0430 \u0432\u0442\u043E\u0440\u043E\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F. \u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u043C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u043C, \u0430 \u041D\u0415 \u0441\u0441\u044B\u043B\u043A\u043E\u0439 \u043D\u0430 file-folder, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 Strapi \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0441\u0430\u043C \u0441\u0435\u0431\u044F \u2014 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u044E \u0432 CMS \u043D\u0435 \u0432\u044B\u0440\u0430\u0437\u0438\u0442\u044C (\u0441\u043C. docs/OPEN_QUESTIONS.md #68).';
    displayName: 'File subfolder';
  };
  attributes: {
    files: Schema.Attribute.Component<'shared.file-entry', true>;
    name: Schema.Attribute.String;
  };
}

export interface SharedFileTab extends Struct.ComponentSchema {
  collectionName: 'components_shared_file_tabs';
  info: {
    description: '\u0420\u0443\u0431\u0440\u0438\u043A\u0430 \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u0433\u043E \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430: \u0442\u043E, \u0447\u0442\u043E \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0442\u0430\u0431\u043E\u043C \u043D\u0430 \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0443\u0440\u043E\u0432\u043D\u0435 \u0438 \u043F\u0435\u0440\u0432\u043E\u0439 \u043A\u0440\u043E\u0448\u043A\u043E\u0439 \u0432\u043D\u0443\u0442\u0440\u0438 \u043F\u0430\u043F\u043A\u0438.';
    displayName: 'File tab';
  };
  attributes: {
    files: Schema.Attribute.Component<'shared.file-entry', true>;
    folders: Schema.Attribute.Component<'shared.file-folder', true>;
    label: Schema.Attribute.String;
  };
}

export interface SharedFontSpecimen extends Struct.ComponentSchema {
  collectionName: 'components_shared_font_specimens';
  info: {
    description: '\u041E\u0434\u043D\u043E \u043D\u0430\u0447\u0435\u0440\u0442\u0430\u043D\u0438\u0435: \u0444\u0430\u0439\u043B \u0448\u0440\u0438\u0444\u0442\u0430 \u0438\u0437 \u043C\u0435\u0434\u0438\u0430\u0442\u0435\u043A\u0438 + \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F.';
    displayName: 'Font specimen';
  };
  attributes: {
    family: Schema.Attribute.String;
    font: Schema.Attribute.Media<'files'>;
    fontSize: Schema.Attribute.Integer;
    letterSpacing: Schema.Attribute.Decimal;
    lineHeight: Schema.Attribute.Integer;
    sample: Schema.Attribute.String;
    styleName: Schema.Attribute.String;
    weight: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'sections.action-buttons': SectionsActionButtons;
      'sections.app-screenshots': SectionsAppScreenshots;
      'sections.color-palette': SectionsColorPalette;
      'sections.divider': SectionsDivider;
      'sections.file-list': SectionsFileList;
      'sections.file-manager': SectionsFileManager;
      'sections.fontface-viewer': SectionsFontfaceViewer;
      'sections.media': SectionsMedia;
      'sections.text-block': SectionsTextBlock;
      'shared.action-button': SharedActionButton;
      'shared.color-format': SharedColorFormat;
      'shared.color-swatch': SharedColorSwatch;
      'shared.file-entry': SharedFileEntry;
      'shared.file-folder': SharedFileFolder;
      'shared.file-subfolder': SharedFileSubfolder;
      'shared.file-tab': SharedFileTab;
      'shared.font-specimen': SharedFontSpecimen;
    }
  }
}
