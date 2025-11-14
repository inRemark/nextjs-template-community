/**
 * Blog Feature - Blog Post Card Component
 * 
 * 博客文章卡片组件（可复用）
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, Tag, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@shared/ui/card';
import { Badge } from '@shared/ui/badge';
import type { StaticBlogPost } from '../types/blog';

interface BlogPostCardProps {
  post: StaticBlogPost;
  categoryName?: string;
  className?: string;
}

export function BlogPostCard({ post, categoryName, className }: BlogPostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${className || ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <Badge variant="secondary" className="text-xs">
            {categoryName || post.frontmatter.category}
          </Badge>
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(post.frontmatter.date)}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/blog/${post.slug}`}>
            {post.frontmatter.title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {post.frontmatter.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            <span>{post.frontmatter.author}</span>
            {post.frontmatter.readTime && (
              <>
                <span className="mx-2">·</span>
                <Clock className="h-3 w-3 mr-1" />
                <span>{post.frontmatter.readTime} 分钟阅读</span>
              </>
            )}
          </div>
        </div>

        {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.frontmatter.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {post.frontmatter.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.frontmatter.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Link 
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium mt-4 group"
        >
          阅读更多
          <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  );
}
