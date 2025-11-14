/**
 * Help Feature - Help Pagination Component
 * 
 * help-pagination.tsx
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@shared/ui/button';
import type { PaginationData } from '../types/help';

interface HelpPaginationProps {
  pagination: PaginationData;
  locale: string;
  basePath?: string;
  searchParams?: Record<string, string>;
}

export function HelpPagination({
  pagination,
  locale,
  basePath = 'help',
  searchParams = {},
}: HelpPaginationProps) {
  const { currentPage, totalPages, hasPrevious, hasNext } = pagination;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const queryString = params.toString();
    return queryString ? `/${locale}/${basePath}?${queryString}` : `/${locale}/${basePath}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevious}
        asChild={hasPrevious}
      >
        {hasPrevious ? (
          <Link href={buildUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and adjacent pages
          const showPage =
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1);

          // Show ellipsis
          const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
          const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

          if (!showPage && !showEllipsisBefore && !showEllipsisAfter) {
            return null;
          }

          if (showEllipsisBefore || showEllipsisAfter) {
            return (
              <span key={page} className="px-2 text-muted-foreground">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              asChild={!isActive}
              disabled={isActive}
            >
              {isActive ? (
                <span>{page}</span>
              ) : (
                <Link href={buildUrl(page)}>{page}</Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        asChild={hasNext}
      >
        {hasNext ? (
          <Link href={buildUrl(currentPage + 1)}>
            <span>Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        ) : (
          <>
            <span>Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}
