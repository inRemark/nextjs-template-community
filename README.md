# Next.js 通用开发模板

> 基于 Next.js 15 + React 19 + TypeScript 的企业级应用模板
123

## ✨ 特性

- ✅ **Next.js 15** - App Router 架构
- ✅ **React 19** - 最新 React 特性
- ✅ **TypeScript** - 严格类型检查
- ✅ **NextAuth.js v5** - JWT + OAuth 认证系统
- ✅ **Prisma ORM** - PostgreSQL 数据库
- ✅ **Tailwind CSS** - 原子化 CSS
- ✅ **Radix UI** - 无障碍 UI 组件库
- ✅ **博客系统** - Markdown 内容管理
- ✅ **用户控制台** - 个人中心集成
- ✅ **积分系统** - 用户成长体系
- ✅ **推荐系统** - 裂变营销工具
- ✅ **通知系统** - 实时消息推送
- ✅ **Docker** - 容器化部署

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 填入必要配置：

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
JWT_SECRET="your-jwt-secret-key"
```

### 数据库初始化

```bash
# 执行数据库迁移
pnpm prisma migrate dev

# 生成 Prisma Client
pnpm prisma generate
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 📦 核心模块

### 认证系统

- JWT 策略
- 邮箱/密码登录
- OAuth 扩展接口（Google/GitHub）
- API 路由保护中间件
- 前端路由保护组件

### 博客系统

- Markdown 内容渲染
- 文章列表与详情
- 分类与标签
- SEO 优化

### 用户控制台

- 个人信息管理
- 活动记录追踪
- 积分与推荐集成
- 通知订阅管理

### 积分系统

- 积分获取与消费
- 交易历史记录
- 排行榜
- 积分规则配置

### 推荐系统

- 推荐码生成
- 推荐关系追踪
- 奖励计算
- 转化漏斗分析

## 📚 文档

- [完整使用指南](./TEMPLATE_SIMPLIFICATION_GUIDE.md) - 详细的模板使用文档
- [API 文档](./docs/api.md) - API 接口说明（待补充）
- [部署指南](./docs/deployment.md) - 生产环境部署（待补充）

## 🛠️ 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 启动生产服务
pnpm start

# 代码检查
pnpm lint

# 类型检查
pnpm tsc --noEmit

# 数据库管理
pnpm prisma studio
```

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t nextjs-template .

# 运行容器
docker-compose up -d
```

## 📂 项目结构

```bash
.
├── prisma/              # 数据库 Schema 与迁移
├── public/              # 静态资源
├── src/
│   ├── app/            # Next.js App Router
│   ├── features/       # 功能模块
│   ├── lib/            # 公共库
│   └── shared/         # 共享组件
├── scripts/            # 运维脚本
└── .env.example        # 环境变量示例
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详见 [贡献指南](./CONTRIBUTING.md)（待创建）

## 📄 许可证

MIT License

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [NextAuth.js 文档](https://next-auth.js.org)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

**模板版本**: 1.0.0  
**最后更新**: 2025-10-26
