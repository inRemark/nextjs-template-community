import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import prisma from '@/lib/database/prisma';
import { startOfDay, subDays, format } from 'date-fns';

/**
 * GET /api/admin/dashboard/revenue-trend
 * 获取收入趋势数据（最近30天）
 */
export const GET = requireAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, days - 1);

    // 获取时间范围内的已完成订单
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        paidAt: true,
        finalAmount: true,
        currency: true,
      },
      orderBy: {
        paidAt: 'asc',
      },
    });

    // 按日期分组统计
    const dailyRevenue: Record<string, { date: string; usd: number; cny: number; total: number; orders: number }> = {};

    // 初始化所有日期
    for (let i = 0; i < days; i++) {
      const date = format(subDays(endDate, days - 1 - i), 'yyyy-MM-dd');
      dailyRevenue[date] = {
        date,
        usd: 0,
        cny: 0,
        total: 0,
        orders: 0,
      };
    }

    // 填充数据
    orders.forEach((order) => {
      if (!order.paidAt) return;
      const date = format(startOfDay(order.paidAt), 'yyyy-MM-dd');
      
      if (dailyRevenue[date]) {
        if (order.currency === 'USD') {
          dailyRevenue[date].usd += order.finalAmount;
        } else if (order.currency === 'CNY') {
          dailyRevenue[date].cny += order.finalAmount;
        }
        dailyRevenue[date].total += order.finalAmount;
        dailyRevenue[date].orders += 1;
      }
    });

    const data = Object.values(dailyRevenue);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get revenue trend error:', error);
    return NextResponse.json(
      { message: 'Failed to get revenue trend', error: String(error) },
      { status: 500 }
    );
  }
});
