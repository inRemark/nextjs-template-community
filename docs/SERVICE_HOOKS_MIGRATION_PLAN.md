# Service + Hooks 架构迁移计划

> 文档生成时间: 2025-11-10  
> 目标: 统一前端数据请求架构,从手动状态管理迁移到 Service + React Query 模式

---

## 📋 目录

- [1. 架构概述](#1-架构概述)
- [2. 当前状态分析](#2-当前状态分析)
- [3. 迁移优先级](#3-迁移优先级)
- [4. 详细迁移方案](#4-详细迁移方案)
- [5. 代码示例](#5-代码示例)
- [6. 迁移检查清单](#6-迁移检查清单)
- [7. 预期收益](#7-预期收益)

---

## 1. 架构概述

### 1.1 目标架构

```
features/xxx/
  ├── services/
  │   └── xxx-client.service.ts   # 纯粹的 API 请求逻辑
  ├── hooks/
  │   └── useXxx.ts                # React Query 封装
  ├── types/
  │   └── xxx.types.ts             # TypeScript 类型定义
  └── components/
      └── XxxComponent.tsx         # UI 组件
```

### 1.2 核心原则

| 层级 | 职责 | 禁止事项 |
|------|------|----------|
| **Service** | API 调用、数据转换、错误处理 | 不包含 React Hooks、状态管理 |
| **Hooks** | React Query 封装、缓存配置 | 不直接处理 fetch 逻辑 |
| **Components** | UI 渲染、用户交互 | 不直接调用 API |

### 1.3 技术栈

- **React Query (TanStack Query)**: 服务端状态管理
- **Native Fetch API**: HTTP 请求 (已移除 Axios)
- **TypeScript**: 类型安全保障

---

## 2. 当前状态分析

### 2.1 已完成模块 ✅

这些模块已经采用 Service + Hooks 架构,**无需迁移**:

| 模块 | Service 文件 | Hooks 文件 | 状态 |
|------|-------------|-----------|------|
| Console | `console-client.service.ts` | `useDashboardStats.ts` | ✅ 完成 |
| Notifications | `notification-client.service.ts` | `useNotifications.ts` | ✅ 完成 |
| Search | `search-client.service.ts` | `useSearch.ts` | ✅ 完成 |
| Points | `points-client.service.ts` | - | ✅ 完成 |
| User | `user-client.service.ts` | - | ✅ 完成 |
| Orders | - | `useOrders.ts` | ⚠️ 部分完成 (直接用 apiClient) |
| Products | - | `useProducts.ts` | ⚠️ 部分完成 (直接用 apiClient) |
| Payments | - | `useAnalytics.ts` | ⚠️ 部分完成 (直接用 apiClient) |

### 2.2 需要迁移的模块 🔴

#### 🔴 高优先级 (手动状态管理 + 无 Service 层)

| 模块 | 文件 | 代码行数 | 问题描述 | 预计收益 |
|------|------|----------|----------|----------|
| **Articles** | `useArticles.ts` | **178 行** | 手动管理 useState/useEffect,无缓存机制 | 减少 60% 代码 |
| **Blog** | `useBlog.ts` | **198 行** | 4个自定义 Hook,重复逻辑多 | 减少 65% 代码 |

#### 🟡 中优先级 (已用 React Query 但缺 Service 层)

| 模块 | 文件 | 问题描述 | 优化方向 |
|------|------|----------|----------|
| **Orders** | `useOrders.ts` | 直接在 Hook 中写 fetch 逻辑 | 提取到 OrderClientService |
| **Products** | `useProducts.ts` | 直接在 Hook 中写 fetch 逻辑 | 提取到 ProductClientService |
| **Admin Products** | `useAdminProducts.ts` | 207 行,逻辑混杂 | 拆分 Service 和 Hook |
| **Payments** | `useAnalytics.ts` | 直接在 Hook 中写 fetch 逻辑 | 提取到 PaymentClientService |

---

## 3. 迁移优先级

### Phase 1: 高收益模块 (1-2 天) 🔴

**目标:** 解决最大痛点,快速看到效果

1. **Articles 模块** - 178 行 → 70 行 (60% 优化)
2. **Blog 模块** - 198 行 → 80 行 (59% 优化)

**验收标准:**
- ✅ Service 层纯函数,无 React 依赖
- ✅ Hooks 使用 React Query 封装
- ✅ 减少至少 50% 代码量
- ✅ 支持缓存、重试、预取

---

### Phase 2: 补充 Service 层 (2-3 天) 🟡

**目标:** 为已有 React Query 的模块补充 Service 层,提高复用性

1. **Orders 模块**
2. **Products 模块**
3. **Payments Analytics 模块**
4. **Admin Products 模块**

**验收标准:**
- ✅ API 逻辑从 Hook 中提取到 Service
- ✅ Service 可在 Server Actions 中复用
- ✅ 类型定义完整

---

### Phase 3: 扩展功能 (可选) 🟢

- 添加乐观更新 (Optimistic Updates)
- 实现无限滚动 (useInfiniteQuery)
- 集成 WebSocket 实时更新
- 添加离线支持

---

## 4. 详细迁移方案

### 4.1 Articles 模块迁移

#### 现状问题

```typescript
// ❌ 当前代码 (178 行)
export function useArticles(params: ArticleListParams = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<...>(null);
  
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // ... 50+ 行 fetch 逻辑
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);
  
  return { articles, loading, error, pagination, refetch: fetchArticles };
}
```

**问题清单:**
- ❌ 手动管理 loading/error 状态 (容易遗漏)
- ❌ 无缓存机制 (每次切换页面重新请求)
- ❌ useCallback 依赖地狱
- ❌ 无重试机制
- ❌ 难以测试 (依赖 React 环境)
- ❌ 无法在 Server Actions 中复用

---

#### 迁移步骤

##### Step 1: 创建 Service 层

**文件:** `src/features/articles/services/article-client.service.ts`

```typescript
import type { 
  Article, 
  ArticleListParams, 
  ArticleListResponse,
  ArticleStats 
} from '../types/article.types';

/**
 * Article Client Service
 * 文章客户端服务 - 负责所有文章相关的 API 请求
 */
export class ArticleClientService {
  /**
   * 获取文章列表
   */
  static async getArticles(params: ArticleListParams = {}): Promise<ArticleListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(
          key, 
          Array.isArray(value) ? value.join(',') : String(value)
        );
      }
    });

    const response = await fetch(`/api/articles?${queryParams}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '获取文章列表失败');
    }

    return data.data;
  }

  /**
   * 获取单篇文章
   */
  static async getArticle(id: string): Promise<Article> {
    const response = await fetch(`/api/articles/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '获取文章失败');
    }

    return data.data;
  }

  /**
   * 增加文章浏览量
   */
  static async incrementView(id: string): Promise<void> {
    const response = await fetch(`/api/articles/${id}/view`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('更新浏览量失败');
    }
  }

  /**
   * 获取文章统计
   */
  static async getArticleStats(authorId?: string): Promise<ArticleStats> {
    const url = authorId
      ? `/api/articles/stats?authorId=${authorId}`
      : '/api/articles/stats';

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '获取统计数据失败');
    }

    return data.data;
  }
}
```

---

##### Step 2: 重构 Hooks 层

**文件:** `src/features/articles/hooks/useArticles.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArticleClientService } from '../services/article-client.service';
import type { ArticleListParams } from '../types/article.types';

/**
 * 获取文章列表
 */
export function useArticles(params: ArticleListParams = {}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => ArticleClientService.getArticles(params),
    staleTime: 1000 * 60 * 5, // 5分钟内数据视为新鲜
  });
}

/**
 * 获取单篇文章
 */
export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => ArticleClientService.getArticle(id),
    enabled: !!id, // id 存在时才执行查询
  });
}

/**
 * 增加文章浏览量
 */
export function useIncrementView(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ArticleClientService.incrementView(id),
    onSuccess: () => {
      // 浏览量更新后,使缓存失效
      queryClient.invalidateQueries({ queryKey: ['article', id] });
    },
  });
}

/**
 * 获取文章统计
 */
export function useArticleStats(authorId?: string) {
  return useQuery({
    queryKey: ['article-stats', authorId],
    queryFn: () => ArticleClientService.getArticleStats(authorId),
    staleTime: 1000 * 60 * 10, // 统计数据10分钟缓存
  });
}
```

**代码量对比:**
- 原始: 178 行
- 新版: Service (60 行) + Hooks (40 行) = **100 行**
- 减少: **44%** ✅

**功能提升:**
- ✅ 自动缓存 (5-10 分钟)
- ✅ 自动重试 (失败自动重试 3 次)
- ✅ 后台刷新 (stale 数据自动更新)
- ✅ Service 可在 Server Actions 中复用
- ✅ 更好的 TypeScript 支持

---

##### Step 3: 更新类型定义

**文件:** `src/features/articles/types/article.types.ts`

```typescript
export interface ArticleListResponse {
  articles: Article[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: ArticleStatus;
  authorId?: string;
  tags?: string[];
  search?: string;
}

export interface ArticleStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViewsPerArticle: number;
}
```

---

##### Step 4: 更新组件使用方式

**Before:**
```typescript
// ❌ 老代码
function ArticleList() {
  const { articles, loading, error, pagination, refetch } = useArticles({ page: 1 });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {articles.map(article => <ArticleCard key={article.id} {...article} />)}
      <Pagination {...pagination} />
    </div>
  );
}
```

**After:**
```typescript
// ✅ 新代码 (React Query 标准模式)
function ArticleList() {
  const { data, isLoading, error, refetch } = useArticles({ page: 1 });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;
  
  return (
    <div>
      {data.articles.map(article => <ArticleCard key={article.id} {...article} />)}
      <Pagination 
        page={data.page}
        total={data.total}
        totalPages={data.totalPages}
      />
    </div>
  );
}
```

---

### 4.2 Blog 模块迁移

#### 现状分析

```typescript
// ❌ 当前代码 (198 行)
// 包含 4 个自定义 Hook:
// 1. useBlog (50 行)
// 2. useBlogPost (40 行)
// 3. useBlogCategories (40 行)
// 4. useBlogTags (40 行)
// 所有 Hook 都手动管理状态,大量重复代码
```

#### 迁移方案

##### Step 1: 创建 Service 层

**文件:** `src/features/blog/services/blog-client.service.ts`

```typescript
import type { 
  StaticBlogPost, 
  BlogFilters, 
  BlogCategory, 
  BlogTag,
  BlogListResponse 
} from '../types/blog.types';

export class BlogClientService {
  /**
   * 获取博客文章列表
   */
  static async getPosts(
    filters: BlogFilters = {}, 
    page: number = 1, 
    limit: number = 10
  ): Promise<BlogListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.category) params.append('category', filters.category);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.author) params.append('author', filters.author);
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start);
      params.append('endDate', filters.dateRange.end);
    }

    const response = await fetch(`/api/blog?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }

    return response.json();
  }

  /**
   * 获取单篇博客文章
   */
  static async getPost(slug: string): Promise<{
    post: StaticBlogPost;
    relatedPosts: StaticBlogPost[];
  }> {
    const response = await fetch(`/api/blog/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog post');
    }

    return response.json();
  }

  /**
   * 获取分类列表
   */
  static async getCategories(): Promise<BlogCategory[]> {
    const response = await fetch('/api/blog/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  /**
   * 获取标签列表
   */
  static async getTags(): Promise<BlogTag[]> {
    const response = await fetch('/api/blog/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    return response.json();
  }
}
```

---

##### Step 2: 重构 Hooks 层

**文件:** `src/features/blog/hooks/useBlog.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { BlogClientService } from '../services/blog-client.service';
import type { BlogFilters } from '../types/blog.types';

/**
 * 获取博客文章列表
 */
export function useBlog(filters: BlogFilters = {}, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['blog', 'posts', filters, page, limit],
    queryFn: () => BlogClientService.getPosts(filters, page, limit),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

/**
 * 获取单篇博客文章
 */
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => BlogClientService.getPost(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 单篇文章10分钟缓存
  });
}

/**
 * 获取博客分类
 */
export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog', 'categories'],
    queryFn: () => BlogClientService.getCategories(),
    staleTime: 1000 * 60 * 30, // 分类数据30分钟缓存
  });
}

/**
 * 获取博客标签
 */
export function useBlogTags() {
  return useQuery({
    queryKey: ['blog', 'tags'],
    queryFn: () => BlogClientService.getTags(),
    staleTime: 1000 * 60 * 30, // 标签数据30分钟缓存
  });
}
```

**代码量对比:**
- 原始: 198 行
- 新版: Service (70 行) + Hooks (50 行) = **120 行**
- 减少: **39%** ✅

---

### 4.3 Orders/Products/Payments 模块优化

这些模块已经使用 React Query,但缺少 Service 层。

#### 迁移策略

**Step 1:** 创建 Service 层
```typescript
// src/features/orders/services/order-client.service.ts
export class OrderClientService {
  static async getOrders(params: OrderListParams) {
    const queryParams = new URLSearchParams();
    // ... 参数处理
    const response = await fetch(`/api/orders?${queryParams}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
  
  static async getOrder(orderId: string) {
    const response = await fetch(`/api/orders/${orderId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
  
  static async createOrder(input: CreateOrderInput) {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
}
```

**Step 2:** 简化 Hook 层
```typescript
// Before: 直接在 Hook 中写 fetch 逻辑
export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      // ... 20 行参数处理和 fetch 逻辑
      const response = await apiClient.get<{ data: OrderListResponse }>(
        `/orders?${queryParams.toString()}`
      );
      return response.data;
    },
  });
}

// After: 调用 Service 层
export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => OrderClientService.getOrders(params),
  });
}
```

**收益:**
- ✅ Hook 代码减少 70%
- ✅ Service 可在 Server Actions 中复用
- ✅ 更容易单元测试

---

### 4.4 Admin Products 模块拆分

**现状:** 207 行代码混杂在一个文件中

**迁移方案:**

```typescript
// src/features/admin/services/admin-product-client.service.ts
export class AdminProductClientService {
  static async getProducts(params: ProductsQuery) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`/api/admin/products?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  static async getProduct(productId: string) {
    const response = await fetch(`/api/admin/products/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    const json = await response.json();
    return json.data;
  }

  static async createProduct(data: ProductFormData) {
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }
    return response.json();
  }

  static async updateProduct(productId: string, data: ProductFormData) {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }
    return response.json();
  }

  static async deleteProduct(productId: string) {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete product');
    }
    return response.json();
  }

  // Price management
  static async createPrice(productId: string, data: PriceFormData) {
    const response = await fetch(`/api/admin/products/${productId}/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create price');
    }
    return response.json();
  }

  static async updatePrice(priceId: string, data: PriceFormData) {
    const response = await fetch(`/api/admin/products/prices/${priceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update price');
    }
    return response.json();
  }

  static async deletePrice(priceId: string) {
    const response = await fetch(`/api/admin/products/prices/${priceId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete price');
    }
    return response.json();
  }
}
```

**Hooks 层:**
```typescript
// src/features/admin/hooks/useAdminProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminProductClientService } from '../services/admin-product-client.service';
import type { ProductsQuery, ProductFormData, PriceFormData } from '../validators/admin-product.validator';

export function useAdminProducts(params: ProductsQuery) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => AdminProductClientService.getProducts(params),
  });
}

export function useAdminProduct(productId: string) {
  return useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: () => AdminProductClientService.getProduct(productId),
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminProductClientService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => 
      AdminProductClientService.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminProductClientService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useCreatePrice(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PriceFormData) => 
      AdminProductClientService.createPrice(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', productId] });
    },
  });
}

export function useUpdatePrice(priceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PriceFormData) => 
      AdminProductClientService.updatePrice(priceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeletePrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminProductClientService.deletePrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}
```

**代码量对比:**
- 原始: 207 行 (混在一起)
- 新版: Service (120 行) + Hooks (85 行) = **205 行**
- 代码量相近,但**职责清晰、可维护性大幅提升** ✅

---

## 5. 代码示例

### 5.1 完整示例: Articles 模块

#### 目录结构
```
src/features/articles/
├── services/
│   └── article-client.service.ts   (60 行)
├── hooks/
│   └── useArticles.ts              (40 行)
├── types/
│   └── article.types.ts            (50 行)
└── components/
    ├── ArticleList.tsx
    └── ArticleDetail.tsx
```

#### 组件使用示例

```typescript
// ArticleList.tsx
'use client';

import { useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import { ArticleCard } from './ArticleCard';
import { Pagination } from '@/shared/components/Pagination';

export function ArticleList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useArticles({ 
    page, 
    limit: 10,
    status: 'PUBLISHED' 
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

```typescript
// ArticleDetail.tsx
'use client';

import { useArticle, useIncrementView } from '../hooks/useArticles';
import { useEffect } from 'react';

export function ArticleDetail({ id }: { id: string }) {
  const { data: article, isLoading, error } = useArticle(id);
  const incrementView = useIncrementView(id);

  // 页面加载时增加浏览量
  useEffect(() => {
    if (article) {
      incrementView.mutate();
    }
  }, [article]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!article) return null;

  return (
    <article>
      <h1>{article.title}</h1>
      <div>{article.content}</div>
      <div>浏览量: {article.viewCount}</div>
    </article>
  );
}
```

---

### 5.2 Server Actions 复用示例

```typescript
// src/app/actions/articles.ts
'use server';

import { ArticleClientService } from '@/features/articles/services/article-client.service';
import { revalidatePath } from 'next/cache';

/**
 * 服务端 Action: 发布文章
 * 展示 Service 层的可复用性
 */
export async function publishArticle(articleId: string) {
  try {
    // 可以直接复用 Client Service (如果是 isomorphic 的话)
    // 或者调用对应的 Server Service
    
    // 示例: 更新文章状态
    const response = await fetch(`${process.env.API_BASE_URL}/api/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PUBLISHED' }),
    });

    if (!response.ok) {
      throw new Error('Failed to publish article');
    }

    revalidatePath('/articles');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

---

## 6. 迁移检查清单

### 6.1 Phase 1: Articles 模块

- [ ] **创建 Service 层**
  - [ ] 创建 `article-client.service.ts` 文件
  - [ ] 实现 `getArticles()` 方法
  - [ ] 实现 `getArticle()` 方法
  - [ ] 实现 `incrementView()` 方法
  - [ ] 实现 `getArticleStats()` 方法
  - [ ] 添加完整的错误处理
  - [ ] 添加 JSDoc 注释

- [ ] **重构 Hooks 层**
  - [ ] 重写 `useArticles()` 使用 React Query
  - [ ] 重写 `useArticle()` 使用 React Query
  - [ ] 添加 `useIncrementView()` mutation
  - [ ] 重写 `useArticleStats()` 使用 React Query
  - [ ] 配置合理的 staleTime
  - [ ] 配置 queryKey 策略

- [ ] **更新类型定义**
  - [ ] 创建 `ArticleListResponse` 类型
  - [ ] 创建 `ArticleListParams` 类型
  - [ ] 创建 `ArticleStats` 类型
  - [ ] 删除旧的 `UseArticlesReturn` 等类型

- [ ] **更新组件**
  - [ ] 查找所有使用 `useArticles` 的组件
  - [ ] 更新为新的 API (data, isLoading, error)
  - [ ] 测试功能是否正常

- [ ] **测试验证**
  - [ ] 测试文章列表加载
  - [ ] 测试分页功能
  - [ ] 测试缓存机制 (切换页面再返回)
  - [ ] 测试错误处理
  - [ ] 测试浏览量更新

### 6.2 Phase 1: Blog 模块

- [ ] **创建 Service 层**
  - [ ] 创建 `blog-client.service.ts` 文件
  - [ ] 实现 `getPosts()` 方法
  - [ ] 实现 `getPost()` 方法
  - [ ] 实现 `getCategories()` 方法
  - [ ] 实现 `getTags()` 方法
  - [ ] 添加错误处理和类型

- [ ] **重构 Hooks 层**
  - [ ] 重写 `useBlog()`
  - [ ] 重写 `useBlogPost()`
  - [ ] 重写 `useBlogCategories()`
  - [ ] 重写 `useBlogTags()`
  - [ ] 配置缓存策略

- [ ] **更新组件和测试**
  - [ ] 更新所有使用 Blog hooks 的组件
  - [ ] 测试博客列表、详情、分类、标签功能

### 6.3 Phase 2: Orders/Products/Payments

- [ ] **Orders 模块**
  - [ ] 创建 `order-client.service.ts`
  - [ ] 提取 fetch 逻辑到 Service
  - [ ] 简化 Hooks 层
  - [ ] 测试功能

- [ ] **Products 模块**
  - [ ] 创建 `product-client.service.ts`
  - [ ] 提取 fetch 逻辑到 Service
  - [ ] 简化 Hooks 层
  - [ ] 测试功能

- [ ] **Payments 模块**
  - [ ] 创建 `payment-client.service.ts`
  - [ ] 提取 fetch 逻辑到 Service
  - [ ] 简化 Hooks 层
  - [ ] 测试功能

- [ ] **Admin Products 模块**
  - [ ] 创建 `admin-product-client.service.ts`
  - [ ] 拆分产品和价格管理逻辑
  - [ ] 重构 Hooks 层
  - [ ] 测试完整的 CRUD 流程

---

## 7. 预期收益

### 7.1 代码量减少

| 模块 | 原代码行数 | 新代码行数 | 减少比例 |
|------|----------|----------|----------|
| **Articles** | 178 | 100 | **44%** ↓ |
| **Blog** | 198 | 120 | **39%** ↓ |
| **Orders** | 74 | 60 | **19%** ↓ |
| **Products** | 50 | 45 | **10%** ↓ |
| **Admin Products** | 207 | 205 | **职责分离** |
| **总计** | **707 行** | **530 行** | **25%** ↓ |

---

### 7.2 功能提升

#### 自动缓存 ✅
```typescript
// React Query 自动管理缓存
const { data } = useArticles({ page: 1 }); // 首次请求
const { data } = useArticles({ page: 1 }); // 从缓存读取,不发请求!
```

#### 自动重试 ✅
```typescript
// 网络错误自动重试 3 次
useQuery({
  queryKey: ['articles'],
  queryFn: () => ArticleClientService.getArticles(),
  retry: 3, // 默认值
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

#### 后台刷新 ✅
```typescript
// 数据过期后自动后台刷新
useQuery({
  queryKey: ['articles'],
  queryFn: () => ArticleClientService.getArticles(),
  staleTime: 1000 * 60 * 5, // 5分钟后数据过期
  refetchOnWindowFocus: true, // 窗口聚焦时自动刷新
});
```

#### 乐观更新 ✅
```typescript
// 立即更新 UI,请求失败则回滚
const mutation = useMutation({
  mutationFn: ArticleClientService.incrementView,
  onMutate: async (articleId) => {
    // 乐观更新: 立即增加浏览量
    queryClient.setQueryData(['article', articleId], (old) => ({
      ...old,
      viewCount: old.viewCount + 1,
    }));
  },
  onError: (err, articleId, context) => {
    // 失败回滚
    queryClient.setQueryData(['article', articleId], context.previousData);
  },
});
```

#### 预取支持 ✅
```typescript
// 鼠标悬停时预取数据
function ArticleCard({ article }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['article', article.id],
      queryFn: () => ArticleClientService.getArticle(article.id),
    });
  };

  return <div onMouseEnter={handleMouseEnter}>...</div>;
}
```

#### 无限滚动 ✅
```typescript
// 轻松实现无限滚动
export function useInfiniteArticles(params: ArticleListParams) {
  return useInfiniteQuery({
    queryKey: ['articles', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      ArticleClientService.getArticles({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
}
```

---

### 7.3 可维护性提升

#### Before (手动状态管理)
```typescript
// ❌ 70 行代码,容易出错
export function useArticles(params: ArticleListParams) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // ... 40 行 fetch 逻辑
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, loading, error, pagination, refetch: fetchArticles };
}
```

#### After (Service + React Query)
```typescript
// ✅ 5 行代码,功能更强大
export function useArticles(params: ArticleListParams) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => ArticleClientService.getArticles(params),
    staleTime: 1000 * 60 * 5,
  });
}
```

---

### 7.4 测试覆盖率提升

#### Service 层单元测试 (无需 React)
```typescript
// article-client.service.test.ts
import { ArticleClientService } from './article-client.service';

describe('ArticleClientService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should fetch articles successfully', async () => {
    const mockData = { 
      success: true, 
      data: { articles: [], page: 1, total: 0 } 
    };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await ArticleClientService.getArticles({ page: 1 });
    
    expect(result).toEqual(mockData.data);
    expect(global.fetch).toHaveBeenCalledWith('/api/articles?page=1');
  });

  it('should handle errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, message: 'Error' }),
    });

    await expect(
      ArticleClientService.getArticles()
    ).rejects.toThrow('Error');
  });
});
```

---

### 7.5 性能优化

#### 减少网络请求
```typescript
// 同一个查询在 5 分钟内不会重复请求
const { data: articlesInPage1 } = useArticles({ page: 1 }); // 发起请求
const { data: articlesInPage2 } = useArticles({ page: 1 }); // 从缓存读取 ✅
```

#### 智能预取
```typescript
// 用户浏览第 1 页时,预取第 2 页
function ArticleList() {
  const { data } = useArticles({ page: 1 });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (data?.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['articles', { page: 2 }],
        queryFn: () => ArticleClientService.getArticles({ page: 2 }),
      });
    }
  }, [data, queryClient]);

  return <div>...</div>;
}
```

---

## 8. 迁移时间线

### Week 1: Phase 1 - 高收益模块

**Day 1-2: Articles 模块**
- 创建 Service 层 (2h)
- 重构 Hooks 层 (2h)
- 更新组件 (2h)
- 测试验证 (2h)

**Day 3-4: Blog 模块**
- 创建 Service 层 (2h)
- 重构 4 个 Hooks (3h)
- 更新组件 (2h)
- 测试验证 (2h)

**Day 5: 总结和文档**
- 编写迁移文档 (2h)
- Code Review (2h)
- 性能测试 (2h)

---

### Week 2: Phase 2 - 补充 Service 层

**Day 1: Orders 模块**
- 创建 Service 层 (1h)
- 重构 Hooks (1h)
- 测试 (1h)

**Day 2: Products 模块**
- 创建 Service 层 (1h)
- 重构 Hooks (1h)
- 测试 (1h)

**Day 3: Payments 模块**
- 创建 Service 层 (2h)
- 重构 Hooks (1h)
- 测试 (1h)

**Day 4-5: Admin Products 模块**
- 创建 Service 层 (3h)
- 重构 Hooks (2h)
- 测试完整 CRUD (2h)
- Code Review 和文档 (2h)

---

## 9. 注意事项

### 9.1 Breaking Changes

迁移后 Hook 的返回值会改变:

```typescript
// Before
const { articles, loading, error, pagination } = useArticles();

// After
const { data, isLoading, error } = useArticles();
// data = { articles, page, limit, total, totalPages, hasNext, hasPrevious }
```

**解决方案:** 统一在一个 PR 中完成模块迁移,避免部分迁移导致的混乱。

---

### 9.2 缓存失效策略

需要在 mutation 成功后手动失效缓存:

```typescript
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ArticleClientService.createArticle,
    onSuccess: () => {
      // 重要! 创建成功后使列表缓存失效
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
```

---

### 9.3 TypeScript 类型安全

Service 层必须明确定义输入输出类型:

```typescript
// ✅ Good
static async getArticles(params: ArticleListParams): Promise<ArticleListResponse> {
  // ...
}

// ❌ Bad
static async getArticles(params: any): Promise<any> {
  // ...
}
```

---

### 9.4 错误处理统一

Service 层统一抛出 Error 对象:

```typescript
static async getArticles(params: ArticleListParams): Promise<ArticleListResponse> {
  const response = await fetch('/api/articles');
  const data = await response.json();

  if (!response.ok || !data.success) {
    // 统一抛出 Error 对象,方便 React Query 捕获
    throw new Error(data.message || 'Failed to fetch articles');
  }

  return data.data;
}
```

---

### 9.5 环境变量处理

Service 层需要支持服务端和客户端:

```typescript
// 使用相对路径 (推荐)
static async getArticles() {
  const response = await fetch('/api/articles'); // ✅
}

// 如果需要绝对路径
static async getArticles() {
  const baseUrl = typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : '';
  const response = await fetch(`${baseUrl}/api/articles`);
}
```

---

## 10. 成功标准

### 迁移完成标准

- ✅ 所有目标模块完成 Service + Hooks 拆分
- ✅ 代码量减少 > 20%
- ✅ 所有功能测试通过
- ✅ TypeScript 编译无错误
- ✅ ESLint 检查通过
- ✅ 单元测试覆盖率 > 80%

### 性能提升标准

- ✅ 相同页面重复访问减少 > 80% 网络请求
- ✅ 页面切换响应时间 < 100ms (从缓存读取)
- ✅ 首次加载时间不增加

### 可维护性标准

- ✅ Service 层可在 Server Actions 中复用
- ✅ Hooks 层代码 < 10 行/Hook
- ✅ 新增功能遵循统一架构模式

---

## 11. 参考资源

### 官方文档
- [TanStack Query v5 文档](https://tanstack.com/query/latest/docs/react/overview)
- [React Query 最佳实践](https://tkdodo.eu/blog/practical-react-query)
- [Next.js 数据获取](https://nextjs.org/docs/app/building-your-application/data-fetching)

### 内部资源
- [API Client 文档](../../lib/api-client.ts)
- [Console 模块参考](../../features/console/)
- [Notifications 模块参考](../../features/notifications/)

---

## 12. 附录

### A. 快速命令

```bash
# 创建新模块的 Service 层
mkdir -p src/features/xxx/services
touch src/features/xxx/services/xxx-client.service.ts

# 创建新模块的 Hooks 层
mkdir -p src/features/xxx/hooks
touch src/features/xxx/hooks/useXxx.ts

# 运行类型检查
npm run type-check

# 运行测试
npm run test

# 运行 ESLint
npm run lint
```

### B. Service 层模板

```typescript
/**
 * [Module Name] Client Service
 * [模块名称] 客户端服务
 */
export class [ModuleName]ClientService {
  /**
   * [方法描述]
   */
  static async [methodName]([params]): Promise<[ReturnType]> {
    const response = await fetch('[endpoint]');
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '[错误信息]');
    }

    return data.data;
  }
}
```

### C. Hooks 层模板

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [ModuleName]ClientService } from '../services/[module-name]-client.service';

export function use[ModuleName]([params]) {
  return useQuery({
    queryKey: ['[module-name]', [params]],
    queryFn: () => [ModuleName]ClientService.[methodName]([params]),
    staleTime: 1000 * 60 * 5, // 根据需求调整
  });
}

export function useCreate[ModuleName]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: [ModuleName]ClientService.[methodName],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[module-name]'] });
    },
  });
}
```

---

## 结语

这个迁移计划旨在将项目中混乱的数据请求逻辑统一为标准的 **Service + React Query Hooks** 架构。

**核心收益:**
- 📉 代码量减少 20-60%
- ⚡ 性能提升 (缓存、预取、后台刷新)
- 🔒 类型安全 (完整的 TypeScript 支持)
- 🧪 可测试性 (Service 层可独立测试)
- 🔄 可复用性 (Service 可在多处使用)

**执行建议:**
- 优先迁移 Articles 和 Blog 模块 (收益最大)
- 逐步补充其他模块的 Service 层
- 保持代码风格一致性
- 及时更新文档

---

**文档维护者:** GitHub Copilot  
**最后更新:** 2025-11-10  
**版本:** v1.0.0
