import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { NotificationService } from '@features/notifications/services/notification.service';
import { logger } from '@logger';

export const PATCH = requireAuth(async (user, request: NextRequest, context: { params: { id: string } }) => {
  try {
    const { id } = context.params;
    
    await NotificationService.markAsRead(user.id, id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Notification marked as read' 
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' }, 
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (user, request: NextRequest, context: { params: { id: string } }) => {
  try {
    const { id } = context.params;
    
    await NotificationService.deleteNotification(user.id, id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' }, 
      { status: 500 }
    );
  }
});