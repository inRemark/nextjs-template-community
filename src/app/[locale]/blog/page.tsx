import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Calendar, User, Tag, ChevronRight } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Card, CardContent, CardHeader } from '@shared/ui/card'
import { PortalLayout } from '@shared/layout/portal-layout'
import { PageContent } from '@/shared/layout/portal-page-content'
import { getBlogPosts, searchPosts, getPostsByCategory, BlogSearchForm } from '@/features/blog'

// ISR cache config: revalidate every hour
export const revalidate = 3600

interface SearchParams {
  page?: string
  category?: string
  search?: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  category: string
  tags: string[]
  readTime: number
}

// generate static metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  
  return {
    title: t('title'),
    description: t('list.description')
  }
}

export default async function BlogPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const { page = '1', category, search } = await searchParams
  const t = await getTranslations({ locale, namespace: 'blog' })
  
  const currentPage = Number.parseInt(page, 10)
  const postsPerPage = 9

  // Server-side read Markdown files directly
  let allPosts
  if (search) {
    allPosts = await searchPosts(locale, search)
  } else if (category && category !== 'all') {
    allPosts = await getPostsByCategory(locale, category)
  } else {
    allPosts = await getBlogPosts(locale)
  }

  // Pagination logic
  const totalPosts = allPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const paginatedPosts = allPosts.slice(startIndex, endIndex)

  // Convert to BlogPost format
  const posts: BlogPost[] = paginatedPosts.map((post) => ({
    id: post.slug,
    title: post.frontmatter.title,
    slug: post.slug,
    excerpt: post.frontmatter.excerpt,
    content: post.content,
    author: post.frontmatter.author,
    publishedAt: post.frontmatter.date,
    category: post.frontmatter.category,
    tags: post.frontmatter.tags,
    readTime: post.frontmatter.readTime
  }))

  const categories = [
    { id: 'all', name: t('list.categories.all') },
    { id: 'email-marketing', name: t('list.categories.email-marketing') },
    { id: 'tutorials', name: t('list.categories.tutorials') },
    { id: 'updates', name: t('list.categories.updates') },
    { id: 'best-practices', name: t('list.categories.best-practices') },
    { id: 'case-studies', name: t('list.categories.case-studies') }
  ]

  // Format date helper
  const getLocaleString = () => {
    if (locale === 'zh') return 'zh-CN'
    if (locale === 'ja') return 'ja-JP'
    return 'en-US'
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(getLocaleString(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Build URL helper function
  const buildQueryString = (params: { page?: number; includeCategory?: boolean; includeSearch?: boolean }) => {
    const query = new URLSearchParams()
    
    if (params.page && params.page > 1) {
      query.set('page', params.page.toString())
    }
    if (params.includeCategory && category && category !== 'all') {
      query.set('category', category)
    }
    if (params.includeSearch && search) {
      query.set('search', search)
    }
    
    const queryString = query.toString()
    const basePath = `/${locale}/blog`
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  return (
    <PortalLayout 
      title={t('title')} 
      description={t('list.description')}
    >
      <PageContent maxWidth="2xl">
      <div className="py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Form */}
            <BlogSearchForm 
              locale={locale}
              initialSearch={search || ''}
              currentCategory={category}
              placeholder={t('list.search')}
            />

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = (category || 'all') === cat.id

                // Build category link
                let href = `/${locale}/blog`
                const params: string[] = []
                if (cat.id !== 'all') params.push(`category=${cat.id}`)
                if (search) params.push(`search=${search}`)
                if (params.length > 0) href += `?${params.join('&')}`
                
                return (
                  <Link key={cat.id} href={href}>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className="text-sm"
                    >
                      {cat.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t('list.noArticles')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(c => c.id === post.category)?.name || post.category}
                    </Badge>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/${locale}/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3 w-3 mr-1" />
                      <span>{post.author}</span>
                      <span className="mx-2">·</span>
                      <span>{post.readTime} {t('list.readTime')}</span>
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Link 
                    href={`/${locale}/blog/${post.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium mt-4 group"
                  >
                    {t('list.readMore')}
                    <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              {/* Previous Page */}
              <Link 
                href={buildQueryString({ page: Math.max(1, currentPage - 1), includeCategory: true, includeSearch: true })}
                className={currentPage === 1 ? 'pointer-events-none' : ''}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                >
                  {t('list.pagination.previous')}
                </Button>
              </Link>
              
              {/* 页码按钮 */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                
                return (
                  <Link 
                    key={pageNum} 
                    href={buildQueryString({ page: pageNum, includeCategory: true, includeSearch: true })}
                  >
                    <Button
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  </Link>
                )
              })}

              {/* Next Page */}
              <Link 
                href={buildQueryString({ page: Math.min(totalPages, currentPage + 1), includeCategory: true, includeSearch: true })}
                className={currentPage === totalPages ? 'pointer-events-none' : ''}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                >
                  {t('list.pagination.next')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      </PageContent>
    </PortalLayout>
  )
}