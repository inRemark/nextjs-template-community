import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { auth } from '@features/auth/middleware/auth.middleware';
import { 
  PointsBalanceResponse,
  PointsHistoryResponse,
  PointsTransactionResponse 
} from '@/features/referral/types/referral.types';

// GET: 获取积分余额
export const GET = auth.require(async (user, request) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'balance') {
      return await getPointsBalance(user.id);
    } else if (action === 'transactions') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      return await getPointsHistory(user.id, page, limit);
    } else {
      // 默认返回余额
      return await getPointsBalance(user.id);
    }

  } catch (error) {
    logger.error('Error fetching points data:', error);
    return NextResponse.json({
      success: false,
      message: '获取积分数据失败'
    }, { status: 500 });
  }
});

// 获取积分余额
async function getPointsBalance(userId: string): Promise<NextResponse<PointsBalanceResponse>> {
  try {
    let userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    });

    // 如果用户没有积分账户，创建一个
    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: {
          userId,
          totalPoints: 0,
          availablePoints: 0,
          spentPoints: 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPoints: userPoints.totalPoints,
        availablePoints: userPoints.availablePoints,
        spentPoints: userPoints.spentPoints
      }
    });

  } catch (error) {
    logger.error('Error fetching points balance:', error);
    return NextResponse.json({
      success: false,
      message: '获取积分余额失败'
    }, { status: 500 });
  }
}

// 获取积分交易历史
async function getPointsHistory(
  userId: string, 
  page: number, 
  limit: number
): Promise<NextResponse<PointsHistoryResponse>> {
  try {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pointsTransaction.count({
        where: { userId }
      })
    ]);

    const transactionResponses: PointsTransactionResponse[] = transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description || undefined,
      relatedId: transaction.relatedId || undefined,
      createdAt: transaction.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactionResponses,
        total,
        page,
        limit
      }
    });

  } catch (error) {
    logger.error('Error fetching points history:', error);
    return NextResponse.json({
      success: false,
      message: '获取积分历史失败'
    }, { status: 500 });
  }
}
