import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import { getReconciliationReport } from '@/features/payments/services/analyticsService';

/**
 * GET /api/admin/analytics/reports
 * 财务报表（订单状态分布与退款统计，对账摘要）
 * Query:
 * - startDate: ISO (required)
 * - endDate: ISO (required)
 */
export const GET = requireAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { message: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const report = await getReconciliationReport(startDate, endDate);

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error('Get reconciliation report error:', error);
    return NextResponse.json(
      { message: 'Failed to get reconciliation report', error: String(error) },
      { status: 500 }
    );
  }
});
