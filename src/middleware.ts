import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const isPublicRoute = path === '/login' || path.startsWith('/_next') || path.startsWith('/favicon.ico');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for the auth cookie
  const authCookie = request.cookies.get('shopguard_auth');

  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
