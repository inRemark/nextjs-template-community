import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { requireAdmin } from '@features/auth/middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import { logger } from '@logger';
/**
 * 管理员用户管理 API
 * 
 * 迁移说明：
 * - 从 /api/users 迁移到 /api/admin/users
 * - 统一管理员接口到 /api/admin/ 路径下
 * 
 * 功能：
 * - GET: 获取用户列表（分页）
 * - PATCH: 更新用户角色
 */

// GET /api/admin/users - 获取用户列表（仅管理员）
export const GET = requireAdmin(async (request: NextRequest) => {

  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 获取用户列表
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // 获取总数
    const total = await prisma.user.count();

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PATCH /api/admin/users - 更新用户角色（仅管理员）
export const PATCH = requireAdmin(async (request: NextRequest) => {

  try {
    const body = await request.json();
    const { userId, role } = body;

    // 验证角色
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // 更新用户角色
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Update user role error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});