import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { getRefundsByUserId } from '@/features/payments/services/refundService';

/**
 * GET /api/refunds/list
 * 获取用户的所有退款记录
 */
export async function GET() {
  try {
    // 验证用户登录
    const session = await auth();

    // 获取用户的退款列表
    const refunds = await getRefundsByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      data: refunds,
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch refunds',
      },
      { status: 500 }
    );
  }
}
