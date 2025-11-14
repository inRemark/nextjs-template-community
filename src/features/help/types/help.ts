// help types

/**
 * Help Article Frontmatter (from Markdown)
 */
export interface HelpFrontmatter {
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  excerpt: string;
  featured?: boolean;
  readTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
}

/**
 * Help Article (from Markdown file)
 */
export interface HelpArticle {
  slug: string;
  frontmatter: HelpFrontmatter;
  content: string;
}

export interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  articleCount: number;
  order?: number;
  color?: string;
}

export interface HelpSearchResult {
  articles: HelpArticle[];
  categories: HelpCategory[];
  totalCount: number;
  searchQuery: string;
  suggestions?: string[];
}

export interface HelpFilters {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  search?: string;
  hasVideo?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  category: string;
}

export interface PopularArticle {
  article: HelpArticle;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export interface HelpStats {
  totalArticles: number;
  totalViews: number;
  averageRating: number;
  popularTopics: string[];
  recentUpdates: HelpArticle[];
}

export interface ContactSupport {
  channels: SupportChannel[];
  businessHours: string;
  responseTime: string;
  languages: string[];
}

export interface SupportChannel {
  type: 'email' | 'chat' | 'phone' | 'ticket';
  name: string;
  description: string;
  contact: string;
  available: boolean;
  icon: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  articlesPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface HelpPageData {
  articles: HelpArticle[];
  pagination: PaginationData;
  filters: HelpFilters;
  categories: HelpCategory[];
  featuredArticles: HelpArticle[];
}

export interface HelpArticlePageData {
  article: HelpArticle;
  relatedArticles: HelpArticle[];
  category?: HelpCategory;
}
