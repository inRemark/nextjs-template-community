import { NextResponse } from 'next/server';
import { getStripePublicKey } from '@/features/payments/services/stripeService';

/**
 * GET /api/payments/stripe/config
 * 获取 Stripe 公钥配置
 */
export async function GET() {
  try {
    const publicKey = getStripePublicKey();

    if (!publicKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe public key not configured',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        publicKey,
      },
    });
  } catch (error) {
    console.error('Error getting Stripe config:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get Stripe config',
      },
      { status: 500 }
    );
  }
}
