import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createDomainError } from '@/lib/middleware/errorHandler';
import { audit } from '@/lib/utils/audit';
import { sendBriefDropEmail } from './email.service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import {
  isSprintStatus,
  type Sprint,
} from '@/types/api.types';
import type { CreateSprintInput } from '@/lib/validators/sprint.schema';

// ─── PUBLIC DATA READ QUERIES ────────────────────────────────────────────────

/**
 * Returns the currently active sprint (status = 'live').
 * Returns null if no sprint is currently live.
 */
export async function getCurrentSprint(
  client?: SupabaseClient<Database>
): Promise<Sprint | null> {

  const supabase = client ?? await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('sprint_status', 'live')
    .order('open_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw createDomainError(
      `Failed to fetch current sprint: ${error.message}`,
      500
    );
  }

  if (data && !isSprintStatus(data.sprint_status)) {
    throw createDomainError(
      'Invalid sprint status received from database',
      500
    );
  }

  return data as Sprint | null;
}

/**
 * Returns a sprint by ID. Throws 404 if not found.
 */
export async function getSprintById(sprintId: string, client?: SupabaseClient<Database>): Promise<Sprint> {
  const supabase = client ?? await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('id', sprintId)
    .single();

  if (error || !data) {
    throw createDomainError('Sprint target record not found', 404);
  }

  if (!isSprintStatus(data.sprint_status)) {
    throw createDomainError(
      'Invalid sprint status received from database',
      500
    );
  }

  return data as Sprint;
}

/**
 * Returns all completed sprints for the archive gallery layout page.
 */
export async function getCompletedSprints(client?: SupabaseClient<Database>): Promise<Sprint[]> {
  const supabase = client ?? await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('sprints')
    .select(`
      id,
      sprint_number,
      title,
      discipline,
      sprint_status,
      open_at,
      close_at,
      results_at
    `)
    .eq('sprint_status', 'complete')
    .order('sprint_number', { ascending: false });

  if (error) {
    throw createDomainError('Failed to fetch historical sprints catalog archive', 500);
  }

  return (data ?? []) as Sprint[];
}

/**
 * Returns the live entry submissions count total recorded for a sprint.
 */
export async function getEntryCount(sprintId: string, client?: SupabaseClient<Database>): Promise<number> {
  const supabase = client ?? await createSupabaseServerClient();

  const { data, error } = await supabase.rpc(
    'get_sprint_entry_count',
    { p_sprint_id: sprintId }
  );

  if (error) {
    throw createDomainError(`Failed to fetch real-time entry count: ${error.message}`, 500);
  }

  return data ?? 0;
}

/**
 * Checks if the submission window is currently open for a sprint.
 */
export async function isSubmissionOpen(sprintId: string, client?: SupabaseClient<Database>): Promise<boolean> {
  const supabase = client ?? await createSupabaseServerClient();

  const { data } = await supabase
    .from('sprints')
    .select('sprint_status, close_at')
    .eq('id', sprintId)
    .single();

  if (!data) return false;

    return (
    data.sprint_status === 'live' &&
    data.close_at !== null &&
    new Date(data.close_at).getTime() > Date.now()
    );
}

// ─── ADMINISTRATIVE TRANSITION MUTATIONS ────────────────────────────────────

/**
 * Creates a new sprint in 'draft' status.
 * Admin only.
 */
export async function createSprint(input: CreateSprintInput, adminId: string): Promise<Sprint> {
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('sprints')
    .insert({
      sprint_number: input.sprint_number,
      title: input.title,
      discipline: input.discipline,
      brief_content: input.brief_content,
      prize_data: input.prize_data,
      sprint_status: 'draft',
      open_at: input.open_at,
      close_at: input.close_at,
      results_at: input.results_at,
      created_by: adminId,
    })
    .select()
    .single();

  if (error || !data) {
    throw createDomainError(`Failed to establish sprint record: ${error?.message}`, 500);
  }

  // Explicitly use void to safely mark this out-of-band promise for ESLint
  void audit({
    actor_id: adminId,
    action: 'sprint.created',
    entity_type: 'sprint',
    entity_id: data.id,
    metadata: {
      sprint_number: data.sprint_number,
      title: data.title,
    },
  });
  if(!isSprintStatus(data.sprint_status)) {
  throw createDomainError(
    'Invalid sprint status received from database',
    500
  );
}

return data as Sprint;
}

/**
 * Publishes a sprint.
 * draft → live state change only. Guarantees safety against multiple active live tracks.
 */
export async function publishSprint(sprintId: string, adminId: string): Promise<void> {
  const admin = getSupabaseAdmin();

  // 1. Preemptive Check: Enforce platform single-live invariant rule
  const { data: activeLiveSprint } = await admin
    .from('sprints')
    .select('id, sprint_number')
    .eq('sprint_status', 'live')
    .limit(1)
    .maybeSingle();

  if (activeLiveSprint) {
    throw createDomainError(
      `State invariant breach: Cannot publish this sprint because Sprint #${activeLiveSprint.sprint_number} is currently active and live. Close that record first.`,
      409
    );
  }

  // 2. Fetch targeted sprint to verify current lifecycle state
  const { data: sprint } = await admin
    .from('sprints')
    .select('sprint_status, sprint_number')
    .eq('id', sprintId)
    .single();

  if (!sprint) {
    throw createDomainError('Targeted sprint record could not be found', 404);
  }

  if (sprint.sprint_status !== 'draft') {
    throw createDomainError(`Invalid state transition: Cannot activate a sprint marked as '${sprint.sprint_status}'`, 409);
  }

  // 3. Perform state modification
  const { error, count } = await admin
    .from('sprints')
    .update({ sprint_status: 'live' }, { count: 'exact' })
    .eq('id', sprintId)
    .eq('sprint_status', 'draft');

  if (error || count === 0) {
    throw createDomainError(`State mutation rejected or preempted by parallel transaction processing request`, 500);
  }

  // Fixed: Added explicit metadata object and void operator for floating promise resolution
  void audit({
    actor_id: adminId,
    action: 'sprint.published',
    entity_type: 'sprint',
    entity_id: sprintId,
    metadata: {},
  });

  // Trigger dispatching email queues non-blockingly
  void sendBriefDropEmail(sprintId).catch((err: unknown) => {
    console.error('[Sprint Service Recovery] Failed to dispatch challenge notice emails:', err);
  });
}

/**
 * Closes an active sprint and moves it to evaluation tracking.
 * live → judging state change.
 */
export async function closeSprint(sprintId: string, adminId: string): Promise<void> {
  const admin = getSupabaseAdmin();

  const { error, count } = await admin
    .from('sprints')
    .update({ sprint_status: 'judging' }, { count: 'exact' })
    .eq('id', sprintId)
    .eq('sprint_status', 'live');

  if (error) {
    throw createDomainError(`Failed to close active window: ${error.message}`, 500);
  }

  if (count === 0) {
    throw createDomainError('Action rejected: Sprint is not active or has already transitioned out of the live window', 409);
  }

  // Fixed: Added explicit metadata object and void operator for floating promise resolution
  void audit({
    actor_id: adminId,
    action: 'sprint.closed',
    entity_type: 'sprint',
    entity_id: sprintId,
    metadata: {},
  });
}
