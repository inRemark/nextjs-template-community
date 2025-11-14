import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { getQueueService } from '@features/mail/services/queue-service';

const queueService = getQueueService();

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const task = await queueService.getTaskStatus(taskId);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Failed to get task status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get task status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const success = await queueService.deleteTask(taskId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete task' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
