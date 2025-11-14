/**
 * Help Feature - Help Article Card Component
 * 
 * help-article-card.tsx
 */

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import type { HelpArticle } from '../types/help';

interface HelpArticleCardProps {
  article: HelpArticle;
  locale: string;
  categoryName?: string;
}

export function HelpArticleCard({ article, locale, categoryName }: HelpArticleCardProps) {
  const { frontmatter, slug } = article;
  
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return '';
    }
  };

  return (
    <Link href={`/${locale}/help/${slug}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-200 h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                {frontmatter.title}
              </CardTitle>
            </div>
            {frontmatter.difficulty && (
              <Badge 
                variant="secondary" 
                className={`text-xs shrink-0 ${getDifficultyColor(frontmatter.difficulty)}`}
              >
                {getDifficultyLabel(frontmatter.difficulty)}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {frontmatter.excerpt}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
            {categoryName && (
              <Badge variant="outline" className="text-xs">
                {categoryName}
              </Badge>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(frontmatter.date).toLocaleDateString(locale)}</span>
            </div>
            
            {frontmatter.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{frontmatter.readTime} 分钟</span>
              </div>
            )}
          </div>
          
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {frontmatter.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
