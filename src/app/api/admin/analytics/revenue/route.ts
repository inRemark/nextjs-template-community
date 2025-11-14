import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import { getDailyRevenue, getMonthlyRevenue, getPaymentMethodStats } from '@/features/payments/services/analyticsService';
import { startOfYear, endOfYear, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

/**
 * GET /api/admin/analytics/revenue
 * 查询收入分析（每日或每月）以及支付方式统计
 * Query:
 * - type: 'daily' | 'monthly' (default: 'daily')
 * - startDate: ISO (daily)
 * - endDate: ISO (daily)
 * - year: number (monthly)
 */
export const GET = requireAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'day') as 'day' | 'month' | 'year';

    if (type === 'day') {
      const dateStr = searchParams.get('date');
      if (!dateStr) {
        return NextResponse.json(
          { message: 'date is required for day type' },
          { status: 400 }
        );
      }
      const startDate = startOfDay(new Date(dateStr));
      const endDate = endOfDay(new Date(dateStr));

      const [daily, methods] = await Promise.all([
        getDailyRevenue(startDate, endDate),
        getPaymentMethodStats(startDate, endDate),
      ]);

      return NextResponse.json({
        data: {
          type: 'day',
          daily,
          paymentMethods: methods,
          period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
        },
      });
    } else if (type === 'month') {
      const monthStr = searchParams.get('month'); // YYYY-MM
      if (!monthStr) {
        return NextResponse.json(
          { message: 'month (YYYY-MM) is required for month type' },
          { status: 400 }
        );
      }
      const [year, month] = monthStr.split('-').map((v) => Number(v));
      const startDate = startOfMonth(new Date(year, month - 1, 1));
      const endDate = endOfMonth(new Date(year, month - 1, 1));

      const [daily, methods] = await Promise.all([
        getDailyRevenue(startDate, endDate),
        getPaymentMethodStats(startDate, endDate),
      ]);

      return NextResponse.json({
        data: {
          type: 'month',
          daily,
          paymentMethods: methods,
          period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
        },
      });
    }

    // year
    const yearStr = searchParams.get('year');
    const year = yearStr ? Number(yearStr) : new Date().getFullYear();
    const monthly = await getMonthlyRevenue(year);
    const startDateYear = startOfYear(new Date(year, 0, 1));
    const endDateYear = endOfYear(new Date(year, 11, 31));
    const methods = await getPaymentMethodStats(startDateYear, endDateYear);

    return NextResponse.json({
      data: {
        type: 'year',
        monthly,
        year,
        paymentMethods: methods,
        period: { startDate: startDateYear.toISOString(), endDate: endDateYear.toISOString() },
      },
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    return NextResponse.json(
      { message: 'Failed to get revenue analytics', error: String(error) },
      { status: 500 }
    );
  }
});
