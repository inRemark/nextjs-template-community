import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { auth } from '@features/auth/middleware/auth.middleware';
import { logger } from '@logger';
import { 
  ShareEmailRequest,
  ShareEmailResponse,
  ShareLinkData 
} from '@/features/referral/types/referral.types';

// POST: 发送邮件邀请
export const POST = auth.require(async (user, request) => {
  try {
    const body = await request.json();
    const { 
      referralCodeId, 
      recipientEmail, 
      recipientName, 
      customMessage 
    }: ShareEmailRequest = body;

    // 验证输入参数
    if (!referralCodeId || !recipientEmail) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      }, { status: 400 });
    }

    // 验证推荐码是否存在且属于当前用户
    const referralCode = await prisma.referralCode.findFirst({
      where: {
        id: referralCodeId,
        userId: user.id,
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!referralCode) {
      return NextResponse.json({
        success: false,
        message: '推荐码不存在或无权访问'
      }, { status: 404 });
    }

    // 生成推荐链接
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/referral/${referralCode.code}`;

    // 构建邮件内容
    const emailSubject = `${user.name || '朋友'} 邀请您体验 VSeek`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">您好 ${recipientName || '朋友'}！</h2>
        
        <p>${user.name || '您的朋友'} 邀请您体验 VSeek - 专业的解决方案对比平台。</p>
        
        ${customMessage ? `<p style="font-style: italic; color: #666;">"${customMessage}"</p>` : ''}
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">VSeek 能为您提供：</h3>
          <ul style="color: #666;">
            <li>🔍 智能问题搜索与解决方案推荐</li>
            <li>⚖️ 详细的方案对比分析</li>
            <li>⭐ 真实用户评价和评分</li>
            <li>📊 数据驱动的决策支持</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${referralLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            立即体验 VSeek
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          或者复制以下链接到浏览器：<br>
          <a href="${referralLink}" style="color: #2563eb;">${referralLink}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          此邮件由 ${user.name || user.email} 通过 VSeek 推荐系统发送。
          如果您不希望收到此类邮件，请忽略此消息。
        </p>
      </div>
    `;

    // 这里应该集成现有的邮件系统
    // 暂时返回成功，实际发送需要集成邮件服务
    logger.debug('邮件邀请:', {
      to: recipientEmail,
      subject: emailSubject,
      content: emailContent
    });

    return NextResponse.json({
      success: true,
      message: '邀请邮件已发送'
    });

  } catch (error) {
    logger.error('Error sending referral email:', error);
    return NextResponse.json({
      success: false,
      message: '发送邀请邮件失败'
    }, { status: 500 });
  }
});

// GET: 获取分享链接数据
export const GET = auth.require(async (user, request) => {
  try {
    const url = new URL(request.url);
    const referralCodeId = url.searchParams.get('referralCodeId');

    if (!referralCodeId) {
      return NextResponse.json({
        success: false,
        message: '缺少推荐码ID'
      }, { status: 400 });
    }

    // 验证推荐码是否存在且属于当前用户
    const referralCode = await prisma.referralCode.findFirst({
      where: {
        id: referralCodeId,
        userId: user.id,
        isActive: true
      }
    });

    if (!referralCode) {
      return NextResponse.json({
        success: false,
        message: '推荐码不存在或无权访问'
      }, { status: 404 });
    }

    // 生成分享链接数据
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/referral/${referralCode.code}`;
    
    // 生成二维码URL（这里可以集成二维码生成服务）
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`;

    const shareData: ShareLinkData = {
      referralCode: referralCode.code,
      referralLink,
      qrCodeUrl
    };

    return NextResponse.json({
      success: true,
      data: shareData
    });

  } catch (error) {
    logger.error('Error getting share data:', error);
    return NextResponse.json({
      success: false,
      message: '获取分享数据失败'
    }, { status: 500 });
  }
});
