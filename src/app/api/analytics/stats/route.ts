import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { getTransactionStats } from '@/features/payments/services/analyticsService';

/**
 * GET /api/analytics/stats
 * 获取交易统计
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const stats = await getTransactionStats(
      session.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
