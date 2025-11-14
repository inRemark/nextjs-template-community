import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { auth } from '@features/auth/middleware/auth.middleware';
import { 
  CreateReferralCodeRequest, 
  CreateReferralCodeResponse,
  ReferralCodeResponse 
} from '@/features/referral/types/referral.types';

// 生成推荐码的辅助函数
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // 生成6-8位随机码
  const length = Math.floor(Math.random() * 3) + 6; // 6-8位
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// 确保推荐码唯一性
async function ensureUniqueCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    code = generateReferralCode();
    
    const existing = await prisma.referralCode.findUnique({
      where: { code }
    });
    
    if (!existing) {
      isUnique = true;
      return code;
    }
    
    attempts++;
  }
  
  // 如果多次尝试仍不唯一，使用时间戳后缀
  const timestamp = Date.now().toString().slice(-4);
  return generateReferralCode() + timestamp;
}

// GET: 获取当前用户的推荐码
export const GET = auth.require(async (user, request) => {
  try {
    // 查找用户现有的推荐码
    let referralCode = await prisma.referralCode.findFirst({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            clicks: true,
            conversions: true
          }
        }
      }
    });

    // 如果没有推荐码，自动生成一个
    if (!referralCode) {
      const newCode = await ensureUniqueCode();
      
      referralCode = await prisma.referralCode.create({
        data: {
          userId: user.id,
          code: newCode,
          isActive: true
        },
        include: {
          _count: {
            select: {
              clicks: true,
              conversions: true
            }
          }
        }
      });
    }

    // 计算转化率
    const conversionRate = referralCode._count.clicks > 0 
      ? (referralCode._count.conversions / referralCode._count.clicks) * 100 
      : 0;

    const response: ReferralCodeResponse = {
      id: referralCode.id,
      code: referralCode.code,
      isActive: referralCode.isActive,
      createdAt: referralCode.createdAt.toISOString(),
      stats: {
        totalClicks: referralCode._count.clicks,
        totalConversions: referralCode._count.conversions,
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Error fetching referral code:', error);
    return NextResponse.json({
      success: false,
      message: '获取推荐码失败'
    }, { status: 500 });
  }
});

// POST: 重新生成推荐码
export const POST = auth.require(async (user, request) => {
  try {
    // 查找用户现有的推荐码
    const existingCode = await prisma.referralCode.findFirst({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    // 如果有现有推荐码，先设置为非活跃
    if (existingCode) {
      await prisma.referralCode.update({
        where: { id: existingCode.id },
        data: { isActive: false }
      });
    }

    // 生成新的推荐码
    const newCode = await ensureUniqueCode();
    
    const referralCode = await prisma.referralCode.create({
      data: {
        userId: user.id,
        code: newCode,
        isActive: true
      },
      include: {
        _count: {
          select: {
            clicks: true,
            conversions: true
          }
        }
      }
    });

    // 计算转化率
    const conversionRate = referralCode._count.clicks > 0 
      ? (referralCode._count.conversions / referralCode._count.clicks) * 100 
      : 0;

    const response: ReferralCodeResponse = {
      id: referralCode.id,
      code: referralCode.code,
      isActive: referralCode.isActive,
      createdAt: referralCode.createdAt.toISOString(),
      stats: {
        totalClicks: referralCode._count.clicks,
        totalConversions: referralCode._count.conversions,
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: '推荐码已重新生成'
    });

  } catch (error) {
    logger.error('Error regenerating referral code:', error);
    return NextResponse.json({
      success: false,
      message: '重新生成推荐码失败'
    }, { status: 500 });
  }
});
