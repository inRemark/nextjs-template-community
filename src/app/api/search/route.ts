import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@features/search/services/search.service';
import { searchParamsSchema } from '@features/search/validators/search.validator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required'
        },
        { status: 400 }
      );
    }

    const validatedParams = searchParamsSchema.parse({
      q: query,
      categoryId,
      page,
      limit,
    });

    const result = await SearchService.search(validatedParams);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform search'
      },
      { status: 500 }
    );
  }
}