import { PrismaClient } from '@prisma/client';

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma; // 开发环境缓存到全局
}

export default prisma;