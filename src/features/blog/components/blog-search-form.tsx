'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@shared/ui/input'

interface BlogSearchFormProps {
  locale: string
  initialSearch: string
  currentCategory?: string
  placeholder: string
}

export function BlogSearchForm({ 
  locale, 
  initialSearch, 
  currentCategory,
  placeholder 
}: BlogSearchFormProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(initialSearch)

  // 防抖搜索：500ms 后自动更新 URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== initialSearch) {
        const params = new URLSearchParams()
        if (searchTerm) params.set('search', searchTerm)
        if (currentCategory && currentCategory !== 'all') {
          params.set('category', currentCategory)
        }
        
        const queryString = params.toString()
        const url = queryString ? `/${locale}/blog?${queryString}` : `/${locale}/blog`
        router.push(url)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, initialSearch, locale, currentCategory, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 表单提交时立即跳转
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (currentCategory && currentCategory !== 'all') {
      params.set('category', currentCategory)
    }
    
    const queryString = params.toString()
    const url = queryString ? `/${locale}/blog?${queryString}` : `/${locale}/blog`
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
