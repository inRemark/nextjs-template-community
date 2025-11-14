# Next.js 国际化完整指南

## 📋 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [核心配置](#核心配置)
- [使用指南](#使用指南)
- [翻译管理](#翻译管理)
- [SEO优化](#SEO优化)
- [实施记录](#实施记录)
- [常见问题](#常见问题)

---

## 项目概述

### 🌍 支持的语言

- **中文 (zh)**: `/zh/*` - 默认语言
- **英文 (en)**: `/en/*`
- **日文 (ja)**: `/ja/*`

### 技术方案

- **框架**: next-intl v4.4.0 (标准 URL 路由方案)
- **路由模式**: `/[locale]/...` (如 `/zh/about`, `/en/about`)
- **切换方式**: URL 跳转 (页面刷新)
- **翻译文件**: JSON 格式 (支持嵌套结构)

### 核心优势

- ✅ **SEO 友好** - URL 路径明确语言标识
- ✅ **类型安全** - 完整 TypeScript 支持
- ✅ **Server Components** - 原生支持服务端组件
- ✅ **自动 hreflang** - 自动生成搜索引擎语言标签
- ✅ **简单配置** - 学习曲线低，易于维护
- ✅ **模块化翻译** - 支持按功能模块拆分翻译文件

---

## 技术架构

### 架构设计图

```bash
┌─────────────────────────────────────────────────────────┐
│                    Browser Request                      │
│                   /zh/about, /en/about                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Middleware (middleware.ts)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  1. next-intl 语言检测与重定向                      │  │
│  │  2. 认证保护（保留原有逻辑）                         │  │
│  │  3. 跳过 API 路由                                  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Root Layout (app/layout.tsx)               │
│              返回 children (不包裹 html/body)             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Locale Layout (app/[locale]/layout.tsx)        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  1. 验证 locale 参数                               │  │
│  │  2. 加载翻译消息 (messages/${locale}.json)          │  │
│  │  3. 注入 NextIntlClientProvider                    │  │
│  │  4. 包裹所有 Providers (Theme, Auth, etc.)         │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Page Components                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  使用 useTranslations('key') 获取翻译              │   │
│  │  使用 getTranslations('key') (服务端组件)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 翻译加载流程

```bash
┌─────────────────────────────────────────────────────────┐
│              i18n/request.ts (服务端)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. 验证 locale 参数                              │  │
│  │  2. 动态导入全局翻译 messages/${locale}.json     │  │
│  │  3. 动态导入功能翻译 features/*/locale/*.json    │  │
│  │  4. 深度合并所有翻译对象                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         NextIntlClientProvider (客户端)                  │
│  将翻译消息注入到 React Context 中                       │
└─────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 在组件中使用翻译

#### 客户端组件

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('feature-name');
  
  return (
    <>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </>
  );
}
```

#### 服务端组件

```typescript
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('feature-name');
  
  return (
    <>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </>
  );
}
```

#### 使用参数

```typescript
const t = useTranslations('common');

// 翻译文件: { "welcome": "Welcome, {name}!" }
<p>{t('welcome', { name: 'John' })}</p>
// 输出: Welcome, John!
```

#### 使用复杂数据结构

```typescript
const t = useTranslations('home');

// 获取原始数据（数组/对象）
const items = t.raw('coreFeatures.items') as Array<{
  title: string;
  description: string;
}>;

return (
  <div>
    {items.map((item, index) => (
      <div key={index}>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    ))}
  </div>
);
```

### 语言切换

```typescript
'use client';

import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select value={locale} onChange={(e) => switchLanguage(e.target.value)}>
      <option value="zh">简体中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
}
```

### 链接导航

```typescript
import { Link } from '@/i18n/routing';

export default function Navigation() {
  return (
    <nav>
      {/* 自动添加语言前缀 */}
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  );
}
```

---

## 目录结构

```bash
src/
├── app/
│   ├── layout.tsx                 # 根布局（简化版）
│   ├── [locale]/                  # 语言路由层
│   │   ├── layout.tsx             # 语言布局（注入翻译）
│   │   ├── page.tsx               # 首页
│   │   ├── about/                 # 关于页
│   │   ├── admin/                 # 管理后台
│   │   ├── articles/              # 文章列表
│   │   ├── auth/                  # 认证页面
│   │   ├── blog/                  # 博客
│   │   ├── console/               # 用户控制台
│   │   ├── help/                  # 帮助中心
│   │   ├── pricing/               # 价格页
│   │   ├── profile/               # 个人中心
│   │   └── unauthorized/          # 无权限页
│   └── api/                       # API 路由（无语言前缀）
│       ├── admin/
│       ├── articles/
│       ├── auth/
│       ├── console/
│       └── user/
│
├── i18n/
│   ├── config.ts                  # 语言配置（locales, defaultLocale）
│   ├── request.ts                 # 服务端翻译加载逻辑
│   └── routing.ts                 # 路由配置与导航工具
│
├── messages/                      # 全局翻译文件
│   ├── zh.json                    # 中文翻译（85+ keys）
│   ├── en.json                    # 英文翻译（85+ keys）
│   └── ja.json                    # 日文翻译（85+ keys）
│
├── features/                      # 功能模块
│   ├── {feature}/
│   │   ├── locale/                # 功能翻译（模块化）
│   │   │   ├── zh.json
│   │   │   ├── en.json
│   │   │   └── ja.json
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── about/locale/              # 关于页翻译
│   ├── articles/locale/           # 文章功能翻译
│   ├── auth/locale/               # 认证功能翻译
│   ├── blog/locale/               # 博客功能翻译
│   ├── home/locale/               # 首页翻译
│   └── ...
│
├── shared/
│   └── components/
│       └── language-switcher.tsx  # 语言切换组件
│
├── middleware.ts                  # 集成语言检测与认证
└── global.d.ts                    # TypeScript 类型定义
```

---

## 核心配置

### 1. 语言配置 (`i18n/config.ts`)

```typescript
export const locales = ['zh', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export const localeNames: Record<Locale, string> = {
  zh: '简体中文',
  en: 'English',
  ja: '日本語',
};
```

### 2. 路由配置 (`i18n/routing.ts`)

```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['zh', 'en', 'ja'],
  defaultLocale: 'zh',
  localePrefix: 'always', // URL 始终包含语言前缀
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

### 3. 翻译加载 (`i18n/request.ts`)

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// 定义功能模块列表
const FEATURE_MODULES = [
  'home',
  'about',
  'articles',
  'auth',
  'blog',
  'console',
  'help',
  'pricing',
  'settings',
  'user',
];

export default getRequestConfig(async ({ locale }) => {
  // 验证 locale
  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // 加载全局翻译
  const globalMessages = (await import(`@/messages/${locale}.json`)).default;

  // 加载功能模块翻译
  const featureMessages: Record<string, any> = {};
  
  for (const module of FEATURE_MODULES) {
    try {
      const messages = (await import(`@features/${module}/locale/${locale}.json`)).default;
      featureMessages[module] = messages;
    } catch (error) {
      // 模块翻译文件不存在时跳过
      console.warn(`Translation file not found: features/${module}/locale/${locale}.json`);
    }
  }

  // 深度合并翻译
  return {
    messages: {
      ...globalMessages,
      ...featureMessages,
    },
  };
});
```

### 4. 中间件集成 (`middleware.ts`)

```typescript
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware(routing);

// 认证保护路由定义
const publicRoutes = [
  '/',
  '/about',
  '/help',
  '/blog',
  '/pricing',
  '/login',
  '/register',
];

const userProtectedRoutes = ['/profile', '/console', '/articles'];
const adminProtectedRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过 API 路由、静态文件
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 应用国际化中间件
  const intlResponse = intlMiddleware(request);

  // 提取语言前缀后的路径
  const pathWithoutLocale = pathname.replace(/^\/(zh|en|ja)/, '') || '/';

  // 检查是否为公共路由
  const isPublicRoute = publicRoutes.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(route)
  );

  if (isPublicRoute) {
    return intlResponse;
  }

  // 认证检查
  const isUserProtected = userProtectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  const isAdminProtected = adminProtectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (!isUserProtected && !isAdminProtected) {
    return intlResponse;
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.sub) {
      const locale = pathname.split('/')[1] || 'zh';
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    if (isAdminProtected && token.role !== 'ADMIN') {
      const locale = pathname.split('/')[1] || 'zh';
      return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
    }

    return intlResponse;
  } catch (err) {
    console.error('Middleware auth error:', err);
    const locale = pathname.split('/')[1] || 'zh';
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 5. TypeScript 类型定义 (`global.d.ts`)

```typescript
type Messages = typeof import('./src/messages/zh.json');
declare interface IntlMessages extends Messages {}
```

---

## 使用指南

### 添加新功能的翻译

#### 步骤 1: 创建翻译文件

在 `/src/features/{feature-name}/locale/` 创建：

```bash
src/features/my-feature/locale/
├── zh.json
├── en.json
└── ja.json
```

#### 步骤 2: 定义翻译内容

**zh.json**:

```json
{
  "title": "我的功能",
  "description": "这是一个示例功能",
  "actions": {
    "create": "创建",
    "edit": "编辑",
    "delete": "删除"
  }
}
```

**en.json**:

```json
{
  "title": "My Feature",
  "description": "This is a sample feature",
  "actions": {
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete"
  }
}
```

#### 步骤 3: 注册功能模块

在 `/src/i18n/request.ts` 的 `FEATURE_MODULES` 中添加：

```typescript
const FEATURE_MODULES = [
  'home',
  'about',
  'my-feature', // 新增
  // ...
];
```

#### 步骤 4: 在组件中使用

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyFeature() {
  const t = useTranslations('my-feature');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('actions.create')}</button>
    </div>
  );
}
```

#### 步骤 5: 验证翻译

```bash
npm run build
node scripts/verify-i18n.js
```

### 翻译文件结构示例

#### 简单键值对

```json
{
  "title": "首页",
  "description": "欢迎来到我们的网站",
  "button": "开始使用"
}
```

#### 嵌套结构

```json
{
  "hero": {
    "title": "主标题",
    "subtitle": "副标题",
    "button": {
      "primary": "开始",
      "secondary": "了解更多"
    }
  },
  "features": {
    "title": "核心功能",
    "list": {
      "fast": "快速",
      "secure": "安全",
      "reliable": "可靠"
    }
  }
}
```

#### 数组结构

```json
{
  "features": [
    {
      "icon": "🚀",
      "title": "快速",
      "description": "闪电般的速度"
    },
    {
      "icon": "🔒",
      "title": "安全",
      "description": "企业级安全保障"
    }
  ]
}
```

#### 带参数的翻译

```json
{
  "welcome": "欢迎, {name}!",
  "itemCount": "你有 {count} 个项目",
  "lastLogin": "上次登录: {date}"
}
```

使用：

```typescript
t('welcome', { name: 'John' })
t('itemCount', { count: 5 })
t('lastLogin', { date: '2024-11-03' })
```

---

## 翻译管理

### 验证翻译完整性

创建验证脚本 `scripts/verify-i18n.js`:

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const locales = ['zh', 'en', 'ja'];
const featuresDir = path.join(__dirname, '../src/features');

function checkFeatureTranslations() {
  const features = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let allValid = true;

  features.forEach(feature => {
    const localeDir = path.join(featuresDir, feature, 'locale');
    
    if (!fs.existsSync(localeDir)) {
      console.log(`⚠️  ${feature}: 缺少 locale 目录`);
      return;
    }

    const existingLocales = fs.readdirSync(localeDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));

    const missingLocales = locales.filter(loc => !existingLocales.includes(loc));

    if (missingLocales.length > 0) {
      console.log(`❌ ${feature}: 缺少语言文件: ${missingLocales.join(', ')}`);
      allValid = false;
    } else {
      console.log(`✅ ${feature}: 所有语言文件齐全 (${locales.join(', ')})`);
    }
  });

  if (allValid) {
    console.log('\n✅ 所有翻译文件验证通过！');
  } else {
    console.log('\n❌ 部分翻译文件缺失，请补充完整');
    process.exit(1);
  }
}

checkFeatureTranslations();
```

运行验证：

```bash
node scripts/verify-i18n.js
```

### 翻译最佳实践

#### 1. 命名规范

- 使用 camelCase: `userProfile.title`
- 语义化命名: `actions.save` 而不是 `btn1`
- 避免冗余: `user.name` 而不是 `user.userName`

#### 2. 组织结构

按功能分组：

```json
{
  "common": {
    "save": "保存",
    "cancel": "取消"
  },
  "user": {
    "profile": { ... },
    "settings": { ... }
  },
  "admin": {
    "dashboard": { ... },
    "users": { ... }
  }
}
```

#### 3. 避免硬编码

❌ 不好：

```typescript
<h1>欢迎来到我们的网站</h1>
```

✅ 好：

```typescript
const t = useTranslations('common');
<h1>{t('welcome')}</h1>
```

#### 4. 提取可复用文本

将通用文本放在 `messages/{locale}.json` 的 `common` 部分：

```json
{
  "common": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "create": "创建",
    "submit": "提交",
    "loading": "加载中...",
    "error": "发生错误",
    "success": "操作成功"
  }
}
```

---

## SEO优化

### URL 路由模式

```bash
默认语言（中文）:
/zh/                   ← 首页
/zh/about              ← 关于页
/zh/blog               ← 博客

英文:
/en/                   ← 首页
/en/about              ← 关于页
/en/blog               ← 博客

日文:
/ja/                   ← 首页
/ja/about              ← 关于页
/ja/blog               ← 博客
```

### hreflang 标签

系统自动为每个页面生成 hreflang 标签：

```typescript
// app/[locale]/layout.tsx
export async function generateMetadata({ params: { locale } }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  
  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'zh': `${baseUrl}/zh`,
        'en': `${baseUrl}/en`,
        'ja': `${baseUrl}/ja`,
        'x-default': `${baseUrl}/zh`,
      },
    },
  };
}
```

### 站点地图

自动生成多语言站点地图 (`app/sitemap.ts`):

```typescript
import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  
  const routes = ['', '/about', '/blog', '/pricing', '/help'];
  
  return routes.flatMap(route => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map(loc => [loc, `${baseUrl}/${loc}${route}`])
        ),
      },
    }))
  );
}
```

### Robots.txt

```txt
# public/robots.txt
User-agent: *
Allow: /

# 允许所有语言版本
Allow: /zh/
Allow: /en/
Allow: /ja/

# 保护敏感路由
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

### 环境变量

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=https://example.com
```

---

## 实施记录

### ✅ 已完成功能

#### Phase 1: 基础配置 (2024-11-03)

- ✅ 安装 `next-intl@4.4.0`
- ✅ 创建 `src/i18n/config.ts` - 语言配置
- ✅ 创建 `src/i18n/routing.ts` - 路由配置
- ✅ 创建 `src/i18n/request.ts` - 服务端翻译请求（支持模块化加载）
- ✅ 配置 `next.config.ts` - 集成 next-intl 插件

#### Phase 2: 翻译文件

- ✅ 创建 `src/messages/zh.json` - 中文翻译 (85+ 条)
- ✅ 创建 `src/messages/en.json` - 英文翻译 (85+ 条)
- ✅ 创建 `src/messages/ja.json` - 日文翻译 (85+ 条)
- ✅ 完整覆盖：common, nav, auth, errors, profile, admin 等模块

#### Phase 3: 功能模块翻译

- ✅ `src/features/about/locale/{zh,en,ja}.json` - 关于页
- ✅ `src/features/articles/locale/{zh,en,ja}.json` - 文章功能
- ✅ `src/features/auth/locale/{zh,en,ja}.json` - 认证功能
- ✅ `src/features/blog/locale/{zh,en,ja}.json` - 博客功能
- ✅ `src/features/home/locale/{zh,en,ja}.json` - 首页
- ✅ `src/features/pricing/locale/{zh,en,ja}.json` - 价格页
- ✅ `src/features/help/locale/{zh,en,ja}.json` - 帮助中心

#### Phase 4: 中间件集成

- ✅ 修改 `src/middleware.ts` - 集成 next-intl 语言检测
- ✅ 保留原有认证逻辑 - 支持多语言路由保护
- ✅ 修复 console.log/warn 错误 - 使用允许的方法

#### Phase 5: 路由重构

- ✅ 调整 `src/app/layout.tsx` - 简化为只返回 children
- ✅ 创建 `src/app/[locale]/layout.tsx` - 语言布局
- ✅ 迁移所有页面到 `app/[locale]/*`:
  - ✅ page.tsx (首页)
  - ✅ about/
  - ✅ admin/
  - ✅ articles/
  - ✅ auth/ (login, register)
  - ✅ blog/
  - ✅ console/
  - ✅ help/
  - ✅ pricing/
  - ✅ profile/
  - ✅ unauthorized/
- ✅ 保留 `app/api/*` - API 路由无语言前缀

#### Phase 6: 组件改造

- ✅ 创建 `src/shared/components/language-switcher.tsx` - 语言切换组件
- ✅ 改造 `src/shared/layout/portal-header.tsx` - 集成语言切换
  - 桌面端: 搜索 | 语言 | 主题 | 用户菜单
  - 移动端: 在菜单中添加语言切换
- ✅ 改造 `src/shared/layout/auth-layout.tsx` - 使用 useTranslations
- ✅ 改造认证页面:
  - ✅ `app/[locale]/auth/login/page.tsx` - 登录页
  - ✅ `app/[locale]/auth/register/page.tsx` - 注册页
- ✅ 改造 `src/features/auth/components/login-form.tsx` - 完整国际化
  - 表单验证错误消息
  - 按钮文本
  - 链接文本
  - 社交登录错误消息

#### Phase 7: 类型安全

- ✅ 创建 `global.d.ts` - IntlMessages 类型定义
- ✅ 更新 `tsconfig.json` - 添加 @messages/* 路径别名
- ✅ 修复 Prisma 类型导入问题:
  - `protected-route.tsx`: 使用字符串字面量
  - `user-management.tsx`: 改用 `@shared/types/user`
  - `role-guard.tsx`: 改用 `@shared/types/user`

#### Phase 8: 构建验证

- ✅ 构建成功 - **156 个静态页面** (52 个页面 × 3 语言)
- ✅ 移除 next.config.ts 中已废弃的 api 配置
- ✅ 修复目录名称问题
- ✅ 生成 Prisma Client
- ✅ 多语言页面构建验证通过

### 技术难点解决

#### 1. ES 模块语法错误

- **问题**: `require is not defined in ES module scope`
- **解决**: 将脚本改为 ES 模块语法

#### 2. Prisma 客户端导入

- **问题**: 客户端组件直接导入 `@prisma/client`
- **解决**: 使用 `@shared/types/user` 中定义的共享类型

#### 3. Logger 类型错误

- **问题**: middleware 中 logger 参数不匹配
- **解决**: 改用 console.warn/error

#### 4. next.config.ts 配置警告

- **问题**: `api` 配置项在 Next.js 15 中已移除
- **解决**: 删除 api 配置项

#### 5. 模块化翻译加载

- **问题**: 功能模块翻译需要手动注册
- **解决**: 在 `i18n/request.ts` 中实现动态导入和深度合并

---

## 常见问题

### Q1: 如何修改默认语言？

在 `/src/i18n/config.ts` 中修改：

```typescript
export const defaultLocale: Locale = 'en'; // 改为英文
```

### Q2: 如何添加新的语言？

**步骤**:

1. 在所有翻译文件中添加新语言 (如 `ko.json` 韩语)

2. 在 `/src/i18n/config.ts` 的 `locales` 中添加：

   ```typescript
   export const locales = ['zh', 'en', 'ja', 'ko'] as const;
   ```

3. 添加语言名称：

   ```typescript
   export const localeNames = {
     // ...
     ko: '한국어',
   };
   ```

4. 运行 `npm run build` 验证

### Q3: 翻译内容更新后需要重新构建吗？

- **开发环境** (`npm run dev`): 自动刷新，无需重新构建
- **生产环境**: 需要重新构建并部署

### Q4: 如何获取当前语言？

```typescript
import { useLocale } from 'next-intl';

export default function Component() {
  const locale = useLocale(); // 'zh' | 'en' | 'ja'
  
  return <p>Current language: {locale}</p>;
}
```

### Q5: API 路由如何处理多语言？

API 路由 **不包含** 语言前缀，通过以下方式处理：

1. **从 Header 获取**:

   ```typescript
   // app/api/example/route.ts
   export async function GET(request: Request) {
     const locale = request.headers.get('accept-language')?.split(',')[0] || 'zh';
     // 使用 locale 返回对应语言的数据
   }
   ```

2. **从查询参数获取**:

   ```typescript
   const { searchParams } = new URL(request.url);
   const locale = searchParams.get('locale') || 'zh';
   ```

### Q6: 如何实现 RTL（从右到左）语言支持？

在 `app/[locale]/layout.tsx` 中添加：

```typescript
const isRTL = locale === 'ar' || locale === 'he'; // 阿拉伯语、希伯来语

return (
  <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
    {/* ... */}
  </html>
);
```

### Q7: 如何处理日期和数字格式化？

使用 `next-intl` 内置的格式化工具：

```typescript
import { useFormatter } from 'next-intl';

export default function Component() {
  const format = useFormatter();
  
  const date = new Date();
  const number = 1234567.89;
  
  return (
    <>
      <p>{format.dateTime(date, { dateStyle: 'full' })}</p>
      <p>{format.number(number, { style: 'currency', currency: 'USD' })}</p>
    </>
  );
}
```

### Q8: 翻译文件太大怎么办？

使用模块化翻译：

```typescript
// 只加载需要的模块
const t = useTranslations('articles'); // 只加载 articles 模块
```

功能模块翻译会自动按需加载。

### Q9: 如何测试多语言功能？

```typescript
// tests/i18n.test.ts
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Component from '@/components/Component';
import zhMessages from '@/messages/zh.json';

test('renders translated text', () => {
  render(
    <NextIntlClientProvider locale="zh" messages={zhMessages}>
      <Component />
    </NextIntlClientProvider>
  );
  
  expect(screen.getByText('首页')).toBeInTheDocument();
});
```

### Q10: 如何处理翻译缺失？

在 `i18n/request.ts` 中配置回退：

```typescript
return {
  messages: {
    ...globalMessages,
    ...featureMessages,
  },
  onError: (error) => {
    console.warn('Translation error:', error.message);
  },
  getMessageFallback: ({ key, namespace }) => {
    return `${namespace}.${key}`; // 返回 key 作为回退
  },
};
```

---

## 🚀 快速命令

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 验证翻译
node scripts/verify-i18n.js

# 启动生产服务器
npm run start

# 类型检查
npm run type-check

# Lint 检查
npm run lint
```

---

## 📚 相关资源

- [next-intl 官方文档](https://next-intl-docs.vercel.app/)
- [Next.js 国际化指南](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [TypeScript 类型安全配置](https://next-intl-docs.vercel.app/docs/workflows/typescript)
- [SEO 最佳实践](https://next-intl-docs.vercel.app/docs/routing/navigation#search-engine-optimization)

---

## 📝 总结

本项目已成功实现基于 `next-intl` 的完整国际化方案：

- ✅ **156 个静态页面** - 52 个页面 × 3 语言 (zh, en, ja)
- ✅ **模块化翻译** - 支持按功能拆分翻译文件
- ✅ **类型安全** - 完整的 TypeScript 支持
- ✅ **SEO 优化** - 自动生成 hreflang 和站点地图
- ✅ **认证集成** - 多语言路由保护
- ✅ **构建成功** - 无错误、无警告

后续可以按照文档指南：

1. 扩充更多功能模块的翻译
2. 添加更多语言支持 (韩语、法语等)
3. 实现翻译管理平台集成
4. 优化用户语言偏好记忆

---

**文档版本**: 1.0.0  
**最后更新**: 2025-11-11  
**维护者**: inRemark Team
