import { TextBlock } from '@/components/blocks/TextBlock/TextBlock';
import { MediaBlock } from '@/components/blocks/MediaBlock/MediaBlock';
import { ColorPalette } from '@/components/blocks/ColorPalette/ColorPalette';
import { ActionButtons } from '@/components/blocks/ActionButtons/ActionButtons';
import { FontfaceViewer } from '@/components/blocks/FontfaceViewer/FontfaceViewer';
import { Divider } from '@/components/blocks/Divider/Divider';
import { AppScreenshots } from '@/components/blocks/AppScreenshots/AppScreenshots';
import type { ContentSection } from './content.data';
import styles from './ContentDrawer.module.scss';

// Сюда будут поступать изменения из craft.js (снимок Strapi Dynamic Zone →
// узлы craft.js → это дерево, см. §3.5). Сам ничего не верстает: каждая
// секция собирается из тех же блоков, которыми оперирует редактор, — иначе
// публичная страница и редактор рано или поздно разъедутся.
//
// Остаётся здесь только обёртка <section id> — она нужна anchor-list для
// якорей и не является частью какого-либо блока.
export function ContentDrawer({ sections }: { readonly sections: readonly ContentSection[] }) {
  return (
    <div className={styles.contentDrawer}>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <TextBlock
            title={section.title}
            description={section.description}
            body={section.body}
          />

          {/* eslint-disable-next-line react/jsx-props-no-spreading --
              media описан ровно как props блока, перечислять их поштучно
              значит дублировать интерфейс и забывать новые поля */}
          {section.media ? <MediaBlock {...section.media} /> : null}

          {/* eslint-disable-next-line react/jsx-props-no-spreading -- то же */}
          {section.palette ? <ColorPalette {...section.palette} /> : null}

          {/* eslint-disable-next-line react/jsx-props-no-spreading -- то же */}
          {section.actions ? <ActionButtons {...section.actions} /> : null}

          {/* eslint-disable-next-line react/jsx-props-no-spreading -- то же */}
          {section.fonts ? <FontfaceViewer {...section.fonts} /> : null}

          {/* eslint-disable-next-line react/jsx-props-no-spreading -- то же */}
          {section.screenshots ? <AppScreenshots {...section.screenshots} /> : null}

          {/* eslint-disable-next-line react/jsx-props-no-spreading -- то же */}
          {section.divider ? <Divider {...section.divider} /> : null}
        </section>
      ))}
    </div>
  );
}
