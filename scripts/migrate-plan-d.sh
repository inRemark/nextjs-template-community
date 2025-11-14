#!/bin/bash

# 方案D 数据库迁移脚本

echo "🚀 开始方案D数据库迁移..."
echo ""

# 1. 创建迁移
echo "📝 创建数据库迁移文件..."
pnpm prisma migrate dev --name add_user_sessions_and_dual_auth

# 2. 生成 Prisma Client
echo ""
echo "⚙️  生成 Prisma Client..."
pnpm prisma generate

echo ""
echo "✅ 方案D数据库迁移完成！"
echo ""
echo "下一步："
echo "  1. 启动开发服务器: pnpm dev"
echo "  2. 访问登录页面: http://localhost:3000/auth/login"
echo "  3. 测试 OAuth 登录（Google/GitHub）"
echo "  4. 查看文档: docs/AUTH_ARCHITECTURE_PLAN_D.md"
