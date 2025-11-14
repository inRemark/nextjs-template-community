import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import {
  createPayment,
  updatePaymentCheckoutUrl,
} from '@/features/payments/services/paymentService';
import { createStripePaymentIntent } from '@/features/payments/services/stripeService';
import { createAlipayOrder } from '@/features/payments/services/alipayService';
import { createWechatNativeOrder } from '@/features/payments/services/wechatService';
import { createPaymentSchema } from '@/features/payments/validators/payment.validator';
import { getOrderById } from '@/features/orders/services/orderService';

/**
 * POST /api/payments/create
 * 创建支付
 */
export async function POST(request: Request) {
  try {
    // 验证用户登录
    const session = await auth();

    const body = await request.json();

    // 验证请求数据
    const validatedData = createPaymentSchema.parse(body);

    // 验证订单所有权
    const order = await getOrderById(validatedData.orderId);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      );
    }

    // 创建支付记录
    const payment = await createPayment(validatedData);

    // 根据支付方式处理
    let result;

    if (validatedData.paymentMethod === 'STRIPE') {
      // Stripe 支付
      const paymentIntent = await createStripePaymentIntent(
        validatedData.orderId,
        validatedData.returnUrl
      );

      // 更新支付记录的 checkoutUrl 和 paymentIntentId
      await updatePaymentCheckoutUrl(
        payment.id,
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${payment.id}`,
        paymentIntent.id
      );

      result = {
        success: true,
        paymentId: payment.id,
        clientSecret: paymentIntent.clientSecret,
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${payment.id}`,
      };
    } else if (validatedData.paymentMethod === 'ALIPAY') {
      // 支付宝支付
      const alipayOrder = await createAlipayOrder(
        validatedData.orderId,
        validatedData.returnUrl
      );

      // 更新支付记录的 checkoutUrl
      await updatePaymentCheckoutUrl(
        payment.id,
        alipayOrder.payUrl
      );

      result = {
        success: true,
        paymentId: payment.id,
        payUrl: alipayOrder.payUrl,
        outTradeNo: alipayOrder.outTradeNo,
      };
    } else if (validatedData.paymentMethod === 'WECHAT') {
      // 微信支付
      const wechatOrder = await createWechatNativeOrder(validatedData.orderId);

      // 更新支付记录的 checkoutUrl
      await updatePaymentCheckoutUrl(
        payment.id,
        wechatOrder.codeUrl
      );

      result = {
        success: true,
        paymentId: payment.id,
        codeUrl: wechatOrder.codeUrl,
        outTradeNo: wechatOrder.outTradeNo,
      };
    } else {
      result = {
        success: false,
        error: 'Unsupported payment method',
      };
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment',
      },
      { status: 500 }
    );
  }
}
