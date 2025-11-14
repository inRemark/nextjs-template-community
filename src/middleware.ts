import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';
import { logger } from '@logger';

const intlMiddleware = createIntlMiddleware(routing);

const publicApiRoutes = [
  '/api/auth',
  '/api/webhooks',
];

const publicRoutes = [
  '/',
  '/about',
  '/help',
  '/blog',
  '/pricing',
  '/api/auth',
];

const userProtectedRoutes = [
  '/profile',
  '/console',
];

const adminProtectedRoutes = [
  '/admin',
];

const protectedRoutes = [
  '/profile',
];

function extractLocale(pathname: string): string {
  return pathname.split('/')[1] || 'zh';
}

function getPathWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/(zh|en|ja)/, '') || '/';
}

function isPublicPath(pathWithoutLocale: string): boolean {
  return publicRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(route)
  );
}

function isProtectedPath(pathWithoutLocale: string): boolean {
  const isUserProtected = userProtectedRoutes.some(route => 
    pathWithoutLocale.startsWith(route)
  );
  const isAdminProtected = adminProtectedRoutes.some(route => 
    pathWithoutLocale.startsWith(route)
  );
  const isOtherProtected = protectedRoutes.some(route => 
    pathWithoutLocale.startsWith(route)
  );
  
  return isUserProtected || isAdminProtected || isOtherProtected;
}

function createRedirect(locale: string, path: string, requestUrl: string): NextResponse {
  return NextResponse.redirect(new URL(`/${locale}${path}`, requestUrl));
}

function handleUnauthenticated(
  pathWithoutLocale: string,
  locale: string,
  requestUrl: string,
  intlResponse: NextResponse
): NextResponse {
  if (pathWithoutLocale === '/login') {
    return intlResponse;
  }
  return createRedirect(locale, '/login', requestUrl);
}

function checkAuthorization(
  pathWithoutLocale: string,
  userRole: string,
  locale: string,
  requestUrl: string
): NextResponse | null {
  const isAdminRoute = adminProtectedRoutes.some(route => 
    pathWithoutLocale.startsWith(route)
  );
  
  if (isAdminRoute && userRole !== 'ADMIN') {
    return createRedirect(locale, '/unauthorized', requestUrl);
  }
  
  const isConsoleRoute = pathWithoutLocale.startsWith('/console');
  const hasConsoleAccess = userRole === 'ADMIN' || userRole === 'EDITOR';
  
  if (isConsoleRoute && !hasConsoleAccess) {
    return createRedirect(locale, '/unauthorized', requestUrl);
  }
  
  return null;
}

async function handleApiAuth(request: NextRequest, pathname: string): Promise<NextResponse> {
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
  if (isPublicApi) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token?.sub) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (pathname.startsWith('/api/admin')) {
      const userRole = (token.role as string) || '';
      if (userRole !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    logger.error('API auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

async function handleNonApiAuth(request: NextRequest, pathname: string): Promise<NextResponse> {
  const intlResponse = intlMiddleware(request);
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  logger.warn('🔍 Path analysis:', {
    originalPathname: pathname,
    pathWithoutLocale,
    isPublic: isPublicPath(pathWithoutLocale),
    isProtected: isProtectedPath(pathWithoutLocale)
  });

  if (isPublicPath(pathWithoutLocale)) {
    return intlResponse;
  }

  if (!isProtectedPath(pathWithoutLocale)) {
    return intlResponse;
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    logger.warn('Middleware token check:', {
      pathname,
      pathWithoutLocale,
      hasToken: !!token,
      userId: token?.sub,
      userRole: token?.role
    });

    const locale = extractLocale(pathname);

    if (!token?.sub) {
      logger.warn('No authentication found, redirecting to login');
      return handleUnauthenticated(pathWithoutLocale, locale, request.url, intlResponse);
    }

    if (pathWithoutLocale === '/login' || pathWithoutLocale === '/auth/login') {
      return createRedirect(locale, '/profile', request.url);
    }

    const userRole = (token.role as string) || '';
    const authResponse = checkAuthorization(pathWithoutLocale, userRole, locale, request.url);
    if (authResponse) {
      return authResponse;
    }

    return intlResponse;
  } catch (err) {
    logger.error('Middleware auth error:', err);
    const locale = extractLocale(pathname);
    return handleUnauthenticated(pathWithoutLocale, locale, request.url, intlResponse);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    return await handleApiAuth(request, pathname);
  }

  return await handleNonApiAuth(request, pathname);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml
     * - robots.txt
     * - public files (images, etc)
     */
    // '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)).*)',
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
