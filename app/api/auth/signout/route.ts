// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { handleRouteError } from '@/lib/middleware/errorHandler';

export const dynamic = 'force-dynamic';

export interface SignoutResponse {
  data: {
    message: string;
  } | null;
  error: { message: string; code?: string } | null;
}

export async function POST(req: Request): Promise<NextResponse<SignoutResponse>> {
  try {
    // 1. FIXED: Added 'await' to cleanly unwrap the asynchronous Server Client Promise
    const supabase = await createSupabaseServerClient();
    const requestId = req.headers.get('x-request-id') || undefined;

    // 2. Terminate the active session and flush local HTTP-only cookies cleanly
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Sign out invocation failed: ${error.message}`);
    }

    // 3. Formulate explicit, type-safe API output contracts matching your ApiSuccess format
    const responseBody: SignoutResponse = {
      data: { message: 'Session successfully revoked. You have been signed out.' },
      error: null,
    };

    const response = NextResponse.json<SignoutResponse>(responseBody);

    // 4. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    return handleRouteError(error) as NextResponse<SignoutResponse>;
  }
}