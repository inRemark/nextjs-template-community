# 社区版代码同步脚本使用说明

## 概述

这个脚本用于将社区版代码自动同步到独立的开源仓库，**只提交变更的文件**，避免全量提交。

## 工作流程

```bash
主仓库（私有，完整代码）
    ↓
打包社区版（source-community/）
    ↓
同步到开源仓库（只提交变更）
    ↓
开源仓库（GitHub/GitLab，社区版代码）
```

## 使用方法

### 1. 基本使用

```bash
npm run sync:community [版本号] [提交信息]
```

例如：

```bash
npm run sync:community 1.0.0 "feat: add new features"
```

### 2. 配置环境变量

在 `.env` 文件中配置（或直接设置环境变量）：

```bash
# 社区版仓库本地路径（默认：../nextjs-template-community）
COMMUNITY_REPO_DIR=../nextjs-template-community

# 社区版仓库远程地址（可选，首次需要手动设置）
COMMUNITY_REPO_REMOTE=git@github.com:username/nextjs-template-community.git
```

### 3. 首次设置

#### 方式一：使用现有仓库

```bash
# 1. 克隆或创建开源仓库
git clone git@github.com:username/nextjs-template-community.git ../nextjs-template-community

# 2. 设置环境变量
export COMMUNITY_REPO_REMOTE=git@github.com:username/nextjs-template-community.git

# 3. 同步代码
npm run sync:community 1.0.0 "Initial community edition release"
```

#### 方式二：让脚本自动创建

```bash
# 1. 设置远程地址
export COMMUNITY_REPO_REMOTE=git@github.com:username/nextjs-template-community.git

# 2. 同步代码（会自动创建目录和初始化 Git）
npm run sync:community 1.0.0 "Initial community edition release"

# 3. 手动添加远程仓库（如果脚本创建）
cd ../nextjs-template-community
git remote add origin git@github.com:username/nextjs-template-community.git
git push -u origin main
```

## 脚本功能

1. **自动打包**：先执行社区版打包
2. **智能同步**：只复制变更的文件，跳过未修改的文件
3. **Git 管理**：自动提交变更，保留 Git 历史
4. **清理删除**：自动删除源目录中已移除的文件
5. **状态显示**：显示同步状态和下一步操作

## 优势

### ✅ 只提交变更

- 首次同步：全量提交
- 后续更新：只提交变更的文件
- Git 历史清晰，不会暴露 Pro 版代码

### ✅ 自动化流程

- 一键同步，无需手动操作
- 自动处理 Git 提交
- 自动清理已删除的文件

### ✅ 安全隔离

- 主仓库（私有）包含完整代码
- 开源仓库（公开）只包含社区版代码
- Pro 版代码永远不会出现在开源仓库

## 工作流程示例

### 首次发布

```bash
# 1. 创建 GitHub 仓库（手动）
# 在 GitHub 创建 nextjs-template-community 仓库

# 2. 设置环境变量
export COMMUNITY_REPO_REMOTE=git@github.com:username/nextjs-template-community.git

# 3. 同步代码
npm run sync:community 1.0.0 "Initial release"

# 4. 推送到远程
cd ../nextjs-template-community
git push -u origin main
```

### 日常更新

```bash
# 1. 在主仓库开发（包含 Pro 功能）

# 2. 同步社区版（只提交变更）
npm run sync:community 1.0.1 "fix: bug fixes and improvements"

# 3. 推送到开源仓库
cd ../nextjs-template-community
git push origin main
```

## 目录结构

```bash
项目根目录/
├── src/                    # 完整源代码（私有）
├── source-community/       # 打包后的社区版（临时）
└── ../nextjs-template-community/  # 开源仓库（同步目标）
    ├── src/                # 社区版源代码
    ├── .git/               # Git 仓库
    └── ...
```

## 受保护的文件

以下文件/目录不会被删除或覆盖（即使源目录中不存在）：

- `.github/` - GitHub 配置和工作流
- `LICENSE`, `LICENSE.md` - 许可证文件
- `CONTRIBUTING.md`, `CONTRIBUTING/` - 贡献指南
- `CHANGELOG.md`, `CHANGELOG/` - 更新日志
- `SECURITY.md` - 安全策略
- `CODE_OF_CONDUCT.md` - 行为准则
- `.gitignore` - Git 配置（如果开源仓库有自定义）
- `README-COMMUNITY.md` - 社区版专用 README
- `COMMUNITY.md` - 社区文档

你可以在 `scripts/sync-community-repo.js` 中的 `EXCLUDE_FROM_DELETION` 数组添加更多需要保护的文件。

## 注意事项

1. **首次同步**：需要手动设置远程仓库地址
2. **Git 历史**：开源仓库的 Git 历史独立于主仓库
3. **分支管理**：默认使用 `main` 分支，可以手动切换
4. **冲突处理**：如果开源仓库有手动修改，可能需要手动解决冲突
5. **受保护文件**：某些文件（如 LICENSE）不会被删除，即使源目录中不存在

## 故障排除

### 问题：找不到远程仓库

```bash
cd ../nextjs-template-community
git remote add origin git@github.com:username/nextjs-template-community.git
```

### 问题：同步后需要手动推送

```bash
cd ../nextjs-template-community
git push origin main
```

### 问题：查看变更内容

```bash
cd ../nextjs-template-community
git log --oneline
git diff HEAD~1
```

## 最佳实践

1. **定期同步**：每次发布新版本时同步一次
2. **提交信息**：使用清晰的提交信息，方便追踪
3. **版本号**：保持版本号与主仓库一致
4. **测试**：同步后测试开源仓库是否可以正常构建
