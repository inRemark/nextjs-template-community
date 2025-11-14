import { NextResponse } from 'next/server';
import { getProducts } from '@/features/products/services/productService';
import { productListParamsSchema } from '@/features/products/validators/product.validator';

/**
 * GET /api/products
 * 获取产品列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featureTypeParam = searchParams.get('featureType');
    const params = {
      featureType: featureTypeParam as 'THEME_CLONE' | 'SCREENSHOT' | null,
      region: searchParams.get('region') || undefined,
      isActive: searchParams.get('isActive')
        ? searchParams.get('isActive') === 'true'
        : undefined,
    };

    // 验证参数
    const validatedParams = productListParamsSchema.parse(params);

    // 获取产品列表
    const products = await getProducts(validatedParams);

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
