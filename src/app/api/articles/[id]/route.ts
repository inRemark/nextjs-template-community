/**
 * Articles API Route - Single Article Operations
 * GET /api/articles/[id] - get single article
 * PATCH /api/articles/[id] - update article
 * DELETE /api/articles/[id] - delete article
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@features/auth/services';
import {
  getArticleById,
  updateArticle,
  deleteArticle,
} from '@/features/articles/services/article.service';
import { updateArticleSchema } from '@/features/articles/validators/article.schema';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/articles/[id] - get single article
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch article',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/articles/[id] - update article
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate data
    const validationResult = updateArticleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data validation failed',
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await getArticleById(id);
    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article not found',
        },
        { status: 404 }
      );
    }

    // 检查权限
    if (existingArticle.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to modify this article',
        },
        { status: 403 }
      );
    }

    const article = await updateArticle(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: article,
      message: 'Article updated successfully',
    });
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update article',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - delete article
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if article exists
    const existingArticle = await getArticleById(id);
    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Article not found',
        },
        { status: 404 }
      );
    }

    // 检查权限
    if (existingArticle.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to delete this article',
        },
        { status: 403 }
      );
    }

    await deleteArticle(id);

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete article',
      },
      { status: 500 }
    );
  }
}
