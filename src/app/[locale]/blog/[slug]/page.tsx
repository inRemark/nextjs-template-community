import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Tag, Clock } from 'lucide-react';
import { Badge } from '@shared/ui/badge';
import { Separator } from '@shared/ui/separator';
import { Card, CardContent } from '@shared/ui/card';
import { PortalLayout } from '@shared/layout/portal-layout';
import { PageContent } from '@/shared/layout/portal-page-content';
import { MarkdownContent } from '@shared/ui/markdown-simple/markdown-content';
import { getBlogPostWithFallback, getBlogPosts, getFeaturedPosts } from '@/features/blog';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const locales = ['zh', 'en', 'ja'];
  const params: Array<{ locale: string; slug: string }> = [];
  
  for (const locale of locales) {
    try {
      const featuredPosts = await getFeaturedPosts(locale);
      const slugs = featuredPosts.slice(0, 20).map(post => ({
        locale,
        slug: post.slug,
      }));
      params.push(...slugs);
    } catch {
      continue;
    }
  }
  
  return params;
}

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// generate metadata for the blog post page
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = await getBlogPostWithFallback(locale, slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }
  
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = await getBlogPostWithFallback(locale, slug);
  const t = await getTranslations({ locale, namespace: 'blog' });
  
  if (!post) {
    notFound();
  }
  
  const allPosts = await getBlogPosts(locale);
  const relatedPosts = allPosts
    .filter(p => 
      p.frontmatter.category === post.frontmatter.category && 
      p.slug !== slug
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

  // Build breadcrumb
  const breadcrumbItems = [
    { label: t('title'), href: `/${locale}/blog` },
    { label: post.frontmatter.title }
  ];

  return (
    <PortalLayout breadcrumb={breadcrumbItems} breadcrumbMaxWidth="4xl">
      <PageContent maxWidth="2xl">
        <div className="max-w-4xl mx-auto px-4">

          <article>
            <header className="mb-8">
              <Badge variant="secondary" className="mb-3 text-xs">
                {post.frontmatter.category}
              </Badge>
              
              <h1 className="text-3xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                {post.frontmatter.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                {post.frontmatter.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  <span>{post.frontmatter.author}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <time>{formatDate(post.frontmatter.date)}</time>
                </div>
                
                {post.frontmatter.readTime && (
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>{post.frontmatter.readTime} {t('detail.minRead')}</span>
                  </div>
                )}
              </div>
              
              {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.frontmatter.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            <Separator className="my-6" />

            <MarkdownContent content={post.content} className="markdown-content text-[15px]" />
          </article>

          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <Separator className="mb-6" />
              <h2 className="text-xl font-bold text-foreground mb-5">
                {t('detail.relatedArticles')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.slug} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {relatedPost.frontmatter.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm">
                        <Link href={`/${locale}/blog/${relatedPost.slug}`}>
                          {relatedPost.frontmatter.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {relatedPost.frontmatter.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <time>{formatDate(relatedPost.frontmatter.date)}</time>
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
