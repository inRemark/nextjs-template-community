import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Tag, Clock } from 'lucide-react';
import { Badge } from '@shared/ui/badge';
import { Separator } from '@shared/ui/separator';
import { Card, CardContent } from '@shared/ui/card';
import { PortalLayout } from '@shared/layout/portal-layout';
import { PageContent } from '@/shared/layout/portal-page-content';
import { MarkdownContent } from '@shared/ui/markdown-simple/markdown-content';
import { getHelpArticleWithFallback, getHelpArticles, getFeaturedArticles } from '@/features/help';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const locales = ['zh', 'en', 'ja'];
  const params: Array<{ locale: string; slug: string }> = [];
  
  for (const locale of locales) {
    try {
      const featuredArticles = await getFeaturedArticles(locale);
      const slugs = featuredArticles.slice(0, 20).map(article => ({
        locale,
        slug: article.slug,
      }));
      params.push(...slugs);
    } catch {
      continue;
    }
  }
  
  return params;
}

interface HelpArticlePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// generate metadata for the help article page
export async function generateMetadata({ params }: HelpArticlePageProps) {
  const { locale, slug } = await params;
  const article = await getHelpArticleWithFallback(locale, slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested help article could not be found.'
    };
  }
  
  return {
    title: article.frontmatter.title,
    description: article.frontmatter.excerpt,
  };
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { locale, slug } = await params;
  const article = await getHelpArticleWithFallback(locale, slug);
  const t = await getTranslations({ locale, namespace: 'help' });
  
  if (!article) {
    notFound();
  }
  
  const allArticles = await getHelpArticles(locale);
  const relatedArticles = allArticles
    .filter(a => 
      a.frontmatter.category === article.frontmatter.category && 
      a.slug !== slug
    )
    .slice(0, 3);
  
  const formatDate = (dateString: string) => {
    let localeStr = 'en-US';
    if (locale === 'zh') localeStr = 'zh-CN';
    else if (locale === 'ja') localeStr = 'ja-JP';
    
    return new Date(dateString).toLocaleDateString(localeStr, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return t('list.difficulty.beginner');
      case 'intermediate': return t('list.difficulty.intermediate');
      case 'advanced': return t('list.difficulty.advanced');
      default: return '';
    }
  };

  // Build breadcrumb
  const breadcrumbItems = [
    { label: t('title'), href: `/${locale}/help` },
    { label: article.frontmatter.title }
  ];

  return (
    <PortalLayout breadcrumb={breadcrumbItems} breadcrumbMaxWidth="4xl">
      <PageContent maxWidth="2xl">
        <div className="max-w-4xl mx-auto px-4">

          <article>
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {article.frontmatter.category}
                </Badge>
                {article.frontmatter.difficulty && (
                  <Badge className={`text-xs ${getDifficultyColor(article.frontmatter.difficulty)}`}>
                    {getDifficultyLabel(article.frontmatter.difficulty)}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                {article.frontmatter.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                {article.frontmatter.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  <span>{article.frontmatter.author}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <time>{formatDate(article.frontmatter.date)}</time>
                </div>
                
                {article.frontmatter.readTime && (
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>{article.frontmatter.readTime} {t('detail.minRead')}</span>
                  </div>
                )}
              </div>
              
              {article.frontmatter.tags && article.frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {article.frontmatter.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            <Separator className="my-6" />

            <MarkdownContent content={article.content} className="markdown-content text-[15px]" />
          </article>

          {relatedArticles.length > 0 && (
            <section className="mt-12">
              <Separator className="mb-6" />
              <h2 className="text-xl font-bold text-foreground mb-5">
                {t('detail.relatedArticles')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map((relatedArticle) => (
                  <Card key={relatedArticle.slug} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {relatedArticle.frontmatter.category}
                        </Badge>
                        {relatedArticle.frontmatter.difficulty && (
                          <Badge className={`text-xs ${getDifficultyColor(relatedArticle.frontmatter.difficulty)}`}>
                            {getDifficultyLabel(relatedArticle.frontmatter.difficulty)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm">
                        <Link href={`/${locale}/help/${relatedArticle.slug}`}>
                          {relatedArticle.frontmatter.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {relatedArticle.frontmatter.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <time>{formatDate(relatedArticle.frontmatter.date)}</time>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageContent>
    </PortalLayout>
  );
}
