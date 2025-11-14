import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { SettingsService } from '@features/settings';
import { updateNotificationSettingsSchema } from '@features/console/validators/console.validator';

export const GET = requireAuth(async (user) => {
  try {
    const settings = await SettingsService.getNotificationSettings(user.id);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error fetching notification settings:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch notification settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (user, request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = updateNotificationSettingsSchema.parse(body);

    const settings = await SettingsService.updateNotificationSettings(user.id, validatedData);

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating notification settings:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update notification settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
