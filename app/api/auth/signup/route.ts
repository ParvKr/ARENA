// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { limitSignup } from '@/lib/middleware/rateLimit';
import { createProfile } from '@/lib/services/profile.service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  display_name: z.string().min(2).max(60),
});

export interface SignupResponse {
  data: {
    message: string;
  } | null;
  error: { message: string; code?: string } | null;
}

export async function POST(req: Request): Promise<NextResponse<SignupResponse>> {
  const admin = getSupabaseAdmin();

  try {
    // 1. Extract and sanitize client network IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
                     
    const requestId = req.headers.get('x-request-id') || undefined;

    // 2. Await the fail-closed sliding window rate limiter block explicitly
    await limitSignup(clientIp, requestId);

    // 3. Consume and validate the incoming registration payload
    const body = await req.json();
    const input = SignupSchema.parse(body);

    // 4. Create the Supabase Authentication Account via the superuser client
    const { data: { user }, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true, 
    });

    if (authError || !user) {
      if (authError?.message?.includes('already registered') || authError?.status === 422) {
        return NextResponse.json<SignupResponse>(
          { 
            data: null, 
            error: { message: 'Email address is already registered to another account.', code: 'EMAIL_EXISTS' } 
          },
          { status: 409 }
        );
      }
      throw new Error(`Auth credential generation failed: ${authError?.message}`);
    }

    // 5. Create the user profile row within the public database schema
    try {
      await createProfile(user.id, input.username, input.display_name, input.email);
    } catch (profileError: unknown) {
      // 6. Transactional Compensation: Clean up orphan credentials if profile creation crashes
      console.error(`[CRITICAL_TRANSACTION_ROLLBACK]: Profile record mapping failed. Triggering deletion of orphan auth user ${user.id}.`);
      
      // Fixed: References 'user.id' natively in the block local scope to clean up variables completely
      await admin.auth.admin.deleteUser(user.id).catch((cleanupErr) => {
        console.error(`[COMPENSATION_FAILURE]: Failed to clean up orphan account ${user.id}:`, cleanupErr);
      });
      
      throw profileError; 
    }

    // 7. Formulate explicit, type-safe API output contracts matching your ApiSuccess format
    const responseBody: SignupResponse = {
      data: { message: 'Account successfully initialized. You can now securely log into the Arena.' },
      error: null,
    };

    const response = NextResponse.json<SignupResponse>(responseBody, { status: 201 });

    // 8. Cache-Control Hardening
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    if (requestId) {
      response.headers.set('x-request-id', requestId);
    }

    return response;

  } catch (error) {
    // 9. Catch and handle unexpected catastrophic errors dynamically
    return handleRouteError(error) as NextResponse<SignupResponse>;
  }
}