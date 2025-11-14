import { NextResponse } from 'next/server';
import { createInvoice, getInvoiceByOrderId } from '@/features/payments/services/invoiceService';

/**
 * POST /api/invoices/create
 * 创建发票
 */
export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const invoice = await createInvoice(orderId);

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invoices/order/[orderId]
 * 获取订单的发票
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const invoice = await getInvoiceByOrderId(orderId);

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoice',
      },
      { status: 500 }
    );
  }
}
