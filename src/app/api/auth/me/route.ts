import { logger } from '@logger';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { requireAuth } from '@features/auth/middleware/auth.middleware';
import { MeResponse, UpdateMeRequest } from '@features/auth/types/auth.types';

// get current user info
export const GET = requireAuth(async (user) => {

  try {
    // get user info
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // set response
    const response: MeResponse = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    logger.error('Get user info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// update current user info
export const PATCH = requireAuth(async (user, request: NextRequest) => {

  try {
    // get request body
    const body: UpdateMeRequest = await request.json();

    // update user info
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // set response
    const response: MeResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    logger.error('Update user info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});