#!/usr/bin/env node

/**
 * 社区版代码同步脚本
 * 将社区版代码同步到独立的开源仓库，只提交变更的文件
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 配置
const COMMUNITY_REPO_DIR = process.env.COMMUNITY_REPO_DIR || path.join(rootDir, '../nextjs-template-community');
const COMMUNITY_REPO_REMOTE = process.env.COMMUNITY_REPO_REMOTE || ''; // 例如: git@github.com:username/nextjs-template-community.git
const VERSION = process.argv[2] || '1.0.0';
const COMMIT_MESSAGE = process.argv[3] || `chore: update to v${VERSION}`;

// 排除列表：这些文件/目录不会被删除（即使源目录中不存在）
const EXCLUDE_FROM_DELETION = new Set([
  '.git',
  '.github',           // GitHub 配置和工作流
  'LICENSE',           // 许可证文件
  'LICENSE.md',
  'CONTRIBUTING.md',   // 贡献指南
  'CONTRIBUTING',      // 贡献指南目录
  'CHANGELOG.md',      // 更新日志
  'CHANGELOG',         // 更新日志目录
  'SECURITY.md',       // 安全策略
  'CODE_OF_CONDUCT.md', // 行为准则
  '.gitignore',        // Git 配置（如果开源仓库有自定义）
  'README-COMMUNITY.md', // 社区版专用 README
  'COMMUNITY.md',      // 社区文档
]);

console.log(`\n🔄 Syncing community edition to repository...\n`);
const protectedFiles = Array.from(EXCLUDE_FROM_DELETION).filter(f => f !== '.git').join(', ');
console.log(`📋 Protected files (won't be deleted): ${protectedFiles}\n`);

// 1. 先打包社区版
console.log('📦 Step 1: Packaging community edition...');
try {
  execSync(`node scripts/package-source.js community ${VERSION}`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('❌ Failed to package community edition');
  process.exit(1);
}

const sourceDir = path.join(rootDir, 'source-community');

// 2. 初始化或更新社区版仓库
console.log('\n📁 Step 2: Setting up community repository...');

if (!fs.existsSync(COMMUNITY_REPO_DIR)) {
  console.log(`   Creating directory: ${COMMUNITY_REPO_DIR}`);
  fs.mkdirSync(COMMUNITY_REPO_DIR, { recursive: true });
  
  // 初始化 Git 仓库
  execSync('git init', { cwd: COMMUNITY_REPO_DIR, stdio: 'pipe' });
  
  // 设置远程仓库（如果提供）
  if (COMMUNITY_REPO_REMOTE) {
    execSync(`git remote add origin ${COMMUNITY_REPO_REMOTE}`, {
      cwd: COMMUNITY_REPO_DIR,
      stdio: 'pipe',
    });
  }
} else {
  // 如果仓库已存在，先拉取最新代码
  try {
    execSync('git fetch origin', { cwd: COMMUNITY_REPO_DIR, stdio: 'pipe' });
    execSync('git pull origin main || git pull origin master', {
      cwd: COMMUNITY_REPO_DIR,
      stdio: 'pipe',
    });
  } catch (error) {
    // 忽略错误，可能是新仓库
  }
}

// 3. 同步文件（只复制变更的文件）
console.log('\n📋 Step 3: Syncing files...');
syncFiles(sourceDir, COMMUNITY_REPO_DIR);

// 4. 添加 .gitignore（如果不存在）
const gitignorePath = path.join(COMMUNITY_REPO_DIR, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# OS
Thumbs.db
`;
  fs.writeFileSync(gitignorePath, gitignoreContent);
}

// 5. 提交变更
console.log('\n📝 Step 4: Committing changes...');
try {
  execSync('git add -A', { cwd: COMMUNITY_REPO_DIR, stdio: 'pipe' });
  
  // 检查是否有变更
  const status = execSync('git status --porcelain', {
    cwd: COMMUNITY_REPO_DIR,
    encoding: 'utf8',
  });
  
  if (status.trim()) {
    execSync(`git commit -m "${COMMIT_MESSAGE}"`, {
      cwd: COMMUNITY_REPO_DIR,
      stdio: 'inherit',
    });
    console.log('✅ Changes committed');
  } else {
    console.log('ℹ️  No changes to commit');
  }
} catch (error) {
  console.error('❌ Failed to commit changes');
  process.exit(1);
}

// 6. 显示状态
console.log('\n📊 Step 5: Repository status...');
try {
  const status = execSync('git status --short', {
    cwd: COMMUNITY_REPO_DIR,
    encoding: 'utf8',
  });
  
  if (status.trim()) {
    console.log('Uncommitted changes:');
    console.log(status);
  } else {
    console.log('✅ Repository is clean');
  }
  
  // 显示分支信息
  const branch = execSync('git branch --show-current', {
    cwd: COMMUNITY_REPO_DIR,
    encoding: 'utf8',
  }).trim();
  console.log(`\n📌 Current branch: ${branch || 'main'}`);
  
  // 显示远程信息
  try {
    const remote = execSync('git remote -v', {
      cwd: COMMUNITY_REPO_DIR,
      encoding: 'utf8',
    });
    if (remote.trim()) {
      console.log('\n🔗 Remote repositories:');
      console.log(remote);
    }
  } catch (error) {
    console.log('\n⚠️  No remote repository configured');
    if (COMMUNITY_REPO_REMOTE) {
      console.log(`   To set remote: cd ${COMMUNITY_REPO_DIR} && git remote add origin ${COMMUNITY_REPO_REMOTE}`);
    }
  }
} catch (error) {
  // 忽略错误
}

console.log(`\n✅ Community edition synced successfully!`);
console.log(`📁 Repository location: ${COMMUNITY_REPO_DIR}`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Review changes: cd ${COMMUNITY_REPO_DIR} && git log`);
console.log(`   2. Push to remote: cd ${COMMUNITY_REPO_DIR} && git push origin ${execSync('git branch --show-current', { cwd: COMMUNITY_REPO_DIR, encoding: 'utf8' }).trim() || 'main'}`);
console.log(`\n`);

// ========== 辅助函数 ==========

function syncFiles(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  let filesCopied = 0;
  let filesSkipped = 0;
  
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    
    // 跳过 .git 目录和排除列表中的文件（这些文件不会被覆盖）
    if (entry.name === '.git' || EXCLUDE_FROM_DELETION.has(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      syncFiles(srcPath, destPath);
    } else {
      // 检查文件是否需要更新
      let shouldCopy = true;
      
      if (fs.existsSync(destPath)) {
        const srcContent = fs.readFileSync(srcPath);
        const destContent = fs.readFileSync(destPath);
        
        if (srcContent.equals(destContent)) {
          shouldCopy = false;
          filesSkipped++;
        }
      }
      
      if (shouldCopy) {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        filesCopied++;
      }
    }
  }
  
  if (filesCopied > 0 || filesSkipped > 0) {
    console.log(`   Copied: ${filesCopied} files, Skipped: ${filesSkipped} unchanged files`);
  }
  
  // 删除目标目录中不存在于源目录的文件
  cleanupDeletedFiles(sourceDir, targetDir);
}

function cleanupDeletedFiles(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    return;
  }
  
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    
    // 跳过排除列表中的文件/目录
    if (EXCLUDE_FROM_DELETION.has(entry.name)) {
      continue;
    }
    
    if (!fs.existsSync(srcPath)) {
      // 文件或目录在源目录中不存在，删除它
      if (entry.isDirectory()) {
        fs.rmSync(destPath, { recursive: true });
      } else {
        fs.unlinkSync(destPath);
      }
    } else if (entry.isDirectory()) {
      cleanupDeletedFiles(srcPath, destPath);
    }
  }
}

