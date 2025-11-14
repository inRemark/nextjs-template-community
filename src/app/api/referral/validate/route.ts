import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';

// GET: 验证推荐码
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({
        success: false,
        error: '缺少推荐码参数'
      }, { status: 400 });
    }

    // 查找推荐码
    const referralCode = await prisma.referralCode.findFirst({
      where: {
        code: code,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!referralCode) {
      return NextResponse.json({
        success: false,
        error: '推荐码无效或已过期'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isValid: true,
      referrerInfo: {
        name: referralCode.user.name,
        email: referralCode.user.email
      },
      referralCodeId: referralCode.id
    });

  } catch (error) {
    logger.error('Error validating referral code:', error);
    return NextResponse.json({
      success: false,
      error: '验证推荐码时发生错误'
    }, { status: 500 });
  }
}
