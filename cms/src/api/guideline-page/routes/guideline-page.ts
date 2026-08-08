import { factories } from '@strapi/strapi';

// Стандартный core-router: сайт читает страницы гайдлайнов по brand+slug.
export default factories.createCoreRouter('api::guideline-page.guideline-page');
