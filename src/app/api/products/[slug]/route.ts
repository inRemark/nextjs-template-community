import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/features/products/services/productService';

/**
 * GET /api/products/[slug]
 * 获取单个产品详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product slug is required',
        },
        { status: 400 }
      );
    }

    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}
