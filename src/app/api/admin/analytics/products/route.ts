import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import { getTransactionStats } from '@/features/payments/services/analyticsService';

/**
 * GET /api/admin/analytics/products
 * 查询产品维度统计（销量与销售额）
 * Query:
 * - startDate: ISO
 * - endDate: ISO
 */
export const GET = requireAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const stats = await getTransactionStats(undefined, startDate, endDate);

    return NextResponse.json({
      data: {
        productStats: stats.productStats,
        totalOrders: stats.totalOrders,
        revenueByCurrency: stats.revenueByCurrency,
        avgOrderValue: stats.avgOrderValue,
        period: {
          startDate: startDate?.toISOString() || null,
          endDate: endDate?.toISOString() || null,
        },
      },
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    return NextResponse.json(
      { message: 'Failed to get product analytics', error: String(error) },
      { status: 500 }
    );
  }
});
