import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@logger';
import { notificationService } from '@features/mail/services/notification-service';
import { templateService } from '@features/mail/services/template-service';
import { getEmailService } from '@features/mail/services/service';
import { getQueueService } from '@features/mail/services/queue-service';

const emailService = getEmailService();
const queueService = getQueueService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      to,
      subject,
      type = 'system',
      data = {},
      templateId,
      variables = {},
      sendMode = 'immediate',  // 'immediate' | 'queue'
      priority = 'NORMAL'     // 'HIGH' | 'NORMAL'
    } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { success: false, error: '收件人邮箱和邮件主题是必需的' },
        { status: 400 }
      );
    }

    // 队列模式
    if (sendMode === 'queue') {
      let content = '';
      let textContent = '';
      let finalSubject = subject;

      if (templateId) {
        content = await templateService.renderTemplate(templateId, variables);
        textContent = await templateService.renderTextTemplate(templateId, variables);
        finalSubject = await templateService.renderSubject(templateId, variables);
      } else {
        content = generateSimpleContent(subject, data.content || '');
        textContent = `${subject}\n\n${data.content || ''}`;
      }

      const taskId = await queueService.addToQueue({
        to,
        subject: finalSubject,
        content,
        textContent,
        templateId,
        variables,
        priority: priority as 'HIGH' | 'NORMAL',
      });

      return NextResponse.json({
        success: true,
        mode: 'queue',
        taskId,
        message: '邮件已加入队列'
      });
    }

    // 立即发送模式
    if (templateId) {
      const htmlContent = await templateService.renderTemplate(templateId, variables);
      const textContent = await templateService.renderTextTemplate(templateId, variables);
      const renderedSubject = await templateService.renderSubject(templateId, variables);
      
      await emailService.sendEmail({
        to,
        subject: renderedSubject,
        html: htmlContent,
        text: textContent
      });
    } else {
      switch (type) {
        case 'referral':
          await notificationService.sendReferralInvitation(
            to, 
            data.referralCode, 
            data.inviterName
          );
          break;
          
        case 'reward':
          await notificationService.sendReferralReward(
            to, 
            data.points, 
            data.referrerName
          );
          break;
          
        case 'share':
          await notificationService.sendShareEmail(to, data);
          break;
          
        case 'verification':
          await notificationService.sendVerificationEmail(
            to, 
            data.token, 
            data.type
          );
          break;
          
        case 'subscription':
          await notificationService.sendSubscriptionUpdate(to, data);
          break;
          
        case 'system':
        default:
          await notificationService.sendSystemNotification(to, {
            type: 'system',
            title: subject,
            content: data.content || '',
            variables
          });
          break;
      }
    }

    await logEmailSent(to, subject, type);

    return NextResponse.json({
      success: true,
      mode: 'immediate',
      message: '邮件发送成功'
    });

  } catch (error) {
    logger.error('邮件发送失败:', error);
    return NextResponse.json(
      { success: false, error: '邮件发送失败' },
      { status: 500 }
    );
  }
}

function generateSimpleContent(title: string, content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${title}</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${content}
      </div>
      <p style="color: #666; font-size: 14px;">
        此邮件由 VSeek 系统自动发送，请勿回复。
      </p>
    </div>
  `;
}

// 记录邮件发送历史
async function logEmailSent(to: string, subject: string, type: string): Promise<void> {
  try {
    // 这里可以保存到数据库
    // 暂时仅在开发环境输出
    if (process.env.NODE_ENV === 'development') {
      logger.info(`邮件已发送: ${type} -> ${to} - ${subject}`);
    }
  } catch (error) {
    logger.error('记录邮件历史失败', error);
  }
}