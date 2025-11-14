/**
 * Help Feature - Help Category Filter Component
 * 
 * help-category-filter.tsx
 */

'use client';

import React from 'react';
import { Button } from '@shared/ui/button';
import type { HelpCategory } from '../types/help';

interface HelpCategoryFilterProps {
  categories: HelpCategory[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
  showAll?: boolean;
  className?: string;
}

export function HelpCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  showAll = true,
  className,
}: HelpCategoryFilterProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {showAll && (
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('all')}
          className="text-sm"
        >
          All
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
          {category.articleCount > 0 && (
            <span className="ml-1 text-xs opacity-70">({category.articleCount})</span>
          )}
        </Button>
      ))}
    </div>
  );
}
