# Articles Feature 模块

文章管理功能模块，提供完整的 CRUD 操作、统计分析等功能。这是一个标准化的业务模块示例，展示了如何在模板中正确实现业务功能。

## 📋 目录结构

```
articles/
├── components/              # UI 组件（可选）
├── hooks/                   # React Hooks
│   └── useArticles.ts       # 文章相关 Hooks
├── services/                # 业务逻辑服务（必需）
│   └── article.service.ts   # 文章服务
├── types/                   # 类型定义（必需）
│   └── article.types.ts     # 文章类型
├── validators/              # 数据验证（可选）
│   └── article.schema.ts    # Zod 验证规则
├── index.ts                 # 导出入口
└── README.md                # 说明文档
```

## 🎯 核心功能

### 1. 文章管理 (CRUD)
- ✅ 创建文章
- ✅ 更新文章
- ✅ 删除文章
- ✅ 文章列表查询（分页、筛选、搜索）
- ✅ 文章详情查看
- ✅ 浏览次数统计

### 2. 数据验证
- ✅ Zod Schema 验证
- ✅ 标题长度验证
- ✅ Slug 格式验证
- ✅ 标签数量限制
- ✅ 封面图片 URL 验证

### 3. 权限控制
- ✅ 作者权限验证
- ✅ 管理员权限支持
- ✅ Session 认证集成

### 4. 统计功能
- ✅ 文章总数统计
- ✅ 发布/草稿数量
- ✅ 浏览次数统计
- ✅ 热门标签分析
- ✅ 最新文章列表

## 📦 数据模型

### Prisma Schema

```prisma
model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  excerpt     String?
  coverImage  String?
  authorId    String
  published   Boolean  @default(false)
  publishedAt DateTime?
  viewCount   Int      @default(0)
  tags        String[] @default([])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  @@index([authorId])
  @@index([published, publishedAt])
  @@index([slug])
  @@map("articles")
}
```

## 🚀 使用示例

### 1. 在组件中使用 Hooks

```typescript
import { useArticles, useArticle, useArticleStats } from '@features/articles';

// 获取文章列表
function ArticleList() {
  const { articles, loading, pagination, refetch } = useArticles({
    published: true,
    page: 1,
    limit: 10,
  });

  return (
    <div>
      {loading ? (
        <div>加载中...</div>
      ) : (
        articles.map((article) => (
          <div key={article.id}>{article.title}</div>
        ))
      )}
    </div>
  );
}

// 获取单篇文章
function ArticleDetail({ id }: { id: string }) {
  const { article, loading, incrementView } = useArticle(id);

  useEffect(() => {
    if (article) {
      incrementView(); // 增加浏览次数
    }
  }, [article, incrementView]);

  return <div>{article?.title}</div>;
}

// 获取统计信息
function ArticleStats() {
  const { stats, loading } = useArticleStats();

  return (
    <div>
      <p>总文章数: {stats?.totalArticles}</p>
      <p>已发布: {stats?.publishedArticles}</p>
      <p>草稿: {stats?.draftArticles}</p>
    </div>
  );
}
```

### 2. 直接调用服务层

```typescript
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleById,
  incrementArticleView,
} from '@features/articles';

// 服务端组件中使用
async function ArticlePage() {
  const { articles } = await getArticles({
    published: true,
    limit: 10,
  });

  return <div>{/* 渲染文章 */}</div>;
}

// API 路由中使用
export async function POST(request: Request) {
  const data = await request.json();
  const article = await createArticle(data, userId);
  return Response.json(article);
}
```

### 3. 使用验证器

```typescript
import { createArticleSchema, updateArticleSchema } from '@features/articles';

// 验证创建数据
const result = createArticleSchema.safeParse(formData);
if (!result.success) {
  console.error('验证失败:', result.error.issues);
  return;
}

// 使用验证后的数据
const article = await createArticle(result.data, userId);
```

## 🔌 API 端点

### 文章列表
**GET** `/api/articles`

查询参数：
- `page` - 页码（默认: 1）
- `limit` - 每页数量（默认: 10）
- `sortBy` - 排序字段（createdAt | updatedAt | publishedAt | viewCount | title）
- `sortOrder` - 排序方向（asc | desc）
- `authorId` - 作者 ID
- `published` - 发布状态（true | false）
- `tags` - 标签列表（逗号分隔）
- `search` - 搜索关键词

响应示例：
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 创建文章
**POST** `/api/articles`

请求体：
```json
{
  "title": "文章标题",
  "slug": "article-slug",
  "content": "文章内容",
  "excerpt": "文章摘要",
  "coverImage": "https://example.com/image.jpg",
  "tags": ["tag1", "tag2"],
  "published": false
}
```

### 获取单篇文章
**GET** `/api/articles/[id]`

### 更新文章
**PATCH** `/api/articles/[id]`

### 删除文章
**DELETE** `/api/articles/[id]`

### 增加浏览次数
**POST** `/api/articles/[id]/view`

### 获取统计信息
**GET** `/api/articles/stats?authorId=xxx`

## 📊 类型定义

完整的类型定义请查看 `types/article.types.ts`，包括：

- `Article` - 文章基础类型
- `CreateArticleRequest` - 创建请求
- `UpdateArticleRequest` - 更新请求
- `ArticleFilters` - 筛选条件
- `ArticleListParams` - 列表查询参数
- `ArticleStats` - 统计信息
- 更多...

## 🔧 工具函数

### generateSlug
生成 URL 友好的 slug

```typescript
import { generateSlug } from '@features/articles';

const slug = generateSlug('这是一篇文章'); // "zhe-shi-yi-pian-wen-zhang"
```

### isSlugUnique
验证 slug 唯一性

```typescript
const isUnique = await isSlugUnique('my-article-slug');
```

### extractExcerpt
从内容提取摘要

```typescript
const excerpt = extractExcerpt(htmlContent, 200);
```

### getAllTags
获取所有已发布文章的标签

```typescript
const tags = await getAllTags();
```

## 🎨 开发指南

### 1. 添加新字段

如果需要添加新字段（例如：阅读时间）：

1. 更新 Prisma Schema
```prisma
model Article {
  // ... 现有字段
  readingTime Int? // 阅读时间（分钟）
}
```

2. 运行迁移
```bash
npx prisma migrate dev --name add_reading_time
```

3. 更新类型定义
```typescript
export interface Article {
  // ... 现有字段
  readingTime?: number;
}
```

4. 更新验证规则
```typescript
export const articleSchema = z.object({
  // ... 现有规则
  readingTime: z.number().int().positive().optional(),
});
```

### 2. 添加新查询

在 `services/article.service.ts` 中添加：

```typescript
export async function getPopularArticles(limit: number = 10) {
  return prisma.article.findMany({
    where: { published: true },
    orderBy: { viewCount: 'desc' },
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}
```

### 3. 添加新 Hook

在 `hooks/useArticles.ts` 中添加：

```typescript
export function usePopularArticles(limit: number = 10) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/popular?limit=${limit}`)
      .then(res => res.json())
      .then(data => setArticles(data.data))
      .finally(() => setLoading(false));
  }, [limit]);

  return { articles, loading };
}
```

## ⚠️ 注意事项

1. **权限控制**: 确保所有修改操作都进行了权限验证
2. **数据验证**: 使用 Zod Schema 进行严格的数据验证
3. **错误处理**: 所有 API 端点都应有完善的错误处理
4. **性能优化**: 
   - 使用索引优化查询
   - 适当使用分页
   - 考虑缓存策略
5. **SEO 优化**: 
   - Slug 应该是 URL 友好的
   - 使用 Next.js 的 Metadata API

## 🌟 最佳实践

1. **Slug 生成**: 创建文章时自动从标题生成 slug
2. **摘要提取**: 如果未提供摘要，自动从内容提取
3. **发布时间**: 发布文章时自动设置 publishedAt
4. **浏览统计**: 使用防抖或节流避免频繁更新
5. **软删除**: 考虑实现软删除功能（添加 deletedAt 字段）

## 🚀 扩展建议

- [ ] 添加文章分类功能
- [ ] 添加文章评论功能
- [ ] 支持 Markdown 编辑器
- [ ] 添加版本历史
- [ ] 支持多语言文章
- [ ] 添加文章模板
- [ ] 实现草稿自动保存
- [ ] 添加 SEO 元数据管理
- [ ] 支持文章定时发布
- [ ] 添加相关文章推荐

---

**版本**: v1.0.0  
**创建时间**: 2025-10-26  
**模块类型**: 业务示例模块  
**作者**: Next.js Template Team
