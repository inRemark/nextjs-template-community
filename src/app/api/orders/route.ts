import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { createOrder, getOrders } from '@/features/orders/services/orderService';
import {
  createOrderSchema,
  orderListParamsSchema,
} from '@/features/orders/validators/order.validator';

/**
 * POST /api/orders
 * 创建订单
 */
export async function POST(request: Request) {
  try {
    // 中间件已验证用户登录，直接获取 session
    const session = await auth();
    const body = await request.json();

    // 验证请求数据
    const validatedData = createOrderSchema.parse(body);

    // 创建订单
    const order = await createOrder(session.user.id as string, validatedData);

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * 获取订单列表
 */
export async function GET(request: Request) {
  try {
    // 中间件已验证用户登录，直接获取 session
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const params = {
      status: (statusParam && statusParam !== 'null' && statusParam !== '') 
        ? (statusParam as 'PENDING' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED')
        : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    };

    // 验证参数
    const validatedParams = orderListParamsSchema.parse(params);

    // 获取订单列表（只返回当前用户的订单）
    const orders = await getOrders({
      ...validatedParams,
      userId: session.user.id as string,
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}
