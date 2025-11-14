# 项目模块耦合度分析报告

**生成日期**: 2025-11-04  
**项目**: Next.js 15 + React 19 全栈模板  
**技术栈**: TypeScript, Prisma ORM, TanStack Query, NextAuth, Radix UI

---

## 目录

1. [执行摘要](#执行摘要)
2. [模块架构概览](#模块架构概览)
3. [耦合度分类](#耦合度分类)
4. [详细耦合度分析](#详细耦合度分析)
5. [跨模块依赖关系](#跨模块依赖关系)
6. [耦合度改进建议](#耦合度改进建议)
7. [依赖矩阵](#依赖矩阵)

---

## 执行摘要

### 项目整体评估

| 指标 | 评分 | 状态 |
|------|------|------|
| **整体耦合度** | 中等偏高 | ⚠️ 需要优化 |
| **模块内聚度** | 良好 | ✅ 按规范 |
| **共享依赖度** | 高 | ⚠️ 关注 |
| **数据库耦合** | 高 | ⚠️ 紧密耦合 |
| **业务层耦合** | 中等 | ⚠️ 存在跨模块调用 |

### 主要发现

1. **数据库层耦合最高**: 所有服务均直接使用 Prisma 操作数据库，缺乏数据访问抽象层
2. **业务模块存在直接调用**: `console` 模块直接调用 `activities` 服务，`payments` 模块直接调用 `orders` 服务
3. **共享类型和工具集中**: 大量模块依赖 `@shared` 和 `@/lib` 中的公共代码
4. **中间件紧密耦合**: 认证中间件被 API 路由广泛使用，形成紧耦合
5. **模块导出规范**: 各模块遵循统一导出模式，有利于代码组织

---

## 模块架构概览

### 项目结构

```bash
src/
├── features/          # 功能模块层（25个模块）
│   ├── auth/         # 认证模块
│   ├── admin/        # 后台管理模块
│   ├── orders/       # 订单模块
│   ├── payments/     # 支付模块
│   ├── console/      # 用户控制台
│   ├── activities/   # 活动追踪
│   ├── notifications/ # 通知系统
│   ├── products/     # 产品管理
│   ├── referral/     # 推荐系统
│   ├── points/       # 积分系统
│   └── 其他模块...
├── app/              # Next.js 应用层
│   ├── api/          # API 路由
│   ├── [locale]/     # 国际化路由
│   └── layout.tsx
├── shared/           # 共享代码
│   ├── components/   # 共享UI组件
│   ├── hooks/        # 共享React Hooks
│   ├── layout/       # 共享布局
│   ├── types/        # 共享类型定义
│   ├── theme/        # 主题系统
│   └── utils/        # 工具函数
├── lib/              # 库层
│   ├── database/     # Prisma 数据库配置
│   ├── redis/        # Redis 客户端
│   ├── cache/        # 缓存管理
│   ├── validators/   # 验证器
│   └── 其他库...
└── i18n/             # 国际化配置
```

### 模块分类

**按功能分类:**

- **认证与授权**: auth, admin
- **业务核心**: orders, payments, products
- **用户交互**: console, profile, referral
- **系统功能**: activities, notifications, mail, points
- **内容管理**: articles, blog, search
- **工具与特性**: screenshot, theme-clone, help

**按所有权分类:**

- **基础模块** (5个): auth, profile, user, activities, notifications
- **核心业务** (5个): orders, payments, products, console, referral
- **增值模块** (15个): 其他功能模块

---

## 耦合度分类

### 耦合度级别定义

| 级别 | 描述 | 特征 | 示例 |
|------|------|------|------|
| **0 - 无耦合** | 完全独立 | 无任何依赖关系 | 静态工具函数、纯数据结构 |
| **1 - 松耦合** | 仅依赖公共接口 | 通过导出接口交互 | `@shared` 中的类型、工具 |
| **2 - 中等耦合** | 依赖公共库和中间件 | 使用共享中间件、验证器 | Prisma、验证器、日志 |
| **3 - 紧耦合** | 直接函数调用 | 模块间直接导入服务 | `console` → `activities` |
| **4 - 数据耦合** | 共享数据库表 | 直接操作相同 Prisma 模型 | 所有服务 → Prisma Client |
| **5 - 内容耦合** | 修改共享变量 | 全局状态修改 | 全局 Zustand store |

---

## 详细耦合度分析

### 1. 核心模块耦合度分析

#### 1.1 Auth (认证模块)

**耦合度评级**: 🟡 **3/5 - 紧耦合**

**依赖项:**

- `@prisma/client` - 用户数据操作
- `@next-auth/prisma-adapter` - NextAuth 集成
- `@shared/types/user` - 用户类型定义
- `@logger` - 日志服务
- `bcryptjs` - 密码加密

**特点:**

```typescript
// 认证配置中使用 Prisma 适配器
const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // ...
}

// RBAC 服务直接操作数据库
export async function hasPermission(userId: string, permission: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });
}
```

**耦合问题:**

- ❌ 直接依赖 Prisma 客户端
- ❌ 与 NextAuth 框架紧耦合
- ✅ 清晰的导出接口

**改进建议:**

- 创建 `UserRepository` 抽象层隔离数据访问
- 定义 `AuthProvider` 接口支持多种认证方式

---

#### 1.2 Orders (订单模块)

**耦合度评级**: 🟡 **3/5 - 紧耦合**

**依赖项:**

- `@prisma/client` - 订单数据操作
- `@features/payments` - 支付模块
- 日志、类型定义等

**跨模块依赖:**

```typescript
// orderService.ts - 与 payments 模块紧耦合
export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { payments: true }
  });
}
```

**耦合问题:**

- ❌ 与 payments 模块存在直接依赖
- ❌ 在支付时触发订单状态更新
- ⚠️ 假设 Payment 表存在外键关系

**改进建议:**

- 使用事件驱动模式替代直接函数调用
- 实现 `OrderEvent` 和 `PaymentEvent` 事件系统

---

#### 1.3 Payments (支付模块)

**耦合度评级**: 🔴 **4/5 - 数据耦合**

**依赖项:**

- `@prisma/client` - 多个支付表操作
- `@features/orders` - 订单服务调用
- Stripe、Alipay、WeChat SDK
- 发票、退款、分析子模块

**直接跨模块调用:**

```typescript
// payments/services/paymentService.ts
import { getOrderById, updateOrderStatus } from '@features/orders/services/orderService';

export async function updatePaymentStatus(paymentId: string, status: string) {
  const payment = await prisma.payment.update({...});
  
  // 直接调用 orders 模块
  if (status === 'SUCCESS') {
    await updateOrderStatus(payment.orderId, 'PAID');
  }
}
```

**耦合问题:**

- 🔴 直接调用 `orders` 模块的业务函数
- 🔴 数据库中有 `Payment.orderId` 外键关系
- 🔴 多个支付子模块（Stripe、Alipay、WeChat）共享支付逻辑
- ⚠️ 发票生成依赖订单和支付数据

**改进建议:**

- 实现 `PaymentGateway` 接口统一支付网关
- 使用 `PaymentProcessedEvent` 替代直接函数调用
- 创建 `PaymentRepository` 抽象数据访问

---

#### 1.4 Console (用户控制台)

**耦合度评级**: 🟡 **3/5 - 紧耦合**

**依赖项:**

- `@features/activities` - 活动服务
- Prisma 多表查询
- 用户评论、收藏等多个实体

**直接依赖分析:**

```typescript
// console/services/console.service.ts
import { ActivityService } from '@features/activities/services/activity.service';

export class ConsoleService {
  static async addFavorite(userId: string, comparisonId: string) {
    // ...
    // 直接调用 activities 模块
    await activityService.createActivity(userId, {
      activityType: ActivityType.FAVORITE_COMPARISON,
      // ...
    });
  }
}
```

**耦合问题:**

- ❌ 直接引入 `ActivityService`
- ❌ 硬编码 `ActivityType` 枚举值
- ⚠️ 深度的 Prisma 关系查询

**改进建议:**

- 使用事件系统发布 `FavoritedEvent` 替代直接调用
- 将活动追踪作为可选的事件监听器

---

### 2. 共享依赖耦合度分析

#### 2.1 Shared Types (@shared/types/user)

**耦合度评级**: 🟢 **1/5 - 松耦合**

**被依赖模块**: auth, profile, console, user, admin (5+个模块)

**依赖结构:**

```typescript
// @shared/types/user.ts
export interface UserProfile { /* ... */ }
export type UserRole = 'ADMIN' | 'EDITOR' | 'USER';
export interface NotificationPreferences { /* ... */ }

// 被多个模块导入
import { UserRole } from '@shared/types/user';
import { UserProfile } from '@shared/types/user';
```

**特点:**

- ✅ 单向依赖（仅导出类型）
- ✅ 不涉及业务逻辑
- ✅ 版本变更影响范围大

**耦合问题:**

- ⚠️ 如果修改 `UserRole` 类型，影响 5+ 个模块
- ⚠️ 类型变化可能导致多处编译错误

**改进建议:**

- 使用接口而非类型别名增加灵活性
- 添加向后兼容的类型版本机制

---

#### 2.2 Auth Middleware (@features/auth/middleware)

**耦合度评级**: 🟡 **2/5 - 中等耦合**

**被使用位置**: 所有 API 路由 (25+ 个端点)

**使用模式:**

```typescript
// 在所有需要认证的 API 端点中使用
import { requireAuth, requireAdmin } from '@features/auth/middleware/auth.middleware';

export const GET = requireAuth(async (user, request) => {
  // API 逻辑
});

export const GET = requireAdmin(async (user, request) => {
  // 仅管理员 API 逻辑
});
```

**耦合问题:**

- ⚠️ 所有受保护的 API 都依赖这个中间件
- ⚠️ 如果修改中间件签名，需要更新多个端点
- ✅ 中间件变更相对稳定

**改进建议:**

- 考虑使用 Next.js 原生 `middleware.ts` 进行全局认证
- 为中间件添加版本号便于迁移

---

#### 2.3 Prisma Client (@/lib/database/prisma)

**耦合度评级**: 🔴 **4/5 - 数据耦合**

**被依赖模块**: 所有业务模块 (15+ 个)

**耦合原因:**

```typescript
// 几乎所有服务都这样导入
import prisma from '@/lib/database/prisma';

export const activities = await prisma.activity.findMany({...});
export const orders = await prisma.order.findMany({...});
// ... 等等
```

**影响分析:**

- 🔴 所有模块都与数据库实现绑定
- 🔴 无法轻易切换数据库实现
- 🔴 无法模拟测试（单位测试困难）
- ⚠️ 数据库架构变更影响所有模块

**统计:**

- 直接使用 Prisma 的模块: `auth`, `orders`, `payments`, `articles`, `activities`, `notifications`, `console`, `mail` 等 (8+ 个)
- 总导入次数: 25+ 次

**改进建议:**

- 创建 `Repository` 模式抽象数据访问
- 实现 `DataAccessLayer` 接口

---

### 3. 业务模块间耦合关系

#### 3.1 支付-订单耦合 (🔴 高耦合)

**关系图:**

```bash
Orders 模块
    ↓
    └─→ Payment.orderId (外键)
        └─→ orders.services.updateOrderStatus()
            └─→ orders.services.getOrderById()
```

**耦合强度:**

- 数据库层: 🔴 强 (外键关系)
- 业务层: 🔴 强 (直接函数调用)
- 接口层: 🟡 中 (清晰的数据结构)

**具体案例:**

```typescript
// 支付成功时更新订单状态
async function updatePaymentStatus(paymentId: string, status: 'SUCCESS') {
  const payment = await prisma.payment.update({...});
  
  // 直接调用 orders 模块的内部函数
  if (status === 'SUCCESS') {
    await updateOrderStatus(payment.orderId, 'PAID');
  }
}
```

**改进方案:**

```typescript
// 方案1: 使用事件系统
class PaymentService {
  async updatePaymentStatus(paymentId: string, status: string) {
    const payment = await this.updatePaymentDb(paymentId, status);
    if (status === 'SUCCESS') {
      // 发布事件，订单模块通过事件监听器响应
      await eventBus.publish('payment.completed', { paymentId, orderId: payment.orderId });
    }
  }
}

// 方案2: 使用 API 调用（跨模块 API）
async function notifyOrderPaymentSuccess(orderId: string) {
  return await fetch('/api/orders/payment-success', {
    method: 'POST',
    body: JSON.stringify({ orderId })
  });
}
```

---

#### 3.2 控制台-活动耦合 (🟡 中耦合)

**关系图:**

```bash
Console 模块
    ↓
    └─→ ActivityService.createActivity()
        └─→ activities.services
            └─→ prisma.userActivity.create()
```

**耦合分析:**

```typescript
// console/services/console.service.ts - 第1行
import { ActivityService } from '@features/activities/services/activity.service';

// 在 addFavorite 方法中直接调用
await activityService.createActivity(userId, {
  activityType: ActivityType.FAVORITE_COMPARISON,
  targetId: comparisonId,
  targetType: 'comparison',
  metadata: { problemId: comparison.problemId }
});
```

**耦合特点:**

- ⚠️ 直接导入 `ActivityService` 类
- ⚠️ 硬编码 `ActivityType` 枚举
- ✅ 通过服务类调用（相对稳定）

**改进建议:**

- 使用依赖注入模式
- 实现活动追踪的观察者模式

---

### 4. 数据库架构耦合度

#### 4.1 Prisma 直接依赖

**问题分析:**

所有模块都直接使用 `@prisma/client`:

| 模块 | 直接 Prisma 调用数 | 表依赖 |
|------|-----|------|
| auth | 3+ | User, Role, Permission |
| orders | 4+ | Order, Payment, Product |
| payments | 6+ | Payment, Order, Invoice, Refund |
| notifications | 3+ | Notification, NotificationSettings |
| activities | 2+ | Activity, ActivityLog |
| console | 8+ | Review, Favorite, Activity, Settings |
| articles | 2+ | Article, Category |
| **总计** | **28+** | **15+ 表** |

**耦合度指标:**

```bash
耦合度公式: (直接Prisma调用数 × 表数) / (模块总数 × 架构级别)
          = (28 × 15) / (25 × 3)
          = 420 / 75
          = 5.6 (高耦合)
```

**影响范围:**

- 🔴 数据库迁移风险高
- 🔴 难以进行单元测试
- 🔴 难以实现模块独立开发
- ⚠️ 模型变更需要多个模块同步更新

---

## 跨模块依赖关系

### 依赖关系图（部分关键模块）

```bash
┌─────────────────────────────────────────────────┐
│                 Auth (认证中心)                  │
│  ├─ @shared/types/user                          │
│  ├─ @prisma/client (User, Role, Permission)     │
│  └─ @logger                                     │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ↓              ↓              ↓
┌────────┐   ┌─────────┐    ┌──────────┐
│ Admin  │   │ Orders  │    │ Console  │
│        │   │         │    │          │
│ @shared│   │@prisma  │    │@prisma   │
│/types  │   │@shared  │    │@shared   │
│        │   └────┬────┘    │@features │
└────────┘        │         │/activities│
                   │        └───────────┘
                   │
                   ↓
        ┌──────────────────┐
        │    Payments      │
        │                  │
        │ @prisma (8表)     │
        │ @features/orders │ ← 紧耦合
        │ @stripe/@alipay  │
        └──────────────────┘
```

### 模块间依赖统计

**出度（依赖其他模块）:**

| 模块 | 依赖数 | 依赖模块列表 |
|------|--------|-----------|
| payments | 2 | orders, notifications |
| console | 2 | activities, notifications |
| admin | 1 | auth (中间件) |
| orders | 1 | notifications (事件) |
| auth | 0 | (基础模块) |

**入度（被其他模块依赖）:**

| 模块 | 被依赖数 | 依赖者 |
|------|---------|--------|
| auth | 5+ | admin, orders, payments, console, user |
| orders | 2 | payments, notifications |
| activities | 1 | console |
| shared | 10+ | 所有模块 |
| lib | 15+ | 所有模块 |

---

## 耦合度改进建议

### 优先级 1: 高风险（需要立即改进）

#### 1.1 数据访问层抽象

**问题:** 所有模块直接使用 Prisma

**建议方案:**

```typescript
// lib/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  constructor(protected prisma: PrismaClient) {}
  
  async findById(id: string): Promise<T | null> {
    // 由子类实现
    throw new Error('Not implemented');
  }
  
  async findAll(filters?: Record<string, any>): Promise<T[]> {
    throw new Error('Not implemented');
  }
}

// features/orders/repositories/order.repository.ts
export class OrderRepository extends BaseRepository<Order> {
  async findById(id: string): Promise<Order | null> {
    return await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
  }
  
  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
}

// features/orders/services/order.service.ts - 使用 Repository
export class OrderService {
  constructor(private repository: OrderRepository) {}
  
  async getOrder(id: string) {
    return await this.repository.findById(id);
  }
}
```

**迁移步骤:**

1. 为每个业务模块创建 `repositories/` 目录
2. 逐步将 Prisma 调用迁移到 Repository 类
3. 更新服务类依赖 Repository 而非 Prisma
4. 添加 Repository 接口定义便于测试 Mock

**预期效果:**

- ✅ 降低耦合度 1-2 级
- ✅ 便于数据库迁移
- ✅ 便于单元测试
- ✅ 提高代码复用性

---

#### 1.2 支付-订单解耦

**问题:** payments 模块直接调用 orders 模块的函数

**建议方案: 事件驱动架构**

```typescript
// lib/events/event-bus.ts
export class EventBus {
  private listeners: Map<string, Function[]> = new Map();
  
  subscribe(eventName: string, listener: Function) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(listener);
  }
  
  async publish(eventName: string, payload: any) {
    const listeners = this.listeners.get(eventName) || [];
    await Promise.all(listeners.map(l => l(payload)));
  }
}

export const eventBus = new EventBus();

// features/payments/services/payment.service.ts - 发布事件
import { eventBus } from '@/lib/events/event-bus';

export async function updatePaymentStatus(paymentId: string, status: string) {
  const payment = await prisma.payment.update({...});
  
  if (status === 'SUCCESS') {
    // 发布事件而不是直接调用
    await eventBus.publish('payment:completed', {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount
    });
  }
  
  return payment;
}

// features/orders/listeners/payment-completed.listener.ts - 监听事件
import { eventBus } from '@/lib/events/event-bus';

eventBus.subscribe('payment:completed', async (payload) => {
  await OrderService.updateStatus(payload.orderId, 'PAID');
});
```

**迁移步骤:**

1. 创建 `lib/events/event-bus.ts`
2. 在 payments 模块中替换直接函数调用为事件发布
3. 在 orders 模块中添加事件监听器
4. 逐步扩展事件系统到其他跨模块交互

**预期效果:**

- ✅ 完全解耦 payments 和 orders
- ✅ 支持异步处理
- ✅ 便于添加新的事件监听器
- ✅ 提高系统可扩展性

---

#### 1.3 Activities 模块可选化

**问题:** console 模块硬依赖 activities 模块

**建议方案: 可选的活动追踪**

```typescript
// lib/tracking/activity-tracker.ts
export interface IActivityTracker {
  track(userId: string, event: ActivityEvent): Promise<void>;
}

export class NoOpActivityTracker implements IActivityTracker {
  async track(): Promise<void> {
    // 空实现，不做任何事
  }
}

export class PrismaActivityTracker implements IActivityTracker {
  async track(userId: string, event: ActivityEvent): Promise<void> {
    await activityService.createActivity(userId, event);
  }
}

// lib/tracking/activity-tracker.factory.ts
export function createActivityTracker(): IActivityTracker {
  if (process.env.ENABLE_ACTIVITY_TRACKING === 'false') {
    return new NoOpActivityTracker();
  }
  return new PrismaActivityTracker();
}

// features/console/services/console.service.ts - 使用抽象
export class ConsoleService {
  constructor(private activityTracker: IActivityTracker) {}
  
  async addFavorite(userId: string, comparisonId: string) {
    const favorite = await this.createFavorite(userId, comparisonId);
    
    // 可选的活动追踪
    await this.activityTracker.track(userId, {
      type: ActivityType.FAVORITE_COMPARISON,
      targetId: comparisonId
    });
    
    return favorite;
  }
}
```

**迁移步骤:**

1. 创建 `IActivityTracker` 接口
2. 实现 `NoOpActivityTracker` 和 `PrismaActivityTracker`
3. 更新 ConsoleService 构造函数接收 tracker 依赖
4. 通过依赖注入配置使用的 tracker 实现

**预期效果:**

- ✅ 使活动追踪可选
- ✅ 降低耦合度
- ✅ 便于测试
- ✅ 支持灵活配置

---

### 优先级 2: 中风险（建议改进）

#### 2.1 共享类型版本化

**问题:** `UserRole` 等类型被多个模块使用，变更影响范围大

**建议方案:**

```typescript
// @shared/types/user/v1.ts
export type UserRoleV1 = 'ADMIN' | 'EDITOR' | 'USER';

// @shared/types/user/v2.ts (未来版本)
export type UserRoleV2 = 'ADMIN' | 'EDITOR' | 'USER' | 'GUEST';

// @shared/types/user/index.ts
export type { UserRoleV1 } from './v1';
export type { UserRoleV2 } from './v2';

// 当前默认
export type UserRole = UserRoleV1;
```

**预期效果:**

- ✅ 支持平滑的类型迁移
- ✅ 向后兼容
- ✅ 便于长期维护

---

#### 2.2 中间件版本化

**问题:** `requireAuth` 中间件被多个 API 使用，变更需要协调

**建议方案:**

```typescript
// features/auth/middleware/v1.middleware.ts
export function requireAuthV1(handler: Function) {
  return async (user, request) => {
    // V1 实现
  };
}

// features/auth/middleware/v2.middleware.ts - 改进版
export function requireAuthV2(handler: Function) {
  return async (user, request) => {
    // V2 实现，向后兼容
  };
}

// 当前导出
export const requireAuth = requireAuthV2;

// 旧版本导出（便于迁移）
export const requireAuthV1 = requireAuthV1;
```

---

### 优先级 3: 低风险（长期优化）

#### 3.1 邮件系统解耦

**建议:** 将邮件作为独立的微服务或异步队列

```typescript
// features/mail/queue/mail-queue.ts
export interface IMailQueue {
  enqueue(task: MailTask): Promise<void>;
}

// 使用场景
async function sendOrderConfirmation(orderId: string) {
  const order = await orderService.getOrder(orderId);
  
  // 不阻塞订单创建流程
  await mailQueue.enqueue({
    type: 'order.confirmation',
    to: order.customer.email,
    data: order
  });
}
```

---

## 依赖矩阵

### 模块间依赖矩阵 (M 表示依赖)

```bash
             Auth  Admin  Orders  Payments  Console  Activities  Shared  Lib
Auth          -     -      -       -         -        -           M      M
Admin         M     -      -       -         -        -           M      M
Orders        M     -      -       -         -        -           M      M
Payments      M     -      M       -         -        -           M      M
Console       M     -      -       -         -        M           M      M
Activities    -     -      -       -         -        -           M      M
Notifications -     -      -       -         -        -           M      M
Shared        -     -      -       -         -        -           -      -
Lib           -     -      -       -         -        -           -      -
```

### 耦合度热力图

```bash
高耦合区域 (红):
- Payments ↔ Orders (直接函数调用 + 外键)
- All ↔ Prisma (直接使用)
- All ↔ Shared Types (类型依赖)

中等耦合区域 (黄):
- Console ↔ Activities (直接导入)
- Admin ↔ Auth (中间件)
- API 路由 ↔ Auth Middleware (广泛使用)

低耦合区域 (绿):
- Blog ↔ Search (通过 API)
- Referral ↔ Points (通过事件，假设已实现)
- Articles ↔ 其他 (相对独立)
```

---

## 总体改进路线图

### 短期 (1-2 周)

- [ ] 文档化所有跨模块依赖关系
- [ ] 创建 `lib/repositories` 基础设施
- [ ] 为 `OrderRepository` 和 `PaymentRepository` 创建初始实现
- [ ] 添加单元测试覆盖 Repository 层

### 中期 (3-4 周)

- [ ] 完成数据访问层抽象（Repository 模式）
- [ ] 实现事件总线系统
- [ ] 迁移 Payments ↔ Orders 交互到事件驱动
- [ ] 添加事件监听器的单元测试

### 长期 (1-2 月)

- [ ] 所有业务模块都使用 Repository 模式
- [ ] 完全事件驱动的跨模块通信
- [ ] 微服务准备（邮件、文件上传等）
- [ ] 完整的可测试性和可维护性提升

---

## 耦合度检查清单

使用此清单评估新模块或修改是否增加耦合度：

### 新模块开发检查表

- [ ] 模块不直接使用 Prisma，而是通过 Repository
- [ ] 模块间通信使用接口或事件，不是直接函数调用
- [ ] 模块导出清晰的公共 API（通过 `index.ts`）
- [ ] 模块有明确的职责边界
- [ ] 模块的单元测试可以不依赖其他业务模块
- [ ] 跨模块依赖不超过 2-3 个

### 跨模块调用审查表

- [ ] 是否存在直接的 `import` 业务逻辑（❌ 坏）
- [ ] 是否应该使用事件或 API（✅ 好）
- [ ] 是否有循环依赖（❌ 必须避免）
- [ ] 是否所有依赖都在 `tsconfig.json` 路径中定义（✅ 好）
- [ ] 变更该模块是否会影响 3 个以上其他模块（⚠️ 高风险）

---

## 附录 A: 各模块文件列表

### 高耦合模块 (需要重点关注)

1. **Payments** (`src/features/payments/`)
   - 8 个服务文件
   - 4 个支付网关集成
   - 依赖: Orders, Notifications, Prisma

2. **Console** (`src/features/console/`)
   - 4 个 Hook 文件
   - 4 个组件文件
   - 依赖: Activities, Prisma

3. **Orders** (`src/features/orders/`)
   - 多个服务文件
   - 被 Payments 依赖
   - 依赖: Prisma

### 独立性较好的模块

1. **Articles** - 相对独立
2. **Blog** - 相对独立
3. **Help** - 相对独立
4. **Theme Clone** - 工具模块
5. **Screenshot** - 工具模块

---

## 附录 B: 改进收益评估

| 改进方案 | 投入 | 收益 | 风险 | 优先级 |
|---------|------|------|------|--------|
| Repository 模式 | 中 | 高 | 低 | 🔴 高 |
| 事件驱动系统 | 高 | 高 | 中 | 🔴 高 |
| 活动追踪可选化 | 低 | 中 | 低 | 🟡 中 |
| 类型版本化 | 中 | 中 | 低 | 🟡 中 |
| 中间件版本化 | 低 | 中 | 低 | 🟡 中 |
| 邮件系统微服务化 | 高 | 高 | 中 | 🟢 低 |

---

## 结论

本项目模块架构总体规范，遵循明确的目录结构和导出规范。但在数据访问层和跨模块通信方面存在较高耦合。

**关键改进方向:**

1. 🔴 **数据访问层**: Repository 模式隔离 Prisma
2. 🔴 **跨模块通信**: 事件驱动替代直接函数调用
3. 🟡 **可选功能**: 支持灵活的功能启用/禁用
4. 🟡 **测试友好**: 支持依赖注入和 Mock

通过这些改进，项目的耦合度将从目前的 **中等偏高** 降低至 **中等**，显著提升代码的可维护性、可测试性和可扩展性。

---

**文档版本**: 1.0  
**最后更新**: 2025-11-04  
**维护者**: 项目开发团队
