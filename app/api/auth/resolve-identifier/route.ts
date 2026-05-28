// app/api/auth/resolve-identifier/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin'; // Administrative superuser token instance
import { handleRouteError } from '@/lib/middleware/errorHandler';
import { z } from 'zod';

const ResolveSchema = z.object({
  identifier: z.string().min(3).max(50),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { identifier } = ResolveSchema.parse(body);

    const admin = getSupabaseAdmin();

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('user_id')
      .eq('username', identifier)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Handle resolution mapping failed.' },
        { status: 404 }
      );
    }

    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(profile.user_id);

    if (userError || !userData?.user?.email) {
      return NextResponse.json(
        { error: 'Profile authorization path unresolvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { email: userData.user.email },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}