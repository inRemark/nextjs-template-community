# VSeek 项目组织架构文档

## 📋 概述

本文档描述了 VSeek 项目的组织架构，采用基于功能域的模块化设计，遵循现代前端项目的最佳实践。

## 🏗️ 整体架构

```bash
src/
├── shared/                    # 共享资源层
│   ├── ui/                   # UI 组件库
│   ├── layout/               # 布局组件
│   ├── theme/                # 主题系统
│   ├── hooks/                # 通用 Hooks
│   ├── types/                # 通用类型定义
│   └── utils/                # 工具函数
├── features/                 # 功能域层
│   ├── admin/               # 管理后台功能域
│   ├── auth/                # 认证功能域
│   ├── mail/                # 邮件功能域
│   ├── referral/            # 推荐功能域
│   ├── blog/                # 博客功能域
│   ├── activities/          # 活动功能域
│   ├── comparisons/         # 对比功能域
│   ├── problems/            # 问题功能域
│   ├── recommendations/     # 推荐功能域
│   ├── reviews/             # 评价功能域
│   ├── search/              # 搜索功能域
│   └── solutions/           # 解决方案功能域
├── app/                     # Next.js App Router
└── lib/                     # 第三方库和工具
```

## 📁 目录结构详解

### 1. `src/shared/` - 共享资源层

共享资源层包含项目中可复用的通用组件、工具和类型定义。

#### `src/shared/ui/` - UI 组件库

- **职责**: 提供项目中通用的 UI 组件
- **包含内容**:
  - `form-components.tsx` - 表单相关组件
  - `notification-components.tsx` - 通知相关组件
  - `data-components.tsx` - 数据展示组件
  - 其他通用 UI 组件

#### `src/shared/layout/` - 布局组件

- **职责**: 提供页面布局相关的组件
- **包含内容**:
  - 页面布局组件
  - 导航组件
  - 侧边栏组件
  - 面包屑组件

#### `src/shared/theme/` - 主题系统

- **职责**: 管理项目的主题和样式系统
- **包含内容**:
  - 主题配置
  - 颜色系统
  - 字体系统
  - 响应式断点

#### `src/shared/hooks/` - 通用 Hooks

- **职责**: 提供可复用的 React Hooks
- **包含内容**:
  - 状态管理 Hooks
  - 副作用 Hooks
  - 工具类 Hooks

#### `src/shared/types/` - 通用类型定义

- **职责**: 定义项目中通用的 TypeScript 类型
- **包含内容**:
  - 基础类型定义
  - 通用接口
  - 枚举类型

#### `src/shared/utils/` - 工具函数

- **职责**: 提供通用的工具函数和辅助方法
- **包含内容**:
  - 数据处理工具
  - 格式化工具
  - 验证工具
  - Excel 处理工具

### 2. `src/features/` - 功能域层

功能域层按照业务功能进行模块化组织，每个功能域都是独立的业务模块。

#### `src/features/admin/` - 管理后台功能域

- **职责**: 管理后台相关的所有功能
- **结构**:

```bash
  admin/
  ├── components/            # 管理后台专用组件
  │   ├── admin-layout.tsx
  │   ├── problem-form.tsx
  │   └── solution-form.tsx
  ├── services/             # 管理后台服务
  ├── hooks/                # 管理后台 Hooks
  ├── types/                # 管理后台类型
  └── utils/                # 管理后台工具
  ```

#### `src/features/auth/` - 认证功能域

- **职责**: 用户认证和授权相关功能
- **结构**:

```bash
  auth/
  ├── components/           # 认证相关组件
  ├── services/             # 认证服务
  │   ├── auth.service.ts
  │   ├── oauth.service.ts
  │   └── next-auth.config.ts
  ├── middleware/           # 认证中间件
  ├── hooks/                # 认证相关 Hooks
  ├── types/                # 认证相关类型
  └── utils/                # 认证工具
  ```

#### `src/features/mail/` - 邮件功能域

- **职责**: 邮件发送和管理相关功能
- **结构**:

```bash
  mail/
  ├── services/             # 邮件服务
  │   ├── email-service-api.ts
  │   ├── notification-service.ts
  │   ├── template-service.ts
  │   └── simple-postgres-queue.ts
  ├── hooks/                # 邮件相关 Hooks
  ├── types/                # 邮件相关类型
  └── templates/            # 邮件模板
  ```

#### `src/features/referral/` - 推荐功能域

- **职责**: 用户推荐系统相关功能
- **结构**:

```bash
  referral/
  ├── components/           # 推荐相关组件
  ├── services/             # 推荐服务
  ├── hooks/                # 推荐相关 Hooks
  ├── types/                # 推荐相关类型
  └── utils/                # 推荐工具
  ```

#### `src/features/blog/` - 博客功能域

- **职责**: 博客文章相关功能
- **结构**:

```bash
  blog/
  ├── components/           # 博客相关组件
  ├── services/             # 博客服务
  ├── hooks/                # 博客相关 Hooks
  └── types/                # 博客相关类型
  ```

#### 其他功能域

- `src/features/activities/` - 活动功能域
- `src/features/comparisons/` - 对比功能域
- `src/features/problems/` - 问题功能域
- `src/features/recommendations/` - 推荐功能域
- `src/features/reviews/` - 评价功能域
- `src/features/search/` - 搜索功能域
- `src/features/solutions/` - 解决方案功能域

### 3. `src/app/` - Next.js App Router

按照 Next.js 13+ App Router 规范组织的路由结构。

### 4. `src/lib/` - 第三方库和工具

包含项目依赖的第三方库配置和工具函数。

## 🔧 路径别名配置

项目使用 TypeScript 路径别名来简化导入路径：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@features/*": ["./src/features/*"]
    }
  }
}
```

### 别名使用示例

```typescript
// 导入共享组件
import { Button } from '@shared/ui/button'
import { useTheme } from '@shared/hooks/useTheme'
import { User } from '@shared/types/user'

// 导入功能域组件
import { AuthForm } from '@features/auth/components/AuthForm'
import { MailService } from '@features/mail/services/MailService'
import { AdminLayout } from '@features/admin/components/AdminLayout'

// 导入通用路径
import { apiClient } from '@/lib/api-client'
```

## 📋 功能域设计原则

### 1. 单一职责原则

每个功能域只负责一个特定的业务功能，保持高内聚低耦合。

### 2. 模块化设计

功能域内部按照职责进一步细分：

- `components/` - UI 组件
- `services/` - 业务逻辑服务
- `hooks/` - React Hooks
- `types/` - TypeScript 类型定义
- `utils/` - 工具函数
- `middleware/` - 中间件（如需要）

### 3. 依赖管理

- 功能域之间通过明确的接口进行通信
- 避免功能域之间的直接依赖
- 共享功能统一放在 `shared/` 目录

### 4. 可扩展性

- 新功能域可以独立开发和测试
- 支持功能域的独立部署（如果需要）
- 便于团队协作开发

## 🚀 开发指南

### 添加新功能域

1. 在 `src/features/` 下创建新的功能域目录
2. 按照标准结构创建子目录
3. 实现功能域的核心功能
4. 在 `tsconfig.json` 中添加路径别名（如需要）

### 添加共享组件

1. 在 `src/shared/` 的相应子目录中添加组件
2. 确保组件的通用性和可复用性
3. 添加适当的 TypeScript 类型定义
4. 编写使用文档和示例

### 导入路径规范

- 优先使用路径别名
- 避免相对路径导入
- 保持导入路径的一致性

## 📊 架构优势

### 1. 可维护性

- 清晰的功能域划分
- 统一的代码组织方式
- 便于定位和修改代码

### 2. 可扩展性

- 新功能可以独立开发
- 支持团队并行开发
- 便于功能模块的添加和移除

### 3. 可测试性

- 功能域可以独立测试
- 清晰的依赖关系
- 便于编写单元测试和集成测试

### 4. 开发效率

- 路径别名简化导入
- 统一的开发规范
- 便于代码复用

## 🔄 迁移历史

### 重构前结构

```bash
src/
├── components/              # 所有组件混在一起
├── lib/                    # 所有库文件混在一起
├── hooks/                  # 所有 hooks 混在一起
├── types/                  # 所有类型混在一起
└── app/                    # Next.js App Router
```

### 重构后结构

```bash
src/
├── shared/                 # 共享资源
├── features/               # 功能域
├── lib/                    # 第三方库
└── app/                    # Next.js App Router
```

### 主要改进

1. **功能域化**: 按业务功能组织代码
2. **共享资源**: 统一管理可复用组件
3. **路径别名**: 简化导入路径
4. **类型安全**: 完善的 TypeScript 支持
5. **模块化**: 支持独立开发和测试

## 📝 总结

VSeek 项目采用了基于功能域的模块化架构，通过清晰的分层和职责划分，实现了代码的高内聚低耦合。这种架构不仅提高了代码的可维护性和可扩展性，也为团队的协作开发提供了良好的基础。

通过统一的开发规范和路径别名系统，开发者可以更高效地进行功能开发和代码维护，同时保证了项目架构的一致性和可预测性。
