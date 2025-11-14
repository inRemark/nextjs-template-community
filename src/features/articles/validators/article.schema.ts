/**
 * Article Feature - Validators
 * article.schema.ts
 */

import { z } from 'zod';

// ============================================
// Basic validation rules
// ============================================

export const articleSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug cannot exceed 200 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  
  content: z.string()
    .min(1, 'Content is required'),

  excerpt: z.string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .optional(),
  
  coverImage: z.string()
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Cover image must be a valid URL' }
    )
    .optional(),
  
  tags: z.array(z.string())
    .max(10, 'Tags cannot exceed 10')
    .optional(),
  
  published: z.boolean()
    .optional(),
  
  publishedAt: z.date()
    .optional(),
});

export const createArticleSchema = articleSchema;

export const updateArticleSchema = articleSchema.partial();

// ============================================
// Query Parameters Validation
// ============================================

export const articleListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  authorId: z.string().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// ============================================
// ID Validation
// ============================================

export const articleIdSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const articleSlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

// ============================================
// Export Types
// ============================================

export type ArticleSchema = z.infer<typeof articleSchema>;
export type CreateArticleSchema = z.infer<typeof createArticleSchema>;
export type UpdateArticleSchema = z.infer<typeof updateArticleSchema>;
export type ArticleListParamsSchema = z.infer<typeof articleListParamsSchema>;
export type ArticleIdSchema = z.infer<typeof articleIdSchema>;
export type ArticleSlugSchema = z.infer<typeof articleSlugSchema>;
