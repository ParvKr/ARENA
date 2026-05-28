// lib/middleware/auth.ts
// requireAuth() — call at the start of any authenticated API route
// Enforces rigid compile-time contracts, zero-knowledge error outputs, and immutable tuples.

import { createSupabaseServerClient } from '../supabase/server';
import type { User } from '@supabase/supabase-js';
import type { ArenaRole } from '../../types/api.types';

const VALID_ROLES = ['competitor', 'judge', 'admin'] as const;
type ValidRole = typeof VALID_ROLES[number];

export class AuthError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message = 'Authentication required', status = 401, code = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Extracts and validates the authenticated user from the current request session.
 * Throws AuthError (401) if no valid session exists.
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('No valid session found. Please sign in.', 401, 'UNAUTHORIZED');
  }

  return user;
}

/**
 * Validates session presence and checks authorization claims inside the secure JWT app_metadata.
 * Avoids network latency by executing entirely in memory.
 * Throws AuthError (403) with a zero-knowledge message if validation fails.
 */
export async function requireSessionRole(allowedRoles: ArenaRole[]): Promise<User> {
  const user = await requireAuth();
  const userRole = user.app_metadata?.arena_role;

  // Guard 1: Enforce explicit configuration (Fail Closed)
  if (!userRole) {
    console.error(`[AUTH_SECURITY_FAILURE]: Role missing in JWT for user ${user.id}`);
    throw new AuthError('Access denied.', 403, 'ROLE_NOT_ASSIGNED');
  }

  // Guard 2: Enforce runtime data integrity against corrupted token claims
  if (!VALID_ROLES.includes(userRole as ValidRole)) {
    console.error(`[AUTH_SECURITY_CORRUPTION]: Invalid signature "${userRole}" found in JWT for user ${user.id}`);
    throw new AuthError('Access denied.', 403, 'INVALID_ROLE_CONFIG');
  }

  const validatedRole = userRole as ArenaRole;

  // Guard 3: Enforce strict operational routing privileges cleanly
  if (!allowedRoles.includes(validatedRole)) {
    console.warn(`[AUTH_FORBIDDEN]: User ${user.id} (${validatedRole}) attempted access requiring: [${allowedRoles.join(', ')}]`);
    throw new AuthError('Access denied.', 403, 'FORBIDDEN');
  }

  return user;
}

/**
 * Gets the authenticated user without throwing. Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<User | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}