# Service + Hooks 架构迁移 - 执行摘要

> 快速参考文档 | 生成时间: 2025-11-10

---

## 🎯 核心目标

将手动状态管理 (useState/useEffect) 迁移到 **Service + React Query Hooks** 架构

**核心收益:**
- 📉 减少 20-60% 代码量
- ⚡ 自动缓存、重试、预取
- 🔒 完整 TypeScript 类型安全
- 🧪 Service 层可独立测试
- 🔄 API 逻辑可跨场景复用

---

## 📊 待迁移模块清单

### 🔴 Phase 1: 高优先级 (手动状态管理)

| 模块 | 文件 | 行数 | 预计收益 | 优先级 |
|------|------|------|----------|--------|
| **Articles** | `useArticles.ts` | 178 | 减少 60% | 🔴 最高 |
| **Blog** | `useBlog.ts` | 198 | 减少 65% | 🔴 最高 |

**问题:** 手动管理状态、无缓存、代码冗余、难以测试

---

### 🟡 Phase 2: 中优先级 (补充 Service 层)

| 模块 | 文件 | 问题 | 优化方向 |
|------|------|------|----------|
| Orders | `useOrders.ts` | 直接在 Hook 中写 fetch | 提取到 OrderClientService |
| Products | `useProducts.ts` | 直接在 Hook 中写 fetch | 提取到 ProductClientService |
| Payments | `useAnalytics.ts` | 直接在 Hook 中写 fetch | 提取到 PaymentClientService |
| Admin Products | `useAdminProducts.ts` | 207 行混杂逻辑 | 拆分 Service 和 Hook |

**问题:** 已用 React Query 但逻辑混在 Hook 中,难以复用

---

### ✅ 无需迁移 (已完成)

- Console (✅ `console-client.service.ts` + `useDashboardStats.ts`)
- Notifications (✅ `notification-client.service.ts` + `useNotifications.ts`)
- Search (✅ `search-client.service.ts` + `useSearch.ts`)
- Points (✅ `points-client.service.ts`)
- User (✅ `user-client.service.ts`)

---

## 🏗️ 标准架构模式

```
features/xxx/
  ├── services/
  │   └── xxx-client.service.ts   # ✅ 纯 API 逻辑 (无 React)
  ├── hooks/
  │   └── useXxx.ts                # ✅ React Query 封装
  ├── types/
  │   └── xxx.types.ts             # ✅ TypeScript 类型
  └── components/
      └── XxxComponent.tsx         # ✅ UI 组件
```

---

## 📝 快速迁移步骤

### Step 1: 创建 Service 层

```typescript
// src/features/xxx/services/xxx-client.service.ts
export class XxxClientService {
  static async getItems(params: Params): Promise<Response> {
    const response = await fetch('/api/xxx?' + new URLSearchParams(params));
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }

  static async getItem(id: string): Promise<Item> {
    const response = await fetch(`/api/xxx/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
}
```

---

### Step 2: 创建 Hooks 层

```typescript
// src/features/xxx/hooks/useXxx.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XxxClientService } from '../services/xxx-client.service';

export function useItems(params: Params) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => XxxClientService.getItems(params),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => XxxClientService.getItem(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: XxxClientService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

---

### Step 3: 更新组件

```typescript
// Before ❌
function ItemList() {
  const { items, loading, error } = useItems(); // 自定义返回值
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return <div>{items.map(...)}</div>;
}

// After ✅
function ItemList() {
  const { data, isLoading, error } = useItems(); // React Query 标准返回值
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!data) return null;
  return <div>{data.items.map(...)}</div>;
}
```

---

## ⏱️ 迁移时间线

### Week 1: Phase 1 - 高收益模块

**Day 1-2: Articles 模块 (8h)**
- [ ] 创建 `article-client.service.ts` (2h)
- [ ] 重构 `useArticles.ts` (2h)
- [ ] 更新组件 (2h)
- [ ] 测试验证 (2h)

**Day 3-4: Blog 模块 (9h)**
- [ ] 创建 `blog-client.service.ts` (2h)
- [ ] 重构 4 个 Hooks (3h)
- [ ] 更新组件 (2h)
- [ ] 测试验证 (2h)

**Day 5: 总结 (6h)**
- [ ] 编写文档 (2h)
- [ ] Code Review (2h)
- [ ] 性能测试 (2h)

---

### Week 2: Phase 2 - 补充 Service 层

**Day 1: Orders 模块 (3h)**
- [ ] 创建 Service + 重构 Hooks + 测试

**Day 2: Products 模块 (3h)**
- [ ] 创建 Service + 重构 Hooks + 测试

**Day 3: Payments 模块 (4h)**
- [ ] 创建 Service + 重构 Hooks + 测试

**Day 4-5: Admin Products 模块 (9h)**
- [ ] 创建 Service (3h)
- [ ] 重构 Hooks (2h)
- [ ] 测试 CRUD (2h)
- [ ] Code Review (2h)

---

## ✅ 验收标准

### 功能测试
- [ ] 所有列表查询正常
- [ ] 所有详情查询正常
- [ ] 所有创建/更新/删除操作正常
- [ ] 缓存机制生效 (切换页面数据不重新请求)
- [ ] 错误处理正确显示

### 代码质量
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] 代码量减少 > 20%
- [ ] Service 层函数纯净 (无 React 依赖)
- [ ] Hooks 层代码简洁 (< 10 行/Hook)

### 性能指标
- [ ] 相同查询重复访问减少 > 80% 网络请求
- [ ] 页面切换响应时间 < 100ms (缓存读取)
- [ ] 首次加载时间不增加

---

## 🎁 React Query 核心功能

### 自动缓存
```typescript
const { data } = useArticles({ page: 1 }); // 首次请求 API
const { data } = useArticles({ page: 1 }); // 从缓存读取,不请求! ✅
```

### 自动重试
```typescript
// 网络错误自动重试 3 次,延迟递增
useQuery({
  queryFn: () => XxxService.getItems(),
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 后台刷新
```typescript
// 数据过期后自动后台刷新
useQuery({
  queryFn: () => XxxService.getItems(),
  staleTime: 1000 * 60 * 5, // 5分钟后数据过期
  refetchOnWindowFocus: true, // 窗口聚焦时自动刷新
});
```

### 乐观更新
```typescript
const mutation = useMutation({
  mutationFn: XxxService.updateItem,
  onMutate: async (newData) => {
    // 立即更新 UI
    queryClient.setQueryData(['item', id], newData);
  },
  onError: (err, variables, context) => {
    // 失败回滚
    queryClient.setQueryData(['item', id], context.previousData);
  },
});
```

### 数据预取
```typescript
// 鼠标悬停时预取详情
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['item', id],
    queryFn: () => XxxService.getItem(id),
  });
};
```

### 无限滚动
```typescript
export function useInfiniteItems(params: Params) {
  return useInfiniteQuery({
    queryKey: ['items', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      XxxService.getItems({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
}
```

---

## ⚠️ 注意事项

### 1. Breaking Changes

迁移后返回值会改变:

```typescript
// Before
const { items, loading, error, pagination } = useItems();

// After
const { data, isLoading, error } = useItems();
// data = { items, page, limit, total, ... }
```

**解决:** 统一在一个 PR 中完成模块迁移

---

### 2. 缓存失效

mutation 成功后必须手动失效缓存:

```typescript
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: XxxService.createItem,
    onSuccess: () => {
      // 重要! 创建成功后使列表缓存失效
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

---

### 3. 类型安全

Service 层必须明确类型:

```typescript
// ✅ Good
static async getItems(params: Params): Promise<Response> { }

// ❌ Bad
static async getItems(params: any): Promise<any> { }
```

---

### 4. 错误处理

统一抛出 Error 对象:

```typescript
if (!response.ok || !data.success) {
  throw new Error(data.message || 'Failed to fetch items');
}
```

---

## 📚 参考资源

### 详细文档
- **完整迁移计划:** `docs/development/SERVICE_HOOKS_MIGRATION_PLAN.md`
- **TanStack Query 官方文档:** https://tanstack.com/query/latest/docs/react/overview
- **React Query 最佳实践:** https://tkdodo.eu/blog/practical-react-query

### 内部示例
- **Console 模块:** `src/features/console/` (已完成 ✅)
- **Notifications 模块:** `src/features/notifications/` (已完成 ✅)
- **Search 模块:** `src/features/search/` (已完成 ✅)

---

## 🚀 快速开始

### 1. 选择模块
优先选择 Articles 或 Blog 模块 (收益最大)

### 2. 创建 Service 层
```bash
mkdir -p src/features/articles/services
touch src/features/articles/services/article-client.service.ts
```

### 3. 重构 Hooks 层
修改 `src/features/articles/hooks/useArticles.ts`

### 4. 更新组件
查找所有使用 `useArticles` 的组件并更新

### 5. 测试验证
```bash
npm run type-check  # TypeScript 检查
npm run lint        # ESLint 检查
npm run test        # 单元测试
npm run dev         # 手动测试功能
```

---

## 📊 预期收益总结

| 指标 | Before | After | 改善 |
|------|--------|-------|------|
| **代码量** | 707 行 | 530 行 | ↓ 25% |
| **Articles 模块** | 178 行 | 100 行 | ↓ 44% |
| **Blog 模块** | 198 行 | 120 行 | ↓ 39% |
| **缓存命中率** | 0% | 80%+ | ↑ 80%+ |
| **页面切换速度** | ~500ms | <100ms | ↑ 5x |
| **测试覆盖率** | 30% | 80%+ | ↑ 50%+ |

---

## 💡 最佳实践

### Service 层
- ✅ 纯函数,无副作用
- ✅ 明确的输入输出类型
- ✅ 统一的错误处理
- ✅ 详细的 JSDoc 注释
- ❌ 不包含 React Hooks
- ❌ 不包含业务逻辑

### Hooks 层
- ✅ 使用 React Query
- ✅ 配置合理的 staleTime
- ✅ 正确的 queryKey 策略
- ✅ mutation 后失效缓存
- ❌ 不直接写 fetch 逻辑
- ❌ 不手动管理 loading/error

### 组件层
- ✅ 使用标准 React Query 返回值
- ✅ 检查 data 是否存在
- ✅ 使用 isLoading 而不是 loading
- ✅ 使用 error.message
- ❌ 不直接调用 Service
- ❌ 不包含数据请求逻辑

---

**文档维护者:** GitHub Copilot  
**最后更新:** 2025-11-10  
**版本:** v1.0.0
