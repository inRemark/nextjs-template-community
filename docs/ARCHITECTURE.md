# 项目架构文档

> Next.js 15 全栈应用架构设计  
> 版本: 1.0.0  
> 更新时间: 2025-10-27

## 目录

- [技术栈](#技术栈)
- [架构设计](#架构设计)
- [模块划分](#模块划分)
- [数据流](#数据流)
- [认证架构](#认证架构)
- [数据库设计](#数据库设计)
- [API 设计](#api-设计)
- [性能优化](#性能优化)

---

## 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.1.6 | React 框架，App Router |
| React | 19.1.0 | UI 组件库 |
| TypeScript | 5.6.3 | 类型系统 |
| Tailwind CSS | 3.x | 原子化 CSS |
| Radix UI | 最新 | 无障碍 UI 组件 |
| React Query | 5.90.5 | 数据状态管理 |
| React Hook Form | 7.64.0 | 表单处理 |
| Zod | 4.1.12 | Schema 验证 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| NextAuth.js | 4.24.10 | 认证系统 |
| Prisma | 6.16.1 | ORM 框架 |
| PostgreSQL | 14+ | 关系型数据库 |
| Bcrypt | 3.0.2 | 密码加密 |
| JSON Web Token | 9.0.2 | JWT 生成/验证 |
| Nodemailer | 最新 | 邮件发送 |

### 开发工具

- **包管理器**: pnpm 8+
- **代码检查**: ESLint
- **类型检查**: TypeScript
- **容器化**: Docker + Docker Compose

---

## 架构设计

### 整体架构

```bash
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Browser    │  │    Mobile    │  │   Desktop    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│                   Next.js Server                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │            App Router (src/app/)                │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │    │
│  │  │  Pages  │  │   API   │  │ Layout  │          │    │
│  │  └─────────┘  └─────────┘  └─────────┘          │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Features Layer (src/features/)          │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │    │
│  │  │ Auth │ │ Blog │ │Article│ │ User │           │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘            │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Shared Layer (src/shared/)             │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │    │
│  │  │  UI  │ │Hooks │ │Utils │ │Layout│            │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘            │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Core Layer (src/lib/)                 │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │    │
│  │  │ DB   │ │Cache │ │ Log  │ │Error │            │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘            │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  Data Layer                             │
│  ┌──────────────┐              ┌──────────────┐         │
│  │  PostgreSQL  │              │    Cache     │         │
│  │   Database   │              │   (Optional) │         │
│  └──────────────┘              └──────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### 分层架构

#### 1. Presentation Layer (展示层)

**位置**: `src/app/`

- **Pages**: 页面组件，基于文件系统路由
- **Layouts**: 布局组件，共享页面结构
- **API Routes**: RESTful API 端点

**职责**:

- 处理 HTTP 请求/响应
- 页面渲染和路由
- 客户端状态管理

#### 2. Feature Layer (功能层)

**位置**: `src/features/`

每个功能模块独立组织:

```bash
features/[module]/
├── components/     # UI 组件
├── hooks/          # React Hooks
├── services/       # 业务逻辑
├── types/          # TypeScript 类型
├── validators/     # 数据验证
└── index.ts        # 统一导出
```

**职责**:

- 业务逻辑封装
- 数据验证
- API 调用
- 状态管理

#### 3. Shared Layer (共享层)

**位置**: `src/shared/`

```bash
shared/
├── components/     # 通用组件
│   └── ui/        # Radix UI 组件
├── hooks/          # 通用 Hooks
├── layout/         # 布局组件
├── lib/            # 工具函数
├── types/          # 全局类型
└── utils/          # 工具函数
```

**职责**:

- 可复用 UI 组件
- 通用工具函数
- 全局类型定义

#### 4. Core Layer (核心层)

**位置**: `src/lib/`

```bash
lib/
├── database/       # 数据库连接
├── cache/          # 缓存管理
├── logger/         # 日志系统
├── errors/         # 错误处理
└── utils/          # 核心工具
```

**职责**:

- 基础设施服务
- 数据库操作
- 日志记录
- 错误处理

---

## 模块划分

### 核心模块

#### 1. 认证模块 (Auth)

**路径**: `src/features/auth/`

**功能**:

- 邮箱密码登录
- OAuth 认证 (Google/GitHub)
- JWT Token 管理
- Session 管理
- 权限控制

**关键文件**:

- `services/auth.service.ts` - 认证业务逻辑
- `components/protected-route.tsx` - 路由保护
- `components/unified-auth-provider.tsx` - 认证上下文

#### 2. 文章模块 (Articles)

**路径**: `src/features/articles/`

**功能**:

- CRUD 操作
- 文章列表/详情
- 标签管理
- 浏览统计

**关键文件**:

- `services/article.service.ts` - 业务逻辑
- `validators/article.validator.ts` - 数据验证
- `types/article.types.ts` - 类型定义

#### 3. 博客模块 (Blog)

**路径**: `src/features/blog/`

**功能**:

- Markdown 渲染
- 博客列表/详情
- SEO 优化

#### 4. 用户模块 (User)

**路径**: `src/features/user/`

**功能**:

- 个人资料管理
- 账户设置
- 文章管理

#### 5. 控制台模块 (Console)

**路径**: `src/features/console/`

**功能**:

- 用户控制台
- 文章管理
- 个人设置

#### 6. 管理后台 (Admin)

**路径**: `src/features/admin/`

**功能**:

- 用户管理
- 内容审核
- 系统配置

---

## 数据流

### SSR 数据流

```bash
Client Request
      ↓
Next.js Server
      ↓
Server Component
      ↓
Prisma ORM
      ↓
PostgreSQL
      ↓
Data Response
      ↓
HTML Rendering
      ↓
Client Hydration
```

### CSR 数据流

```bash
User Action
      ↓
React Component
      ↓
React Query
      ↓
API Route (/api/*)
      ↓
Service Layer
      ↓
Prisma ORM
      ↓
PostgreSQL
      ↓
JSON Response
      ↓
State Update
      ↓
UI Re-render
```

### 认证数据流

```bash
Login Request
      ↓
NextAuth Handler
      ↓
Credentials Provider
      ↓
User Validation
      ↓
JWT Generation
      ↓
Session Storage
      ↓
Cookie Set
      ↓
Authenticated State
```

---

## 认证架构

### NextAuth 配置

**文件**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
策略: JWT
Providers:
  - Credentials (邮箱密码)
  - Google OAuth
  - GitHub OAuth

JWT 配置:
  - 加密算法: HS256
  - 过期时间: 30天
  - 自动刷新: 支持
```

### 权限控制

#### 角色定义

```typescript
enum UserRole {
  ADMIN   // 管理员 - 完全权限
  EDITOR  // 编辑 - 内容管理
  USER    // 用户 - 基础权限
}
```

#### 权限矩阵

| 功能 | USER | EDITOR | ADMIN |
|------|------|--------|-------|
| 查看文章 | ✓ | ✓ | ✓ |
| 创建文章 | ✓ | ✓ | ✓ |
| 编辑自己的文章 | ✓ | ✓ | ✓ |
| 编辑所有文章 | ✗ | ✓ | ✓ |
| 删除文章 | ✗ | ✓ | ✓ |
| 用户管理 | ✗ | ✗ | ✓ |
| 系统配置 | ✗ | ✗ | ✓ |

### 路由保护

#### Server-Side 保护

```typescript
// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/console/:path*",
    "/admin/:path*",
    "/profile/:path*"
  ]
};
```

#### Client-Side 保护

```typescript
<ProtectedRoute requiredRole="ADMIN">
  <AdminPanel />
</ProtectedRoute>
```

---

## 数据库设计

### ER 图

```bash
┌─────────────┐
│    User     │
├─────────────┤
│ id          │──┐
│ email       │  │
│ name        │  │
│ password    │  │
│ role        │  │
└─────────────┘  │
                 │ 1:N
                 │
                 ▼
         ┌─────────────┐
         │   Article   │
         ├─────────────┤
         │ id          │
         │ title       │
         │ content     │
         │ authorId    │──┐
         │ published   │  │
         └─────────────┘  │
                          │ FK
                          │
         ┌────────────────┘
         │
┌─────────────┐
│   Session   │
├─────────────┤
│ id          │
│ userId      │──────► User.id
│ token       │
│ expires     │
└─────────────┘

┌──────────────────────┐
│   Account            │
├──────────────────────┤
├──────────────────────┤
│ id                   │
│ userId               │──────► User.id
│ provider             │
│ providerAccountId    │
└──────────────────────┘
```

### 核心表结构

#### users 表

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  password VARCHAR,
  role VARCHAR DEFAULT 'USER',
  email_verified TIMESTAMP,
  image VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### articles 表

```sql
CREATE TABLE articles (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR,
  cover_image VARCHAR,
  author_id VARCHAR NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  tags VARCHAR[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_published ON articles(published, published_at);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);
```

### 数据库优化

#### 1. 索引策略

- **单列索引**: email, slug, role
- **复合索引**: (published, published_at)
- **全文索引**: tags (GIN)

#### 2. 查询优化

```typescript
// ✓ 使用 select 减少数据传输
prisma.article.findMany({
  select: {
    id: true,
    title: true,
    excerpt: true,
    author: {
      select: { name: true }
    }
  }
});

// ✓ 使用 include 减少查询次数
prisma.article.findUnique({
  include: { author: true }
});
```

#### 3. 分页优化

```typescript
// 使用 cursor-based 分页
const articles = await prisma.article.findMany({
  take: 10,
  skip: 1,
  cursor: { id: lastId }
});
```

---

## API 设计

### RESTful API 规范

#### 命名规范

```bash
GET    /api/articles         # 列表
GET    /api/articles/:id     # 详情
POST   /api/articles         # 创建
PATCH  /api/articles/:id     # 更新
DELETE /api/articles/:id     # 删除
```

#### 响应格式

**成功响应**:

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": { ... }
  }
}
```

#### 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### API 认证

#### JWT Token

```http
Authorization: Bearer <JWT_TOKEN>
```

#### Token 刷新

```bash
GET /api/auth/refresh
Response: { token: string, expiresIn: number }
```

---

## 性能优化

### 1. 渲染优化

#### Server Components

```typescript
// 默认使用 Server Component
export default async function Page() {
  const data = await fetchData();
  return <View data={data} />;
}
```

#### Client Components

```typescript
'use client'
// 仅在需要交互时使用
export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <div onClick={() => setState(...)} />;
}
```

### 2. 数据缓存

#### React Query 缓存

```typescript
const { data } = useQuery({
  queryKey: ['articles', id],
  queryFn: () => fetchArticle(id),
  staleTime: 5 * 60 * 1000, // 5分钟
  cacheTime: 10 * 60 * 1000  // 10分钟
});
```

#### Next.js 缓存

```typescript
// 路由段缓存
export const revalidate = 3600; // 1小时

// 数据缓存
fetch(url, { next: { revalidate: 3600 } });
```

### 3. 代码分割

```typescript
// 动态导入
const DynamicComponent = dynamic(
  () => import('./HeavyComponent'),
  { loading: () => <Skeleton /> }
);
```

### 4. 图片优化

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Description"
  priority={false}
  loading="lazy"
/>
```

### 5. Bundle 优化

**next.config.ts**:

```typescript
const config = {
  experimental: {
    reactCompiler: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};
```

---

## 安全架构

### 1. 认证安全

- JWT Token 加密存储
- Password 使用 bcrypt 加密（10 rounds）
- Session 定期过期
- CSRF 保护

### 2. 数据验证

```typescript
// Zod Schema 验证
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

### 3. SQL 注入防护

- 使用 Prisma ORM 参数化查询
- 禁止原始 SQL 查询

### 4. XSS 防护

- React 自动转义
- DOMPurify 清理 HTML

---

## 扩展性设计

### 1. 模块化架构

- 功能模块独立
- 低耦合高内聚
- 易于添加新功能

### 2. 可配置化

- 环境变量配置
- 功能开关
- 主题定制

### 3. 可测试性

- 单元测试覆盖
- 集成测试支持
- E2E 测试框架

---

## 监控与日志

### 日志系统

**文件**: `src/lib/logger/`

```typescript
logger.info('操作成功', { userId, action });
logger.error('操作失败', { error, context });
logger.warn('警告信息', { details });
```

### 错误追踪

- 统一错误处理
- 错误边界组件
- 错误日志记录

---

## 部署架构

### 生产环境

```bash
┌─────────────┐
│   Nginx     │ ──► 负载均衡 + SSL
└──────┬──────┘
       │
┌──────▼──────┐
│  Next.js    │ ──► 应用服务器
│  Container  │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │ ──► 数据库
└─────────────┘
```

### 容器化

- Docker 多阶段构建
- Docker Compose 本地开发
- 环境变量注入
- 健康检查

---

**文档版本**: 1.0.0  
**维护者**: Template Team  
**更新日期**: 2025-10-01
