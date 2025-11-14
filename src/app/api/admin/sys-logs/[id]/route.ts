import { NextResponse } from 'next/server';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import prisma from '@/lib/database/prisma';

/**
 * GET /api/admin/logs/[id]
 * 管理员获取系统日志详情
 */
export const GET = requireAdmin(async (request, { params }: { params: { id: string } }) => {
  try {
    const id = params.id;
    // 兼容未生成 Prisma 类型的场景
    const systemLog = (prisma as unknown as { systemLog: { findUnique: (args: Record<string, unknown>) => Promise<unknown | null>; } }).systemLog;

    const log = await systemLog.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!log) {
      return NextResponse.json({ message: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json({ data: log });
  } catch (error) {
    console.error('Get admin log detail error:', error);
    return NextResponse.json(
      { message: 'Failed to get log detail', error: String(error) },
      { status: 500 }
    );
  }
});
