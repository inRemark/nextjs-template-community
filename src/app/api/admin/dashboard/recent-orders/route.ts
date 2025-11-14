import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import prisma from '@/lib/database/prisma';

/**
 * GET /api/admin/dashboard/recent-orders
 * 获取最近订单列表
 */
export const GET = requireAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        payment: {
          select: {
            id: true,
            paymentMethod: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error('Get recent orders error:', error);
    return NextResponse.json(
      { message: 'Failed to get recent orders', error: String(error) },
      { status: 500 }
    );
  }
});
