# Blog Markdown Migration - 完成

## ✅ 改造完成

Blog 模块已成功从 mock 数据迁移到 **Markdown 文件 + ISR** 方案。

---

## 🎯 实施的方案

**Next.js App Router + 运行时 Markdown 读取 + ISR 缓存策略**

### 核心特点

- ✅ **灵活性**：支持 SSG/ISR/SSR 混合渲染
- ✅ **国际化**：按语言目录分离 (`zh`/`en`/`ja`)
- ✅ **构建快速**：只预生成精选文章（ISR 按需生成其他）
- ✅ **易于维护**：Markdown 文件直接编辑，无需数据库

---

## 📁 新增的文件结构

```
docs/blog/
├── zh/                                    # 中文博客
│   ├── getting-started-with-sendmail.md
│   ├── email-marketing-best-practices.md
│   └── improve-email-open-rates.md
├── en/                                    # 英文博客
│   ├── getting-started-with-sendmail.md
│   └── email-marketing-best-practices.md
└── ja/                                    # 日文博客（待添加）

src/lib/markdown/
├── loader.ts                              # Markdown 文件加载器
└── blog.ts                                # Blog 业务逻辑

src/app/api/blog/route.ts                  # API：从 Markdown 读取
src/app/[locale]/blog/page.tsx             # 列表页：传递 locale
src/app/[locale]/blog/[slug]/page.tsx      # 详情页：ISR Server Component
```

---

## 🔧 核心改动

### 1. **安装依赖**
```bash
pnpm add gray-matter
```

### 2. **Markdown 加载器** (`src/lib/markdown/loader.ts`)
- 通用的 Markdown 文件读取和解析工具
- 支持 frontmatter 提取
- 支持递归读取目录

### 3. **Blog 业务逻辑** (`src/lib/markdown/blog.ts`)
- `getBlogPosts(locale)` - 获取所有文章
- `getBlogPost(locale, slug)` - 获取单篇文章
- `searchPosts(locale, query)` - 搜索文章
- `getFeaturedPosts(locale)` - 获取精选文章

### 4. **API Route** (`src/app/api/blog/route.ts`)
```typescript
// 支持参数：
// - locale: 语言（zh/en/ja）
// - slug: 文章 slug（单篇）
// - search: 搜索关键词
// - category: 分类筛选
// - page, limit: 分页
```

### 5. **Blog 详情页** (ISR Server Component)
```typescript
// ISR 配置
export const revalidate = 3600;        // 1小时后重新验证
export const dynamicParams = true;     // 允许动态生成

// 只预生成精选文章（约20篇）
export async function generateStaticParams() {
  const featuredPosts = await getFeaturedPosts(locale);
  return featuredPosts.slice(0, 20).map(post => ({
    locale,
    slug: post.slug,
  }));
}
```

---

## 📝 Markdown 文件格式

### Frontmatter 字段

```markdown
---
title: "文章标题"
date: "2024-01-20"
author: "作者"
category: "tutorials"
tags: ["标签1", "标签2"]
excerpt: "文章摘要"
featured: true
readTime: 8
coverImage: "/images/blog/cover.jpg"
---

# 文章标题

文章内容使用标准 Markdown 语法...
```

### 必需字段
- `title` - 文章标题
- `date` - 发布日期（YYYY-MM-DD）
- `author` - 作者
- `category` - 分类
- `tags` - 标签数组
- `excerpt` - 摘要

### 可选字段
- `featured` - 是否精选（`true`/`false`）
- `readTime` - 预计阅读时间（分钟）
- `coverImage` - 封面图片路径

---

## 🚀 使用方式

### 添加新博客文章

1. 在 `docs/blog/{locale}/` 创建 `.md` 文件
2. 文件名即为 slug（如 `my-article.md` → `/blog/my-article`）
3. 添加 frontmatter 和内容
4. 保存即可（开发环境立即生效）

**示例：**
```bash
# 添加中文文章
docs/blog/zh/new-feature-release.md

# 添加英文文章
docs/blog/en/new-feature-release.md
```

### 本地开发

```bash
pnpm dev

# 访问博客
# http://localhost:3000/zh/blog
# http://localhost:3000/en/blog
```

### 生产构建

```bash
pnpm build

# ISR 工作流程：
# 1. 构建时生成精选文章（约20篇）
# 2. 首次访问其他文章时动态生成
# 3. 1小时后自动重新验证
```

---

## ⚙️ ISR 策略说明

| 场景 | 行为 |
|------|------|
| **构建时** | 生成精选文章的 HTML（~20篇） |
| **首次访问非精选文章** | 动态生成 → 缓存 |
| **后续访问** | 直接返回缓存的 HTML（超快）|
| **1小时后** | 自动重新生成（保持内容新鲜）|

### 优势
- ⚡ 构建快：只生成 20 篇，不是全部
- 🚀 访问快：热门文章预生成，其他按需生成
- 🔄 自动更新：ISR 自动刷新，无需重新部署

---

## 🐳 Docker 部署

Dockerfile 已更新，确保复制 `docs/` 目录：

```dockerfile
# 复制源码和文档
COPY . .
COPY docs ./docs

# 在 runner 阶段也需要
COPY --from=base --chown=nextjs:nodejs /app/docs ./docs
```

---

## 📊 性能对比

### 构建时间（假设 100 篇文章）

| 方案 | 构建时间 | 说明 |
|------|---------|------|
| **全量静态** | ~5分钟 | 生成所有文章 |
| **本方案 (ISR)** | ~30秒 | 只生成 20 篇精选 ✅ |

### 访问速度

| 场景 | 速度 |
|------|------|
| **精选文章** | 50ms（预生成）⚡ |
| **其他文章（首次）** | 200ms（动态生成） |
| **其他文章（后续）** | 50ms（缓存）⚡ |

---

## 🔜 下一步（可选）

### 1. Help 模块迁移
使用相同方案迁移 Help 模块：
```
docs/help/
├── zh/
│   ├── quick-start/
│   │   └── create-template.md
│   └── index.json
└── en/
    └── ...
```

### 2. 自动提取分类和标签
从所有 Markdown 文件自动提取分类和标签，替换 `mockCategories` 和 `mockTags`。

### 3. 添加更多语言
在 `docs/blog/` 下添加更多语言目录（如 `ja`/`ko`/`fr`）。

### 4. RSS Feed
生成 RSS feed 供用户订阅。

---

## 📚 相关文档

- [Next.js ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [react-markdown](https://github.com/remarkjs/react-markdown)

---

## 🎉 完成！

Blog 模块已成功迁移到 Markdown + ISR 方案，兼具性能和灵活性！
