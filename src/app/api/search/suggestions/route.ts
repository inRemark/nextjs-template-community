import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@features/search/services/search.service';
import { suggestionParamsSchema } from '@features/search/validators/search.validator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const validatedParams = suggestionParamsSchema.parse({
      q: query,
      limit,
    });

    const suggestions = await SearchService.getSuggestions(validatedParams.q, validatedParams.limit);

    return NextResponse.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    logger.error('Search suggestions API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get search suggestions'
      },
      { status: 500 }
    );
  }
}