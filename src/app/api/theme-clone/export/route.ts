/**
 * Theme Export API
 * POST /api/theme-clone/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportTheme } from '@/features/theme-clone/services/export.service';
import type {
  ExportRequest,
  ThemeExtractionResult,
} from '@/features/theme-clone/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, extractionData } = body as ExportRequest & {
      extractionData: ThemeExtractionResult;
    };

    // TODO: extractionId can be used to fetch from database
    // const extractionId = body.extractionId;

    if (!format) {
      return NextResponse.json(
        { error: 'Export format is required' },
        { status: 400 }
      );
    }

    // TODO: 从数据库获取提取结果
    // const extractionData = await prisma.themeExtraction.findUnique({
    //   where: { id: extractionId }
    // });

    if (!extractionData) {
      return NextResponse.json(
        { error: 'Extraction result not found' },
        { status: 404 }
      );
    }

    const result = exportTheme(extractionData, format);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Theme export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export theme',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
