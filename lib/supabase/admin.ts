// =========================================
// ARENA V0.1P SUPABASE BYPASS ADMIN CLIENT
// lib/supabase/admin.ts
// =========================================

import 'server-only'; // Enforce strict server-only boundaries at compile time
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

// Declare global namespace tracker to prevent connection socket exhaustion during local dev hot-reloads
const globalForSupabaseAdmin = globalThis as unknown as {
  _adminClient: ReturnType<typeof createClient<Database>> | undefined;
};

// WARNING: Service-role client bypasses all RLS protections.
// Server-only usage required.

export function getSupabaseAdmin() {
  // Pin client initialization to globalThis container workspace
  if (!globalForSupabaseAdmin._adminClient) {
    // FIXED: Swapped out frontend-exposed variables to enforce total backend trust boundary isolation
    const url = process.env.SUPABASE_URL; 
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'CRITICAL INFRASTRUCTURE ERROR: Missing administrative credentials. Verify your server-side environment configurations.'
      );
    }

    globalForSupabaseAdmin._adminClient = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false, // Bypasses background polling token overhead leaks
        persistSession: false,   // Restricts instance to be completely stateless inside Server Actions
      },
    });
  }

  return globalForSupabaseAdmin._adminClient;
}