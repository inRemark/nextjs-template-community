# 订单与支付系统设计方案

## 📋 目录

1. [系统概述](#系统概述)
2. [核心功能模块](#核心功能模块)
3. [数据库设计](#数据库设计)
4. [支付网关集成](#支付网关集成)
5. [订单流程](#订单流程)
6. [API 设计](#api-设计)
7. [安全设计](#安全设计)
8. [技术栈](#技术栈)
9. [实施计划](#实施计划)

---

## 系统概述

### 业务场景

为 ThemeClone 和 Screenshot 两个核心功能提供付费服务，支持国内外用户直接支付购买。

### 设计目标

- ✅ 支持国际支付（Stripe）
- ✅ 支持国内支付（微信支付、支付宝）
- ✅ 完整的订单生命周期管理
- ✅ 安全可靠的支付流程
- ✅ 用户友好的支付体验
- ✅ 完善的财务对账机制

---

## 核心功能模块

```bash
订单与支付系统
├── 订单管理 (Orders)
│   ├── 订单创建
│   ├── 订单查询
│   ├── 订单状态管理
│   └── 订单历史记录
├── 支付管理 (Payments)
│   ├── 支付网关集成
│   ├── 支付结果处理
│   ├── 支付回调处理
│   └── 退款管理
├── 产品管理 (Products)
│   ├── 产品定义
│   ├── 价格配置
│   └── 折扣优惠
├── 发票管理 (Invoices)
│   ├── 发票生成
│   ├── 发票下载
│   └── 发票记录
└── 财务报表 (Finance)
    ├── 交易统计
    ├── 收入分析
    └── 对账报告
```

---

## 数据库设计

### Prisma Schema

``prisma
// ==================== 产品模型 ====================
model Product {
  id              String    @id @default(cuid())
  name            String    // 产品名称
  slug            String    @unique // URL 标识
  description     String?   // 产品描述
  featureType     FeatureType // 功能类型
  isActive        Boolean   @default(true)
  
  // 关联
  prices          ProductPrice[]
  orders          Order[]
  
  // 时间戳
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([slug])
  @@index([featureType])
}

// ==================== 产品价格 ====================
model ProductPrice {
  id              String    @id @default(cuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // 价格信息
  amount          Float     // 金额
  currency        String    @default("USD") // 货币类型
  region          String    @default("global") // 地区：global/cn
  
  // 价格类型
  type            PriceType @default(ONE_TIME)
  interval        String?   // 订阅周期：month/year
  
  // 状态
  isActive        Boolean   @default(true)
  
  // 第三方平台 ID
  stripePriceId   String?   // Stripe Price ID
  
  // 时间戳
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([productId])
  @@index([currency])
}

// ==================== 订单模型 ====================
model Order {
  id              String    @id @default(cuid())
  orderNumber     String    @unique // 订单号：ORD20250101XXXXXX
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  // 产品信息
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  
  // 订单金额
  amount          Float     // 订单金额
  currency        String    @default("USD")
  discountAmount  Float     @default(0) // 折扣金额
  finalAmount     Float     // 实付金额
  
  // 订单状态
  status          OrderStatus @default(PENDING)
  
  // 功能相关数据
  featureData     Json?     // 存储功能相关参数
  resultData      Json?     // 存储处理结果
  
  // 支付信息
  payment         Payment?
  
  // 发票
  invoice         Invoice?
  
  // 备注
  remark          String?
  metadata        Json?     // 额外元数据
  
  // 时间戳
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  paidAt          DateTime? // 支付时间
  completedAt     DateTime? // 完成时间
  expiredAt       DateTime? // 过期时间
  
  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
}

// ==================== 支付记录 ====================
model Payment {
  id              String    @id @default(cuid())
  orderId         String    @unique
  order           Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // 支付方式
  paymentMethod   PaymentMethod // stripe/alipay/wechat
  paymentGateway  String    // 支付网关标识
  
  // 支付金额
  amount          Float
  currency        String    @default("USD")
  
  // 支付状态
  status          PaymentStatus @default(PENDING)
  
  // 第三方支付信息
  paymentIntentId String?   // Stripe Payment Intent ID
  transactionId   String?   // 第三方交易号
  
  // 支付跳转
  checkoutUrl     String?   // 支付页面 URL
  redirectUrl     String?   // 支付完成后跳转 URL
  
  // 错误信息
  errorCode       String?
  errorMessage    String?
  
  // 退款信息
  refunds         Refund[]
  
  // 时间戳
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  paidAt          DateTime? // 支付成功时间
  
  @@index([orderId])
  @@index([paymentIntentId])
  @@index([transactionId])
  @@index([status])
}

// ==================== 退款记录 ====================
model Refund {
  id              String    @id @default(cuid())
  paymentId       String
  payment         Payment   @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  
  // 退款信息
  amount          Float     // 退款金额
  currency        String    @default("USD")
  reason          String?   // 退款原因
  status          RefundStatus @default(PENDING)
  
  // 第三方退款信息
  refundId        String?   // 第三方退款 ID
  
  // 时间戳
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  processedAt     DateTime? // 处理时间
  
  @@index([paymentId])
  @@index([status])
}

// ==================== 发票模型 ====================
model Invoice {
  id              String    @id @default(cuid())
  invoiceNumber   String    @unique // 发票号
  orderId         String    @unique
  order           Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  // 发票信息
  amount          Float
  currency        String    @default("USD")
  taxAmount       Float     @default(0) // 税额
  
  // 开票信息
  billingName     String    // 开票抬头
  billingTaxId    String?   // 税号
  billingAddress  String?   // 地址
  billingEmail    String?   // 邮箱
  
  // 发票文件
  pdfUrl          String?   // PDF 文件 URL
  
  // 状态
  status          InvoiceStatus @default(DRAFT)
  
  // 时间戳
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  issuedAt        DateTime? // 开具时间
  
  @@index([userId])
  @@index([invoiceNumber])
  @@index([status])
}

// ==================== 枚举类型 ====================
enum FeatureType {
  THEME_CLONE   // 主题克隆
  SCREENSHOT    // 网页截图
}

enum PriceType {
  ONE_TIME      // 一次性付费
  RECURRING     // 订阅制
}

enum OrderStatus {
  PENDING       // 待支付
  PAID          // 已支付
  PROCESSING    // 处理中
  COMPLETED     // 已完成
  FAILED        // 失败
  CANCELLED     // 已取消
  REFUNDED      // 已退款
  EXPIRED       // 已过期
}

enum PaymentMethod {
  STRIPE        // Stripe
  ALIPAY        // 支付宝
  WECHAT        // 微信支付
}

enum PaymentStatus {
  PENDING       // 待支付
  PROCESSING    // 处理中
  SUCCESS       // 成功
  FAILED        // 失败
  CANCELLED     // 已取消
  REFUNDED      // 已退款
}

enum RefundStatus {
  PENDING       // 待处理
  PROCESSING    // 处理中
  SUCCESS       // 成功
  FAILED        // 失败
}

enum InvoiceStatus {
  DRAFT         // 草稿
  ISSUED        // 已开具
  SENT          // 已发送
  PAID          // 已支付
  CANCELLED     // 已取消
}
```

### 用户模型扩展

``prisma
model User {
  // ... 现有字段 ...
  
  // 订单与支付相关
  orders          Order[]
  invoices        Invoice[]
}
```

---

## 支付网关集成

### 1. Stripe（国际支付）

#### 优势

- 支持全球 135+ 货币
- 支持信用卡、Apple Pay、Google Pay
- 文档完善，API 友好
- 安全合规（PCI DSS Level 1）

#### 集成方案

``typescript
// Stripe Payment Intent 流程
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// 创建 Payment Intent
async function createPaymentIntent(orderId: string, amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // 转换为分
    currency: 'usd',
    metadata: {
      orderId,
    },
  });
  
  return paymentIntent;
}

// Webhook 处理
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      // 处理支付成功
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      // 处理支付失败
      await handlePaymentFailed(event.data.object);
      break;
  }
}
```

#### 费率

- 国际卡：2.9% + $0.30 per transaction
- 中国卡：3.4% + $0.30 per transaction

---

### 2. 支付宝（国内支付）

#### 支付宝集成方案

``typescript
// 使用 alipay-sdk
import AlipaySdk from 'alipay-sdk';

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: 'https://openapi.alipay.com/gateway.do',
});

// 创建支付订单
async function createAlipayOrder(orderNumber: string, amount: number) {
  const result = await alipaySdk.exec('alipay.trade.page.pay', {
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/alipay`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/success`,
    bizContent: {
      out_trade_no: orderNumber,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: amount.toFixed(2),
      subject: '订单支付',
    },
  });
  
  return result;
}
```

#### 支付宝费率

- PC 网站支付：0.6% - 1.2%
- 手机网站支付：0.6% - 1.2%

---

### 3. 微信支付（国内支付）

#### 微信支付集成方案

``typescript
// 使用 wechatpay-node-v3
import WxPay from 'wechatpay-node-v3';

const wxpay = new WxPay({
  appid: process.env.WECHAT_APP_ID!,
  mchid: process.env.WECHAT_MCH_ID!,
  publicKey: process.env.WECHAT_PUBLIC_KEY!,
  privateKey: process.env.WECHAT_PRIVATE_KEY!,
});

// 创建支付订单
async function createWechatOrder(orderNumber: string, amount: number) {
  const result = await wxpay.transactions_native({
    description: '订单支付',
    out_trade_no: orderNumber,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/wechat`,
    amount: {
      total: Math.round(amount * 100), // 分
      currency: 'CNY',
    },
  });
  
  return result;
}
```

#### 微信支付费率

- Native 支付：0.6%
- JSAPI 支付：0.6%

---

## 订单流程

### 完整流程图

```
用户选择功能
    ↓
[创建订单] (status: PENDING)
    ↓
显示支付选项（Stripe/支付宝/微信）
    ↓
用户选择支付方式
    ↓
[创建支付记录] (status: PENDING)
    ↓
调用支付网关 API
    ↓
跳转到支付页面
    ↓
用户完成支付
    ↓
[支付网关回调] Webhook
    ↓
验证签名 & 更新订单状态
    ↓
[订单状态: PAID]
[支付状态: SUCCESS]
    ↓
异步任务处理（ThemeClone/Screenshot）
    ↓
[订单状态: PROCESSING]
    ↓
任务完成，保存结果
    ↓
[订单状态: COMPLETED]
    ↓
发送通知给用户
    ↓
生成发票（可选）
```

### 状态流转

#### 订单状态

```
PENDING → PAID → PROCESSING → COMPLETED
         ↓              ↓
    EXPIRED      FAILED/CANCELLED
         ↓
    REFUNDED
```

#### 支付状态

```
PENDING → PROCESSING → SUCCESS
         ↓              ↓
    CANCELLED      REFUNDED
         ↓
      FAILED
```

---

## API 设计

### 产品 APIs

```
// GET /api/products - 获取产品列表
GET /api/products?featureType=THEME_CLONE&region=global

Response:
{
  "data": [
    {
      "id": "prod_xxx",
      "name": "Theme Clone",
      "slug": "theme-clone",
      "featureType": "THEME_CLONE",
      "prices": [
        {
          "id": "price_xxx",
          "amount": 9.99,
          "currency": "USD",
          "region": "global"
        },
        {
          "id": "price_yyy",
          "amount": 68,
          "currency": "CNY",
          "region": "cn"
        }
      ]
    }
  ]
}
```

---

### 订单 APIs

```
// POST /api/orders - 创建订单
POST /api/orders

Request:
{
  "productId": "prod_xxx",
  "priceId": "price_xxx",
  "featureData": {
    "url": "https://example.com"
  }
}

Response:
{
  "data": {
    "id": "order_xxx",
    "orderNumber": "ORD20250101123456",
    "status": "PENDING",
    "amount": 9.99,
    "currency": "USD",
    "expiredAt": "2025-01-01T12:00:00Z"
  }
}

// GET /api/orders - 获取订单列表
GET /api/orders?page=1&limit=10&status=COMPLETED

Response:
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}

// GET /api/orders/:id - 获取订单详情
GET /api/orders/order_xxx

Response:
{
  "data": {
    "id": "order_xxx",
    "orderNumber": "ORD20250101123456",
    "status": "COMPLETED",
    "product": {...},
    "payment": {...},
    "resultData": {...}
  }
}
```

---

### 支付 APIs

```
// POST /api/payments/create - 创建支付
POST /api/payments/create

Request:
{
  "orderId": "order_xxx",
  "paymentMethod": "STRIPE" | "ALIPAY" | "WECHAT",
  "returnUrl": "https://example.com/success"
}

Response:
{
  "data": {
    "paymentId": "pay_xxx",
    "checkoutUrl": "https://checkout.stripe.com/xxx", // Stripe
    // 或
    "qrCodeUrl": "weixin://xxx", // 微信
    // 或
    "formData": {...} // 支付宝
  }
}

// POST /api/webhooks/stripe - Stripe Webhook
POST /api/webhooks/stripe

// POST /api/webhooks/alipay - 支付宝回调
POST /api/webhooks/alipay

// POST /api/webhooks/wechat - 微信回调
POST /api/webhooks/wechat

// POST /api/payments/:id/refund - 退款
POST /api/payments/pay_xxx/refund

Request:
{
  "amount": 9.99,
  "reason": "用户取消"
}

Response:
{
  "data": {
    "refundId": "ref_xxx",
    "status": "PROCESSING"
  }
}
```

---

### 发票 APIs

```
// POST /api/invoices - 创建发票
POST /api/invoices

Request:
{
  "orderId": "order_xxx",
  "billingName": "公司名称",
  "billingTaxId": "91110000xxxx",
  "billingEmail": "invoice@example.com"
}

Response:
{
  "data": {
    "id": "inv_xxx",
    "invoiceNumber": "INV20250101123456",
    "pdfUrl": "https://cdn.example.com/invoices/xxx.pdf"
  }
}

// GET /api/invoices/:id/download - 下载发票
GET /api/invoices/inv_xxx/download
```

---

## 安全设计

### 1. Webhook 安全验证

```
// Stripe 签名验证
function verifyStripeSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  try {
    stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return true;
  } catch (err) {
    return false;
  }
}

// 支付宝签名验证
function verifyAlipaySignature(params: any): boolean {
  return alipaySdk.checkNotifySign(params);
}

// 微信签名验证
function verifyWechatSignature(data: any): boolean {
  return wxpay.verifySign(data);
}
```

### 2. 订单防重复支付

```
// 使用乐观锁
async function payOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  
  if (order.status !== 'PENDING') {
    throw new Error('订单状态异常');
  }
  
  // 使用事务更新
  await prisma.$transaction([
    prisma.order.update({
      where: {
        id: orderId,
        status: 'PENDING', // 确保状态未变
      },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    }),
  ]);
}
```

### 3. 金额验证

```
// 回调时验证金额
function validatePaymentAmount(
  orderAmount: number,
  paidAmount: number
): boolean {
  // 允许 1 分钱的误差（处理浮点数问题）
  return Math.abs(orderAmount - paidAmount) < 0.01;
}
```

### 4. 订单过期机制

```
// 30 分钟未支付自动过期
async function expireUnpaidOrders() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  await prisma.order.updateMany({
    where: {
      status: 'PENDING',
      createdAt: {
        lt: thirtyMinutesAgo,
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });
}
```

---

## 技术栈

### 后端

- **Next.js 15** - App Router
- **Prisma** - ORM
- **PostgreSQL** - 数据库
- **Stripe SDK** - 国际支付
- **alipay-sdk** - 支付宝
- **wechatpay-node-v3** - 微信支付

### 前端

- **React 19** - UI 框架
- **TailwindCSS** - 样式
- **Shadcn/ui** - 组件库
- **React Query** - 数据管理
- **Stripe Elements** - 支付表单

### 工具

- **BullMQ** - 任务队列（异步处理）
- **Redis** - 缓存
- **Resend** - 邮件通知

---

## 实施计划

### 第一阶段：基础架构（Week 1-2）

#### 1.1 数据库设计

- [x] 创建 Prisma Schema
- [x] 运行数据库迁移
- [x] 创建种子数据

#### 1.2 产品管理

- [x] 创建产品模型和 API
- [x] 配置 ThemeClone 和 Screenshot 产品
- [x] 设置价格（USD/CNY）

#### 1.3 订单模块

- [x] 订单创建 API
- [x] 订单查询 API
- [x] 订单状态管理

---

### 第二阶段：支付集成（Week 3-4）

#### 2.1 Stripe 集成（国际支付）

- [ ] 注册 Stripe 账号
- [x] 集成 Stripe Payment Intent
- [x] 实现 Webhook 处理
- [x] 前端集成 Stripe Elements
- [ ] 测试支付流程

#### 2.2 支付宝集成（国内支付）

- [ ] 注册支付宝商家账号
- [x] 集成支付宝 SDK
- [x] 实现回调处理
- [x] 前端集成支付表单（二维码+跳转）
- [ ] 测试支付流程

#### 2.3 微信支付集成（国内支付）

- [ ] 注册微信商户号
- [x] 集成微信支付 SDK
- [x] 实现回调处理
- [x] 前端集成二维码支付
- [ ] 测试支付流程

---

### 第三阶段：业务流程（Week 5-6）

<!-- #### 3.1 异步任务处理

- [ ] 集成 BullMQ
- [ ] 创建 ThemeClone 任务队列
- [ ] 创建 Screenshot 任务队列
- [ ] 实现任务重试机制 -->

<!-- #### 3.2 通知系统

- [ ] 支付成功通知
- [ ] 任务完成通知
- [ ] 订单状态变更通知 -->

#### 3.3 用户界面

- [x] 订单列表页面
- [x] 订单详情页面
- [x] 支付页面
- [x] 支付结果页面

---

### 第四阶段：高级功能（Week 7-8）

#### 4.1 退款管理 ✅

- [x] 退款服务层（refundService.ts）
- [x] 退款 API（/api/refunds/create、/api/refunds/[id]、/api/refunds/list）
- [x] 退款验证器（refund.validator.ts）
- [x] React Hooks（useRefunds.ts）
- [x] 退款按钮组件（RefundButton.tsx）
- [x] 退款列表组件（RefundList.tsx）
- [x] 退款记录页面（/refunds）
- [x] 支持 Stripe/支付宝/微信三种支付方式的退款
- [x] 部分退款和全额退款支持
- [x] 退款金额验证和累计控制

#### 4.2 发票系统 ✅

- [x] 发票服务层（invoiceService.ts）
- [x] PDF 生成服务（invoicePdfService.ts，基于 PDFKit）
- [x] 发票 API（/api/invoices/create、/api/invoices/[id]/download）
- [x] React Hooks（useInvoices.ts）
- [x] 发票按钮组件（InvoiceButton.tsx）
- [x] 自动生成发票编号（INV格式）
- [x] 专业 PDF 格式（包含公司信息、客户信息、产品明细）
- [x] 发票下载功能
- [x] 集成到订单详情页

#### 4.3 财务报表 ✅

- [x] 分析服务层（analyticsService.ts）
  - [x] 交易统计（总订单数、收入、平均订单金额）
  - [x] 每日收入分析（按日期分组）
  - [x] 月度收入分析（按月份统计）
  - [x] 支付方式统计（Stripe/支付宝/微信）
  - [x] 对账报告（订单状态、退款统计）
- [x] 分析 API（/api/analytics/stats、/api/analytics/daily-revenue、/api/analytics/reconciliation）
- [x] React Hooks（useAnalytics.ts）
- [x] 交易统计组件（TransactionStats.tsx）
- [x] 财务报表页面（/analytics）
- [x] 多货币支持
- [x] 日期范围筛选

---

---

### 第六阶段：测试与优化（Week 11-12）

#### 6.1 测试

- [ ] 单元测试
- [ ] 集成测试
- [ ] 支付流程 E2E 测试
- [ ] 后台管理功能测试
- [ ] 压力测试

#### 6.2 优化

- [ ] 性能优化
- [ ] 安全加固
- [ ] 错误处理优化
- [ ] 日志完善

#### 6.3 上线准备

- [ ] 生产环境配置
- [ ] 监控告警
- [ ] 文档完善
- [ ] 运维手册

---

## 后台管理系统详细设计 ✨ NEW

### 架构设计

#### 路由结构

```
/admin
├── /dashboard           # 仪表盘
├── /products            # 产品管理
│   ├── /list           # 产品列表
│   ├── /create         # 创建产品
│   ├── /[id]/edit      # 编辑产品
│   └── /[id]/prices    # 价格管理
├── /orders              # 订单管理
│   ├── /list           # 订单列表
│   └── /[id]           # 订单详情
├── /payments            # 支付管理
│   ├── /list           # 支付列表
│   ├── /[id]           # 支付详情
│   └── /refunds        # 退款管理
├── /invoices            # 发票管理
│   ├── /list           # 发票列表
│   └── /[id]           # 发票详情
├── /analytics           # 数据分析
│   ├── /overview       # 总览
│   ├── /revenue        # 收入分析
│   └── /reports        # 财务报表
└── /logs                # 系统日志
```

#### 权限模型

```
// 用户模型扩展（基于现有 next-auth 系统）
model User {
  // ... 现有字段 ...
  
  // 管理员相关
  role            UserRole    @default(USER)
}

enum UserRole {
  USER              // 普通用户
  ADMIN             // 管理员
  SUPER_ADMIN       // 超级管理员
}
```

### 核心功能实现

#### 1. 仪表盘 API

```
// GET /api/admin/dashboard/stats
// 获取仪表盘统计数据
export async function getDashboardStats() {
  const today = startOfDay(new Date());
  
  // 今日订单数
  const todayOrders = await prisma.order.count({
    where: {
      createdAt: { gte: today },
    },
  });
  
  // 今日收入
  const todayRevenue = await prisma.order.aggregate({
    where: {
      createdAt: { gte: today },
      status: 'COMPLETED',
    },
    _sum: { finalAmount: true },
  });
  
  // 待处理订单
  const pendingOrders = await prisma.order.count({
    where: {
      status: { in: ['PENDING', 'PAID', 'PROCESSING'] },
    },
  });
  
  // 成功率（最近30天）
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = await prisma.order.groupBy({
    by: ['status'],
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
  });
  
  const totalRecent = recentOrders.reduce((sum, item) => sum + item._count.id, 0);
  const completed = recentOrders.find(item => item.status === 'COMPLETED')?._count.id || 0;
  const successRate = totalRecent > 0 ? (completed / totalRecent) * 100 : 0;
  
  return {
    todayOrders,
    todayRevenue: todayRevenue._sum.finalAmount || 0,
    pendingOrders,
    successRate: successRate.toFixed(2),
  };
}
```

#### 2. 订单管理 API

```
// GET /api/admin/orders
// 管理员获取订单列表（简化筛选）
export async function getAdminOrders(params: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string; // 搜索订单号
}) {
  const {
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    search,
  } = params;
  
  const where: any = {};
  
  if (status) where.status = status;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  
  if (search) {
    where.orderNumber = { contains: search };
  }
  
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: true,
        product: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);
  
  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// PATCH /api/admin/orders/[id]/status
// 手动更新订单状态
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  
  return order;
}
```

#### 3. 数据分析 API

```
// GET /api/admin/analytics/revenue-trend
// 获取收入趋势（简化版）
export async function getRevenueTrend(params: {
  startDate: string;
  endDate: string;
  interval: 'day' | 'week' | 'month';
}) {
  const { startDate, endDate, interval } = params;
  
  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      paidAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    select: {
      paidAt: true,
      finalAmount: true,
      currency: true,
    },
    orderBy: { paidAt: 'asc' },
  });
  
  // 按时间间隔分组
  const grouped = groupByInterval(orders, interval);
  
  return grouped;
}

// GET /api/admin/analytics/product-ranking
// 获取产品销售排行
export async function getProductRanking(params: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const { startDate, endDate, limit = 10 } = params;
  
  const where: any = { status: 'COMPLETED' };
  
  if (startDate || endDate) {
    where.paidAt = {};
    if (startDate) where.paidAt.gte = new Date(startDate);
    if (endDate) where.paidAt.lte = new Date(endDate);
  }
  
  const ranking = await prisma.order.groupBy({
    by: ['productId'],
    where,
    _count: { id: true },
    _sum: { finalAmount: true },
    orderBy: {
      _sum: { finalAmount: 'desc' },
    },
    take: limit,
  });
  
  // 获取产品详情
  const products = await Promise.all(
    ranking.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      return {
        product,
        orderCount: item._count.id,
        totalRevenue: item._sum.finalAmount || 0,
      };
    })
  );
  
  return products;
}
```

### UI 组件设计

#### 1. 仪表盘组件

```
// AdminDashboard.tsx
export function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: recentOrders } = useRecentOrders({ limit: 10 });
  const { data: revenueTrend } = useRevenueTrend({ days: 30 });
  
  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="今日订单"
          value={stats?.todayOrders}
          icon={<ShoppingCart />}
        />
        <StatsCard
          title="今日收入"
          value={`$${stats?.todayRevenue}`}
          icon={<DollarSign />}
        />
        <StatsCard
          title="待处理"
          value={stats?.pendingOrders}
          icon={<Clock />}
        />
        <StatsCard
          title="成功率"
          value={`${stats?.successRate}%`}
          icon={<TrendingUp />}
        />
      </div>
      
      {/* 收入趋势图 */}
      <Card>
        <CardHeader>
          <CardTitle>收入趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={revenueTrend} />
        </CardContent>
      </Card>
      
      {/* 最近订单 */}
      <Card>
        <CardHeader>
          <CardTitle>最近交易</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={recentOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2. 订单列表组件

```
// AdminOrderList.tsx
export function AdminOrderList() {
  const [filters, setFilters] = useState({
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    search: '',
  });
  
  const { data: orders, isLoading } = useAdminOrders(filters);
  
  return (
    <div className="space-y-4">
      {/* 筛选器 - 简化版 */}
      <div className="flex gap-4">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">待支付</SelectItem>
            <SelectItem value="COMPLETED">已完成</SelectItem>
            {/* ... 更多状态 */}
          </SelectContent>
        </Select>
        
        <DateRangePicker
          onDateChange={(start, end) => {
            setFilters({ ...filters, startDate: start, endDate: end });
          }}
        />
        
        <Input
          placeholder="搜索订单号"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      
      {/* 订单表格 */}
      <DataTable
        columns={orderColumns}
        data={orders?.data || []}
        loading={isLoading}
      />
    </div>
  );
}
```

### 权限控制

#### 中间件实现

```
// middleware/adminAuth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function adminAuthMiddleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // 检查是否登录
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 检查管理员权限
  if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/403', request.url));
  }
  
  return NextResponse.next();
}

// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminAuthMiddleware(request);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

#### API 权限验证

```
// lib/auth/adminGuard.ts
import { getServerSession } from 'next-auth';

export async function requireAdmin() {
  const session = await getServerSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return session.user;
}

// 使用示例
export async function GET(request: Request) {
  const admin = await requireAdmin();
  
  // 执行管理员操作
  const orders = await getAdminOrders();
  
  return NextResponse.json({ data: orders });
}
```

### 安全考虑

1. **权限验证**
   - 基于 next-auth 的用户认证
   - 检查用户角色（ADMIN/SUPER_ADMIN）
   - 管理员路由中间件保护

2. **数据脱敏**
   - 用户敏感信息脱敏展示
   - 支付信息部分隐藏

3. **Rate Limiting**
   - 限制 API 调用频率
   - 防止暴力破解
   - 异常访问告警

---

## 环境变量配置

```
# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# 支付宝
ALIPAY_APP_ID=xxx
ALIPAY_PRIVATE_KEY=xxx
ALIPAY_PUBLIC_KEY=xxx
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# 微信支付
WECHAT_APP_ID=xxx
WECHAT_MCH_ID=xxx
WECHAT_API_V3_KEY=xxx
WECHAT_SERIAL_NO=xxx
WECHAT_PRIVATE_KEY=xxx
WECHAT_PUBLIC_KEY=xxx

# 应用配置
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ORDER_EXPIRATION_MINUTES=30
```

---

## 风险与应对

### 风险点

1. **支付网关稳定性**
   - 应对：实现多支付网关冗余

2. **回调丢失**
   - 应对：定时轮询未完成订单 + 手动补单机制

3. **金额精度问题**
   - 应对：使用整数存储（分），展示时转换

4. **并发支付**
   - 应对：数据库事务 + 乐观锁

5. **退款纠纷**
   - 应对：完善的订单记录 + 客服系统

---

## 成本估算

### 支付手续费

- Stripe：2.9% + $0.30
- 支付宝：0.6% - 1.2%
- 微信支付：0.6%

### 假设月交易额 $10,000

- Stripe 手续费：~$320
- 支付宝手续费（¥60,000）：~¥600
- 微信支付手续费（¥60,000）：~¥360

### 基础设施

- 数据库：$25/月（Vercel Postgres）
- Redis：$15/月
- 总计：~$40/月

---

## 参考资源

- [Stripe Documentation](https://stripe.com/docs)
- [支付宝开放平台](https://opendocs.alipay.com/)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## 总结

本设计方案提供了一个完整的订单与支付系统架构，支持国内外主流支付方式，具备：

✅ 完善的订单生命周期管理  
✅ 安全可靠的支付流程  
✅ 灵活的产品定价策略  
✅ 完整的财务对账机制  
✅ 良好的扩展性

预计 **8-10 周**完成全部开发和测试工作。

---

## 开发进度

### ✅ 已完成（Week 1-2）

**第一阶段：基础架构**

1. **数据库设计** ✓
   - ✅ 创建完整的 Prisma Schema（Product, ProductPrice, Order, Payment, Refund, Invoice）
   - ✅ 添加枚举类型（FeatureType, OrderStatus, PaymentMethod, PaymentStatus, RefundStatus, InvoiceStatus）
   - ✅ 成功运行数据库迁移：`20251103183344_add_order_payment_system`
   - ✅ 创建种子数据（2个产品，4个价格配置）

2. **产品管理模块** (`src/features/products`) ✓
   - ✅ 类型定义：`types/product.types.ts`
   - ✅ 业务服务：`services/productService.ts`
   - ✅ 数据验证：`validators/product.validator.ts`
   - ✅ React Hooks：`hooks/useProducts.ts`
   - ✅ 国际化：`locales/{zh,en,ja}.json`
   - ✅ API 路由：
     - `GET /api/products` - 获取产品列表
     - `GET /api/products/[slug]` - 获取产品详情

3. **订单管理模块** (`src/features/orders`) ✓
   - ✅ 类型定义：`types/order.types.ts`
   - ✅ 业务服务：`services/orderService.ts`
   - ✅ 工具函数：`utils/orderUtils.ts`（订单号生成、过期计算、金额格式化）
   - ✅ 数据验证：`validators/order.validator.ts`
   - ✅ React Hooks：`hooks/useOrders.ts`
   - ✅ 国际化：`locales/{zh,en,ja}.json`
   - ✅ UI 组件：`components/OrderList.tsx`, `components/OrderDetail.tsx`
   - ✅ API 路由：
     - `POST /api/orders` - 创建订单
     - `GET /api/orders` - 获取订单列表
     - `GET /api/orders/[id]` - 获取订单详情
     - `POST /api/orders/[id]/process` - 手动处理订单 ✨NEW

**第二阶段：支付集成**

4. **支付模块** (`src/features/payments`) ✓
   - ✅ 类型定义：`types/payment.types.ts`
   - ✅ 业务服务：
     - `services/paymentService.ts` - 支付记录管理
     - `services/stripeService.ts` - Stripe SDK 集成
     - `services/alipayService.ts` - 支付宝 SDK 集成 ✨NEW
     - `services/wechatService.ts` - 微信支付 SDK 集成 ✨NEW
   - ✅ 数据验证：`validators/payment.validator.ts`
   - ✅ React Hooks：`hooks/usePayments.ts`
   - ✅ 国际化：`locales/{zh,en,ja}.json`
   - ✅ UI 组件：
     - `components/StripeCheckoutForm.tsx` - Stripe 支付表单
     - `components/AlipayCheckoutForm.tsx` - 支付宝支付表单 ✨NEW
     - `components/WechatCheckoutForm.tsx` - 微信支付表单 ✨NEW
   - ✅ API 路由：
     - `POST /api/payments/create` - 创建支付（支持三种支付方式）✨NEW
     - `GET /api/payments/[id]` - 获取支付详情
     - `GET /api/payments/stripe/config` - 获取 Stripe 配置
     - `POST /api/payments/stripe/webhook` - Stripe Webhook
     - `POST /api/payments/alipay/webhook` - 支付宝 Webhook ✨NEW
     - `POST /api/payments/wechat/webhook` - 微信支付 Webhook ✨NEW

5. **Stripe 支付集成** ✓
   - ✅ 安装依赖：`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
   - ✅ Payment Intent 创建和管理
   - ✅ Webhook 签名验证
   - ✅ 退款功能支持
   - ✅ 完整的错误处理

6. **支付宝支付集成** ✓ ✨NEW
   - ✅ 安装依赖：`alipay-sdk`
   - ✅ 支付订单创建（PC 网站支付）
   - ✅ 交易状态查询
   - ✅ Webhook 签名验证
   - ✅ 退款功能
   - ✅ 二维码支付支持

7. **微信支付集成** ✓ ✨NEW
   - ✅ Native 支付订单创建
   - ✅ 交易状态查询
   - ✅ Webhook 签名验证和数据解密
   - ✅ 退款功能
   - ✅ 二维码扫码支付

8. **Webhook 事件处理** ✓
   - ✅ Stripe: `payment_intent.succeeded/failed/canceled`
   - ✅ Stripe: `charge.refunded`
   - ✅ 支付宝：`TRADE_SUCCESS/TRADE_FINISHED/TRADE_CLOSED` ✨NEW
   - ✅ 微信：`SUCCESS/CLOSED/PAYERROR` ✨NEW

**第三阶段：用户界面**

7. **订单管理页面** ✓
   - ✅ `/orders` - 订单列表页面（带状态筛选）
   - ✅ `/orders/[id]` - 订单详情页面
   - ✅ `/orders/[id]/pay` - 支付页面（支持三种支付方式切换）✨NEW

8. **支付界面** ✓
   - ✅ Stripe Elements 集成
   - ✅ 支付宝二维码/跳转支付 ✨NEW
   - ✅ 微信二维码支付 ✨NEW
   - ✅ 支付方式选择器
   - ✅ 订单摘要展示
   - ✅ 支付状态反馈

9. **订单处理系统** ✓ ✨NEW
   - ✅ 订单处理服务：`services/orderProcessor.ts`
   - ✅ ThemeClone 订单处理
   - ✅ Screenshot 订单处理
   - ✅ 支付后自动处理流程

10. **新增依赖** ✓ ✨NEW
    - ✅ `alipay-sdk` - 支付宝官方 SDK
    - ✅ `qrcode` - 二维码生成库
    - ✅ `@types/qrcode` - TypeScript 类型
    - ✅ `@radix-ui/react-radio-group` - 单选按钮组件

### 🔄 进行中

无

### 📋 待开始

**第四阶段：后台管理扩展（Week 13-14）** 📋 新增

- [ ] 发票管理后台
  - [ ] 发票列表（分页、搜索、筛选）
  - [ ] 发票详情查看
  - [ ] 重新生成 PDF
  - [ ] 作废发票
  - [ ] 发票导出功能

- [ ] 数据统计与分析
  - [ ] 收入分析（按时间/产品/支付方式/地区/货币）
  - [ ] 财务报表（日报表、周报表、月报表、对账单等）
  - [ ] API 端点完善
  - [ ] 前端分析页面

- [ ] 系统日志管理
  - [ ] 支付回调日志
  - [ ] API 调用日志
  - [ ] 错误日志
  - [ ] 日志查询和导出功能

- [ ] 支持测试与优化
  - [ ] 测试 Stripe 支付流程
  - [ ] 测试支付宝支付流程
  - [ ] 测试微信支付流程

- [ ] 高级功能（可选）
  - [ ] 数据可视化图表优化
  - [ ] 批量操作功能
  - [ ] 数据导出（Excel/CSV）
  - [ ] 权限细分

**第五阶段：异步任务处理、通知系统（可选）**

- [ ] BullMQ 集成
- [ ] 任务队列
- [ ] 通知系统

---

## 技术实施细节

### 已实现的核心功能

#### 1. 产品价格体系

```
// 支持多货币、多地区定价
interface ProductPrice {
  amount: number;        // 金额
  currency: string;      // USD / CNY
  region: string;        // global / cn
  type: 'ONE_TIME' | 'RECURRING';
}
```

**当前配置：**
- Theme Clone: $9.99 (USD/global) / ¥68 (CNY/cn)
- Screenshot: $4.99 (USD/global) / ¥35 (CNY/cn)

#### 2. 订单生命周期管理

```
// 订单状态流转
PENDING → PAID → PROCESSING → COMPLETED
         ↓              ↓
    EXPIRED      FAILED/CANCELLED
         ↓
    REFUNDED
```

**关键实现：**
- ✅ 订单号自动生成（格式：ORD20250101ABC123）
- ✅ 30分钟未支付自动过期
- ✅ 用户权限验证（只能查看自己的订单）
- ✅ 订单状态自动更新时间戳（paidAt, completedAt）

#### 3. API 安全设计

- ✅ 使用 NextAuth Session 验证
- ✅ 订单所有权验证
- ✅ Zod Schema 数据验证
- ✅ 完善的错误处理

### 数据库表关系

```
User (用户)
  ↓
  ├─→ Order (订单) ←─→ Product (产品)
  │      ↓
  │   Payment (支付) ←─→ Refund (退款)
  │      ↓
  └─→ Invoice (发票)
```
