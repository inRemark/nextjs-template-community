import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeWebhook } from '@/features/payments/services/stripeService';
import {
  getPaymentByOrderId,
  updatePaymentStatus,
} from '@/features/payments/services/paymentService';
import { createSystemLog } from '@/shared/service/logService';
import type Stripe from 'stripe';

/**
 * POST /api/payments/stripe/webhook
 * Stripe Webhook 处理
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing stripe-signature header',
        },
        { status: 400 }
      );
    }

    // 验证 webhook 签名
    const event = verifyStripeWebhook(body, signature);

    // 记录接收事件日志
    await createSystemLog({
      type: 'PAYMENT_WEBHOOK',
      level: 'INFO',
      message: `Stripe webhook received: ${event.type}`,
      url: '/api/payments/stripe/webhook',
      method: 'POST',
      status: 200,
      source: 'stripe',
      context: { eventType: event.type },
    });

    // 处理不同的事件类型
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const payment = await getPaymentByOrderId(orderId);
          if (payment) {
            await updatePaymentStatus(payment.id, 'SUCCESS', {
              paymentIntentId: paymentIntent.id,
              transactionId: paymentIntent.id,
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const payment = await getPaymentByOrderId(orderId);
          if (payment) {
            await updatePaymentStatus(payment.id, 'FAILED', {
              paymentIntentId: paymentIntent.id,
              errorCode: paymentIntent.last_payment_error?.code,
              errorMessage: paymentIntent.last_payment_error?.message,
            });
          }
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const payment = await getPaymentByOrderId(orderId);
          if (payment) {
            await updatePaymentStatus(payment.id, 'CANCELLED', {
              paymentIntentId: paymentIntent.id,
            });
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          // 查找对应的支付记录
          const payment = await getPaymentByOrderId(
            charge.metadata?.orderId || ''
          );
          if (payment) {
            await updatePaymentStatus(payment.id, 'REFUNDED', {
              transactionId: charge.id,
            });
          }
        }
        break;
      }

      default:
        // 未处理的事件类型
        break;
    }

    return NextResponse.json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    await createSystemLog({
      type: 'PAYMENT_WEBHOOK',
      level: 'ERROR',
      message: `Stripe webhook error: ${error instanceof Error ? error.message : 'unknown'}`,
      url: '/api/payments/stripe/webhook',
      method: 'POST',
      status: 400,
      source: 'stripe',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 400 }
    );
  }
}
