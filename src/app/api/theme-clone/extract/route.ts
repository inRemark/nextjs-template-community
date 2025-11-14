/**
 * Theme Extraction API
 * POST /api/theme-clone/extract
 */

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { extractWebsiteTheme } from '@/features/theme-clone/services/extract.service';
import type { ExtractRequest, ThemeExtractionResult } from '@/features/theme-clone/types';

export async function POST(request: NextRequest) {
  try {
    const body: ExtractRequest = await request.json();
    const { url, options = {} } = body;

    // 验证 URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // URL 格式验证
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 提取主题
    const extractionData = await extractWebsiteTheme(url, options);

    const result: ThemeExtractionResult = {
      id: nanoid(),
      ...extractionData,
      status: 'completed',
    };

    // 调试：检查截图数据
    if (options.screenshot) {
      // eslint-disable-next-line no-console
      console.log('Screenshot in result:', {
        hasScreenshot: !!result.screenshot,
        screenshotLength: result.screenshot?.length || 0,
      });
    }

    // TODO: 存储到数据库
    // await prisma.themeExtraction.create({ data: result });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Theme extraction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
