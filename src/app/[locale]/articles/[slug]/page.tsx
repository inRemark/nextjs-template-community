/**
 * Article Detail Page
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getArticleBySlug, incrementArticleView } from '@/features/articles/services/article.service';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { PortalLayout } from '@/shared/layout/portal-layout';
import { PageContent } from '@/shared/layout/portal-page-content';
import { Eye, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN, enUS, ja } from 'date-fns/locale';

const localeMap = {
  zh: zhCN,
  en: enUS,
  ja: ja,
} as const;

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

async function ArticleContent({ slug, locale }: { slug: string; locale: string }) {
  const t = await getTranslations('articles.detail');
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // increment view count (asynchronous, non-blocking)
  incrementArticleView(article.id).catch((error) => {
    console.error('Failed to increment view:', error);
  });

  const dateFnsLocale = localeMap[locale as keyof typeof localeMap] || zhCN;

  return (
    <article className="space-y-8">
      {/* Article Header */}
      <header className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">{article.title}</h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center">
            <User className="h-3.5 w-3.5 mr-1.5" />
            <span>{article.author?.name || t('anonymous')}</span>
          </div>
          {article.publishedAt && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>{format(new Date(article.publishedAt), 'PPP', { locale: dateFnsLocale })}</span>
            </div>
          )}
          <div className="flex items-center">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            <span>{article.viewCount} {t('views')}</span>
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <Separator className="my-6" />

      {/* Article Content */}
      {article.excerpt && (
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {article.excerpt}
        </p>
      )}

      {article.coverImage && (
        <div className="aspect-video overflow-hidden rounded-lg mb-8">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-slate dark:prose-invert max-w-none text-[15px] leading-loose prose-p:leading-loose prose-p:my-6 prose-li:leading-loose prose-headings:mt-8"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'articles' });

  // Build breadcrumb
  const breadcrumbItems = [
    { label: t('title'), href: `/${locale}/articles` },
    { label: slug }
  ];

  return (
    <PortalLayout breadcrumb={breadcrumbItems} breadcrumbMaxWidth="4xl">
      <PageContent maxWidth="2xl">
        <div className="max-w-4xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="space-y-8 animate-pulse">
                <div className="h-12 bg-muted rounded w-3/4" />
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="aspect-video bg-muted rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              </div>
            }
          >
            <ArticleContent slug={slug} locale={locale} />
          </Suspense>
        </div>
      </PageContent>
    </PortalLayout>
  );
}
