// =========================================
// ARENA V0.1P SUPABASE INTERACTIVE CLIENT
// lib/supabase/client.ts
// =========================================

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../../types/database.types'; // Synchronized path lookup

// Module-level singleton container to prevent multi-instance connection exhaustion inside browser memory loops
let _clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Returns a secure client-side browser client using public environment tokens.
 * Safe to import and invoke across interactive components and React Hooks.
 * Respects all active Row-Level Security (RLS) constraints.
 */
export function createSupabaseBrowserClient() {
  if (!_clientInstance) {
    // Defensive environment injection boundary check
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        'CLIENT INITIALIZATION FAILURE: Missing public environment tokens. Check your client-facing environment config mappings.'
      );
    }

    _clientInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return _clientInstance;
}