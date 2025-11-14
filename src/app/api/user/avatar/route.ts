import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '@features/auth/middleware/auth.middleware';

/**
 * 用户头像管理 API - 统一接口
 * 
 * 用途：
 * - 整合 /api/profile/avatar 的头像上传功能
 * - 为所有需要头像上传的场景提供统一接口
 * 
 * 迁移说明：
 * - 直接从 /api/profile/avatar/route.ts 迁移
 * - /api/profile/avatar 将作为代理指向此接口（可选）
 * 
 * TODO:
 * - [ ] 集成云存储服务（AWS S3/阿里云OSS等）
 * - [ ] 实现图片自动压缩和缩略图生成
 * - [ ] 添加旧头像自动清理机制
 * - [ ] 支持更多图片格式验证
 */

/**
 * POST /api/user/avatar - 上传用户头像
 */
export const POST = requireAuth(async (user, request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' }, 
        { status: 400 }
      );
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
        }, 
        { status: 400 }
      );
    }
    
    // 验证文件大小 (最大 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File too large. Maximum size is 2MB.' 
        }, 
        { status: 400 }
      );
    }
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `avatar_${user.id}_${timestamp}.${extension}`;
    
    // TODO: 
    // - 上传到云存储服务
    // - 生成优化的缩略图
    // - 更新数据库中的头像URL
    // - 删除旧的头像文件
    
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // 确保上传目录存在
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
      await mkdir(uploadDir, { recursive: true });
      
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      const avatarUrl = `/uploads/avatars/${fileName}`;
      
      return NextResponse.json({ 
        success: true,
        data: { avatarUrl },
        message: 'Avatar uploaded successfully' 
      });
    } catch (fileError) {
      logger.error('Error saving file:', fileError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save uploaded file' 
        }, 
        { status: 500 }
      );
    }
    
  } catch (error) {
    logger.error('Error uploading avatar:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload avatar' 
      }, 
      { status: 500 }
    );
  }
});
