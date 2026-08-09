import { ContentDrawer } from './ContentDrawer';
import { ContentCard } from './ContentCard';
import { contentSections, anchorLinks } from './content.data';

// Дашборд: та же белая карточка с якорями, что и у страницы раздела (см.
// ContentCard). Контент здесь пока из плейсхолдера content.data.ts — у
// раздела он уже приходит из Strapi.
export function Drawer() {
  return (
    <ContentCard anchors={anchorLinks}>
      <ContentDrawer sections={contentSections} />
    </ContentCard>
  );
}
