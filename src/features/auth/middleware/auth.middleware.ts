import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, type Permission } from '@features/auth/services/rbac.service';
import { Session } from 'next-auth';
import { UserRole } from '@shared/types/user';
import { logger } from '@logger';
import { AuthUser } from '@features/auth/types/auth.types';

async function getServerSession() {
  try {
    const { auth } = await import('../services/auth.config');
    return await auth();
  } catch (error) {
    logger.error('Failed to get server session:', error);
    return null;
  }
}

/**
 * get user role from session safely
 */
function extractUserRole(session: Session | null): UserRole {
  if (session?.user?.role && typeof session.user.role === 'string') {
    const role = session.user.role.toUpperCase();
    if (role === 'ADMIN' || role === 'EDITOR' || role === 'USER') {
      return role as UserRole;
    }
  }
  return 'USER';
}

/**
 * Extract authenticated user from request (NextAuth Session only)
 * Returns AuthUser and optional original session object
 */
async function getUserFromRequest(): Promise<{ user: AuthUser | null; session?: Session | null }> {
  const session = await getServerSession();
  if (session?.user?.id) {
    const userRole = extractUserRole(session);
    return {
      user: { id: session.user.id, email: session.user.email || '', name: session.user.name || undefined, role: userRole },
      session,
    };
  }

  return { user: null };
}

/**
 * NextAuth authentication middleware
 * Unified authentication logic to avoid code duplication
 */
export async function withNextAuth(
  handler: (request: NextRequest, session: { user: { id: string; email: string; name: string; role: string } }) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Get NextAuth session
      const session = await getServerSession();
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized', error: 'NO_SESSION' },
          { status: 401 }
        );
      }

      // call the handler with session
      return await handler(request, session);
    } catch (error) {
      logger.error('NextAuth middleware error:', error);
      return NextResponse.json(
        { message: 'Authentication failed', error: 'MIDDLEWARE_ERROR' },
        { status: 500 }
      );
    }
  };
}

/**
 * Get current user's session
 * Used for quickly obtaining authentication info in API routes
 */
export async function getCurrentSession() {
  try {
    return await getServerSession();
  } catch (error) {
    logger.error('Get session error:', error);
    return null;
  }
}

/**
 * Check if user has specified permission
 * Uses unified getUserFromRequest combined with RBAC system
 */
export async function requirePermission(permission: Permission) {
  return async (
    handler: (request: NextRequest, session: { user: { id: string; email: string; name: string; role: string } }) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest) => {
      try {
        // use unified method to get user
        const { user, session } = await getUserFromRequest();

        if (!user) {
          return NextResponse.json(
            { message: 'Unauthorized', error: 'NO_SESSION' },
            { status: 401 }
          );
        }

        // check permission
        const ok = await hasPermission(user.id, permission);
        if (!ok) {
          return NextResponse.json(
            { message: 'Insufficient permissions', error: 'INSUFFICIENT_PERMISSIONS' },
            { status: 403 }
          );
        }

        // If there is a NextAuth session, pass it directly; otherwise, construct a pseudo session object
        const sessionToPass = session || { 
          user: { 
            id: user.id, 
            email: user.email, 
            name: user.name || '', 
            role: user.role 
          } 
        } as Session;

        return await handler(request, sessionToPass);
      } catch (error) {
        logger.error('Permission middleware error:', error);
        return NextResponse.json(
          { message: 'Permission check failed', error: 'PERMISSION_ERROR' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Check user roles - general middleware
 */
export async function requireRole(roles: string[]) {
  return async (
    handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest) => {
      try {
        const { user } = await getUserFromRequest();

        if (!user || !roles.includes(user.role)) {
          return NextResponse.json(
            { message: 'Insufficient role', error: 'INSUFFICIENT_ROLE' },
            { status: 403 }
          );
        }

        return await handler(request, user);
      } catch (error) {
        logger.error('Role middleware error:', error);
        return NextResponse.json(
          { message: 'Role check failed', error: 'ROLE_ERROR' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Admin permission check - dedicated middleware
 */
export function requireAdmin<T extends unknown[]>(
  handler: (request: NextRequest, user: AuthUser, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const { user } = await getUserFromRequest();

      if (user?.role !== 'ADMIN') {
        return NextResponse.json(
          { message: 'Admin privileges required', error: 'INSUFFICIENT_PERMISSIONS' },
          { status: 403 }
        );
      }

      return await handler(request, user, ...args);
    } catch (error) {
      logger.error('Admin middleware error:', error);
      return NextResponse.json(
        { message: 'Admin check failed', error: 'ADMIN_ERROR' },
        { status: 500 }
      );
    }
  };
}

/**
 * Basic authentication - compatible with existing API signatures
 */
export function requireAuth<T extends unknown[]>(
  handler: (user: AuthUser, request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const { user } = await getUserFromRequest();

      if (!user) {
        return NextResponse.json(
          { message: 'Unauthorized', error: 'NO_SESSION' },
          { status: 401 }
        );
      }

      return await handler(user, request, ...args);
    } catch (error) {
      logger.error('Auth middleware error:', error);
      return NextResponse.json(
        { message: 'Authentication failed', error: 'AUTH_ERROR' },
        { status: 500 }
      );
    }
  };
}

/**
 * Get user information - only supports NextAuth Session
 */
export async function getAuthUserFromRequest(): Promise<AuthUser> {
  const session = await getServerSession();
  if (session?.user?.id) {
    const userRole = extractUserRole(session);
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || undefined,
      role: userRole,
    };
  }
  
  throw new Error('No authentication session found');
}

/**
 * Unified authentication middleware collection - fully compatible with auth-request.ts API
 */
export const auth = {
  /**
   * Basic authentication - requires login
   */
  require: requireAuth,
  
  /**
   * Admin authentication - requires ADMIN role
   */
  requireAdmin: requireAdmin,
  
  /**
   * Role authentication - requires specified roles
   */
  requireRole: requireRole,
  
  /**
   * Get user information - only supports NextAuth Session
   */
  getUser: getAuthUserFromRequest,
  
};