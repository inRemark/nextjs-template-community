import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { hashPassword } from '@features/auth/services/auth.service';
import { AuthResponse } from '@features/auth/types/auth.types';
import { registerApiSchema } from '@/features/auth/validators/auth';
import { ZodError } from 'zod';
import { ReferralService } from '@/features/referral/services/referral.service';
import { PointsService } from '@/features/referral/services/points.service';

// user registration - POST /api/auth/register
export async function POST(request: NextRequest) {
  let body: unknown;
  
  try {
    body = await request.json();

    // use Zod Schema to validate input (no need for confirmPassword)
    const { email, password, name } = registerApiSchema.parse(body);

    // get referral code (if any)
    const bodyData = body as { referralCode?: string };
    const referralCode = bodyData.referralCode || request.nextUrl.searchParams.get('ref');

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // check and validate referral code (if provided)
    let referralCodeInfo: Awaited<ReturnType<typeof ReferralService.validateReferralCode>> = null;
    if (referralCode) {
      referralCodeInfo = await ReferralService.validateReferralCode(referralCode);
      if (!referralCodeInfo) {
        logger.warn('Invalid referral code provided:', referralCode);
        // do not block registration, just log a warning
      }
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // generate name from email (take the part before @)
    const emailName = email.split('@')[0];

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || emailName,
        password: hashedPassword,
        role: 'USER', // default role is user
      },
    });

    // process referral and points rewards
    if (referralCodeInfo) {
      try {
        // create referral
        const referral = await ReferralService.createReferral(
          referralCodeInfo.userId,
          user.id,
          referralCodeInfo.id
        );

        // record conversion
        await ReferralService.recordConversion(
          referralCodeInfo.id,
          'REGISTER',
          undefined,
          user.id
        );

        // reward referrer with points (50 points)
        await PointsService.addPoints(
          referralCodeInfo.userId,
          50,
          'EARNED_REFERRAL_REGISTER',
          referral.id,
          `推荐用户 ${user.name || user.email} 注册成功`
        );

        // reward new user with points (50 points)
        await PointsService.addPoints(
          user.id,
          50,
          'EARNED_REFERRAL_REGISTER',
          referral.id,
          `通过推荐码 ${referralCode} 注册奖励`
        );

        // update referral status to rewarded
        await ReferralService.updateReferralStatus(referral.id, 'REWARDED');

        logger.info('Referral rewards processed successfully', {
          referrerId: referralCodeInfo.userId,
          referredUserId: user.id,
          referralCode
        });
      } catch (error) {
        // process referral failure should not block registration
        logger.error('Failed to process referral:', error);
      }
    }

    // set response (no longer generate JWT token)
    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    // Zod validation error
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      logger.error('Zod validation error:', {
        path: firstError.path,
        message: firstError.message,
        code: firstError.code,
        received: body,
      });
      return NextResponse.json(
        { success: false, error: firstError.message },
        { status: 400 }
      );
    }

    // other errors
    logger.error('Registration error:', error);
    console.error('Full error details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
