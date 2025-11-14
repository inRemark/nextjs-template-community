import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { getPaymentById } from '@/features/payments/services/paymentService';

/**
 * GET /api/payments/[id]
 * 获取支付详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录
    const session = await auth();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment ID is required',
        },
        { status: 400 }
      );
    }

    const payment = await getPaymentById(id);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found',
        },
        { status: 404 }
      );
    }

    // 验证支付所有权（通过订单）
    if (payment.order.userId !== session.user.id) {
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
      data: payment,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment',
      },
      { status: 500 }
    );
  }
}
