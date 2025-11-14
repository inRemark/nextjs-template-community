import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { getOrderById } from '@/features/orders/services/orderService';

/**
 * POST /api/orders/[id]/process
 * 手动触发订单处理（用于测试或重试）
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录
    const session = await auth();

    const { id } = await params;

    // 验证订单所有权
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    // 处理订单
    const result = await processOrder(id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process order',
      },
      { status: 500 }
    );
  }
}
