import prisma from '@/lib/database/prisma';
import type { Prisma } from '@prisma/client';

export type CreateSystemLogParams = {
  type: 'PAYMENT_WEBHOOK' | 'API_CALL' | 'ERROR';
  level?: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  url?: string;
  method?: string;
  status?: number;
  source?: string;
  userId?: string;
  context?: Record<string, unknown>;
};

/**
 * Attention: This function writes critical business logs to the database.
 * Make sure the provided context is sanitized and size-controlled.
 */
export async function createSystemLog(params: CreateSystemLogParams) {
  const data: Prisma.SystemLogCreateInput = {
    type: params.type as any,
    level: (params.level || 'INFO') as any,
    message: params.message.substring(0, 2000),
    url: params.url,
    method: params.method,
    status: params.status,
    source: params.source,
    context: params.context ? (params.context as any) : undefined,
    createdAt: new Date(),
    user: params.userId ? { connect: { id: params.userId } } : undefined,
  };

  return prisma.systemLog.create({ data });
}
