// components/AuthProvider.tsx
// Bootstraps Supabase auth into Zustand on the client.
// This is the only place setUser is called — everything else reads from the store.
'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useArenaStore } from '@/lib/store';
import type { Profile } from '@/types/api.types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useArenaStore((state) => state.setUser);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // ── 1. Fetch profile row for a given auth user id ──────────────────────
    async function loadProfile(userId: string): Promise<void> {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Profile may not exist yet (e.g. mid-signup); silently clear.
        setUser(null);
        return;
      }

      setUser(data as Profile);
    }

    // ── 2. Check existing session on mount ─────────────────────────────────
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    // ── 3. Subscribe to future changes (sign-in, sign-out, token refresh) ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}
