/**
 * Blog Feature - Blog Pagination Component
 * 
 * 博客分页组件
 */

'use client';

import React from 'react';
import { Button } from '@shared/ui/button';
import type { PaginationData } from '../types/blog';

interface BlogPaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  className?: string;
}

export function BlogPagination({
  pagination,
  onPageChange,
  maxVisiblePages = 5,
  className,
}: BlogPaginationProps) {
  const { currentPage, totalPages, hasNext, hasPrevious } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    if (currentPage - halfVisible < 1) {
      endPage = Math.min(totalPages, endPage + (halfVisible - currentPage + 1));
    }
    
    if (currentPage + halfVisible > totalPages) {
      startPage = Math.max(1, startPage - (currentPage + halfVisible - totalPages));
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex justify-center ${className || ''}`}>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
        >
          上一页
        </Button>
        
        {visiblePages[0] > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {visiblePages[0] > 2 && (
              <span className="text-muted-foreground">...</span>
            )}
          </>
        )}
        
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="text-muted-foreground">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
