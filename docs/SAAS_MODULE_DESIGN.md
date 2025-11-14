# SaaS 功能模块设计报告

> 基于 Next.js 15 通用模板的 SaaS 功能补充方案  
> **版本**: 1.0.0  
> **日期**: 2025-10-27

---

## 📋 目录

1. [现状分析](#现状分析)
2. [核心缺失模块](#核心缺失模块)
3. [模块详细设计](#模块详细设计)
4. [数据库 Schema 设计](#数据库-schema-设计)
5. [技术实现方案](#技术实现方案)
6. [开发优先级](#开发优先级)
7. [安全与合规](#安全与合规)

---

## 现状分析

### 已有功能模块

| 模块 | 状态 | 完整度 | 说明 |
|------|------|--------|------|
| 认证系统 (Auth) | ✅ 完整 | 95% | NextAuth v5 + JWT + OAuth |
| 用户管理 (User) | ✅ 完整 | 90% | 基础用户信息管理 |
| 博客系统 (Blog) | ✅ 完整 | 85% | Markdown 内容管理 |
| 文章管理 (Articles) | ✅ 完整 | 90% | CRUD + 权限控制 |
| 积分系统 (Points) | ✅ 完整 | 80% | 积分获取、消费、记录 |
| 推荐系统 (Referral) | ✅ 完整 | 85% | 推荐码、关系追踪、转化分析 |
| 通知系统 (Notifications) | ✅ 完整 | 80% | 实时通知、订阅管理 |
| 用户控制台 (Console) | ✅ 完整 | 85% | 个人中心、活动记录 |
| 管理后台 (Admin) | ⚠️ 部分 | 60% | 基础管理功能 |
| 搜索功能 (Search) | ✅ 完整 | 75% | 全文搜索、过滤排序 |

### SaaS 关键缺失

作为一个完整的 SaaS 模板，当前项目**缺少以下核心商业化模块**：

| 缺失模块 | 重要性 | 业务影响 | 实现复杂度 |
|---------|--------|----------|-----------|
| 💰 订阅管理 | ⭐⭐⭐⭐⭐ | 无法实现付费订阅 | 中 |
| 💳 支付集成 | ⭐⭐⭐⭐⭐ | 无法收取费用 | 高 |
| 📊 配额管理 | ⭐⭐⭐⭐⭐ | 无法限制资源使用 | 中 |
| 📜 发票管理 | ⭐⭐⭐⭐ | 无法生成合规发票 | 中 |
| 👥 团队协作 | ⭐⭐⭐⭐ | 无法支持团队用户 | 高 |
| 🔑 API 密钥管理 | ⭐⭐⭐⭐ | 无法提供 API 访问 | 中 |
| 📈 使用分析 | ⭐⭐⭐⭐ | 无法追踪产品使用 | 高 |
| ⚙️ 功能开关 | ⭐⭐⭐ | 无法灰度发布 | 低 |
| 🎫 工单系统 | ⭐⭐⭐ | 无法提供客户支持 | 中 |
| 📝 审计日志 | ⭐⭐⭐ | 无法满足合规要求 | 低 |

---

## 核心缺失模块

### 1. 订阅管理系统 (Subscription) ⭐⭐⭐⭐⭐

**业务价值**
- SaaS 应用的核心商业模式
- 实现多层级套餐定价
- 支持月付/年付/终身等计费周期
- 自动续费与到期管理

**核心功能**
- ✅ 套餐计划管理（免费版、专业版、企业版）
- ✅ 订阅创建与激活
- ✅ 订阅升级/降级
- ✅ 订阅续费与取消
- ✅ 试用期管理
- ✅ 套餐特性权限控制
- ✅ 订阅状态追踪

**目录结构**
```bash
src/features/subscription/
├── components/
│   ├── PlanCard.tsx
│   ├── PlanComparison.tsx
│   ├── UpgradeDialog.tsx
│   └── SubscriptionStatus.tsx
├── hooks/
│   ├── useSubscription.ts
│   ├── useUpgrade.ts
│   └── usePlanFeatures.ts
├── services/
│   ├── subscription.service.ts
│   ├── plan.service.ts
│   └── billing-cycle.service.ts
├── types/
│   └── subscription.types.ts
├── validators/
│   └── subscription.schema.ts
├── index.ts
└── README.md
```

---

### 2. 支付集成系统 (Payment) ⭐⭐⭐⭐⭐

**业务价值**
- 实现收入转化
- 支持多种支付方式
- 自动对账与退款

**核心功能**
- ✅ 支付宝集成
- ✅ 微信支付集成
- ✅ Stripe 集成（国际支付）
- ✅ 订单创建与支付
- ✅ 支付回调处理
- ✅ 退款管理
- ✅ 支付历史记录

**目录结构**
```bash
src/features/payment/
├── providers/
│   ├── alipay.provider.ts
│   ├── wechat.provider.ts
│   └── stripe.provider.ts
├── services/
│   ├── payment.service.ts
│   ├── order.service.ts
│   └── refund.service.ts
├── webhooks/
│   ├── alipay-webhook.ts
│   ├── wechat-webhook.ts
│   └── stripe-webhook.ts
├── types/
│   └── payment.types.ts
└── README.md
```

---

### 3. 配额管理系统 (Quota) ⭐⭐⭐⭐⭐

**业务价值**
- 按套餐限制资源使用
- 防止滥用与超量消费
- 推动用户升级套餐

**核心功能**
- ✅ 配额定义（API 调用、存储空间、项目数量等）
- ✅ 配额消费追踪
- ✅ 配额重置（月度/年度）
- ✅ 配额预警（80%/90%/100%）
- ✅ 超额处理策略

**目录结构**
```bash
src/features/quota/
├── middleware/
│   └── checkQuota.ts
├── services/
│   ├── quota.service.ts
│   ├── usage-tracker.service.ts
│   └── quota-reset.service.ts
├── types/
│   └── quota.types.ts
└── README.md
```

---

### 4. 团队协作系统 (Team) ⭐⭐⭐⭐

**业务价值**
- 支持企业级客户
- 提高客单价（团队版定价更高）
- 增强用户粘性

**核心功能**
- ✅ 团队创建与管理
- ✅ 成员邀请与加入
- ✅ 角色权限管理（Owner/Admin/Member）
- ✅ 团队资源共享
- ✅ 团队配额管理
- ✅ 团队账单统一管理

**目录结构**
```bash
src/features/team/
├── components/
│   ├── TeamList.tsx
│   ├── TeamSettings.tsx
│   ├── MemberList.tsx
│   └── InviteMemberDialog.tsx
├── hooks/
│   ├── useTeam.ts
│   ├── useTeamMembers.ts
│   └── useTeamPermissions.ts
├── services/
│   ├── team.service.ts
│   ├── member.service.ts
│   └── invitation.service.ts
├── types/
│   └── team.types.ts
└── README.md
```

---

### 5. API 密钥管理系统 (API Keys) ⭐⭐⭐⭐

**业务价值**
- 提供开放 API 服务
- 扩展产品使用场景
- 增加产品粘性

**核心功能**
- ✅ API Key 生成与管理
- ✅ 权限范围控制（Scopes）
- ✅ 密钥轮换与撤销
- ✅ 使用率统计
- ✅ IP 白名单
- ✅ 速率限制

**目录结构**
```bash
src/features/api-keys/
├── components/
│   ├── ApiKeyList.tsx
│   ├── CreateApiKeyDialog.tsx
│   └── ApiKeyUsageChart.tsx
├── middleware/
│   └── validateApiKey.ts
├── services/
│   ├── api-key.service.ts
│   └── api-usage.service.ts
├── types/
│   └── api-key.types.ts
└── README.md
```

---

### 6. 发票管理系统 (Invoice) ⭐⭐⭐⭐

**业务价值**
- 满足企业客户合规需求
- 提升品牌专业度
- 自动化财务流程

**核心功能**
- ✅ 发票自动生成
- ✅ 发票模板定制
- ✅ 发票 PDF 导出
- ✅ 发票邮件发送
- ✅ 增值税发票支持
- ✅ 发票历史记录

**目录结构**
```bash
src/features/invoice/
├── components/
│   ├── InvoiceList.tsx
│   ├── InvoiceDetail.tsx
│   └── InvoiceTemplate.tsx
├── services/
│   ├── invoice.service.ts
│   ├── invoice-generator.service.ts
│   └── pdf-generator.service.ts
├── templates/
│   └── invoice-template.html
└── README.md
```

---

### 7. 使用分析系统 (Analytics) ⭐⭐⭐⭐

**业务价值**
- 了解用户行为模式
- 优化产品功能
- 数据驱动决策

**核心功能**
- ✅ 用户行为追踪
- ✅ 功能使用统计
- ✅ 留存率分析
- ✅ 漏斗分析
- ✅ 自定义事件追踪
- ✅ 实时数据看板

**目录结构**
```bash
src/features/analytics/
├── components/
│   ├── AnalyticsDashboard.tsx
│   ├── MetricsCard.tsx
│   └── UsageChart.tsx
├── services/
│   ├── analytics.service.ts
│   ├── event-tracker.service.ts
│   └── metrics.service.ts
├── hooks/
│   ├── useAnalytics.ts
│   └── useTrackEvent.ts
└── README.md
```

---

### 8. 工单系统 (Support Tickets) ⭐⭐⭐

**业务价值**
- 提供客户支持服务
- 提升客户满意度
- 收集产品反馈

**核心功能**
- ✅ 工单创建与提交
- ✅ 工单分类与优先级
- ✅ 工单分配与流转
- ✅ 工单回复与附件
- ✅ 工单状态追踪
- ✅ SLA 管理

**目录结构**
```bash
src/features/support/
├── components/
│   ├── TicketList.tsx
│   ├── TicketDetail.tsx
│   ├── CreateTicketDialog.tsx
│   └── TicketReply.tsx
├── services/
│   ├── ticket.service.ts
│   └── sla.service.ts
└── README.md
```

---

### 9. 功能开关系统 (Feature Flags) ⭐⭐⭐

**业务价值**
- 灰度发布新功能
- A/B 测试
- 快速回滚问题功能

**核心功能**
- ✅ 功能开关定义
- ✅ 用户/团队级别控制
- ✅ 百分比灰度
- ✅ 环境隔离
- ✅ 开关监控与分析

**目录结构**
```bash
src/features/feature-flags/
├── components/
│   └── FeatureFlag.tsx
├── hooks/
│   └── useFeatureFlag.ts
├── services/
│   └── feature-flag.service.ts
└── README.md
```

---

### 10. 审计日志系统 (Audit Logs) ⭐⭐⭐

**业务价值**
- 满足安全合规要求
- 追踪敏感操作
- 问题排查与取证

**核心功能**
- ✅ 操作日志记录
- ✅ 敏感操作审计
- ✅ 日志查询与筛选
- ✅ 日志导出
- ✅ 日志保留策略

**目录结构**
```bash
src/features/audit/
├── components/
│   ├── AuditLogList.tsx
│   └── AuditLogDetail.tsx
├── services/
│   └── audit.service.ts
├── middleware/
│   └── logAudit.ts
└── README.md
```

---

## 模块详细设计

### 订阅管理系统详细设计

#### 数据模型

```typescript
// 订阅计划
interface Plan {
  id: string;
  name: string; // 'free', 'pro', 'enterprise'
  displayName: string; // '免费版', '专业版', '企业版'
  description?: string;
  price: number;
  currency: string; // 'CNY', 'USD'
  interval: 'month' | 'year' | 'lifetime';
  intervalCount: number; // 1, 12
  trialDays: number; // 试用天数
  features: PlanFeature[];
  limits: PlanLimits;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
}

// 套餐特性
interface PlanFeature {
  key: string; // 'unlimited_projects'
  name: string; // '无限项目'
  description?: string;
  included: boolean;
  value?: any; // 特性值
}

// 套餐限制
interface PlanLimits {
  projects?: number; // -1 表示无限制
  storage?: number; // GB
  apiCalls?: number; // 每月
  teamMembers?: number;
  customDomain?: boolean;
  prioritySupport?: boolean;
}

// 用户订阅
interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  endedAt?: Date;
  metadata?: Record<string, any>;
}
```

#### 核心服务

```typescript
// subscription.service.ts
export class SubscriptionService {
  // 创建订阅
  async createSubscription(params: {
    userId: string;
    planId: string;
    trialDays?: number;
  }): Promise<Subscription> {
    const plan = await this.getPlan(params.planId);
    const trialEnd = params.trialDays 
      ? addDays(new Date(), params.trialDays)
      : null;
    
    return await prisma.subscription.create({
      data: {
        userId: params.userId,
        planId: params.planId,
        status: trialEnd ? 'trialing' : 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(plan),
        trialEnd,
      },
    });
  }
  
  // 升级订阅
  async upgradeSubscription(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(subscriptionId);
    const newPlan = await this.getPlan(newPlanId);
    
    // 计算差价
    const prorationAmount = await this.calculateProration(
      subscription,
      newPlan
    );
    
    // 更新订阅
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: newPlanId,
        // 立即生效
        currentPeriodEnd: this.calculatePeriodEnd(newPlan),
      },
    });
  }
  
  // 取消订阅
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<Subscription> {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        canceledAt: new Date(),
        cancelAtPeriodEnd: !immediately,
        ...(immediately && {
          status: 'canceled',
          endedAt: new Date(),
        }),
      },
    });
  }
  
  // 检查订阅状态
  async checkSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    subscription?: Subscription;
    plan?: Plan;
  }> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['trialing', 'active'] },
      },
      include: { plan: true },
    });
    
    return {
      hasActiveSubscription: !!subscription,
      subscription,
      plan: subscription?.plan,
    };
  }
}
```

---

### 支付集成系统详细设计

#### 数据模型

```typescript
// 支付订单
interface PaymentOrder {
  id: string;
  orderNumber: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  provider: 'alipay' | 'wechat' | 'stripe';
  providerOrderId?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  paidAt?: Date;
  refundedAt?: Date;
  metadata?: Record<string, any>;
}
```

#### 支付提供商接口

```typescript
// payment-provider.interface.ts
export interface PaymentProvider {
  // 创建支付订单
  createPaymentOrder(params: {
    amount: number;
    currency: string;
    orderId: string;
    userId: string;
    returnUrl: string;
    notifyUrl: string;
  }): Promise<{
    paymentUrl?: string;
    qrCode?: string;
    formData?: any;
  }>;
  
  // 查询订单状态
  queryOrderStatus(providerOrderId: string): Promise<{
    status: string;
    paidAt?: Date;
  }>;
  
  // 申请退款
  refund(params: {
    providerOrderId: string;
    amount: number;
    reason: string;
  }): Promise<{
    refundId: string;
    status: string;
  }>;
  
  // 验证回调签名
  verifyWebhookSignature(
    payload: any,
    signature: string
  ): boolean;
}
```

#### 支付宝实现

```typescript
// alipay.provider.ts
export class AlipayProvider implements PaymentProvider {
  private client: AlipaySdk;
  
  constructor() {
    this.client = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
      gateway: 'https://openapi.alipay.com/gateway.do',
    });
  }
  
  async createPaymentOrder(params: {
    amount: number;
    currency: string;
    orderId: string;
    returnUrl: string;
    notifyUrl: string;
  }): Promise<{ paymentUrl: string }> {
    const result = await this.client.pageExec(
      'alipay.trade.page.pay',
      {
        out_trade_no: params.orderId,
        total_amount: params.amount.toFixed(2),
        subject: '订阅付款',
        product_code: 'FAST_INSTANT_TRADE_PAY',
        return_url: params.returnUrl,
        notify_url: params.notifyUrl,
      }
    );
    
    return { paymentUrl: result };
  }
  
  // ... 其他方法实现
}
```

---

### 配额管理系统详细设计

#### 核心服务

```typescript
// quota.service.ts
export class QuotaService {
  // 检查配额
  async checkQuota(
    userId: string,
    resource: string,
    amount: number = 1
  ): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
  }> {
    const usage = await this.getOrCreateUsage(userId, resource);
    
    const remaining = usage.limit - usage.used;
    const allowed = remaining >= amount;
    
    return {
      allowed,
      current: usage.used,
      limit: usage.limit,
      remaining,
    };
  }
  
  // 消费配额
  async consumeQuota(
    userId: string,
    resource: string,
    amount: number = 1
  ): Promise<void> {
    const check = await this.checkQuota(userId, resource, amount);
    
    if (!check.allowed) {
      throw new QuotaExceededError(
        `Quota exceeded for ${resource}. ` +
        `Used: ${check.current}, Limit: ${check.limit}`
      );
    }
    
    await prisma.quotaUsage.update({
      where: {
        userId_resource_periodStart: {
          userId,
          resource,
          periodStart: this.getCurrentPeriodStart(),
        },
      },
      data: {
        used: { increment: amount },
      },
    });
    
    // 检查是否需要发送配额预警
    await this.checkQuotaWarning(userId, resource);
  }
  
  // 重置配额
  async resetQuota(userId: string, resource: string): Promise<void> {
    await prisma.quotaUsage.updateMany({
      where: {
        userId,
        resource,
        periodEnd: { lte: new Date() },
      },
      data: {
        used: 0,
        periodStart: this.getCurrentPeriodStart(),
        periodEnd: this.getCurrentPeriodEnd(),
      },
    });
  }
}
```

#### 配额中间件

```typescript
// checkQuota.middleware.ts
export function checkQuotaMiddleware(resource: string) {
  return async (req: Request, user: User) => {
    const quotaService = new QuotaService();
    
    const check = await quotaService.checkQuota(user.id, resource);
    
    if (!check.allowed) {
      throw new APIError({
        code: 'QUOTA_EXCEEDED',
        message: `您的${resource}配额已用完，请升级套餐`,
        statusCode: 429,
      });
    }
    
    // 在请求处理后消费配额
    req.on('finish', async () => {
      await quotaService.consumeQuota(user.id, resource);
    });
  };
}

// 使用示例
export const POST = requireAuth(
  checkQuotaMiddleware('api_calls'),
  async (user, request) => {
    // API 处理逻辑
  }
);
```

---

## 数据库 Schema 设计

### 核心表结构

```prisma
// ============================================
// 订阅与计费系统
// ============================================

model Plan {
  id            String   @id @default(cuid())
  name          String   @unique
  displayName   String
  description   String?
  price         Decimal  @default(0) @db.Decimal(10, 2)
  currency      String   @default("CNY")
  interval      String   // 'month', 'year', 'lifetime'
  intervalCount Int      @default(1)
  trialDays     Int      @default(0)
  features      Json
  limits        Json
  metadata      Json?
  isActive      Boolean  @default(true)
  isPublic      Boolean  @default(true)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  subscriptions Subscription[]
  
  @@map("plans")
}

model Subscription {
  id                 String             @id @default(cuid())
  userId             String
  planId             String
  status             SubscriptionStatus @default(TRIALING)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  trialStart         DateTime?
  trialEnd           DateTime?
  canceledAt         DateTime?
  cancelAtPeriodEnd  Boolean            @default(false)
  endedAt            DateTime?
  metadata           Json?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  
  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan               Plan               @relation(fields: [planId], references: [id])
  invoices           Invoice[]
  
  @@index([userId])
  @@index([status])
  @@index([currentPeriodEnd])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

model PaymentOrder {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String
  subscriptionId  String?
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("CNY")
  provider        String
  providerOrderId String?
  status          PaymentStatus @default(PENDING)
  paidAt          DateTime?
  refundedAt      DateTime?
  metadata        Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
  @@map("payment_orders")
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  REFUNDED
  CANCELED
}

// ============================================
// 配额管理系统
// ============================================

model QuotaLimit {
  id        String   @id @default(cuid())
  planId    String
  resource  String
  limit     Int
  period    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([planId, resource, period])
  @@map("quota_limits")
}

model QuotaUsage {
  id          String   @id @default(cuid())
  userId      String
  teamId      String?
  resource    String
  used        Int      @default(0)
  limit       Int
  periodStart DateTime
  periodEnd   DateTime
  resetAt     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, resource, periodStart])
  @@map("quota_usage")
}

// ============================================
// 团队协作系统
// ============================================

model Team {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  ownerId     String
  planId      String?
  avatar      String?
  description String?
  settings    Json?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  owner       User             @relation("TeamOwner", fields: [ownerId], references: [id])
  members     TeamMember[]
  invitations TeamInvitation[]
  
  @@map("teams")
}

model TeamMember {
  id          String   @id @default(cuid())
  teamId      String
  userId      String
  role        TeamRole
  permissions String[] @default([])
  joinedAt    DateTime @default(now())
  
  team        Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([teamId, userId])
  @@map("team_members")
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}

model TeamInvitation {
  id         String   @id @default(cuid())
  teamId     String
  email      String
  role       TeamRole @default(MEMBER)
  invitedBy  String
  token      String   @unique
  expiresAt  DateTime
  acceptedAt DateTime?
  createdAt  DateTime @default(now())
  
  team       Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  inviter    User     @relation(fields: [invitedBy], references: [id])
  
  @@map("team_invitations")
}

// ============================================
// API 密钥管理
// ============================================

model ApiKey {
  id          String        @id @default(cuid())
  userId      String
  teamId      String?
  name        String
  key         String        @unique
  hashedKey   String
  scopes      String[]      @default([])
  ipWhitelist String[]      @default([])
  rateLimit   Int?
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  usageLogs   ApiUsageLog[]
  
  @@map("api_keys")
}

model ApiUsageLog {
  id          String   @id @default(cuid())
  apiKeyId    String
  endpoint    String
  method      String
  statusCode  Int
  ipAddress   String
  timestamp   DateTime @default(now())
  
  apiKey      ApiKey   @relation(fields: [apiKeyId], references: [id], onDelete: Cascade)
  
  @@index([apiKeyId, timestamp])
  @@map("api_usage_logs")
}

// ============================================
// 发票管理
// ============================================

model Invoice {
  id             String        @id @default(cuid())
  invoiceNumber  String        @unique
  userId         String
  subscriptionId String?
  amount         Decimal       @db.Decimal(10, 2)
  tax            Decimal       @default(0) @db.Decimal(10, 2)
  totalAmount    Decimal       @db.Decimal(10, 2)
  currency       String        @default("CNY")
  status         InvoiceStatus @default(DRAFT)
  items          Json
  billingAddress Json?
  issuedAt       DateTime
  dueAt          DateTime
  paidAt         DateTime?
  voidedAt       DateTime?
  pdfUrl         String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  
  @@index([userId])
  @@map("invoices")
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  VOID
  OVERDUE
}

// ============================================
// 工单系统
// ============================================

model SupportTicket {
  id           String         @id @default(cuid())
  ticketNumber String         @unique
  userId       String
  subject      String
  description  String         @db.Text
  category     TicketCategory
  priority     TicketPriority
  status       TicketStatus   @default(OPEN)
  assignedTo   String?
  tags         String[]       @default([])
  resolvedAt   DateTime?
  closedAt     DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignee     User?          @relation("TicketAssignee", fields: [assignedTo], references: [id])
  replies      TicketReply[]
  
  @@map("support_tickets")
}

enum TicketCategory {
  BUG
  FEATURE
  QUESTION
  BILLING
  OTHER
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_USER
  RESOLVED
  CLOSED
}

model TicketReply {
  id        String   @id @default(cuid())
  ticketId  String
  userId    String
  isStaff   Boolean  @default(false)
  content   String   @db.Text
  createdAt DateTime @default(now())
  
  ticket    SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
  
  @@map("ticket_replies")
}

// ============================================
// 功能开关
// ============================================

model FeatureFlag {
  id                String   @id @default(cuid())
  key               String   @unique
  name              String
  description       String?
  enabled           Boolean  @default(false)
  rolloutPercentage Int?
  targetUsers       String[] @default([])
  targetPlans       String[] @default([])
  environment       String   @default("production")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@map("feature_flags")
}

// ============================================
// 审计日志
// ============================================

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  resource   String
  resourceId String
  changes    Json?
  ipAddress  String
  userAgent  String?
  status     String
  timestamp  DateTime @default(now())
  
  @@index([userId, timestamp])
  @@map("audit_logs")
}

// ============================================
// User 模型扩展
// ============================================

model User {
  // ... 现有字段 ...
  
  // 新增关联
  subscriptions     Subscription[]
  paymentOrders     PaymentOrder[]
  invoices          Invoice[]
  ownedTeams        Team[]             @relation("TeamOwner")
  teamMemberships   TeamMember[]
  teamInvitations   TeamInvitation[]
  apiKeys           ApiKey[]
  supportTickets    SupportTicket[]
  assignedTickets   SupportTicket[]    @relation("TicketAssignee")
  ticketReplies     TicketReply[]
}
```

---

## 技术实现方案

### 1. 支付集成方案

**支付宝接入**
- SDK: `alipay-sdk`
- 支付方式: 网页支付、扫码支付
- 回调处理: Webhook 验签

**微信支付接入**
- SDK: `wechatpay-node-v3`
- 支付方式: Native、JSAPI、H5
- 回调处理: Webhook 验签

**Stripe 接入**
- SDK: `@stripe/stripe-js`
- 支付方式: Checkout、Payment Intents
- 回调处理: Webhook Events

### 2. 发票生成方案

**PDF 生成**
- 库: `puppeteer` 或 `pdfkit`
- 模板: HTML + CSS
- 中文字体: 内嵌字体文件

**发票模板示例**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'SimSun', serif; }
    .invoice-header { text-align: center; }
    .invoice-table { width: 100%; border-collapse: collapse; }
    .invoice-table td, .invoice-table th {
      border: 1px solid #000;
      padding: 8px;
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <h1>发票</h1>
    <p>发票编号: {{invoiceNumber}}</p>
  </div>
  <!-- 发票内容 -->
</body>
</html>
```

### 3. 实时分析方案

**数据收集**
- 前端: 自定义事件追踪
- 后端: API 调用日志
- 存储: PostgreSQL + Redis

**数据聚合**
- 实时: Redis 计数器
- 离线: 定时任务聚合
- 展示: Chart.js / Recharts

### 4. 功能开关实现

```typescript
// useFeatureFlag.ts
export function useFeatureFlag(flagKey: string): boolean {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    async function checkFlag() {
      const result = await fetch(`/api/feature-flags/${flagKey}`);
      const data = await result.json();
      setEnabled(data.enabled);
    }
    checkFlag();
  }, [flagKey, user]);
  
  return enabled;
}

// 使用示例
function NewFeature() {
  const enabled = useFeatureFlag('new_dashboard');
  
  if (!enabled) {
    return <OldDashboard />;
  }
  
  return <NewDashboard />;
}
```

---

## 开发优先级

### P0 - 核心商业化功能（1-2周）

| 模块 | 工作量 | 依赖 | 输出 |
|------|--------|------|------|
| 订阅管理 | 3天 | - | 套餐、订阅 CRUD |
| 配额管理 | 2天 | 订阅管理 | 配额检查、消费 |
| 支付集成（支付宝） | 3天 | 订阅管理 | 订单、回调 |

### P1 - 企业级功能（2-3周）

| 模块 | 工作量 | 依赖 | 输出 |
|------|--------|------|------|
| 发票管理 | 3天 | 支付集成 | 发票生成、PDF |
| 团队协作 | 5天 | - | 团队、成员、邀请 |
| API 密钥 | 2天 | - | 密钥管理、验证 |

### P2 - 运营支持功能（1-2周）

| 模块 | 工作量 | 依赖 | 输出 |
|------|--------|------|------|
| 工单系统 | 3天 | - | 工单 CRUD、回复 |
| 使用分析 | 4天 | - | 事件追踪、看板 |

### P3 - 高级功能（1周）

| 模块 | 工作量 | 依赖 | 输出 |
|------|--------|------|------|
| 功能开关 | 1天 | - | 开关管理、检查 |
| 审计日志 | 2天 | - | 日志记录、查询 |

---

## 安全与合规

### 数据安全

1. **API 密钥加密存储**
   - 使用 `bcrypt` 或 `argon2` 哈希
   - 仅显示部分密钥 (`sk_live_****1234`)

2. **支付信息保护**
   - PCI DSS 合规
   - 不存储完整卡号
   - 敏感字段加密

3. **审计日志**
   - 记录所有敏感操作
   - 日志不可篡改
   - 定期归档

### 合规要求

1. **财务合规**
   - 发票符合税务规范
   - 支持增值税发票
   - 财务数据可追溯

2. **数据合规**
   - GDPR 数据导出
   - 用户数据删除权
   - 隐私政策更新

3. **SLA 保障**
   - 99.9% 可用性
   - 工单响应时间
   - 数据备份策略

---

## 总结

本设计报告完整规划了 10 个核心 SaaS 功能模块，涵盖：

✅ **商业化能力**: 订阅、支付、发票  
✅ **企业级功能**: 团队协作、API 密钥  
✅ **运营支持**: 配额管理、工单系统  
✅ **数据驱动**: 使用分析、审计日志  
✅ **灵活性**: 功能开关

### 开发建议

1. **分阶段实施**: 按 P0 → P1 → P2 → P3 优先级开发
2. **模块独立**: 每个模块独立可测试
3. **文档先行**: 先完善 API 文档和类型定义
4. **测试覆盖**: 核心逻辑单元测试覆盖率 > 80%

### 下一步行动

1. [ ] Review 本设计方案
2. [ ] 确定第一期开发范围（建议 P0 模块）
3. [ ] 搭建开发环境
4. [ ] 创建数据库迁移
5. [ ] 开发第一个模块（订阅管理）

---

**文档维护**  
如有问题或建议，请联系开发团队或提交 Issue。
