import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { NotificationService } from '@features/notifications/services/notification.service';
import { logger } from '@logger';

export const POST = requireAuth(async (user, request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const beforeDate = body.beforeDate ? new Date(body.beforeDate) : undefined;
    
    const count = await NotificationService.markAllAsRead(user.id, beforeDate);
    
    return NextResponse.json({ 
      success: true,
      message: `${count} notifications marked as read`,
      count,
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark all notifications as read' }, 
      { status: 500 }
    );
  }
});
