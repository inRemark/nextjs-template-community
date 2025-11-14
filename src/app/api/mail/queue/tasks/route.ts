import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { getQueueService } from '@features/mail/services/queue-service';
import { EmailTaskStatus } from '@prisma/client';

const queueService = getQueueService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as EmailTaskStatus | null;
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    const tasks = await queueService.getQueueTasks(
      status || undefined,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    logger.error('Failed to get queue tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get queue tasks' },
      { status: 500 }
    );
  }
}
