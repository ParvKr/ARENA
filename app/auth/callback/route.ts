import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/database.types';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createProfile } from '@/lib/services/profile.service';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = safeNextPath(requestUrl.searchParams.get('next'));
  const code = requestUrl.searchParams.get('code');
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (!code) return oauthErrorRedirect(requestUrl.origin);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        }),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return oauthErrorRedirect(requestUrl.origin);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return oauthErrorRedirect(requestUrl.origin);

  const { data: existingProfile, error: profileError } = await getSupabaseAdmin()
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) return oauthErrorRedirect(requestUrl.origin);
  if (!existingProfile) {
    await createProfile(user.id, createUsername(user), displayName(user), user.email ?? '');
  }

  return response;
}

function safeNextPath(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/sprint';
}

function oauthErrorRedirect(origin: string): NextResponse {
  return NextResponse.redirect(new URL('/signin?error=oauth_callback', origin));
}

function createUsername(user: { id: string; email?: string; user_metadata: Record<string, unknown> }): string {
  const requested = typeof user.user_metadata.user_name === 'string' ? user.user_metadata.user_name : user.email?.split('@')[0];
  const base = (requested ?? 'competitor').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 11) || 'competitor';
  return `${base}_${user.id.replace(/-/g, '').slice(0, 8)}`.slice(0, 20);
}

function displayName(user: { email?: string; user_metadata: Record<string, unknown> }): string {
  const name = user.user_metadata.full_name ?? user.user_metadata.name ?? user.email?.split('@')[0] ?? 'Arena competitor';
  return String(name).trim().slice(0, 60) || 'Arena competitor';
}
