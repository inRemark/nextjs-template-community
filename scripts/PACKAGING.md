# 源代码打包脚本使用说明

## 概述

这个脚本用于将单一代码库打包成两个独立的源代码版本：

- **Community Edition（社区版）**：开源版本，包含基础功能
- **Pro Edition（专业版）**：完整版本，包含所有功能

## 工作流程

### 方案一：直接打包（用于分发）

```bash
# 打包后生成 ZIP 文件，直接分发给客户
npm run package:community 1.0.0
npm run package:pro 1.0.0
```

### 方案二：同步到开源仓库（推荐用于开源）

```bash
# 自动同步社区版到开源仓库，只提交变更
npm run sync:community 1.0.0 "feat: update features"
```

**优势**：

- ✅ 只提交变更的文件，不是全量提交
- ✅ 开源仓库的 Git 历史清晰
- ✅ 不会暴露 Pro 版代码
- ✅ 自动化流程，一键同步

详细说明请参考：[SYNC-COMMUNITY.md](./SYNC-COMMUNITY.md)

## 安装依赖

首先确保安装了 `archiver` 依赖：

```bash
pnpm install
```

## 使用方法

### 1. 打包社区版

```bash
npm run package:community [版本号]
```

例如：

```bash
npm run package:community 1.0.0
```

### 2. 打包 Pro 版

```bash
npm run package:pro [版本号]
```

例如：

```bash
npm run package:pro 1.0.0
```

### 3. 打包两个版本

```bash
npm run package:all [版本号]
```

例如：

```bash
npm run package:all 1.0.0
```

如果不指定版本号，默认使用 `1.0.0`。

## 输出

打包完成后，会在以下位置生成文件：

- **源代码目录**：`source-community/` 或 `source-pro/`
- **压缩包**：`releases/nextjs-template-community-v1.0.0.zip` 或 `releases/nextjs-template-pro-v1.0.0.zip`

## 配置

编辑 `.edition-config.json` 文件来配置哪些功能属于社区版，哪些属于 Pro 版。

### 社区版包含的功能

- auth（认证）
- home（首页）
- articles（文章）
- blog（博客）
- help（帮助）
- theme-clone（主题克隆）
- screenshot（截图）
- about（关于）
- features（功能展示）
- shared-layout（共享布局）

### Pro 版额外包含的功能

- admin（管理后台）
- orders（订单）
- payments（支付）
- referral（推荐）
- points（积分）
- notifications（通知）
- mail（邮件）
- search（搜索）
- console（控制台）
- profile（个人资料）
- products（产品）
- pricing（定价）

## 脚本功能

1. **选择性复制源代码**：根据配置只复制对应版本需要的功能模块
2. **处理 Prisma Schema**：社区版自动移除 Pro-only 的数据库模型
3. **更新依赖**：社区版自动移除 Pro-only 的 npm 依赖（如 Stripe、支付宝 SDK）
4. **清理代码**：移除代码中标记的 `/* PRO_ONLY_START */ ... /* PRO_ONLY_END */` 代码块
5. **生成版本信息**：创建 `EDITION_INFO.json` 和 `README-EDITION.md`

## 代码标记

如果某些文件需要同时包含社区版和 Pro 版代码，可以使用注释标记：

```typescript
// 社区版代码
export const config = {};

/* PRO_ONLY_START */
// Pro 版专用代码
export const proConfig = {};
/* PRO_ONLY_END */
```

打包社区版时，标记的代码块会被自动移除。

## 注意事项

1. 打包前确保代码已提交或备份
2. 生成的源代码包可以直接运行，但需要先安装依赖：`pnpm install`
3. 社区版的 Prisma schema 已自动处理，但首次运行需要执行迁移：`pnpm prisma migrate dev`
4. 打包脚本本身不会包含在生成的源代码包中

## 故障排除

如果遇到问题：

1. 确保 Node.js 版本 >= 18
2. 确保已安装所有依赖：`pnpm install`
3. 检查 `.edition-config.json` 配置是否正确
4. 查看控制台输出的错误信息
