import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { 
  RewardUserRequest,
  RewardUserResponse,
  PointsTransactionType 
} from '@/features/referral/types/referral.types';

// POST: 发放积分奖励
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      amount, 
      type, 
      relatedId, 
      description 
    }: RewardUserRequest = body;

    // 验证输入参数
    if (!userId || !amount || !type) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      }, { status: 400 });
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 获取或创建用户积分账户
      let userPoints = await tx.userPoints.findUnique({
        where: { userId }
      });

      if (!userPoints) {
        userPoints = await tx.userPoints.create({
          data: {
            userId,
            totalPoints: 0,
            availablePoints: 0,
            spentPoints: 0
          }
        });
      }

      // 更新积分
      const updatedUserPoints = await tx.userPoints.update({
        where: { userId },
        data: {
          totalPoints: userPoints.totalPoints + amount,
          availablePoints: userPoints.availablePoints + amount
        }
      });

      // 创建积分交易记录
      const transaction = await tx.pointsTransaction.create({
        data: {
          userId,
          amount,
          type: type as PointsTransactionType,
          relatedId: relatedId || null,
          description: description || getDefaultDescription(type as PointsTransactionType)
        }
      });

      return { userPoints: updatedUserPoints, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `成功发放 ${amount} 积分`,
      data: {
        newBalance: result.userPoints.availablePoints,
        transactionId: result.transaction.id
      }
    });

  } catch (error) {
    logger.error('Error rewarding user points:', error);
    return NextResponse.json({
      success: false,
      message: '发放积分失败'
    }, { status: 500 });
  }
}

// 获取默认描述
function getDefaultDescription(type: PointsTransactionType): string {
  const descriptions = {
    EARNED_REFERRAL_REGISTER: '推荐用户注册奖励',
    EARNED_REFERRAL_FIRST_LOGIN: '推荐用户首次登录奖励',
    EARNED_REFERRAL_FIRST_ACTIVITY: '推荐用户首次活动奖励',
    SPENT_FEATURE: '兑换功能消费',
    EXPIRED: '积分过期',
    ADMIN_ADJUSTMENT: '管理员调整'
  };

  return descriptions[type] || '积分变动';
}

// PUT: 批量发放奖励（用于推荐系统自动触发）
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { rewards }: { rewards: RewardUserRequest[] } = body;

    if (!Array.isArray(rewards) || rewards.length === 0) {
      return NextResponse.json({
        success: false,
        message: '奖励列表不能为空'
      }, { status: 400 });
    }

    const results = [];

    // 批量处理奖励
    for (const reward of rewards) {
      try {
        const response = await POST(new NextRequest('http://localhost/api/points/rewards', {
          method: 'POST',
          body: JSON.stringify(reward),
          headers: { 'Content-Type': 'application/json' }
        }));

        const result = await response.json();
        results.push({
          userId: reward.userId,
          success: result.success,
          message: result.message
        });
      } catch (error) {
        results.push({
          userId: reward.userId,
          success: false,
          message: '发放失败'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '批量发放完成',
      data: { results }
    });

  } catch (error) {
    logger.error('Error batch rewarding points:', error);
    return NextResponse.json({
      success: false,
      message: '批量发放积分失败'
    }, { status: 500 });
  }
}

// GET: 获取奖励配置
export async function GET(req: NextRequest) {
  try {
    const config = {
      rewardAmounts: {
        register: 50,
        firstLogin: 20,
        firstActivity: 30
      },
      rules: {
        maxRewardsPerDay: 1000,
        minIntervalBetweenRewards: 60, // seconds
        expirationDays: 365
      }
    };

    return NextResponse.json({
      success: true,
      data: config
    });

  } catch (error) {
    logger.error('Error fetching reward config:', error);
    return NextResponse.json({
      success: false,
      message: '获取奖励配置失败'
    }, { status: 500 });
  }
}
