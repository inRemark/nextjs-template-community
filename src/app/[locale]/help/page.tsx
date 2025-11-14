import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@shared/ui/button'
import { PortalLayout } from '@shared/layout/portal-layout'
import { PageContent } from '@/shared/layout/portal-page-content'
import { 
  getHelpArticles, 
  searchArticles, 
  getArticlesByCategory, 
  HelpSearchForm
} from '@/features/help'

// ISR cache config: revalidate every hour
export const revalidate = 3600

interface SearchParams {
  page?: string
  category?: string
  search?: string
}

// generate static metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'help' })
  
  return {
    title: t('title'),
    description: t('list.description')
  }
}

export default async function HelpPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const { page = '1', category, search } = await searchParams
  const t = await getTranslations({ locale, namespace: 'help' })
  
  const currentPage = Number.parseInt(page, 10)
  const articlesPerPage = 9

  // Server-side read Markdown files directly
  let allArticles
  if (search) {
    allArticles = await searchArticles(locale, search)
  } else if (category && category !== 'all') {
    allArticles = await getArticlesByCategory(locale, category)
  } else {
    allArticles = await getHelpArticles(locale)
  }

  // Pagination logic
  const totalArticles = allArticles.length
  const totalPages = Math.ceil(totalArticles / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const paginatedArticles = allArticles.slice(startIndex, endIndex)

  const categories = [
    { id: 'all', name: t('list.categories.all') },
    { id: 'getting-started', name: t('list.categories.getting-started') },
    { id: 'account', name: t('list.categories.account') },
    { id: 'troubleshooting', name: t('list.categories.troubleshooting') },
    { id: 'features', name: t('list.categories.features') },
    { id: 'billing', name: t('list.categories.billing') },
    { id: 'api', name: t('list.categories.api') }
  ]

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
    const basePath = `/${locale}/help`
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
            <HelpSearchForm 
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
                let href = `/${locale}/help`
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

        {/* Help Articles List */}
        {paginatedArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t('list.noArticles')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedArticles.map((article) => {
              const categoryName = categories.find(c => c.id === article.frontmatter.category)?.name || article.frontmatter.category
              const difficulty = article.frontmatter.difficulty
              
              const getDifficultyColor = (diff?: string) => {
                switch (diff) {
                  case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }
              }
              
              const getDifficultyLabel = (diff?: string) => {
                switch (diff) {
                  case 'beginner': return t('list.difficulty.beginner')
                  case 'intermediate': return t('list.difficulty.intermediate')
                  case 'advanced': return t('list.difficulty.advanced')
                  default: return ''
                }
              }
              
              return (
                <Link 
                  key={article.slug} 
                  href={`/${locale}/help/${article.slug}`}
                  className="block"
                >
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 hover:border-primary/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                            {article.frontmatter.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {article.frontmatter.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                            {categoryName}
                          </span>
                          {difficulty && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded ${getDifficultyColor(difficulty)}`}>
                              {getDifficultyLabel(difficulty)}
                            </span>
                          )}
                          {article.frontmatter.readTime && (
                            <span>{article.frontmatter.readTime} {t('list.readTime')}</span>
                          )}
                          <span>·</span>
                          <span>{new Date(article.frontmatter.date).toLocaleDateString(locale)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
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
              
              {/* page number */}
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