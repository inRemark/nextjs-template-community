import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { getDailyRevenue } from '@/features/payments/services/analyticsService';

/**
 * GET /api/analytics/daily-revenue
 * 获取每日收入
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const data = await getDailyRevenue(
      new Date(startDate),
      new Date(endDate),
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch daily revenue',
      },
      { status: 500 }
    );
  }
}
