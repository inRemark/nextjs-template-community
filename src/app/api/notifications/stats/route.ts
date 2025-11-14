import { NextResponse } from 'next/server';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { NotificationService } from '@features/notifications/services/notification.service';
import { logger } from '@logger';

export const GET = requireAuth(async (user) => {
  try {
    const stats = await NotificationService.getNotificationStats(user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching notification stats:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch notification stats' },
      { status: 500 }
    );
  }
});
