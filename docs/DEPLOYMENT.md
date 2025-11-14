# VSeek 生产环境部署指南

本文档详细介绍了如何将 VSeek 应用部署到生产环境，包括 Vercel 部署、数据库配置、环境变量设置等。

## 📋 目录

- [前置要求](#前置要求)
- [环境准备](#环境准备)
- [数据库设置](#数据库设置)
- [Vercel 部署](#vercel-部署)
- [环境变量配置](#环境变量配置)
- [域名和SSL配置](#域名和ssl配置)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)
- [回滚流程](#回滚流程)
- [维护指南](#维护指南)

## 🎯 前置要求

### 必需服务
- [ ] Vercel 账户
- [ ] PostgreSQL 数据库（推荐 Railway 或 Supabase）
- [ ] Redis 缓存（可选，推荐 Upstash）
- [ ] Sentry 账户（错误监控）
- [ ] Google Analytics（可选）

### 必需工具
- [ ] Node.js 18+ 
- [ ] pnpm 包管理器
- [ ] Git
- [ ] 域名（可选）

## 🚀 环境准备

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/vseek.git
cd vseek
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 构建项目

```bash
pnpm build
```

### 4. 运行测试

```bash
pnpm test
pnpm lint
```

## 🗄️ 数据库设置

### 1. 创建 PostgreSQL 数据库

推荐使用以下服务之一：

#### Railway（推荐）
1. 访问 [Railway.app](https://railway.app)
2. 创建新项目
3. 添加 PostgreSQL 服务
4. 复制连接字符串

#### Supabase
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取数据库 URL

#### 自建数据库
```bash
# 使用 Docker
docker run --name vseek-postgres \
  -e POSTGRES_DB=vseek_production \
  -e POSTGRES_USER=vseek_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:15
```

### 2. 运行数据库迁移

```bash
# 设置数据库 URL
export DATABASE_URL="postgresql://username:password@host:port/database"

# 运行迁移
pnpm prisma db push

# 执行种子数据
pnpm prisma db seed
```

### 3. 验证数据库连接

```bash
pnpm tsx scripts/migrate-production.ts --dry-run
```

## ☁️ Vercel 部署

### 1. 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 选择项目根目录

### 2. 配置构建设置

Vercel 会自动检测到 `vercel.json` 配置文件，包含以下设置：

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev", 
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### 3. 设置环境变量

在 Vercel Dashboard 中添加以下环境变量：

#### 必需变量
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters
NEXTAUTH_URL=https://your-domain.com
```

#### 可选变量
```
REDIS_URL=redis://...
SENTRY_DSN=https://...
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4. 部署应用

```bash
# 推送代码触发自动部署
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

## 🔧 环境变量配置

### 生产环境变量清单

参考 `env.production.example` 文件，设置以下环境变量：

#### 数据库配置
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

#### 认证配置
```bash
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
NEXTAUTH_URL="https://your-domain.com"
```

#### 缓存配置（可选）
```bash
REDIS_URL="redis://username:password@host:port"
```

#### 邮件配置（可选）
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@your-domain.com"
```

#### 监控配置（推荐）
```bash
SENTRY_DSN="https://your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
```

#### 分析配置（可选）
```bash
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_VERCEL_ANALYTICS="true"
```

### 环境变量安全注意事项

1. **永远不要**将敏感信息提交到代码仓库
2. 使用强密码和长密钥
3. 定期轮换密钥
4. 使用 Vercel 环境变量功能管理生产配置
5. 限制环境变量的访问权限

## 🌐 域名和SSL配置

### 1. 添加自定义域名

1. 在 Vercel Dashboard 中选择项目
2. 进入 "Settings" > "Domains"
3. 添加你的域名
4. 按照指示配置 DNS 记录

### 2. SSL证书

Vercel 自动为所有域名提供免费的 SSL 证书，无需额外配置。

### 3. DNS配置

添加以下 DNS 记录：

```
类型: CNAME
名称: www
值: cname.vercel-dns.com

类型: A
名称: @
值: 76.76.19.61
```

## 📊 监控和日志

### 1. Sentry 错误监控

#### 设置 Sentry 项目
1. 访问 [Sentry.io](https://sentry.io)
2. 创建新项目
3. 选择 "Next.js" 平台
4. 获取 DSN

#### 配置 Sentry
```bash
# 安装 Sentry CLI
npm install -g @sentry/cli

# 配置 Sentry
sentry-cli login
sentry-cli projects list
```

#### 验证 Sentry 集成
```bash
# 检查 Sentry 配置
pnpm tsx -e "import('./src/lib/monitoring/sentry').then(m => console.log('Sentry health:', m.checkSentryHealth()))"
```

### 2. Vercel Analytics

Vercel Analytics 会自动启用，无需额外配置。

### 3. Google Analytics

1. 创建 Google Analytics 账户
2. 获取测量 ID
3. 设置环境变量 `NEXT_PUBLIC_GA_ID`

### 4. 日志监控

使用 Vercel Dashboard 的 "Functions" 标签页查看 API 日志。

## 🔍 故障排查

### 常见问题

#### 1. 构建失败

**问题**: Vercel 构建失败
**解决方案**:
```bash
# 本地测试构建
pnpm build

# 检查构建日志
vercel logs your-deployment-url
```

#### 2. 数据库连接失败

**问题**: 应用无法连接数据库
**解决方案**:
```bash
# 验证数据库连接
pnpm prisma db push

# 检查环境变量
vercel env ls
```

#### 3. 认证问题

**问题**: 用户无法登录
**解决方案**:
- 检查 `NEXTAUTH_SECRET` 是否正确设置
- 验证 `NEXTAUTH_URL` 是否匹配域名
- 检查 JWT 配置

#### 4. 静态资源加载失败

**问题**: 图片或CSS文件无法加载
**解决方案**:
- 检查 `vercel.json` 配置
- 验证文件路径
- 检查缓存设置

### 调试命令

```bash
# 检查环境变量
vercel env ls

# 查看部署日志
vercel logs

# 本地预览生产构建
vercel dev

# 检查数据库连接
pnpm prisma db push --preview-feature
```

## 🔄 回滚流程

### 1. 自动回滚

Vercel 会自动保留最近的部署版本，可以通过 Dashboard 快速回滚。

### 2. 手动回滚

```bash
# 回滚到特定提交
git revert HEAD
git push origin main

# 或强制推送到之前的提交
git reset --hard <previous-commit-hash>
git push origin main --force
```

### 3. 数据库回滚

```bash
# 使用备份文件回滚数据库
pnpm tsx scripts/migrate-production.ts --rollback=backup-2024-01-15T10-30-00-000Z.sql
```

## 🛠️ 维护指南

### 日常维护任务

#### 1. 监控检查
- [ ] 检查 Sentry 错误报告
- [ ] 查看 Vercel Analytics 数据
- [ ] 监控数据库性能
- [ ] 检查 API 响应时间

#### 2. 安全更新
```bash
# 更新依赖
pnpm update

# 检查安全漏洞
pnpm audit

# 修复漏洞
pnpm audit fix
```

#### 3. 数据库维护
```bash
# 创建数据库备份
pnpm tsx scripts/migrate-production.ts

# 检查数据库性能
pnpm prisma studio
```

#### 4. 性能优化
- 定期检查 Core Web Vitals
- 优化图片和静态资源
- 监控 API 响应时间
- 检查缓存命中率

### 定期任务

#### 每周
- [ ] 检查错误日志
- [ ] 审查用户反馈
- [ ] 更新依赖包
- [ ] 备份数据库

#### 每月
- [ ] 性能分析报告
- [ ] 安全审计
- [ ] 容量规划
- [ ] 功能使用统计

#### 每季度
- [ ] 架构审查
- [ ] 技术债务评估
- [ ] 灾难恢复测试
- [ ] 安全渗透测试

## 📞 支持联系

### 技术支持
- 项目 Issues: [GitHub Issues](https://github.com/your-username/vseek/issues)
- 文档: [项目 Wiki](https://github.com/your-username/vseek/wiki)

### 紧急联系
- 生产环境问题: [紧急联系方式]
- 数据库问题: [DBA 联系方式]

## 📚 相关文档

- [VSeek MVP 开发计划](./VSeek-MVP-Development-Plan.md)
- [API 文档](./api-customer-documentation.md)
- [架构文档](./architecture/)
- [开发指南](./development/)

---

**最后更新**: 2025-01-15  
**版本**: 1.0.0  
**维护者**: VSeek 开发团队
