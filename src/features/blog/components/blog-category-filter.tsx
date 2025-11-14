/**
 * Blog Feature - Blog Category Filter Component
 * 
 * 博客分类筛选器组件
 */

'use client';

import React from 'react';
import { Button } from '@shared/ui/button';
import type { BlogCategory } from '../types/blog';

interface BlogCategoryFilterProps {
  categories: BlogCategory[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
  showAll?: boolean;
  className?: string;
}

export function BlogCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  showAll = true,
  className,
}: BlogCategoryFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {showAll && (
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('all')}
          className="text-sm"
        >
          全部
        </Button>
      )}
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.slug)}
          className="text-sm"
        >
          {category.name}
          {category.postCount > 0 && (
            <span className="ml-1 text-xs opacity-70">({category.postCount})</span>
          )}
        </Button>
      ))}
    </div>
  );
}
