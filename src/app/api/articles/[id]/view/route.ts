/**
 * Articles API Route - Increment View Count
 * POST /api/articles/[id]/view - Increment the view count of an article by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementArticleView } from '@/features/articles/services/article.service';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await incrementArticleView(id);

    return NextResponse.json({
      success: true,
      message: 'View count updated successfully',
    });
  } catch (error) {
    console.error('Failed to increment view:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update view count',
      },
      { status: 500 }
    );
  }
}
