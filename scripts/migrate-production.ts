#!/usr/bin/env tsx

/**
 * 生产环境数据库迁移脚本
 * 用于在生产环境中安全地执行数据库迁移和种子数据
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { logger } from '@logger';

const prisma = new PrismaClient();

interface MigrationOptions {
  skipBackup?: boolean;
  skipSeed?: boolean;
  force?: boolean;
  dryRun?: boolean;
}

/**
 * 创建数据库备份
 */
async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.sql`;
  
  logger.info('🔄 创建数据库备份...');
  
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    
    // 使用 pg_dump 创建备份
    const backupCommand = `pg_dump "${dbUrl}" > ${backupFile}`;
    execSync(backupCommand, { stdio: 'inherit' });
    
    logger.success(`数据库备份已创建: ${backupFile}`, { emoji: '✅' });
    return backupFile;
  } catch (error) {
    logger.error('❌ 创建备份失败:', error);
    throw error;
  }
}

/**
 * 执行数据库迁移
 */
async function runMigrations(options: MigrationOptions): Promise<void> {
  logger.info('🔄 执行数据库迁移...');
  
  if (options.dryRun) {
    logger.info('🔍 干运行模式 - 不执行实际迁移');
    return;
  }
  
  try {
    // 生成 Prisma 客户端
    logger.info('📦 生成 Prisma 客户端...');
    execSync('pnpm prisma generate', { stdio: 'inherit' });
    
    // 推送数据库模式
    logger.info('🚀 推送数据库模式...');
    execSync('pnpm prisma db push --accept-data-loss', { stdio: 'inherit' });
    
    logger.success('数据库迁移完成', { emoji: '✅' });
  } catch (error) {
    logger.error('❌ 数据库迁移失败:', error);
    throw error;
  }
}

/**
 * 验证数据库连接
 */
async function validateDatabase(): Promise<void> {
  logger.info('🔍 验证数据库连接...');
  
  try {
    await prisma.$connect();
    logger.success('数据库连接正常', { emoji: '✅' });
  } catch (error) {
    logger.error('❌ 数据库连接失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 执行种子数据
 */
async function runSeed(options: MigrationOptions): Promise<void> {
  if (options.skipSeed) {
    logger.info('⏭️  跳过种子数据');
    return;
  }
  
  logger.info('🌱 执行种子数据...');
  
  if (options.dryRun) {
    logger.info('🔍 干运行模式 - 不执行种子数据');
    return;
  }
  
  try {
    execSync('pnpm prisma db seed', { stdio: 'inherit' });
    logger.success('种子数据执行完成', { emoji: '✅' });
  } catch (error) {
    logger.error('❌ 种子数据执行失败:', error);
    throw error;
  }
}

/**
 * 验证数据完整性
 */
async function validateData(): Promise<void> {
  logger.info('🔍 验证数据完整性...');
  
  try {
    await prisma.$connect();
    
    // 检查关键表是否存在数据
    const problemCount = await prisma.problem.count();
    const solutionCount = await prisma.solution.count();
    const categoryCount = await prisma.problemCategory.count();
    
    logger.info('📊 数据统计:');
    logger.info(`   - 问题数量: ${problemCount}`);
    logger.info(`   - 解决方案数量: ${solutionCount}`);
    logger.info(`   - 分类数量: ${categoryCount}`);
    
    if (categoryCount === 0) {
      logger.warn('⚠️  警告: 没有找到问题分类数据');
    }
    
    logger.success('数据验证完成', { emoji: '✅' });
  } catch (error) {
    logger.error('❌ 数据验证失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 创建迁移报告
 */
async function createMigrationReport(
  backupFile: string,
  options: MigrationOptions
): Promise<void> {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    environment: process.env.NODE_ENV || 'production',
    databaseUrl: process.env.DATABASE_URL ? '***已设置***' : '未设置',
    options,
    backupFile,
    status: 'completed',
  };
  
  const reportFile = `migration-report-${timestamp.replace(/[:.]/g, '-')}.json`;
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  logger.info(`📋 迁移报告已创建: ${reportFile}`);
}

/**
 * 主迁移函数
 */
async function migrate(options: MigrationOptions = {}): Promise<void> {
  logger.info('🚀 开始生产环境数据库迁移');
  logger.info('=====================================');
  
  let backupFile = '';
  
  try {
    // 验证环境
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    
    if (process.env.NODE_ENV !== 'production' && !options.force) {
      throw new Error('当前不是生产环境，使用 --force 强制执行');
    }
    
    // 验证数据库连接
    await validateDatabase();
    
    // 创建备份
    if (!options.skipBackup) {
      backupFile = await createBackup();
    }
    
    // 执行迁移
    await runMigrations(options);
    
    // 执行种子数据
    await runSeed(options);
    
    // 验证数据
    await validateData();
    
    // 创建报告
    await createMigrationReport(backupFile, options);
    
    logger.info('=====================================');
    logger.success('生产环境数据库迁移完成！', { emoji: '🎉' });
    
  } catch (error) {
    logger.error('=====================================');
    logger.error('💥 迁移失败:', error);
    
    if (backupFile) {
      logger.info(`📁 备份文件: ${backupFile}`);
      logger.info('💡 如需回滚，请使用备份文件恢复数据库');
    }
    
    process.exit(1);
  }
}

/**
 * 回滚函数
 */
async function rollback(backupFile: string): Promise<void> {
  logger.info(`🔄 开始回滚到备份: ${backupFile}`);
  
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }
    
    // 使用 psql 恢复备份
    const restoreCommand = `psql "${dbUrl}" < ${backupFile}`;
    execSync(restoreCommand, { stdio: 'inherit' });
    
    logger.success('数据库回滚完成', { emoji: '✅' });
  } catch (error) {
    logger.error('❌ 数据库回滚失败:', error);
    throw error;
  }
}

// 命令行参数解析
const args = process.argv.slice(2);
const options: MigrationOptions = {
  skipBackup: args.includes('--skip-backup'),
  skipSeed: args.includes('--skip-seed'),
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run'),
};

const rollbackFile = args.find(arg => arg.startsWith('--rollback='))?.split('=')[1];

// 主执行逻辑
async function main() {
  if (rollbackFile) {
    await rollback(rollbackFile);
  } else {
    await migrate(options);
  }
}

// 显示帮助信息
if (args.includes('--help') || args.includes('-h')) {
  logger.info(`
VSeek 生产环境数据库迁移工具

用法:
  pnpm tsx scripts/migrate-production.ts [选项]

选项:
  --skip-backup    跳过数据库备份
  --skip-seed      跳过种子数据
  --force          强制在生产环境外执行
  --dry-run        干运行模式，不执行实际迁移
  --rollback=FILE  回滚到指定备份文件
  --help, -h       显示帮助信息

示例:
  # 正常迁移
  pnpm tsx scripts/migrate-production.ts

  # 跳过备份的迁移
  pnpm tsx scripts/migrate-production.ts --skip-backup

  # 干运行模式
  pnpm tsx scripts/migrate-production.ts --dry-run

  # 回滚到备份
  pnpm tsx scripts/migrate-production.ts --rollback=backup-2024-01-15T10-30-00-000Z.sql

注意事项:
  - 在生产环境执行前，请确保已备份数据库
  - 建议先在测试环境验证迁移脚本
  - 迁移过程中请勿中断执行
  - 如有问题，可使用备份文件进行回滚
`);
  process.exit(0);
}

// 执行主函数
main().catch((error) => {
  logger.error('💥 脚本执行失败:', error);
  process.exit(1);
});
