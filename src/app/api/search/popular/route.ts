import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@features/search/services/search.service';
import { popularSearchParamsSchema } from '@features/search/validators/search.validator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');

    const validatedParams = popularSearchParamsSchema.parse({ limit });

    const popularSearches = await SearchService.getPopularSearches(validatedParams.limit);

    return NextResponse.json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    logger.error('Popular searches API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get popular searches'
      },
      { status: 500 }
    );
  }
}