import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { auth } from '@features/auth/middleware/auth.middleware';
import { 
  ReferralListResponse, 
  ReferralStatsResponse,
  ReferralUser 
} from '@/features/referral/types/referral.types';

// GET: 获取推荐关系列表和统计数据
export const GET = auth.require(async (user, request) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');

    if (action === 'stats') {
      return await getReferralStats(user.id);
    } else {
      return await getReferralList(user.id, page, limit, status);
    }

  } catch (error) {
    logger.error('Error fetching referral relationships:', error);
    return NextResponse.json({
      success: false,
      message: '获取推荐数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// 获取推荐用户列表
async function getReferralList(
  userId: string, 
  page: number, 
  limit: number, 
  status?: string | null
): Promise<NextResponse<ReferralListResponse>> {
  try {
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      referrerId: userId
    };

    if (status) {
      where.status = status;
    }

    // 查询推荐关系
    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          referred: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.referral.count({ where })
    ]);

    // 格式化推荐用户数据
    const referralUsers: ReferralUser[] = referrals.map(referral => ({
      id: referral.referred.id,
      name: referral.referred.name || undefined,
      email: referral.referred.email,
      createdAt: referral.referred.createdAt.toISOString(),
      status: referral.status,
      rewardedAt: referral.rewardedAt?.toISOString() || undefined
    }));

    return NextResponse.json({
      success: true,
      data: {
        referrals: referralUsers,
        total,
        page,
        limit
      }
    });

  } catch (error) {
    logger.error('Error fetching referral list:', error);
    return NextResponse.json({
      success: false,
      message: '获取推荐列表失败'
    }, { status: 500 });
  }
}

// 获取推荐统计数据
async function getReferralStats(userId: string): Promise<NextResponse<ReferralStatsResponse>> {
  try {
    // 获取用户的所有推荐码
    const referralCodes = await prisma.referralCode.findMany({
      where: { userId, isActive: true },
      select: { id: true }
    });

    const referralCodeIds = referralCodes.map(code => code.id);

    if (referralCodeIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalClicks: 0,
            totalConversions: 0,
            conversionRate: 0,
            totalRewards: 0,
            availablePoints: 0
          },
          trends: {
            daily: [],
            weekly: []
          }
        }
      });
    }

    // 获取总体统计数据
    const [
      totalClicks,
      totalConversions,
      userPoints
    ] = await Promise.all([
      prisma.referralClick.count({
        where: { referralCodeId: { in: referralCodeIds } }
      }),
      prisma.referralConversion.count({
        where: { 
          referralCodeId: { in: referralCodeIds },
          stepType: { in: ['REGISTER', 'FIRST_LOGIN', 'FIRST_ACTIVITY'] }
        }
      }),
      prisma.userPoints.findUnique({
        where: { userId }
      })
    ]);

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // 获取最近7天的每日数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 获取最近7天的每日数据 - 简化版本
    const dailyStats = await prisma.referralClick.findMany({
      where: {
        referralCodeId: { in: referralCodeIds },
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        id: true,
        converted: true,
        createdAt: true
      }
    });

    // 获取最近4周的每周数据
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    // 获取最近4周的每周数据 - 简化版本
    const weeklyStats = await prisma.referralClick.findMany({
      where: {
        referralCodeId: { in: referralCodeIds },
        createdAt: { gte: fourWeeksAgo }
      },
      select: {
        id: true,
        converted: true,
        createdAt: true
      }
    });

    // 格式化每日趋势数据
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayStats = dailyStats.filter(stat => 
        stat.createdAt.toISOString().split('T')[0] === dateStr
      );

      dailyTrends.push({
        date: dateStr,
        clicks: dayStats.length,
        conversions: dayStats.filter(stat => stat.converted).length,
        rewards: 0 // 这里需要根据实际奖励计算
      });
    }

    // 格式化每周趋势数据
    const weeklyTrends = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const weekStats = weeklyStats.filter(stat => 
        stat.createdAt >= weekStart && stat.createdAt < weekEnd
      );

      const totalClicks = weekStats.length;
      const totalConversions = weekStats.filter(stat => stat.converted).length;

      weeklyTrends.push({
        week: `Week ${4 - i}`,
        clicks: totalClicks,
        conversions: totalConversions,
        rewards: 0 // 这里需要根据实际奖励计算
      });
    }

    // 获取推荐排行榜
    const topReferrers = await prisma.referral.groupBy({
      by: ['referrerId'],
      where: {
        referralCodeId: { in: referralCodeIds },
        status: { in: ['COMPLETED', 'REWARDED'] }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    const topReferrersWithDetails = await Promise.all(
      topReferrers.map(async (referrer) => {
        const user = await prisma.user.findUnique({
          where: { id: referrer.referrerId },
          select: { name: true, email: true }
        });

        return {
          userId: referrer.referrerId,
          userName: user?.name || undefined,
          totalConversions: referrer._count.id,
          totalRewards: 0 // 这里需要根据实际奖励计算
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalClicks,
          totalConversions,
          conversionRate: Math.round(conversionRate * 100) / 100,
          totalRewards: userPoints?.totalPoints || 0,
          availablePoints: userPoints?.availablePoints || 0
        },
        trends: {
          daily: dailyTrends,
          weekly: weeklyTrends
        },
        topReferrers: topReferrersWithDetails
      }
    });

  } catch (error) {
    logger.error('Error fetching referral stats:', error);
    return NextResponse.json({
      success: false,
      message: '获取推荐统计失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
