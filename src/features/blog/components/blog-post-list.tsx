/**
 * Blog Feature - Blog Post List Component
 * 
 * 博客文章列表组件
 */

'use client';

import React from 'react';
import { BlogPostCard } from './blog-post-card';
import type { StaticBlogPost } from '../types/blog';

interface BlogPostListProps {
  posts: StaticBlogPost[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function BlogPostList({ 
  posts, 
  loading = false, 
  emptyMessage = '没有找到相关文章',
  className 
}: BlogPostListProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ''}`}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="border rounded-lg p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
                <div className="h-3 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ''}`}>
      {posts.map((post) => (
        <BlogPostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
