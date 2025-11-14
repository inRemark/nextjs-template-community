import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import prisma from '@/lib/database/prisma';
import { startOfDay, subDays } from 'date-fns';

/**
 * GET /api/admin/dashboard/stats
 * 获取仪表盘统计数据
 */
export const GET = requireAdmin(async () => {
  try {
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);

    // 今日订单数
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: today },
      },
    });

    // 今日收入（已完成订单）
    const todayRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: today },
        status: 'COMPLETED',
      },
      _sum: {
        finalAmount: true,
      },
    });

    // 待处理订单（待支付、已支付、处理中）
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'PAID', 'PROCESSING'],
        },
      },
    });

    // 最近30天成功率
    const recentOrders = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: {
        id: true,
      },
    });

    const totalRecent = recentOrders.reduce((sum, item) => sum + item._count.id, 0);
    const completed = recentOrders.find((item) => item.status === 'COMPLETED')?._count.id || 0;
    const successRate = totalRecent > 0 ? (completed / totalRecent) * 100 : 0;

    // 总收入
    const totalRevenue = await prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        finalAmount: true,
      },
    });

    // 总订单数
    const totalOrders = await prisma.order.count();

    return NextResponse.json({
      data: {
        todayOrders,
        todayRevenue: todayRevenue._sum.finalAmount || 0,
        pendingOrders,
        successRate: Number(successRate.toFixed(2)),
        totalRevenue: totalRevenue._sum.finalAmount || 0,
        totalOrders,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Failed to get dashboard stats', error: String(error) },
      { status: 500 }
    );
  }
});
