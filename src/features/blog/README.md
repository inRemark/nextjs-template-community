# Blog Feature 模块

博客功能模块，提供博客文章展示、筛选、搜索等功能。

## 📋 目录结构

```
blog/
├── components/              # 博客组件
│   ├── blog-post-card.tsx         # 文章卡片
│   ├── blog-post-list.tsx         # 文章列表
│   ├── blog-category-filter.tsx   # 分类筛选
│   ├── blog-search-box.tsx        # 搜索框
│   └── blog-pagination.tsx        # 分页组件
├── hooks/                   # React Hooks
│   └── useBlog.ts           # 博客相关 Hooks
├── types/                   # 类型定义
│   └── blog.ts              # 博客类型
├── index.ts                 # 导出入口
└── README.md                # 说明文档
```

## 🎯 核心功能

### 1. 博客文章管理
- ✅ 文章列表展示
- ✅ 文章详情查看
- ✅ 分类筛选
- ✅ 标签筛选
- ✅ 全文搜索
- ✅ 分页导航

### 2. 复用组件
- ✅ BlogPostCard - 文章卡片组件
- ✅ BlogPostList - 文章列表组件
- ✅ BlogCategoryFilter - 分类筛选器
- ✅ BlogSearchBox - 搜索框
- ✅ BlogPagination - 分页组件

### 3. 数据获取 Hooks
- ✅ useBlog - 获取文章列表
- ✅ useBlogPost - 获取文章详情
- ✅ useBlogCategories - 获取分类列表
- ✅ useBlogTags - 获取标签列表
- ✅ useBlogSearch - 搜索文章

## 📦 使用示例

### 1. 使用文章列表组件

```typescript
import { useBlog } from '@features/blog';
import { BlogPostList, BlogPagination } from '@features/blog';

function BlogListPage() {
  const [page, setPage] = useState(1);
  const { posts, loading, pagination } = useBlog({}, page, 10);

  return (
    <div>
      <BlogPostList posts={posts} loading={loading} />
      {pagination && (
        <BlogPagination
          pagination={pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

### 2. 使用分类筛选

```typescript
import { useBlog, useBlogCategories } from '@features/blog';
import { BlogCategoryFilter } from '@features/blog';

function BlogWithFilter() {
  const [category, setCategory] = useState('all');
  const { categories } = useBlogCategories();
  const { posts } = useBlog({ category: category === 'all' ? undefined : category });

  return (
    <div>
      <BlogCategoryFilter
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />
      <BlogPostList posts={posts} />
    </div>
  );
}
```

### 3. 使用搜索功能

```typescript
import { useBlogSearch } from '@features/blog';
import { BlogSearchBox, BlogPostList } from '@features/blog';

function BlogSearch() {
  const [query, setQuery] = useState('');
  const { results, loading } = useBlogSearch(query);

  return (
    <div>
      <BlogSearchBox onSearch={setQuery} />
      <BlogPostList posts={results} loading={loading} />
    </div>
  );
}
```

### 4. 单个文章卡片

```typescript
import { BlogPostCard } from '@features/blog';

function FeaturedPost({ post }) {
  return (
    <BlogPostCard 
      post={post}
      categoryName="精选"
      className="max-w-sm"
    />
  );
}
```

## 📊 类型定义

### StaticBlogPost

```typescript
interface StaticBlogPost {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    author: string;
    tags: string[];
    category: string;
    excerpt: string;
    coverImage?: string;
    featured?: boolean;
    readTime?: number;
  };
  content: string; // Markdown content
}
```

### BlogFilters

```typescript
interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
```

### PaginationData

```typescript
interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

## 🎨 组件 API

### BlogPostCard

文章卡片组件

**Props:**
- `post: StaticBlogPost` - 文章数据
- `categoryName?: string` - 分类名称（可选）
- `className?: string` - 自定义样式

### BlogPostList

文章列表组件

**Props:**
- `posts: StaticBlogPost[]` - 文章数组
- `loading?: boolean` - 加载状态
- `emptyMessage?: string` - 空状态提示
- `className?: string` - 自定义样式

### BlogCategoryFilter

分类筛选器

**Props:**
- `categories: BlogCategory[]` - 分类列表
- `selectedCategory: string` - 当前选中分类
- `onCategoryChange: (slug: string) => void` - 分类变更回调
- `showAll?: boolean` - 是否显示"全部"选项
- `className?: string` - 自定义样式

### BlogSearchBox

搜索框组件

**Props:**
- `onSearch: (query: string) => void` - 搜索回调
- `placeholder?: string` - 占位符文本
- `className?: string` - 自定义样式

### BlogPagination

分页组件

**Props:**
- `pagination: PaginationData` - 分页数据
- `onPageChange: (page: number) => void` - 页码变更回调
- `maxVisiblePages?: number` - 最多显示页码数（默认 5）
- `className?: string` - 自定义样式

## 🔧 Hooks API

### useBlog

获取博客文章列表

```typescript
const { posts, loading, error, pagination, refetch } = useBlog(
  filters?: BlogFilters,
  page?: number,
  limit?: number
);
```

### useBlogPost

获取单篇文章详情

```typescript
const { post, relatedPosts, loading, error, refetch } = useBlogPost(slug: string);
```

### useBlogCategories

获取分类列表

```typescript
const { categories, loading, error, refetch } = useBlogCategories();
```

### useBlogTags

获取标签列表

```typescript
const { tags, loading, error, refetch } = useBlogTags();
```

### useBlogSearch

搜索文章

```typescript
const { results, loading, error } = useBlogSearch(query: string);
```

## 🌟 复用场景

### 1. 博客列表页
- 使用 BlogPostList + BlogPagination
- 使用 BlogCategoryFilter 筛选
- 使用 BlogSearchBox 搜索

### 2. 首页精选文章
- 使用 BlogPostCard 展示精选文章
- 限制显示数量

### 3. 相关文章推荐
- 使用 BlogPostList 展示相关文章
- 使用 grid 布局

### 4. 分类归档页
- 使用 BlogCategoryFilter 导航
- 使用 BlogPostList 展示分类文章

## 📝 集成指南

### 在页面中使用

```typescript
// app/blog/page.tsx
import { 
  useBlog, 
  useBlogCategories,
  BlogPostList,
  BlogCategoryFilter,
  BlogSearchBox,
  BlogPagination 
} from '@features/blog';

export default function BlogPage() {
  const [filters, setFilters] = useState<BlogFilters>({});
  const [page, setPage] = useState(1);
  
  const { posts, loading, pagination } = useBlog(filters, page);
  const { categories } = useBlogCategories();

  return (
    <div>
      <BlogSearchBox onSearch={(q) => setFilters({ ...filters, search: q })} />
      <BlogCategoryFilter
        categories={categories}
        selectedCategory={filters.category || 'all'}
        onCategoryChange={(cat) => setFilters({ ...filters, category: cat })}
      />
      <BlogPostList posts={posts} loading={loading} />
      {pagination && (
        <BlogPagination pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}
```

## ⚠️ 注意事项

1. **数据源**: 当前使用静态 Markdown 文件作为数据源
2. **SEO 优化**: 文章详情页应使用 SSG 或 ISR
3. **图片优化**: 使用 Next.js Image 组件
4. **缓存策略**: 文章列表可以适当缓存

## 🚀 后续计划

- [ ] 添加文章评论功能
- [ ] 添加文章点赞/收藏
- [ ] 支持文章目录（TOC）
- [ ] 支持代码高亮
- [ ] 支持多语言
- [ ] RSS 订阅

---

**版本**: v1.0.0  
**创建时间**: 2025-10-26  
**作者**: VSeek Team
