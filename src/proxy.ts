import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass authentication checks for webhook callbacks and health routes
  if (pathname.startsWith('/api/webhooks') || pathname === '/api/health') {
    return NextResponse.next();
  }

  // 2. Synchronize and refresh the Supabase session cookie at the edge
  const { response, user, role } = await updateSession(request);

  const isPublicAuthRoute = pathname === '/login' || pathname === '/signup';
  const isUnauthorizedRoute = pathname === '/unauthorized';

  // 3. If an authenticated user visits /login or /signup, redirect directly to their dashboard
  if (isPublicAuthRoute && user && role) {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (role === 'TEACHER') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
    if (role === 'STUDENT') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  // 4. Role-based Route Protection
  const isAdminRoute = pathname.startsWith('/admin');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isStudentRoute = pathname.startsWith('/student');

  if (isAdminRoute || isTeacherRoute || isStudentRoute) {
    // Unauthenticated user -> Redirect to /login with return URL
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role Enforcement
    if (isAdminRoute && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (isTeacherRoute && role !== 'TEACHER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (isStudentRoute && role !== 'STUDENT' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public static images & fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
