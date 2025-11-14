/**
 * blog types
 */

export interface BlogFrontmatter {
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  excerpt: string;
  featured?: boolean;
  readTime?: number;
  coverImage?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  postCount: number;
  color?: string;
}

export interface BlogTag {
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  email?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

export interface BlogSearchResult {
  posts: BlogPost[];
  totalCount: number;
  hasMore: boolean;
  searchQuery: string;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BlogPageData {
  posts: BlogPost[];
  pagination: PaginationData;
  filters: BlogFilters;
  categories: BlogCategory[];
  tags: BlogTag[];
  featuredPosts: BlogPost[];
}

export interface BlogPostPageData {
  post: BlogPost;
  relatedPosts: BlogPost[];
  tableOfContents?: TOCItem[];
  author?: BlogAuthor;
}

export type BlogLayout = 'grid' | 'list' | 'card';
export type BlogSortBy = 'date' | 'title' | 'popularity' | 'readTime';
