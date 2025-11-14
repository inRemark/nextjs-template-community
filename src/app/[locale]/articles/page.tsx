import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createPageMetadataGenerator } from '@/lib/seo';
import { getArticles } from '@/features/articles/services/article.service';
import type { Article } from '@/features/articles/types/article.types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { PortalLayout } from '@/shared/layout/portal-layout';
import { formatDistance } from 'date-fns';
import { zhCN, enUS, ja } from 'date-fns/locale';

const localeMap = {
  zh: zhCN,
  en: enUS,
  ja: ja,
} as const;

// Article skeleton loading component
function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, index) => (
        <Card key={`skeleton-${index}`} className="h-full animate-pulse">
          <div className="aspect-video bg-muted rounded-t-lg" />
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ArticlesListProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    tag?: string;
  }>;
  locale: string;
}

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    tag?: string;
  }>;
}

// generate SEO metadata
export const generateMetadata = createPageMetadataGenerator('articles');

async function ArticlesList({ searchParams, locale }: ArticlesListProps) {
  const t = await getTranslations('articles.list');
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search;
  const tag = params.tag;
  
  const dateFnsLocale = localeMap[locale as keyof typeof localeMap] || zhCN;

  const { articles, totalPages, hasNext, hasPrevious } = await getArticles({
    page,
    limit: 12,
    published: true,
    search,
    tags: tag ? [tag] : undefined,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8">
      {/* Article List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: Article) => (
          <Link key={article.id} href={`/articles/${article.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              {article.coverImage && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <span>{article.author?.name || t('anonymous')}</span>
                  <span>•</span>
                  <span>
                    {article.publishedAt
                      ? formatDistance(new Date(article.publishedAt), new Date(), {
                          addSuffix: true,
                          locale: dateFnsLocale,
                        })
                      : t('unpublished')}
                  </span>
                  <span>•</span>
                  <span>{article.viewCount} {t('views')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 3).map((tagItem: string) => (
                    <Badge key={tagItem} variant="secondary" className="text-xs">
                      {tagItem}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {hasPrevious && (
            <Button variant="outline" asChild>
              <Link 
                href={{
                  pathname: '/articles',
                  query: {
                    page: page - 1,
                    ...(search && { search }),
                    ...(tag && { tag }),
                  },
                }}
              >
                <span>{t('pagination.previous')}</span>
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {t('pagination.current', { page, totalPages })}
          </span>
          {hasNext && (
            <Button variant="outline" asChild>
              <Link 
                href={{
                  pathname: '/articles',
                  query: {
                    page: page + 1,
                    ...(search && { search }),
                    ...(tag && { tag }),
                  },
                }}
              >
                <span>{t('pagination.next')}</span>
              </Link>
            </Button>
          )}
        </div>
      )}

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noArticles')}</p>
        </div>
      )}
    </div>
  );
}

export default async function ArticlesPage(props: PageProps) {
  const t = await getTranslations('articles.list');
  const params = await props.params;
  
  return (
    <PortalLayout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Article List */}
          <Suspense fallback={<ArticlesSkeleton />}>
            <ArticlesList searchParams={props.searchParams} locale={params.locale} />
          </Suspense>
        </div>
      </div>
    </PortalLayout>
  );
}
