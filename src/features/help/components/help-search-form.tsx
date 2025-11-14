'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@shared/ui/input'

interface HelpSearchFormProps {
  locale: string
  initialSearch: string
  currentCategory?: string
  placeholder: string
}

export function HelpSearchForm({ 
  locale, 
  initialSearch, 
  currentCategory,
  placeholder 
}: HelpSearchFormProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(initialSearch)

  // Anti shake search: URL automatically updated after 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== initialSearch) {
        const params = new URLSearchParams()
        if (searchTerm) params.set('search', searchTerm)
        if (currentCategory && currentCategory !== 'all') {
          params.set('category', currentCategory)
        }
        
        const queryString = params.toString()
        const url = queryString ? `/${locale}/help?${queryString}` : `/${locale}/help`
        router.push(url)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, initialSearch, locale, currentCategory, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission immediately redirects
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (currentCategory && currentCategory !== 'all') {
      params.set('category', currentCategory)
    }
    
    const queryString = params.toString()
    const url = queryString ? `/${locale}/help?${queryString}` : `/${locale}/help`
    router.push(url)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
    </form>
  )
}
