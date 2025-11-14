/**
 * Blog Feature - Blog Search Box Component
 * 
 * 博客搜索框组件
 */

'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@shared/ui/input';

interface BlogSearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function BlogSearchBox({ 
  onSearch, 
  placeholder = '搜索文章...',
  className 
}: BlogSearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex-1 max-w-md ${className || ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          className="pl-10"
        />
      </div>
    </form>
  );
}
