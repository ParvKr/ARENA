// lib/middleware/roles.ts
// requireProfileRole() — call when you need the verified, real-time database row data
// Enforces sharp whitelist parameter projections and eliminates runtime type assertions.

import { createSupabaseServerClient } from '../supabase/server';
import type { Profile, ArenaRole } from '../../types/api.types';

// Strict projection block mapping to avoid selecting * database parameters
const PROFILE_WHITELIST_PROJECTION = 'user_id, username, display_name, bio, avatar_url, arena_role, rank_tier, total_points, sprint_count, created_at, updated_at' as const;

export class RoleError extends Error {
  readonly status = 403;
  readonly code = 'FORBIDDEN';

  constructor(message = 'Access denied.') {
    super(message);
    this.name = 'RoleError';
  }
}

/**
 * Checks that the authenticated user profile has the required role clearance inside the database.
 * Admin role automatically passes all operational role validation checks.
 * Throws RoleError (403) with zero-knowledge messages on failure.
 * @returns Fully populated Profile record from the database using a safe, explicit type overlay
 */
export async function requireProfileRole(userId: string, requiredRole: ArenaRole): Promise<Profile> {
  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase
  .from('profiles')
  .select(PROFILE_WHITELIST_PROJECTION)
  .eq('user_id', userId)
  .single()
  .overrideTypes<Profile>();

  if (error || !profile) {
    console.error(`[ROLE_SECURITY_FAILURE]: Profile lookup failed or missing fields for user_id: ${userId}`);
    throw new RoleError('Access denied. Account configuration issue detected.');
  }

  // Admin bypasses all structural role boundaries natively
  if (profile.arena_role === 'admin') return profile;

  if (profile.arena_role !== requiredRole) {
    console.warn(`[ROLE_FORBIDDEN]: User ${userId} (${profile.arena_role}) attempted access requiring privilege: '${requiredRole}'`);
    throw new RoleError('Access denied.');
  }

  return profile;
}

/**
 * Gets the user profile record seamlessly using explicit whitelist fields without throwing execution exceptions.
 * Returns null if the target profile does not exist or fails connectivity sweeps.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_WHITELIST_PROJECTION)
    .eq('user_id', userId)
    .single()
    .overrideTypes<Profile>();

    if (error) return null;
    return data;
  } catch (err) {
    console.error(`[PROFILE_FETCH_EXCEPTION]: Unexpected failure reading profile for user ${userId}`, err);
    return null;
  }
}