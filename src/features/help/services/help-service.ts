import path from 'node:path';
import { loadMarkdownFile, loadMarkdownFiles, fileExists } from '@/lib/file/markdown-loader';
import type { HelpFrontmatter, HelpArticle } from '../types/help';

/**
 * get all help articles
 */
export async function getHelpArticles(locale: string): Promise<HelpArticle[]> {
  const helpDir = path.join(process.cwd(), 'docs/help', locale);
  const articles = await loadMarkdownFiles<HelpFrontmatter>(helpDir);
  
  // Sort by date in descending order 
  return articles.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();
    return dateB - dateA;
  });
}

/**
 * get single help article by slug
 */
export async function getHelpArticle(
  locale: string, 
  slug: string
): Promise<HelpArticle | null> {
  const filePath = path.join(process.cwd(), 'docs/help', locale, `${slug}.md`);
  
  if (!(await fileExists(filePath))) {
    return null;
  }
  
  return loadMarkdownFile<HelpFrontmatter>(filePath);
}

/**
 * get help article with fallback
 * if the article does not exist in the specified locale, fallback to English
 */
export async function getHelpArticleWithFallback(
  locale: string,
  slug: string
): Promise<HelpArticle | null> {
  let article = await getHelpArticle(locale, slug);
  
  if (!article && locale !== 'en') {
    article = await getHelpArticle('en', slug);
  }
  
  return article;
}

/**
 * get featured articles
 */
export async function getFeaturedArticles(locale: string): Promise<HelpArticle[]> {
  const articles = await getHelpArticles(locale);
  return articles.filter(article => article.frontmatter.featured);
}

/**
 * get articles by category
 */
export async function getArticlesByCategory(
  locale: string,
  category: string
): Promise<HelpArticle[]> {
  const articles = await getHelpArticles(locale);
  return articles.filter(article => article.frontmatter.category === category);
}

/**
 * get articles by difficulty
 */
export async function getArticlesByDifficulty(
  locale: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<HelpArticle[]> {
  const articles = await getHelpArticles(locale);
  return articles.filter(article => article.frontmatter.difficulty === difficulty);
}

/**
 * search articles
 */
export async function searchArticles(
  locale: string,
  query: string
): Promise<HelpArticle[]> {
  const articles = await getHelpArticles(locale);
  const lowerQuery = query.toLowerCase();
  
  return articles.filter(article => {
    const titleMatch = article.frontmatter.title.toLowerCase().includes(lowerQuery);
    const excerptMatch = article.frontmatter.excerpt.toLowerCase().includes(lowerQuery);
    const contentMatch = article.content.toLowerCase().includes(lowerQuery);
    const tagsMatch = article.frontmatter.tags.some(tag => 
      tag.toLowerCase().includes(lowerQuery)
    );
    
    return titleMatch || excerptMatch || contentMatch || tagsMatch;
  });
}

/**
 * get all categories
 */
export async function getAllCategories(locale: string): Promise<string[]> {
  const articles = await getHelpArticles(locale);
  const categories = new Set(articles.map(article => article.frontmatter.category));
  return Array.from(categories);
}

/**
 * get all tags
 */
export async function getAllTags(locale: string): Promise<string[]> {
  const articles = await getHelpArticles(locale);
  const tags = new Set(articles.flatMap(article => article.frontmatter.tags));
  return Array.from(tags);
}

/**
 * get all difficulties
 */
export async function getAllDifficulties(): Promise<Array<'beginner' | 'intermediate' | 'advanced'>> {
  return ['beginner', 'intermediate', 'advanced'];
}
