import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { 
  TrackClickRequest, 
  TrackClickResponse,
  TrackConversionRequest,
  TrackConversionResponse,
  ConversionStep 
} from '@/features/referral/types/referral.types';

// POST: 记录推荐链接点击
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCodeId, ipAddress, userAgent, referer, utmParams }: TrackClickRequest = body;

    // 验证推荐码是否存在
    const referralCode = await prisma.referralCode.findFirst({
      where: {
        id: referralCodeId,
        isActive: true
      }
    });

    if (!referralCode) {
      return NextResponse.json({
        success: false,
        message: '推荐码不存在或已失效'
      }, { status: 404 });
    }

    // 获取客户端IP地址
    const clientIp = ipAddress || 
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // 获取User Agent
    const clientUserAgent = userAgent || req.headers.get('user-agent') || 'unknown';

    // 创建点击记录
    const clickRecord = await prisma.referralClick.create({
      data: {
        referralCodeId,
        ipAddress: clientIp,
        userAgent: clientUserAgent,
        referer: referer || req.headers.get('referer') || null,
        utmParams: utmParams || null
      }
    });

    return NextResponse.json({
      success: true,
      trackingId: clickRecord.id
    });

  } catch (error) {
    logger.error('Error tracking referral click:', error);
    return NextResponse.json({
      success: false,
      message: '记录点击失败'
    }, { status: 500 });
  }
}

// PUT: 记录转化步骤
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      trackingId, 
      referralCodeId, 
      stepType, 
      userId, 
      metadata 
    }: TrackConversionRequest = body;

    let targetReferralCodeId = referralCodeId;

    // 如果有trackingId，从点击记录中获取推荐码ID
    if (trackingId && !referralCodeId) {
      const clickRecord = await prisma.referralClick.findUnique({
        where: { id: trackingId }
      });

      if (!clickRecord) {
        return NextResponse.json({
          success: false,
          message: '追踪ID无效'
        }, { status: 404 });
      }

      targetReferralCodeId = clickRecord.referralCodeId;
    }

    if (!targetReferralCodeId) {
      return NextResponse.json({
        success: false,
        message: '缺少推荐码信息'
      }, { status: 400 });
    }

    // 验证推荐码是否存在
    const referralCode = await prisma.referralCode.findFirst({
      where: {
        id: targetReferralCodeId,
        isActive: true
      }
    });

    if (!referralCode) {
      return NextResponse.json({
        success: false,
        message: '推荐码不存在或已失效'
      }, { status: 404 });
    }

    // 创建转化记录
    const conversionRecord = await prisma.referralConversion.create({
      data: {
        referralCodeId: targetReferralCodeId,
        clickId: trackingId || null,
        stepType: stepType as ConversionStep,
        userId: userId || null,
        metadata: metadata || null
      }
    });

    // 如果是注册转化，更新点击记录为已转化
    if (stepType === 'REGISTER' && trackingId) {
      await prisma.referralClick.update({
        where: { id: trackingId },
        data: {
          converted: true,
          convertedAt: new Date()
        }
      });
    }

    // 如果是注册转化，创建推荐关系
    if (stepType === 'REGISTER' && userId) {
      // 检查是否已经存在推荐关系
      const existingReferral = await prisma.referral.findUnique({
        where: { referredUserId: userId }
      });

      if (!existingReferral) {
        await prisma.referral.create({
          data: {
            referrerId: referralCode.userId,
            referredUserId: userId,
            referralCodeId: targetReferralCodeId,
            status: 'PENDING',
            ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || null,
            userAgent: req.headers.get('user-agent') || null
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '转化记录已保存'
    });

  } catch (error) {
    logger.error('Error tracking conversion:', error);
    return NextResponse.json({
      success: false,
      message: '记录转化失败'
    }, { status: 500 });
  }
}
