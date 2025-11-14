# OAuth 认证完整指南

## 📋 目录

- [项目概述](#项目概述)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [工作原理](#工作原理)
- [测试验证](#测试验证)
- [安全最佳实践](#安全最佳实践)
- [常见问题](#常见问题)
- [生产部署](#生产部署)

---

## 项目概述

### 🎯 当前状态

**已完成功能：**

- ✅ NextAuth v5 集成
- ✅ Google OAuth 登录
- ✅ GitHub OAuth 登录
- ✅ Credentials（邮箱/密码）登录
- ✅ 数据库用户管理（Prisma）
- ✅ OAuth 账户自动关联
- ✅ Session 管理（JWT + Cookie）
- ✅ 前端登录界面（支持三种登录方式）

**技术栈：**

- **认证框架**: NextAuth.js v5
- **数据库**: PostgreSQL + Prisma ORM
- **Session 策略**: JWT (HTTP-only Cookie)
- **前端框架**: Next.js 14+ (App Router)
- **UI 组件**: Radix UI + Tailwind CSS

### 支持的认证方式

| 方式 | 状态 | 说明 |
|------|------|------|
| 邮箱/密码 | ✅ 已实现 | 使用 bcrypt 加密存储 |
| Google OAuth | ✅ 已实现 | 支持 Web 端 |
| GitHub OAuth | ✅ 已实现 | 支持 Web 端 |
| Apple Sign In | 🚧 计划中 | 待实现 |
| 移动端 OAuth | 🚧 计划中 | 需要适配 Bearer Token |

---

## 快速开始

### 🚀 3步快速测试

#### 步骤 1：基础配置

**方式 A：仅测试邮箱登录（跳过 OAuth）**

```bash
# 1. 复制环境变量模板
cp .env.example .env.local

# 2. 生成 NextAuth 密钥
echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env.local

# 3. 启动开发服务器
pnpm dev
```

此时可以使用邮箱/密码登录，OAuth 按钮会显示为灰色（未配置）。

---

**方式 B：完整测试（包含 OAuth）**

1. **复制模板并生成密钥**

```bash
cp .env.example .env.local
```

2. **编辑 `.env.local`，添加必需配置**

```env
# NextAuth 配置（必需）
NEXTAUTH_SECRET="粘贴生成的密钥"
NEXTAUTH_URL="http://localhost:3000"

# 数据库（必需）
DATABASE_URL="postgresql://user:password@localhost:5432/your_db?schema=public"
```

生成密钥命令：

```bash
openssl rand -base64 32
```

3. **添加 OAuth 配置（可选，按需选择）**

```env
# Google OAuth（可选）
GOOGLE_CLIENT_ID="你的客户端ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="你的客户端密钥"

# GitHub OAuth（可选）
GITHUB_CLIENT_ID="你的客户端ID"
GITHUB_CLIENT_SECRET="你的客户端密钥"
```

#### 步骤 2：验证配置

运行验证脚本：

```bash
pnpm verify:oauth
```

**预期输出：**

```bash
🔍 OAuth 配置验证

📋 必需配置：
  ✓ NEXTAUTH_SECRET: 已配置
  ✓ NEXTAUTH_URL: 已配置

🔐 OAuth 提供商：

  GOOGLE:
    ✓ GOOGLE_CLIENT_ID: 已配置
    ✓ GOOGLE_CLIENT_SECRET: 已配置
  → GOOGLE 登录已启用

  GITHUB:
    ○ GITHUB_CLIENT_ID: 未设置
    ○ GITHUB_CLIENT_SECRET: 未设置
  → GITHUB 未配置（可选）

📊 配置总结：
  ✓ 必需配置完整
  ✓ 已启用 OAuth 提供商: google

🔗 OAuth 回调 URL（在 OAuth 应用中配置）：
  GOOGLE: http://localhost:3000/api/auth/callback/google
  GITHUB: http://localhost:3000/api/auth/callback/github
```

#### 步骤 3：启动测试

```bash
pnpm dev
```

访问 `http://localhost:3000/auth/login`，你会看到：

1. **邮箱/密码登录表单**（始终可用）
2. **"或"分割线**
3. **OAuth 按钮**：
   - 🔴 使用 Google 登录（如已配置）
   - ⚫ 使用 GitHub 登录（如已配置）

---

## 详细配置

### 1. Google OAuth 配置

#### 1.1 创建 Google OAuth 应用

**步骤：**

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 导航到 **API 和服务** → **凭据**
4. 启用 Google+ API（如需要）
5. 点击 **创建凭据** → **OAuth 客户端 ID**
6. 应用类型选择 **Web 应用**
7. 配置授权重定向 URI：

   ```text
   开发环境:
   http://localhost:3000/api/auth/callback/google

   生产环境:
   https://yourdomain.com/api/auth/callback/google
   ```

8. 点击 **创建** 并保存凭据

#### 1.2 配置环境变量

在 `.env.local` 中添加：

```env
# Google OAuth
GOOGLE_CLIENT_ID="你的客户端ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="你的客户端密钥"
```

#### 1.3 可选：自定义 Scope

默认 scope: `openid`, `email`, `profile`

如需更多权限，修改 `src/features/auth/services/next-auth.config.ts`:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
    },
  },
}),
```

---

### 2. GitHub OAuth 配置

#### 2.1 创建 GitHub OAuth 应用

**步骤：**

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **New OAuth App**
3. 填写应用信息：
   - **Application name**: 你的应用名称
   - **Homepage URL**:
     - 开发: `http://localhost:3000`
     - 生产: `https://yourdomain.com`
   - **Application description**: 可选
   - **Authorization callback URL**:

     ```text
     开发环境:
     http://localhost:3000/api/auth/callback/github

     生产环境:
     https://yourdomain.com/api/auth/callback/github
     ```

4. 点击 **Register application**
5. 复制 **Client ID**
6. 点击 **Generate a new client secret** 并复制密钥

#### 2.2 配置环境变量

在 `.env.local` 中添加：

```env
# GitHub OAuth
GITHUB_CLIENT_ID="你的GitHub客户端ID"
GITHUB_CLIENT_SECRET="你的GitHub客户端密钥"
```

#### 2.3 可选：配置权限范围

默认 scope: `user:email`, `read:user`

如需更多权限，修改配置：

```typescript
GitHubProvider({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'user:email read:user repo', // 添加 repo 权限
    },
  },
}),
```

---

### 3. 数据库配置

#### 3.1 确保数据库运行

```bash
# 检查 PostgreSQL 状态
pg_isready

# 或使用 Docker
docker ps | grep postgres
```

#### 3.2 运行数据库迁移

```bash
# 应用所有迁移
pnpm prisma migrate dev

# 生成 Prisma Client
pnpm prisma generate

# 可选：填充测试数据
pnpm prisma db seed
```

#### 3.3 验证数据库表

OAuth 功能需要以下表：

- `User` - 用户基础信息
- `Account` - OAuth 账户关联
- `Session` - 会话管理（如使用数据库 session）
- `VerificationToken` - 邮箱验证（可选）

查看表结构：

```bash
pnpm prisma studio
```

---

## 工作原理

### Web 端 OAuth 流程（已实现 ✅）

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant N as NextAuth
    participant O as OAuth Provider
    participant DB as 数据库

    U->>F: 点击 OAuth 登录按钮
    F->>N: GET /api/auth/signin/google
    N->>O: 重定向到授权页面
    U->>O: 授权应用
    O->>N: 回调 /api/auth/callback/google
    N->>O: 交换授权码获取 access_token
    O->>N: 返回用户信息
    N->>DB: 查找/创建用户
    N->>DB: 关联 OAuth 账户
    N->>F: 设置 HTTP-only Cookie (JWT)
    F->>U: 重定向到 /console
```

**详细步骤：**

1. **用户点击 OAuth 按钮**
   - 前端调用 `signIn('google')` 或 `signIn('github')`
   - NextAuth 重定向到 OAuth 提供商授权页面

2. **用户授权**
   - 在 Google/GitHub 授权页面确认权限
   - OAuth 提供商生成授权码

3. **回调处理**
   - OAuth 提供商回调到 `/api/auth/callback/{provider}`
   - NextAuth 使用授权码交换 access_token
   - 获取用户 profile 信息

4. **用户创建/关联**
   - 检查 email 是否已存在于数据库
   - 如存在 → 关联 OAuth 账户到现有用户
   - 如不存在 → 创建新用户 + OAuth 账户记录

5. **Session 创建**
   - 生成 JWT token（包含 user id, role 等）
   - 设置 HTTP-only Cookie
   - 重定向到应用首页

### 账户关联逻辑

**场景 1：首次使用 OAuth 登录**

```typescript
// 用户邮箱: user@example.com
// 数据库: 无记录

// 执行流程：
1. 创建 User 记录
2. 创建 Account 记录（关联 OAuth 信息）
3. 生成 Session
```

**场景 2：已有邮箱用户，首次使用 OAuth**

```typescript
// 用户邮箱: user@example.com
// 数据库: 已有通过邮箱注册的用户

// 执行流程：
1. 查找到现有 User 记录
2. 创建 Account 记录（关联到现有用户）
3. 生成 Session
```

**场景 3：已使用 Google，现在用 GitHub 登录（同邮箱）**

```typescript
// 用户邮箱: user@example.com
// 数据库: User + Google Account

// 执行流程：
1. 查找到现有 User 记录
2. 创建新的 Account 记录（GitHub）
3. 同一用户现在关联了两个 OAuth 账户
4. 生成 Session
```

相关代码位置：`src/features/auth/services/next-auth.config.ts`

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // 自动关联逻辑
    if (account?.provider !== 'credentials') {
      // OAuth 登录时，通过 email 查找现有用户
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (existingUser) {
        // 关联到现有用户
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            // ...
          },
        });
      }
    }
    return true;
  },
}
```

### Session 管理

**JWT 策略（默认）：**

```typescript
// JWT 存储在 HTTP-only Cookie 中
// 不需要数据库查询，性能更好

session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 天
}

// JWT Payload:
{
  sub: "user-id",
  email: "user@example.com",
  role: "USER",
  iat: 1234567890,
  exp: 1234567890
}
```

**验证流程：**

```typescript
// 受保护路由中
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/services/next-auth.config';

const session = await getServerSession(authOptions);
if (!session) {
  redirect('/auth/login');
}

// session.user 包含：{ id, email, name, role }
```

---

## 测试验证

### 1. 检查可用 Provider

访问端点查看已启用的认证方式：

```bash
curl http://localhost:3000/api/auth/providers
```

**预期响应：**

```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "http://localhost:3000/api/auth/signin/google",
    "callbackUrl": "http://localhost:3000/api/auth/callback/google"
  },
  "github": {
    "id": "github",
    "name": "GitHub",
    "type": "oauth",
    "signinUrl": "http://localhost:3000/api/auth/signin/github",
    "callbackUrl": "http://localhost:3000/api/auth/callback/github"
  },
  "credentials": {
    "id": "credentials",
    "name": "Credentials",
    "type": "credentials"
  }
}
```

如果某个 provider 缺失，说明环境变量未配置。

### 2. 测试登录流程

**完整测试清单：**

- [ ] 访问 `/auth/login` 页面
- [ ] 看到三种登录方式
- [ ] 点击 Google 按钮 → 跳转到 Google 授权页
- [ ] 授权后自动回调并登录
- [ ] 登录成功后跳转到 `/console`
- [ ] 右上角显示用户头像/名称
- [ ] 刷新页面仍然保持登录状态
- [ ] 访问 `/profile` 查看个人信息
- [ ] 点击退出登录 → 返回登录页

### 3. 查看开发日志

开发模式下，终端会输出详细日志：

```bash
# 邮箱登录日志
🔍 Credentials authorization attempt: user@example.com
👤 User found: { id: 'xxx', email: 'user@example.com', role: 'USER' }
✅ Authorization successful for user: user@example.com

# OAuth 登录日志
🔐 OAuth sign in: google
📧 Profile email: user@example.com
👤 User lookup/creation
✅ Account linked to user: xxx

# JWT 创建
JWT token created: { sub: 'xxx', role: 'USER', ... }

# Session 创建
Session created: { user: { id: 'xxx', email: 'user@example.com' } }
```

### 4. 数据库验证

使用 Prisma Studio 查看数据：

```bash
pnpm prisma studio
```

**检查项：**

1. **User 表**：是否创建了新用户
2. **Account 表**：是否有对应的 OAuth 记录
   - `provider`: 'google' 或 'github'
   - `providerAccountId`: OAuth 提供商的用户 ID
   - `userId`: 关联的用户 ID

### 5. 调试技巧

**浏览器控制台：**

```javascript
// 查看当前 session
console.log(window.localStorage); // NextAuth 不使用 localStorage

// 查看 Cookie
document.cookie; // 应该能看到 next-auth.session-token
```

**后端调试：**

```typescript
// 在 next-auth.config.ts 中添加
debug: process.env.NODE_ENV === 'development',

// 启用后会输出更详细的日志
```

---

## 安全最佳实践

### 🔒 生产环境检查清单

#### 必需配置

- [ ] **使用 HTTPS**（绝对必需！OAuth 要求）
- [ ] **设置正确的 `NEXTAUTH_URL`**
  
  ```env
  # 必须是完整的 HTTPS URL
  NEXTAUTH_URL="https://yourdomain.com"
  ```

- [ ] **使用强随机的 `NEXTAUTH_SECRET`**
  
  ```bash
  # 至少 32 个字符
  openssl rand -base64 32
  ```

- [ ] **配置正确的回调 URL**
  - 在 Google/GitHub OAuth 应用中
  - 使用生产域名
  - 必须与 `NEXTAUTH_URL` 匹配

#### 安全措施

- [ ] **限制允许的域名**
  - 在 OAuth 应用设置中限制 Authorized domains
  
- [ ] **不要在前端暴露密钥**
  
  ```typescript
  // ❌ 错误
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // ✅ 正确 - 只在服务端使用
  // next-auth.config.ts 自动处理
  ```

- [ ] **启用 CSRF 保护**（NextAuth 默认已启用）

- [ ] **定期轮换密钥**
  - 定期更新 `NEXTAUTH_SECRET`
  - 更新 OAuth 应用的 Client Secret

- [ ] **监控异常登录**
  - 记录登录日志
  - 检测异常 IP 或设备

#### Cookie 安全配置

NextAuth 默认配置已经很安全：

```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,      // 防止 XSS 攻击
      sameSite: 'lax',     // 防止 CSRF
      path: '/',
      secure: process.env.NODE_ENV === 'production', // 生产环境强制 HTTPS
    },
  },
}
```

### 数据保护

#### 敏感信息处理

```typescript
// ✅ 正确 - 只存储必要信息
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.sub = user.id;
      token.role = user.role;
      // 不要存储密码或敏感的 OAuth token
    }
    return token;
  },
}
```

#### 用户隐私

- OAuth access_token 不存储在 JWT 中（除非必需）
- 定期清理过期的 Session 记录
- 遵守 GDPR/数据保护法规

### 速率限制

建议在登录端点添加速率限制：

```typescript
// middleware.ts 或使用 rate-limit 中间件
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 限制 5 次尝试
  message: '登录尝试次数过多，请稍后再试',
});
```

---

## 常见问题

### Q1: OAuth 按钮是灰色的？

**原因：** 环境变量未配置或未生效

**解决步骤：**

```bash
# 1. 检查文件是否存在
ls -la .env.local

# 2. 查看环境变量
cat .env.local | grep GOOGLE
cat .env.local | grep GITHUB

# 3. 验证配置
pnpm verify:oauth

# 4. 重启开发服务器（重要！）
# 按 Ctrl+C 停止，然后重新运行
pnpm dev
```

### Q2: 授权后显示 "Configuration Error"

**原因：** `NEXTAUTH_SECRET` 或 `NEXTAUTH_URL` 配置错误

**检查：**

```bash
# 确保这两个变量存在
cat .env.local | grep NEXTAUTH_SECRET
cat .env.local | grep NEXTAUTH_URL

# NEXTAUTH_URL 必须与访问的 URL 一致
# 开发: http://localhost:3000
# 生产: https://yourdomain.com
```

### Q3: 授权后显示 "Callback URL mismatch"

**原因：** OAuth 应用的回调 URL 配置错误

**解决：**

1. **检查 Google OAuth 应用**：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 确认回调 URL: `http://localhost:3000/api/auth/callback/google`

2. **检查 GitHub OAuth 应用**：
   - 访问 [GitHub Settings](https://github.com/settings/developers)
   - 确认回调 URL: `http://localhost:3000/api/auth/callback/github`

3. **注意事项**：
   - URL 必须完全匹配（包括协议、端口）
   - 不能有尾部斜杠
   - 区分大小写

### Q4: 授权后显示 "Email is required for OAuth login"

**原因：** OAuth 提供商未返回用户邮箱

**解决：**

**Google：**

- 确保请求了 `email` scope
- 检查用户的 Google 账户是否有邮箱

**GitHub：**

- 用户的邮箱可能设置为私密
- 修改 OAuth 应用权限，添加 `user:email` scope
- 或要求用户在 GitHub 设置中公开邮箱

### Q5: 数据库连接失败

**检查清单：**

```bash
# 1. PostgreSQL 是否运行
pg_isready

# 2. 数据库是否存在
psql -U postgres -c "\l"

# 3. 连接字符串是否正确
echo $DATABASE_URL

# 4. 运行迁移
pnpm prisma migrate dev

# 5. 验证连接
pnpm prisma db pull
```

### Q6: Session 无法持久化（刷新后退出登录）

**可能原因：**

1. **Cookie 未正确设置**
   - 检查浏览器开发者工具 → Application → Cookies
   - 应该有 `next-auth.session-token`

2. **域名不匹配**
   - `NEXTAUTH_URL` 必须与访问的域名一致

3. **HTTPS 问题**
   - 生产环境必须使用 HTTPS
   - 本地开发可以用 HTTP

4. **浏览器隐私设置**
   - 禁用了第三方 Cookie
   - 使用无痕模式

### Q7: 如何支持多个 OAuth 账户关联到同一用户？

**已支持！** 默认实现会自动关联：

```typescript
// 用户首先用 Google 登录 (user@example.com)
// 然后用 GitHub 登录 (同样的 user@example.com)
// → 系统会自动关联到同一个用户

// 查看数据库：
// User: { id: 1, email: 'user@example.com' }
// Account: [
//   { userId: 1, provider: 'google', ... },
//   { userId: 1, provider: 'github', ... }
// ]
```

### Q8: 如何在 API 路由中获取当前用户？

```typescript
// app/api/example/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/services/next-auth.config';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  // 使用 userId 进行操作
  return Response.json({ userId, userRole });
}
```

### Q9: 如何自定义登录后的跳转页面？

```typescript
// 在登录按钮中指定
signIn('google', { callbackUrl: '/dashboard' });

// 或在 next-auth.config.ts 中全局配置
pages: {
  signIn: '/auth/login',
  signOut: '/auth/logout',
  error: '/auth/error',
  newUser: '/onboarding', // 新用户首次登录跳转
},
```

### Q10: 如何实现退出登录？

```typescript
'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })}>
      退出登录
    </button>
  );
}
```

---

## 生产部署

### 环境变量配置

**必需变量：**

```env
# NextAuth（必需）
NEXTAUTH_SECRET="生产环境强随机密钥"
NEXTAUTH_URL="https://yourdomain.com"

# 数据库（必需）
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# Google OAuth（可选）
GOOGLE_CLIENT_ID="生产环境客户端ID"
GOOGLE_CLIENT_SECRET="生产环境客户端密钥"

# GitHub OAuth（可选）
GITHUB_CLIENT_ID="生产环境客户端ID"
GITHUB_CLIENT_SECRET="生产环境客户端密钥"
```

### OAuth 应用配置

#### Google Cloud Console

1. 创建生产环境的 OAuth 应用
2. 配置授权域名：`yourdomain.com`
3. 添加回调 URL：`https://yourdomain.com/api/auth/callback/google`
4. 发布应用（从测试模式切换到生产）

#### GitHub OAuth App

1. 创建新的 OAuth App（或更新现有）
2. Homepage URL: `https://yourdomain.com`
3. Callback URL: `https://yourdomain.com/api/auth/callback/github`

### Vercel 部署

**步骤：**

1. **连接 GitHub 仓库**
2. **配置环境变量**（在 Vercel Dashboard）
3. **部署**

```bash
# 或使用 Vercel CLI
vercel --prod
```

**注意事项：**

- Vercel 自动配置 `NEXTAUTH_URL`
- 确保所有环境变量都添加到 Vercel
- OAuth 回调 URL 使用 Vercel 提供的域名

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# 构建镜像
docker build -t my-app .

# 运行容器
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET="xxx" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e DATABASE_URL="xxx" \
  -e GOOGLE_CLIENT_ID="xxx" \
  -e GOOGLE_CLIENT_SECRET="xxx" \
  my-app
```

### 健康检查

创建健康检查端点：

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### 监控与日志

**推荐工具：**

- **Sentry**: 错误追踪
- **LogRocket**: 用户会话回放
- **Datadog**: 性能监控
- **Vercel Analytics**: 内置分析

**日志配置：**

```typescript
// next-auth.config.ts
export const authOptions: NextAuthConfig = {
  // ...
  logger: {
    error(code, metadata) {
      console.error('[NextAuth Error]', code, metadata);
      // 发送到 Sentry 等
    },
    warn(code) {
      console.warn('[NextAuth Warning]', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth Debug]', code, metadata);
      }
    },
  },
};
```

---

## 📚 相关资源

### 官方文档

- [NextAuth.js 文档](https://next-auth.js.org/)
- [Google OAuth 文档](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth 文档](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Next.js 认证指南](https://nextjs.org/docs/authentication)

### 项目文档

- [项目架构](./ARCHITECTURE.md)
- [认证架构](./AUTH_ARCHITECTURE.md)
- [部署指南](./DEPLOYMENT.md)
- [国际化指南](./I18N_GUIDE.md)

### 社区资源

- [NextAuth 示例](https://github.com/nextauthjs/next-auth/tree/main/apps/examples)
- [OAuth 最佳实践](https://oauth.net/2/best-practice/)

---

## 🎯 下一步计划

### 短期目标

- [ ] 添加 Apple Sign In
- [ ] 实现邮箱验证流程
- [ ] 添加双因素认证（2FA）

### 中期目标

- [ ] 移动端 OAuth 适配
- [ ] 实现 Bearer Token 认证
- [ ] 设备管理功能
- [ ] Session Token 哈希存储

### 长期目标

- [ ] 支持更多 OAuth 提供商（WeChat、微博等）
- [ ] 实现 SAML/SSO 企业登录
- [ ] 完善审计日志系统

---

## ✅ 验收标准

完成以下检查，确保 OAuth 功能正常：

- [ ] Google OAuth 登录成功
- [ ] GitHub OAuth 登录成功
- [ ] 邮箱/密码登录成功
- [ ] 账户自动关联（同邮箱不同登录方式）
- [ ] Session 持久化（刷新页面不退出）
- [ ] 退出登录功能正常
- [ ] 受保护路由正确拦截
- [ ] 生产环境部署成功
- [ ] OAuth 回调 URL 配置正确
- [ ] 所有环境变量已配置

---

**配置完成！** 🎉

如有问题，请查看终端日志、浏览器控制台，或参考 [常见问题](#常见问题) 章节。

**文档版本**: 1.0.0  
**最后更新**: 2025-11-11  
**维护者**: inRemark Team
