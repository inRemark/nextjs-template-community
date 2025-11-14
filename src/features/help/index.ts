/**
 * Help Feature - Public API
 * 
 * This module exports types, components, and services related to the help feature.
 */

// Types
export * from './types/help';

// Components
export { HelpArticleCard } from './components/help-article-card';
export { HelpCategoryFilter } from './components/help-category-filter';
export { HelpSearchForm } from './components/help-search-form';
export { HelpPagination } from './components/help-pagination';

// Services
export {
  getHelpArticles,
  getHelpArticle,
  getHelpArticleWithFallback,
  getFeaturedArticles,
  getArticlesByCategory,
  getArticlesByDifficulty,
  searchArticles,
  getAllCategories,
  getAllTags,
  getAllDifficulties
} from './services/help-service';
