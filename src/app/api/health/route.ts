import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test VSeek tables
    const problemCount = await prisma.problem.count();
    const solutionCount = await prisma.solution.count();
    const categoryCount = await prisma.problemCategory.count();
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        vseek_tables: {
          problems: problemCount,
          solutions: solutionCount,
          categories: categoryCount,
        },
      },
      version: '1.0.0',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        version: '1.0.0',
      },
      { status: 503 }
    );
  }
}
