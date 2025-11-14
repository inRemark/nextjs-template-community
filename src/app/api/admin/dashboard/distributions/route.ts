import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import prisma from '@/lib/database/prisma';

/**
 * GET /api/admin/dashboard/distributions
 * 获取订单状态和支付方式分布
 */
export const GET = requireAdmin(async () => {
  try {
    // 订单状态分布
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // 支付方式分布
    const paymentMethodDistribution = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        status: 'SUCCESS',
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      data: {
        orderStatus: orderStatusDistribution.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
        paymentMethod: paymentMethodDistribution.map((item) => ({
          method: item.paymentMethod,
          count: item._count.id,
          totalAmount: item._sum.amount || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Get distributions error:', error);
    return NextResponse.json(
      { message: 'Failed to get distributions', error: String(error) },
      { status: 500 }
    );
  }
});
