import path from 'node:path';
import { loadMarkdownFile, loadMarkdownFiles, fileExists } from '@/lib/file/markdown-loader';
import type { BlogFrontmatter, BlogPost } from '../types/blog';

/**
 * get all blog posts
 */
export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), 'docs/blog', locale);
  const posts = await loadMarkdownFiles<BlogFrontmatter>(blogDir);
  
  // Sort by date in descending order 
  return posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();
    return dateB - dateA;
  });
}

/**
 * get single blog post by slug
 */
export async function getBlogPost(
  locale: string, 
  slug: string
): Promise<BlogPost | null> {
  const filePath = path.join(process.cwd(), 'docs/blog', locale, `${slug}.md`);
  
  if (!(await fileExists(filePath))) {
    return null;
  }
  
  return loadMarkdownFile<BlogFrontmatter>(filePath);
}

/**
 * get blog post with fallback
 * if the post does not exist in the specified locale, fallback to Chinese
 */
export async function getBlogPostWithFallback(
  locale: string,
  slug: string
): Promise<BlogPost | null> {
  let post = await getBlogPost(locale, slug);
  
  if (!post && locale !== 'en') {
    post = await getBlogPost('en', slug);
  }
  
  return post;
}

/**
 * get featured posts
 */
export async function getFeaturedPosts(locale: string): Promise<BlogPost[]> {
  const posts = await getBlogPosts(locale);
  return posts.filter(post => post.frontmatter.featured);
}

/**
 * get posts by category
 */
export async function getPostsByCategory(
  locale: string,
  category: string
): Promise<BlogPost[]> {
  const posts = await getBlogPosts(locale);
  return posts.filter(post => post.frontmatter.category === category);
}

/**
 * search posts
 */
export async function searchPosts(
  locale: string,
  query: string
): Promise<BlogPost[]> {
  const posts = await getBlogPosts(locale);
  const lowerQuery = query.toLowerCase();
  
  return posts.filter(post => {
    const titleMatch = post.frontmatter.title.toLowerCase().includes(lowerQuery);
    const excerptMatch = post.frontmatter.excerpt.toLowerCase().includes(lowerQuery);
    const contentMatch = post.content.toLowerCase().includes(lowerQuery);
    const tagsMatch = post.frontmatter.tags.some(tag => 
      tag.toLowerCase().includes(lowerQuery)
    );
    
    return titleMatch || excerptMatch || contentMatch || tagsMatch;
  });
}

/**
 * get all categories
 */
export async function getAllCategories(locale: string): Promise<string[]> {
  const posts = await getBlogPosts(locale);
  const categories = new Set(posts.map(post => post.frontmatter.category));
  return Array.from(categories);
}

/**
 * get all tags
 */
export async function getAllTags(locale: string): Promise<string[]> {
  const posts = await getBlogPosts(locale);
  const tags = new Set(posts.flatMap(post => post.frontmatter.tags));
  return Array.from(tags);
}
