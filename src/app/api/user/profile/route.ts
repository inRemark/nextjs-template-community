import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

/**
 * 用户资料管理 API - 统一接口
 * 
 * 用途：
 * - 整合 /api/profile 的基础资料管理功能
 * - 为 Console 和 Profile 页面提供统一的用户资料接口
 * 
 * 迁移说明：
 * - 基于 /api/profile/route.ts 实现（使用真实数据库）
 * - /api/profile 将作为代理指向此接口（向后兼容）
 * 
 * TODO:
 * - [ ] 实现资料完成度计算逻辑
 * - [ ] 添加字段验证和数据清洗
 * - [ ] 实现资料修改历史记录
 */

const prisma = new PrismaClient();

/**
 * GET /api/user/profile - 获取用户完整资料
 */
export const GET = requireAuth(async (user) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        company: true,
        department: true,
        title: true,
        bio: true,
        timezone: true,
        language: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // TODO: 计算资料完成度
    const completionFields = ['name', 'phone', 'company', 'bio'];
    const completedFields = completionFields.filter(
      field => profile[field as keyof typeof profile]
    ).length;
    const profileCompletion = Math.round((completedFields / completionFields.length) * 100);

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        profileCompletion,
      },
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/user/profile - 更新用户资料
 */
export const PATCH = requireAuth(async (user, request: NextRequest) => {
  try {
    const updates = await request.json();
    
    // TODO: 添加数据验证
    const allowedFields = [
      'name', 'phone', 'company', 'department', 'title', 
      'bio', 'timezone', 'language', 'theme'
    ];
    
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...filteredUpdates,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        company: true,
        department: true,
        title: true,
        bio: true,
        timezone: true,
        language: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
