import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import prisma from '@/lib/database/prisma';

/**
 * GET /api/admin/logs
 * 管理员获取系统日志列表
 */
export const GET = requireAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || undefined; // PAYMENT_WEBHOOK | API_CALL | ERROR | ALL
    const level = searchParams.get('level') || undefined; // INFO | WARN | ERROR | ALL
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const userEmail = searchParams.get('userEmail') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = {};
    if (type && type !== 'ALL') where.type = type;
    if (level && level !== 'ALL') where.level = level;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }
    const systemLog = (prisma as unknown as { systemLog: { findMany: (args: Record<string, unknown>) => Promise<unknown[]>; count: (args: Record<string, unknown>) => Promise<number>; } }).systemLog;
    if (userEmail) {
      where.user = { is: { email: { contains: userEmail, mode: 'insensitive' } } };
    }
    if (search) {
      where.message = { contains: search, mode: 'insensitive' };
    }

    const [logs, total] = await Promise.all([
      systemLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      systemLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    return NextResponse.json(
      { message: 'Failed to get logs', error: String(error) },
      { status: 500 }
    );
  }
});
