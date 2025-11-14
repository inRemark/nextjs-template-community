#!/usr/bin/env node

/**
 * OAuth 配置验证脚本
 * 
 * 用途：快速检查 OAuth 环境变量是否正确配置
 * 运行：node scripts/verify-oauth-config.cjs
 */

// 检查是否在项目根目录
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

// ANSI 颜色代码（替代 chalk）
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const c = {
  red: (text) => `${colors.red}${text}${colors.reset}`,
  green: (text) => `${colors.green}${text}${colors.reset}`,
  yellow: (text) => `${colors.yellow}${text}${colors.reset}`,
  blue: (text) => `${colors.blue}${text}${colors.reset}`,
  cyan: (text) => `${colors.cyan}${text}${colors.reset}`,
  gray: (text) => `${colors.gray}${text}${colors.reset}`,
  bold: (text) => `${colors.bold}${text}${colors.reset}`
};

console.log(c.bold(c.blue('\n🔍 OAuth 配置验证\n')));

// 简单的环境变量加载器（替代 dotenv）
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

// 加载环境变量
loadEnv(envPath);

const requiredVars = {
  'NEXTAUTH_SECRET': {
    description: 'NextAuth 密钥（至少32字符）',
    validator: (val) => val && val.length >= 32,
    errorMsg: '必须至少32个字符'
  },
  'NEXTAUTH_URL': {
    description: 'NextAuth URL',
    validator: (val) => val && (val.startsWith('http://') || val.startsWith('https://')),
    errorMsg: '必须是完整的 HTTP/HTTPS URL'
  }
};

const oauthVars = {
  google: {
    'GOOGLE_CLIENT_ID': {
      description: 'Google OAuth 客户端 ID',
      validator: (val) => val && val.includes('.apps.googleusercontent.com'),
      errorMsg: '格式应为: xxx.apps.googleusercontent.com'
    },
    'GOOGLE_CLIENT_SECRET': {
      description: 'Google OAuth 客户端密钥',
      validator: (val) => val && val.length > 20,
      errorMsg: '密钥长度不足'
    }
  },
  github: {
    'GITHUB_CLIENT_ID': {
      description: 'GitHub OAuth 客户端 ID',
      validator: (val) => val && val.length > 10,
      errorMsg: 'Client ID 格式不正确'
    },
    'GITHUB_CLIENT_SECRET': {
      description: 'GitHub OAuth 客户端密钥',
      validator: (val) => val && val.length > 20,
      errorMsg: '密钥长度不足'
    }
  }
};

let hasErrors = false;
let enabledProviders = [];

// 检查必需变量
console.log(c.bold('📋 必需配置：\n'));
for (const [key, config] of Object.entries(requiredVars)) {
  const value = process.env[key];
  if (!value) {
    console.log(c.red(`  ✗ ${key}: 未设置`));
    console.log(c.gray(`    说明: ${config.description}\n`));
    hasErrors = true;
  } else if (config.validator && !config.validator(value)) {
    console.log(c.yellow(`  ⚠ ${key}: 已设置但可能有问题`));
    console.log(c.gray(`    ${config.errorMsg}\n`));
    hasErrors = true;
  } else {
    console.log(c.green(`  ✓ ${key}: 已配置`));
  }
}

// 检查 OAuth 提供商
console.log(c.bold('\n🔐 OAuth 提供商：\n'));
for (const [provider, vars] of Object.entries(oauthVars)) {
  let providerConfigured = true;
  let providerPartial = false;
  
  console.log(c.bold(`  ${provider.toUpperCase()}:`));
  
  for (const [key, config] of Object.entries(vars)) {
    const value = process.env[key];
    if (!value) {
      console.log(c.gray(`    ○ ${key}: 未设置`));
      providerConfigured = false;
    } else if (config.validator && !config.validator(value)) {
      console.log(c.yellow(`    ⚠ ${key}: ${config.errorMsg}`));
      providerPartial = true;
    } else {
      console.log(c.green(`    ✓ ${key}: 已配置`));
    }
  }
  
  if (providerConfigured && !providerPartial) {
    console.log(c.green(`  → ${provider.toUpperCase()} 登录已启用\n`));
    enabledProviders.push(provider);
  } else if (providerPartial) {
    console.log(c.yellow(`  → ${provider.toUpperCase()} 配置不完整\n`));
  } else {
    console.log(c.gray(`  → ${provider.toUpperCase()} 未配置（可选）\n`));
  }
}

// 总结
console.log(c.bold('📊 配置总结：\n'));
if (hasErrors) {
  console.log(c.red('  ✗ 发现配置问题，请检查必需变量\n'));
} else {
  console.log(c.green('  ✓ 必需配置完整\n'));
}

if (enabledProviders.length > 0) {
  console.log(c.green(`  ✓ 已启用 OAuth 提供商: ${enabledProviders.join(', ')}\n`));
} else {
  console.log(c.yellow('  ⚠ 未启用任何 OAuth 提供商（仅支持邮箱登录）\n'));
}

// 提供建议
if (hasErrors || enabledProviders.length === 0) {
  console.log(c.bold(c.cyan('💡 下一步：\n')));
  
  if (!fs.existsSync(envPath)) {
    console.log(c.cyan(`  1. 复制环境变量模板文件：`));
    console.log(c.gray(`     cp .env.example .env.local\n`));
  }
  
  if (hasErrors) {
    console.log(c.cyan(`  2. 编辑 .env.local 文件，配置必需变量`));
    console.log(c.gray(`     - NEXTAUTH_SECRET: 运行 'openssl rand -base64 32' 生成`));
    console.log(c.gray(`     - NEXTAUTH_URL: http://localhost:3000 (开发环境)\n`));
  }
  
  if (enabledProviders.length === 0) {
    console.log(c.cyan(`  3. 配置 OAuth 提供商（可选）：`));
    console.log(c.gray(`     - Google: https://console.cloud.google.com/`));
    console.log(c.gray(`     - GitHub: https://github.com/settings/developers`));
    console.log(c.gray(`     详细步骤请参考: docs/OAUTH_SETUP.md\n`));
  }
  
  console.log(c.cyan(`  4. 重启开发服务器使配置生效\n`));
}

// 显示回调 URL（用于配置 OAuth 应用）
if (enabledProviders.length > 0) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  console.log(c.bold(c.cyan('🔗 OAuth 回调 URL（在 OAuth 应用中配置）：\n')));
  
  for (const provider of enabledProviders) {
    console.log(c.cyan(`  ${provider.toUpperCase()}:`));
    console.log(c.gray(`    ${baseUrl}/api/auth/callback/${provider}\n`));
  }
}

// 退出码
process.exit(hasErrors ? 1 : 0);
