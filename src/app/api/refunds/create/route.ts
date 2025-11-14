import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { createRefundSchema } from '@/features/payments/validators/refund.validator';
import { createRefund } from '@/features/payments/services/refundService';

/**
 * POST /api/refunds/create
 * 创建退款申请
 */
export async function POST(request: Request) {
  try {
    // 验证用户登录
    const session = await auth();

    const body = await request.json();

    // 验证请求数据
    const validatedData = createRefundSchema.parse(body);

    // 创建退款
    const refund = await createRefund(
      validatedData.paymentId,
      validatedData.amount,
      validatedData.reason,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: refund,
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create refund',
      },
      { status: 500 }
    );
  }
}
