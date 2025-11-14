import { logger } from '@logger';
import { NextResponse } from 'next/server';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

/**
 * 用户信息汇总 API
 * 
 * 用途：
 * - 提供用户完整信息的一站式查询接口
 * - 包含基本资料、通知设置、统计数据等
 * 
 * TODO:
 * - [ ] 实现用户统计数据聚合
 * - [ ] 添加缓存机制优化性能
 * - [ ] 支持可配置的返回字段
 */

const prisma = new PrismaClient();

/**
 * GET /api/user - 获取当前用户完整信息（包含统计数据）
 * 
 * 返回数据：
 * - 用户基本信息
 * - 通知设置
 * - 统计数据（评价数、对比数、收藏数等）
 */
export const GET = requireAuth(async (user) => {
  try {
    // 获取用户基本信息
    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        notificationSettings: true,
      },
    });

    if (!userInfo) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // TODO: 获取用户统计数据
    // const [reviewCount, comparisonCount, favoriteCount] = await Promise.all([
    //   prisma.review.count({ where: { userId: user.id } }),
    //   prisma.comparison.count({ where: { userId: user.id } }),
    //   prisma.favorite.count({ where: { userId: user.id } }),
    // ]);

    return NextResponse.json({
      success: true,
      data: {
        ...userInfo,
        // stats: {
        //   reviews: reviewCount,
        //   comparisons: comparisonCount,
        //   favorites: favoriteCount,
        // },
      },
    });
  } catch (error) {
    logger.error('Error fetching user info:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user info',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
