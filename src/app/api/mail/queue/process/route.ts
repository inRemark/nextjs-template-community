import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { getQueueService } from '@features/mail/services/queue-service';
import { getQueueProcessor } from '@features/mail/services/queue-processor';

const queueService = getQueueService();
const queueProcessor = getQueueProcessor();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { limit = 10, action } = body;

    if (action === 'start') {
      const { interval = 60 } = body;
      queueProcessor.start(interval);
      
      return NextResponse.json({
        success: true,
        message: `Queue processor started (interval: ${interval}s)`,
        status: queueProcessor.getStatus()
      });
    }

    if (action === 'stop') {
      queueProcessor.stop();
      
      return NextResponse.json({
        success: true,
        message: 'Queue processor stopped',
        status: queueProcessor.getStatus()
      });
    }

    const result = await queueService.processQueue(limit);
    const stats = await queueService.getQueueStats();

    return NextResponse.json({
      success: true,
      data: result,
      stats
    });
  } catch (error) {
    logger.error('Failed to process queue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process queue' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await queueService.getQueueStats();
    const processorStatus = queueProcessor.getStatus();

    return NextResponse.json({
      success: true,
      stats,
      processor: processorStatus
    });
  } catch (error) {
    logger.error('Failed to get queue stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get queue stats' },
      { status: 500 }
    );
  }
}
