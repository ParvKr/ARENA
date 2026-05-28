// lib/services/profile.service.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createDomainError } from '@/lib/middleware/errorHandler';
import { audit } from '@/lib/utils/audit';
import { sendWelcomeEmail } from './email.service';
import type { Profile } from '@/types/api.types';

// ─── HARDENED TYPE DEFINITIONS ──────────────────────────────────────────────

export interface SprintHistoryEntry {
  id: string;
  sprint_id: string;
  submitted_at: string;
  main_file_url: string;
  main_file_type: string;
  results: {
    rank: number;
    normalized_score: number;
    points_awarded: number;
  } | null; // Aligned with Single/MaybeSingle relationship schemas
  sprints: {
    sprint_number: number;
    title: string;
    discipline: string;
    sprint_status: string; // Fixed: Aligned with physical DB 'sprint_status' column
  };
}

type MutableProfileUpdate = Partial<
  Omit<Profile, 'user_id' | 'arena_role' | 'rank_tier' | 'total_points'>
>;

// ─── LOCAL STORAGE SANITIZATION UTILITIES ───────────────────────────────────

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

// ─── PUBLIC DATA READ QUERIES ────────────────────────────────────────────────

/**
 * Returns a public profile by username. Throws 404 if not found.
 */
export async function getProfileByUsername(
  username: string,
  client?: SupabaseClient<Database> // Fixed: Using explicit SupabaseClient type signatures
): Promise<Profile> {
  const supabase = client ?? (await createSupabaseServerClient());
  const normalizedUsername = normalizeUsername(username);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', normalizedUsername)
    .single();

  if (error || !data) {
    throw createDomainError('Profile record not found matching requested username', 404);
  }

  return data as Profile;
}

/**
 * Returns a profile by its matching user_id primary key. Throws 404 if not found.
 */
export async function getProfileById(
  userId: string,
  client?: SupabaseClient<Database>
): Promise<Profile> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw createDomainError('Profile record not found matching requested user identifier', 404);
  }

  return data as Profile;
}

/**
 * Checks if a username is available (case-insensitive lookup matching database constraints).
 */
export async function isUsernameAvailable(
  username: string,
  client?: SupabaseClient<Database>
): Promise<boolean> {
  const supabase = client ?? (await createSupabaseServerClient());
  const normalizedUsername = normalizeUsername(username);

  /*
   * FIXED: Run query using case-insensitive match (.ilike) to match database constraints.
   * This intercepts mixed-case inputs like "Parv01" or "parv01" identically.
   */
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', normalizedUsername)
    .maybeSingle();

  // FIXED: Propagate real database connection errors down to the error middleware handlers instead of swallowing them
  if (error) {
    throw createDomainError(`Database identification operation failure: ${error.message}`, 500);
  }

  // If no duplicate row data object comes back, the username handle is clear for use!
  return !data;
}

// ─── TRANSACTION MUTATIONS LAYER ────────────────────────────────────────────

/**
 * Creates a public participant profile layer following an authentication signup event.
 * Handles atomic unique violations gracefully to prevent user onboarding race conditions.
 */
export async function createProfile(
  userId: string,
  username: string,
  displayName: string,
  email: string
): Promise<Profile> {
  const cleanUsername = normalizeUsername(username);
  const cleanDisplayName = displayName.trim();

  // Preemptive Security Checks: Shield storage fields from garbage text or whitespace bypassing
  if (cleanUsername.length < 3) {
    throw createDomainError('Username validation failed: minimum length requirements not satisfied', 400);
  }

  if (!cleanDisplayName) { // Fixed: Security check rejects empty names
    throw createDomainError('Display name configuration parameter cannot be left blank', 400);
  }

  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('profiles')
    .insert({
      user_id: userId,
      username: cleanUsername,
      display_name: cleanDisplayName,
      arena_role: 'competitor',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw createDomainError('Onboarding conflict: This requested username is already registered', 409);
    }
    throw createDomainError(`Failed to establish user profile: ${error.message}`, 500);
  }

  if (!data) {
    throw createDomainError('Profile creation failed: empty initialization response received from storage engine', 500);
  }

  void audit({
    actor_id: userId,
    action: 'profile.created',
    entity_type: 'profile',
    entity_id: userId,
    metadata: { username: cleanUsername },
  });

  void sendWelcomeEmail(email, cleanUsername).catch((err: unknown) => {
    console.error('[Profile Service Recovery] Failed to dispatch onboarding welcome notice message:', err);
  });

  return data as Profile;
}

/**
 * Updates a profile's editable metadata fields.
 * Restricted to the authenticated profile owner.
 */
export async function updateProfile(
  userId: string,
  updates: MutableProfileUpdate, // Type safety enforced via strict update interface
  client?: SupabaseClient<Database>
): Promise<Profile> {
  const supabase = client ?? (await createSupabaseServerClient());

  // Fixed: Defensively copied updates without unsafe 'as any' casts
  const sanitizedUpdates: MutableProfileUpdate = { ...updates };
  const { data, error } = await supabase
    .from('profiles')
    .update(sanitizedUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    throw createDomainError(`Profile metadata modification rejected: ${error?.message ?? 'Unknown Exception'}`, 500);
  }

  return data as Profile;
}

/**
 * Returns a user's full Sprint submission and placement history records catalog.
 */
export async function getSprintHistory(
  userId: string,
  client?: SupabaseClient<Database>
): Promise<SprintHistoryEntry[]> { // Fixed: Swapped generic types out for explicit schema entries
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      sprint_id,
      submitted_at,
      main_file_url,
      main_file_type,
      results (
        rank,
        normalized_score,
        points_awarded
      ),
      sprints!inner (
        sprint_number,
        title,
        discipline,
        sprint_status
      )
    `) // Fixed: Changed 'status' mapping token to match table-level 'sprint_status'
    .eq('user_id', userId)
    .eq('is_disqualified', false)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw createDomainError(`Failed to fetch historic sprint participation data: ${error.message}`, 500);
  }

  return (data ?? []) as unknown as SprintHistoryEntry[];
}
