import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { NotificationService } from '@features/notifications/services/notification.service';
import { logger } from '@logger';
import type { NotificationQueryParams } from '@/features/notifications/types/notification.types';

export const GET = requireAuth(async (user, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const statusFilter = searchParams.get('status');
    
    const params: NotificationQueryParams = {
      limit,
      page,
      filters: statusFilter ? { status: statusFilter as 'unread' | 'read' | 'archived' } : undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const result = await NotificationService.getNotifications(user.id, params);

    return NextResponse.json({
      success: true,
      notifications: result.notifications,
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
});