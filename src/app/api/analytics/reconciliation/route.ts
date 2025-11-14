import { NextResponse } from 'next/server';
import { getReconciliationReport } from '@/features/payments/services/analyticsService';

/**
 * GET /api/analytics/reconciliation
 * 获取对账报告
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const report = await getReconciliationReport(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching reconciliation report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report',
      },
      { status: 500 }
    );
  }
}
