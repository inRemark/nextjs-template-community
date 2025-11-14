import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { getRefundById } from '@/features/payments/services/refundService';
import { refundIdSchema } from '@/features/payments/validators/refund.validator';

/**
 * GET /api/refunds/[id]
 * 获取退款详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录
    const session = await auth();

    const { id } = await params;

    // 验证参数
    refundIdSchema.parse({ id });

    // 获取退款详情
    const refund = await getRefundById(id);

    if (!refund) {
      return NextResponse.json(
        {
          success: false,
          error: 'Refund not found',
        },
        { status: 404 }
      );
    }

    // 验证用户权限
    if (refund.payment.order.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: refund,
    });
  } catch (error) {
    console.error('Error fetching refund:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch refund',
      },
      { status: 500 }
    );
  }
}
