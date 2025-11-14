import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/services/auth.config';
import { getInvoiceById, generateInvoice } from '@/features/payments/services/invoiceService';

/**
 * GET /api/invoices/[id]/download
 * 下载发票 PDF
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    const { id } = await params;

    // 获取发票信息
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // 验证用户权限
    if (invoice.order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 生成 PDF
    const pdfBuffer = await generateInvoice(id);

    // 返回 PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download invoice',
      },
      { status: 500 }
    );
  }
}
