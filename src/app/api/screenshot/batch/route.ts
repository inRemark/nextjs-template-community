/**
 * Batch Screenshot API
 * 批量截图 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { batchScreenshot, VIEWPORT_PRESETS } from '@/features/screenshot/services/screenshot.service';
import type {
  BatchScreenshotRequest,
  BatchScreenshotResponse,
  ViewportConfig,
} from '@/features/screenshot/types';

export async function POST(request: NextRequest) {
  try {
    const body: BatchScreenshotRequest = await request.json();
    const { urls, options } = body;

    // URL 验证
    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs are required' },
        { status: 400 }
      );
    }

    // 数量限制（免费版 10 个）
    if (urls.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 URLs allowed in free version' },
        { status: 400 }
      );
    }

    // 验证每个 URL
    const validUrls = urls.filter((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      );
    }

    // 获取视口配置
    const viewports: ViewportConfig[] = options.viewports.map((vp) => {
      return VIEWPORT_PRESETS[vp.name] || vp;
    });

    if (viewports.length === 0) {
      return NextResponse.json(
        { error: 'At least one viewport is required' },
        { status: 400 }
      );
    }

    // 执行批量截图
    const results = await batchScreenshot(
      validUrls,
      viewports,
      options.fullPage || false
    );

    const response: BatchScreenshotResponse = {
      id: nanoid(),
      total: results.length,
      completed: results.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Batch screenshot error:', error);
    return NextResponse.json(
      {
        error: 'Failed to capture screenshots',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
