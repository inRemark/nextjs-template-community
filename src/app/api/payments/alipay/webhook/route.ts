import { NextResponse } from 'next/server';
import { verifyAlipayCallback } from '@/features/payments/services/alipayService';
import { updatePaymentStatus, getPaymentByOrderNumber } from '@/features/payments/services/paymentService';
import { createSystemLog } from '@/shared/service/logService';
import { updateOrderStatus } from '@/features/orders/services/orderService';

/**
 * POST /api/payments/alipay/webhook
 * 支付宝异步通知回调
 */
export async function POST(request: Request) {
  try {
    // 获取回调参数
    const formData = await request.formData();
    const params: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // 验证签名
    const isValid = verifyAlipayCallback(params);
    if (!isValid) {
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'WARN',
        message: 'Alipay callback invalid signature',
        url: '/api/payments/alipay/webhook',
        method: 'POST',
        status: 400,
        source: 'alipay',
        context: { params: { out_trade_no: params.out_trade_no, trade_status: params.trade_status } },
      });
      return new NextResponse('FAIL', { status: 400 });
    }

    // 获取交易状态
    const tradeStatus = params.trade_status;
    const outTradeNo = params.out_trade_no; // 我们的订单号
    const tradeNo = params.trade_no; // 支付宝交易号

    // 查找支付记录
    const payment = await getPaymentByOrderNumber(outTradeNo);
    if (!payment) {
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'WARN',
        message: 'Alipay payment not found',
        url: '/api/payments/alipay/webhook',
        method: 'POST',
        status: 404,
        source: 'alipay',
        context: { outTradeNo },
      });
      return new NextResponse('FAIL', { status: 404 });
    }

    // 处理支付成功
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      // 更新支付状态
      await updatePaymentStatus(payment.id, 'SUCCESS', {
        transactionId: tradeNo,
        paidAt: new Date(params.gmt_payment),
      });

      // 更新订单状态为已支付
      await updateOrderStatus(payment.orderId, 'PAID');
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'INFO',
        message: 'Alipay trade success',
        url: '/api/payments/alipay/webhook',
        method: 'POST',
        status: 200,
        source: 'alipay',
        context: { outTradeNo, tradeNo, tradeStatus },
      });
    }
    
    // 处理支付关闭
    else if (tradeStatus === 'TRADE_CLOSED') {
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'WARN',
        message: 'Alipay trade closed',
        url: '/api/payments/alipay/webhook',
        method: 'POST',
        status: 200,
        source: 'alipay',
        context: { outTradeNo, tradeNo, tradeStatus },
      });
      await updatePaymentStatus(payment.id, 'FAILED', {
        errorMessage: '交易关闭',
      });
    }

    // 返回成功
    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('Alipay webhook error:', error);
    await createSystemLog({
      type: 'PAYMENT_WEBHOOK',
      level: 'ERROR',
      message: `Alipay webhook error: ${error instanceof Error ? error.message : 'unknown'}`,
      url: '/api/payments/alipay/webhook',
      method: 'POST',
      status: 500,
      source: 'alipay',
    });
    return new NextResponse('FAIL', { status: 500 });
  }
}
