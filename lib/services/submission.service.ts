import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createDomainError } from '@/lib/middleware/errorHandler';
import { limitSubmission } from '@/lib/middleware/rateLimit';
import { audit } from '@/lib/utils/audit';
import { sendSubmissionConfirmation } from './email.service';
import { assertOwnedUploadUrl } from './storage.service';

// Fixed: Import core input validation structures natively from the Zod schema configuration files
import type { Submission, AnonymisedSubmission } from '@/types/api.types';
import type { SubmissionOutput } from '@/lib/validators/submission.schema';

// ─── TRANSACTION COMPLIANCE MUTATIONS ───────────────────────────────────────

/**
 * Creates an anonymous project submission entry for the authenticated competitor.
 * Enforces strict temporal deadlines, entry singletons, and sliding rate limit shields.
 */
export async function createSubmission(
  input: SubmissionOutput, // Fixed: Eradicated loose 'any' typing parameters for exact parsed outputs
  userId: string,
  email: string,
  client?: SupabaseClient<Database>
): Promise<Submission> { // Fixed: Returning standard clean app layer entities instead of leaky raw table rows
  // 1. Explicitly await the sliding window limiter check to block payload spammers
  await limitSubmission(userId, input.sprint_id, 'server-action');

  // URLs are user-controlled request data. Confirm that every asset is in the
  // authenticated user's own storage namespace before recording it.
  assertOwnedUploadUrl(input.main_file_url, userId, false);
  input.process_file_urls.forEach((url) => assertOwnedUploadUrl(url, userId, true));

  // 2. Instantiate server client instance wrapper gracefully
  const supabase = client ?? (await createSupabaseServerClient());

  // 3. Fetch challenge timeline metrics via correct database metadata columns
  const { data: sprint, error: sprintError } = await supabase
    .from('sprints')
    .select('id, sprint_status, close_at')
    .eq('id', input.sprint_id)
    .single();

  if (sprintError || !sprint) {
    throw createDomainError('The targeted competition sprint brief record could not be verified', 404);
  }

  // 4. Assert active lifecycle phase invariants
  if (sprint.sprint_status !== 'live') {
    throw createDomainError('Action rejected: The submission gateway window for this sprint is currently locked', 409);
  }

  if (sprint.close_at && new Date(sprint.close_at) <= new Date()) {
    throw createDomainError('Action rejected: The submission deadline threshold has passed', 409);
  }

  // 5. Pre-flight check (UX Only): Surfaces clean feedback during standard sequential navigation sweeps
  const existingSubmission = await getUserSubmission(input.sprint_id, userId, supabase);
  if (existingSubmission) {
    throw createDomainError('Aborted: You have already delivered an active project entry for this weekly sprint', 409);
  }

  // 6. Execute atomic data insertion row payload
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      sprint_id: input.sprint_id,
      user_id: userId,
      main_file_url: input.main_file_url,
      main_file_type: input.main_file_type,
      process_file_urls: input.process_file_urls,
      brief_interpretation: input.brief_interpretation,
      tools_used: input.tools_used,
      time_spent_hours: input.time_spent_hours,
      note_to_judges: input.note_to_judges ?? null,
      is_disqualified: false,
    })
    .select()
    .single();

  if (error) {
    // Fixed: Catches parallel transaction racing conditions using the PostgreSQL unique violation code
    if (error.code === '23505') {
      throw createDomainError('Conflict exception: Duplicate entry intercepted. You have already submitted to this sprint.', 409);
    }
    throw createDomainError(`Failed to save project delivery to storage engine: ${error.message}`, 500);
  }

  if (!data) {
    throw createDomainError('Data loss exception: Null insertion acknowledgment received from cluster data nodes', 500);
  }

  // 7. Non-blocking asynchronous compliance logging dispatching
  void audit({
    actor_id: userId,
    action: 'submission.created',
    entity_type: 'submission',
    entity_id: data.id,
    metadata: { sprint_id: input.sprint_id },
  });

  // 8. Safely hand off transactional confirmation emails out-of-band with a void operator
  void sendSubmissionConfirmation(email, data.id, input.sprint_id).catch((err: unknown) => {
    console.error('[Submission Recovery Eng] Failed to drop submission confirmation receipt mail notice:', err);
  });

  return data as unknown as Submission;
}

/**
 * Returns the current authenticated participant's submission entry mapping payload.
 */
export async function getUserSubmission(
  sprintId: string,
  userId: string,
  client?: SupabaseClient<Database>
): Promise<Submission | null> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('sprint_id', sprintId)
    .eq('user_id', userId)
    .maybeSingle();

  // Fixed: Escalates structural infrastructure breakdowns rather than masking them as empty results
  if (error) {
    throw createDomainError(`Storage cluster registry extraction failed: ${error.message}`, 500);
  }

  return data as unknown as Submission | null;
}

/**
 * JUDGE INTERFACE GATEWAY ACCESSOR
 * Pulls non-disqualified challenge project artifacts with all identity pointers stripped out.
 * Bypasses RLS configurations securely via service superuser client mapping.
 */
export async function getSubmissionsForJudging(
  sprintId: string
): Promise<AnonymisedSubmission[]> {
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('submissions')
    .select(`
      id,
      sprint_id,
      main_file_url,
      main_file_type,
      process_file_urls,
      brief_interpretation,
      tools_used,
      time_spent_hours,
      note_to_judges,
      submitted_at
    `)
    .eq('sprint_id', sprintId)
    .eq('is_disqualified', false)
    .order('submitted_at', { ascending: true });

  if (error) {
    throw createDomainError(`Judicial inspection lookup query rejected: ${error.message}`, 500);
  }

  const sanitizedSubmissions = (data ?? []) as unknown as AnonymisedSubmission[];

  // Keep this excellent defensive block!
  for (const record of sanitizedSubmissions) {
    if ('user_id' in record || 'username' in record || 'email' in record) {
      throw new Error('[CRITICAL EXCEPTION] Security perimeter breach: Leaked participant properties detected during anonymization checks');
    }
  }

  return sanitizedSubmissions;
}

/**
 * ADMINISTRATIVE CONTROL MANAGEMENT PANELS ACCESSOR
 * Returns raw submission rows for administrative workflows.
 */
export async function getSubmissionsForAdmin(
  sprintId: string
): Promise<Submission[]> {
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('submissions')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('submitted_at', { ascending: true });

  if (error) {
    throw createDomainError(`Administrative submissions analytics retrieval failed: ${error.message}`, 500);
  }

  return (data ?? []) as unknown as Submission[];
}

/**
 * ADMINISTRATIVE MUTATION ROUTINE
 * Marks an entry as disqualified and records the reasoning for compliance monitoring.
 */
export async function disqualifySubmission(
  submissionId: string,
  reason: string,
  adminId: string
): Promise<void> {
  const admin = getSupabaseAdmin();

  const { error, count } = await admin
    .from('submissions')
    .update(
      {
        is_disqualified: true,
        disqualify_reason: reason,
        disqualified_at: new Date().toISOString(),
        disqualified_by: adminId,
      },
      { count: 'exact' }
    )
    .eq('id', submissionId);

  if (error) {
    throw createDomainError(`Disqualification update sequence rejected by database engine: ${error.message}`, 500);
  }

  if (count === 0) {
    throw createDomainError('Disqualification update rejected: Target submission record could not be found', 404);
  }

  void audit({
    actor_id: adminId,
    action: 'submission.disqualified',
    entity_type: 'submission',
    entity_id: submissionId,
    metadata: { reason },
  });
}
