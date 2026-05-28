// lib/services/judging.service.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createDomainError } from '@/lib/middleware/errorHandler';
import { limitScoring } from '@/lib/middleware/rateLimit';
import { audit } from '@/lib/utils/audit';
import type { JudgingAssignment, Score } from '@/types/api.types';
import type { ScoreOutput } from '@/lib/validators/judging.schema';

/**
 * Returns the judge's assignment for a specific sprint.
 * Throws 403 if the judge is not assigned to this sprint.
 */
export async function getJudgingAssignment(
  sprintId: string,
  judgeId: string
): Promise<JudgingAssignment> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('judging_assignments')
    .select('*')
    .eq('sprint_id', sprintId)
    .eq('judge_user_id', judgeId)
    .single();

  if (error || !data) {
    throw createDomainError('You are not assigned to judge this sprint', 403);
  }

  return data;
}

/**
 * Returns judge progress: how many entries scored vs total.
 */
export async function getJudgeProgress(
  sprintId: string,
  judgeId: string
): Promise<{ scored: number; total: number }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc('get_judge_progress', { p_sprint_id: sprintId, p_judge_id: judgeId });

  if (error || !data) {
    throw createDomainError('Failed to fetch judge progress', 500);
  }

  const progress = Array.isArray(data) ? data[0] : data;

  return {
    scored: progress?.scored ?? 0,
    total: progress?.total ?? 0,
  };
}

/**
 * Saves or updates a judge's score for a submission.
 * Blocked if the judge has already marked their evaluation complete for this sprint.
 */
export async function saveScore(
  input: ScoreOutput,
  sprintId: string, // Enforce strict contextual isolation bounds
  judgeId: string
): Promise<Score> {
  // 1. Await async rate-limiting check to prevent edge network bypasses
  await limitScoring(judgeId, 'server-action');
  
  const supabase = await createSupabaseServerClient();
  const admin = getSupabaseAdmin();

  // 2. Guard: Validate that the submission actually belongs to this specific sprint context
  const { data: submission, error: subError } = await admin
    .from('submissions')
    .select('id')
    .eq('id', input.submission_id)
    .eq('sprint_id', sprintId)
    .single();

  if (subError || !submission) {
    throw createDomainError('Malicious or forged transaction detected: Submission does not belong to this sprint.', 400);
  }

  // 3. Guard: Ensure this judge's evaluation for this specific sprint is not finalized
  const { data: assignment, error: assignmentError } = await supabase
    .from('judging_assignments')
    .select('is_complete')
    .eq('sprint_id', sprintId)
    .eq('judge_user_id', judgeId)
    .single();

  if (assignmentError || !assignment) {
    throw createDomainError('No valid assignment parameters found for this active user context.', 403);
  }

  if (assignment.is_complete) {
    throw createDomainError(
      'Your evaluation is already submitted. Scores are now immutable for this sprint.',
      409
    );
  } 

  // 4. Upsert: Save or update score utilizing corrected, space-free multi-column index parameters
const { data, error } = await supabase
  .from('scores')
  .upsert(
    {
      submission_id: input.submission_id,
      judge_user_id: judgeId,

      concept_score: input.concept_score,
      craft_score: input.craft_score,
      adherence_score: input.adherence_score,
      originality_score: input.originality_score,
      impact_score: input.impact_score,

      feedback: input.comment,
    },
    {
      onConflict: 'submission_id,judge_user_id',
    }
  )
  .select()
  .single();

  if (error || !data) {
    throw createDomainError(`Failed to save score execution: ${error?.message}`, 500);
  }

  return data;
} 

/**
 * Marks a judge's evaluation as complete. Scores become immutable.
 * Validates all entries in the sprint have been scored.
 */
export async function completeEvaluation(
  sprintId: string,
  judgeId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Validate: all entries must be scored
  const progress = await getJudgeProgress(sprintId, judgeId);
  if (progress.scored < progress.total || progress.total === 0) {
    throw createDomainError(
      `You have only scored ${progress.scored} of ${progress.total} entries. Score all entries before submitting.`,
      409
    );
  }

  const { error } = await supabase
    .from('judging_assignments')
    .update({
      is_complete: true,
      completed_at: new Date().toISOString(),
    })
    .eq('sprint_id', sprintId)
    .eq('judge_user_id', judgeId);

  if (error) throw createDomainError(`Failed to complete evaluation: ${error.message}`, 500);

  // Void expression applied to make audit tracking cleanly fire-and-forget
  void audit({
    actor_id: judgeId,
    action: 'judge.evaluation_complete',
    entity_type: 'judge',
    entity_id: judgeId,
    metadata: { scored: progress.scored, total: progress.total },
  });
} 

/**
 * ADMIN: Assigns a judge to a sprint.
 * Validates that the targeted user account is a verified system judge.
 */
export async function assignJudge(
  sprintId: string,
  judgeId: string,
  adminId: string
): Promise<void> {
  const admin = getSupabaseAdmin();

  // 1. Guard: Validate destination user role credentials prior to table insertion
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('arena_role')
    .eq('user_id', judgeId)
    .single();

  if (profileError || !profile) {
    throw createDomainError('Targeted user configuration row could not be found.', 404);
  }

  if (profile.arena_role !== 'judge') {
    throw createDomainError('Privilege assignment exception: Only certified users can be assigned as judges.', 400);
  }

  // 2. Insert assignment parameters safely
  const { error } = await admin
    .from('judging_assignments')
    .insert({ sprint_id: sprintId, judge_user_id: judgeId });

  if (error) {
    if (error.code === '23505') { 
      throw createDomainError('This judge is already assigned to this sprint', 409);
    }
    throw createDomainError(`Failed to assign judge: ${error.message}`, 500);
  }

  void audit({
    actor_id: adminId,
    action: 'judge.assigned',
    entity_type: 'judge',
    entity_id: judgeId,
    metadata: { sprint_id: sprintId },
  });
} 

/**
 * ADMIN: Checks if all assigned judges have completed evaluation.
 */
export async function allJudgesComplete(sprintId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .rpc('check_all_judges_complete', { p_sprint_id: sprintId });

  if (error) throw createDomainError('Failed to check judge completion status', 500);

  return data === true;
}

