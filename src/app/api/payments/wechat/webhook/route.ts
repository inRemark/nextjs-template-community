import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWechatCallback } from '@/features/payments/services/wechatService';
import { updatePaymentStatus, getPaymentByOrderNumber } from '@/features/payments/services/paymentService';
import { updateOrderStatus } from '@/features/orders/services/orderService';
import { createSystemLog } from '@/shared/service/logService';

import * as nodeCrypto from 'crypto';

/**
 * POST /api/payments/wechat/webhook
 * 微信支付异步通知回调
 */
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const timestamp = headersList.get('wechatpay-timestamp') || '';
    const nonce = headersList.get('wechatpay-nonce') || '';
    const signature = headersList.get('wechatpay-signature') || '';
    
    const body = await request.text();

    // 验证签名
    const isValid = verifyWechatCallback(timestamp, nonce, body, signature);
    if (!isValid) {
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'WARN',
        message: 'Wechat callback invalid signature',
        url: '/api/payments/wechat/webhook',
        method: 'POST',
        status: 400,
        source: 'wechat',
      });
      return NextResponse.json(
        { code: 'FAIL', message: '签名验证失败' },
        { status: 400 }
      );
    }

    // 解析通知数据
    const data = JSON.parse(body);
    
    // 解密数据
    const {
      ciphertext,
      associated_data,
      nonce: dataNonce,
    } = data.resource;

    const apiV3Key = process.env.WECHAT_PAY_API_V3_KEY || '';
    const decipher = nodeCrypto.createDecipheriv(
      'aes-256-gcm',
      apiV3Key,
      dataNonce
    );
    
    decipher.setAuthTag(Buffer.from(data.resource.auth_tag, 'base64'));
    decipher.setAAD(Buffer.from(associated_data));
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    const paymentData = JSON.parse(decrypted);

    // 获取订单号和交易状态
    const outTradeNo = paymentData.out_trade_no;
    const tradeState = paymentData.trade_state;
    const transactionId = paymentData.transaction_id;

    // 查找支付记录
    const payment = await getPaymentByOrderNumber(outTradeNo);
    if (!payment) {
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'WARN',
        message: 'Wechat payment not found',
        url: '/api/payments/wechat/webhook',
        method: 'POST',
        status: 404,
        source: 'wechat',
        context: { outTradeNo },
      });
      return NextResponse.json(
        { code: 'FAIL', message: '订单不存在' },
        { status: 404 }
      );
    }

    // 处理支付成功
    if (tradeState === 'SUCCESS') {
      await updatePaymentStatus(payment.id, 'SUCCESS', {
        transactionId,
        paidAt: new Date(paymentData.success_time),
      });

      await updateOrderStatus(payment.orderId, 'PAID');
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'INFO',
        message: 'Wechat trade success',
        url: '/api/payments/wechat/webhook',
        method: 'POST',
        status: 200,
        source: 'wechat',
        context: { outTradeNo, transactionId },
      });
    }
    
    // 处理支付失败
    else if (tradeState === 'CLOSED' || tradeState === 'PAYERROR') {
      await createSystemLog({
        type: 'PAYMENT_WEBHOOK',
        level: 'WARN',
        message: 'Wechat trade closed or error',
        url: '/api/payments/wechat/webhook',
        method: 'POST',
        status: 200,
        source: 'wechat',
        context: { outTradeNo, tradeState },
      });
      await updatePaymentStatus(payment.id, 'FAILED', {
        errorMessage: paymentData.trade_state_desc || '支付失败',
      });
    }

    return NextResponse.json({ code: 'SUCCESS', message: '成功' });
  } catch (error) {
    console.error('Wechat webhook error:', error);
    await createSystemLog({
      type: 'PAYMENT_WEBHOOK',
      level: 'ERROR',
      message: `Wechat webhook error: ${error instanceof Error ? error.message : 'unknown'}`,
      url: '/api/payments/wechat/webhook',
      method: 'POST',
      status: 500,
      source: 'wechat',
    });
    return NextResponse.json(
      { code: 'FAIL', message: '处理失败' },
      { status: 500 }
    );
  }
}
