// =========================================
// ARENA V0.1P SECURITY & GATEWAY MIDDLEWARE
// middleware.ts
// =========================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types/database.types';
import type { ArenaRole } from './types/api.types'; // Extract our strict application roles

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Create the base response header proxy layer
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Official Supabase SSR Cookie Exchange Pattern
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // FIXED: Spreading full cookie options onto the request object to prevent path/expiry desyncs
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 3. Decrypt active token data packet safely inside Edge RAM
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = (user?.app_metadata?.arena_role as ArenaRole | undefined) || 'competitor';

  if (user) {
    const { data: profileRole } = await supabase
      .from('profiles')
      .select('arena_role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileRole?.arena_role) {
      userRole = profileRole.arena_role as ArenaRole;
    }
  }

  // ─── THE SECURITY GATE MATRIX ───────────────────────────────────────────

  const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/judge') || pathname.startsWith('/admin') || pathname.startsWith('/sprint') || pathname.startsWith('/profile');

  // Gate 1: Redirect authenticated users away from authentication onboarding pages
  if (user && isAuthRoute) {
    const targetDashboard = userRole === 'admin' ? '/admin' : userRole === 'judge' ? '/judge' : '/dashboard';
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // Gate 2: Enforce authentication on all control workspaces
  if (!user && isProtectedPath && !isAuthRoute) {
    const loginRedirect = new URL('/signin', request.url);
    loginRedirect.searchParams.set('next', pathname); // Preserves redirect destination histories
    return NextResponse.redirect(loginRedirect);
  }

  // Gate 3: Admin Workspace Shield
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Gate 4: Judge Workspace Shield
  if (pathname.startsWith('/judge') && userRole !== 'judge' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// ─── ACCELERATED ROUTE FILTERING MATCHERS ─────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Excludes internal API endpoints, static assets, and optimization pipes
     * to keep middleware latency drops to an absolute minimum.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
