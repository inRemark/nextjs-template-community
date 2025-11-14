/**
 * Article Feature - Service Layer
 * Article Service
 */

import prisma from '@/lib/database/prisma';
import type {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleListParams,
  ArticleStats,
} from '../types/article.types';

// ============================================
// Query Service
// ============================================

/**
 * Get article list
 */
export async function getArticles(params: ArticleListParams = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    authorId,
    published,
    tags,
    search,
    startDate,
    endDate,
  } = params;

  const skip = (page - 1) * limit;

  // Build query conditions
  const where: Record<string, any> = {};

  if (authorId) {
    where.authorId = authorId;
  }

  if (typeof published === 'boolean') {
    where.published = published;
  }

  if (tags && tags.length > 0) {
    where.tags = {
      hasSome: tags,
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (startDate || endDate) {
    where.publishedAt = {};
    if (startDate) {
      where.publishedAt.gte = startDate;
    }
    if (endDate) {
      where.publishedAt.lte = endDate;
    }
  }

  // Execute query
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    articles,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Get article by ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  return prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Get article stats
 */
export async function getArticleStats(authorId?: string): Promise<ArticleStats> {
  const where = authorId ? { authorId } : {};

  const [totalArticles, publishedArticles, draftArticles, totalViewsData, recentArticles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.count({ where: { ...where, published: true } }),
    prisma.article.count({ where: { ...where, published: false } }),
    prisma.article.aggregate({
      where,
      _sum: { viewCount: true },
    }),
    prisma.article.findMany({
      where: { ...where, published: true },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
  ]);

  const totalViews = totalViewsData._sum.viewCount || 0;
  const averageViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

  // Get top tags
  const articles = await prisma.article.findMany({
    where,
    select: { tags: true },
  });

  const tagCounts = new Map<string, number>();
  for (const article of articles as { tags: string[] }[]) {
    for (const tag of article.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    totalViews,
    averageViews,
    topTags,
    recentArticles,
  };
}

// ============================================
// Modify Service
// ============================================

/**
 * Create article
 */
export async function createArticle(data: CreateArticleRequest, authorId: string): Promise<Article> {
  return prisma.article.create({
    data: {
      ...data,
      authorId,
      tags: data.tags || [],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Update article
 */
export async function updateArticle(id: string, data: UpdateArticleRequest): Promise<Article | null> {
  return prisma.article.update({
    where: { id },
    data,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Delete article
 */
export async function deleteArticle(id: string): Promise<void> {
  await prisma.article.delete({
    where: { id },
  });
}

/**
 * Increment article view count
 */
export async function incrementArticleView(id: string): Promise<void> {
  await prisma.article.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate Slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/g, '')
    .replaceAll(/[\s_-]+/g, '-')
    .replaceAll(/(^-+)|(-+$)/g, '');
}

/**
 * Validate Slug uniqueness
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!article) return true;
  if (excludeId && article.id === excludeId) return true;
  return false;
}

/**
 * Extract excerpt
 */
export function extractExcerpt(content: string, length: number = 200): string {
  const plainText = content
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length) + '...';
}

/**
 * Get all tags
 */
export async function getAllTags(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { tags: true },
  });

  const tagsSet = new Set<string>();
  for (const article of articles as { tags: string[] }[]) {
    for (const tag of article.tags) {
      tagsSet.add(tag);
    }
  }

  return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
}
