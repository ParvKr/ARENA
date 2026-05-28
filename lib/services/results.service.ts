import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createDomainError } from '@/lib/middleware/errorHandler';
import { computeRankings } from '@/lib/utils/scoring';
import { audit } from '@/lib/utils/audit';
import { sendResultsNotification } from './email.service';

// ─── EXTENDED DATABASE TYPE SHIELD FOR EXTENSION RPCs ───────────────────────
// Extends the auto-generated types to include our custom pipeline functions
type ExtendedDatabase = Database & {
  public: {
    Functions: {
      execute_sprint_publication_pipeline: {
        Args: {
          p_sprint_id: string;
          p_published_at: string;
        };
        Returns: unknown;
      };
      get_emails_for_users_list: {
        Args: {
          p_user_ids: string[];
        };
        Returns: Array<{ user_id: string; email: string }>;
      };
    };
  };
};

// ─── PRODUCTION TYPE PROJECTIONS & DATA VIEWS ───────────────────────────────
export interface RawScoreJoinPayload {
  submission_id: string;
  concept_score: number;
  craft_score: number;
  adherence_score: number;
  originality_score: number;
  impact_score: number;
  judge_user_id: string;
  submissions: {
    id: string;
    sprint_id: string;
    is_disqualified: boolean;
  } | null;
}

export interface NotificationResultRecord {
  rank: number;
  submissions: {
    user_id: string;
  } | null;
}

export interface PublishedResultView {
  sprint_id: string;
  submission_id: string;
  rank: number;
  normalized_score: number; // Synchronized: Spelled with 'z' to match database row row signatures
  points_awarded: number;
  published_at: string | null;
  submissions: {
    user_id: string;
    main_file_url: string;
    main_file_type: string;
    brief_interpretation: string;
    tools_used: string;
    profiles: {
      username: string;
      display_name: string;
      avatar_url: string | null;
      rank_tier: string;
    } | null;
  } | null;
}

// Helper factory to provide an administrative client casted to our Extended schema safely
function getExtendedAdminClient() {
  return getSupabaseAdmin() as unknown as SupabaseClient<ExtendedDatabase>;
}

// ─── COMPILATION RUNTIME UTILITIES ──────────────────────────────────────────

/**
 * Computes result rankings from all completed judge evaluations.
 * Idempotent: Safe to invoke multiple times (performs upsert updates).
 */
export async function computeResults(sprintId: string): Promise<void> {
  const admin = getExtendedAdminClient(); // Safely typed client context hook

  const { data: rawScores, error: scoresError } = await admin
    .from('scores')
    .select(`
      submission_id,
      concept_score,
      craft_score,
      adherence_score,
      originality_score,
      impact_score,
      judge_user_id,
      submissions!inner (
        id,
        sprint_id,
        is_disqualified
      )
    `)
    .eq('submissions.sprint_id', sprintId)
    .eq('submissions.is_disqualified', false);

  if (scoresError) {
    throw createDomainError(`Failed to aggregate score maps: ${scoresError.message}`, 500);
  }

  if (!rawScores || rawScores.length === 0) {
    throw createDomainError('Action aborted: No valid scores discovered for this active challenge', 409);
  } 

  const typedScores = rawScores as unknown as RawScoreJoinPayload[];

  const scoreMap = new Map<string, RawScoreJoinPayload[]>();
  for (const score of typedScores) {
    const existing = scoreMap.get(score.submission_id) ?? [];
    scoreMap.set(score.submission_id, [...existing, score]);
  }

const groups = [...scoreMap.entries()].map(
  ([submission_id, scs]) => ({
    submission_id,
    scores: scs.map(score => ({
      submission_id: score.submission_id,
      concept_score: score.concept_score,
      craft_score: score.craft_score,
      adherence_score: score.adherence_score,
      originality_score: score.originality_score,
      impact_score: score.impact_score,
      judge_user_id: score.judge_user_id,

      // synthetic filler fields for Score compatibility
      id: crypto.randomUUID(),
      feedback: null,
      raw_total_score: null,
      scored_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  })
);

  const rankings = computeRankings(groups);

  const resultRows = rankings.map(r => ({
    sprint_id: sprintId,
    submission_id: r.submission_id,
    rank: r.rank,
    normalized_score: r.normalised_score, // Fixed: Corrected alignment directly to 'normalized_score' database column
    points_awarded: r.points_awarded,
    published_at: null,
  }));

  const { error: insertError } = await admin
    .from('results')
    .upsert(resultRows, { onConflict: 'sprint_id,submission_id' });

  if (insertError) {
    throw createDomainError(`Failed to save computed leaderboard matrix: ${insertError.message}`, 500);
  }

  void audit({
    actor_id: null,
    action: 'sprint.results_computed',
    entity_type: 'sprint',
    entity_id: sprintId,
    metadata: { entry_count: rankings.length },
  });
}

/**
 * Publicizes calculated sprint results.
 * Atomically locks down results dates and advances the global profile rank tiers.
 */
export async function publishResults(sprintId: string, adminId: string): Promise<void> {
  const admin = getExtendedAdminClient();

  const { count, error: countError } = await admin
    .from('results')
    .select('submission_id', { count: 'exact', head: true })
    .eq('sprint_id', sprintId)
    .is('published_at', null);

  if (countError || !count || count === 0) {
    throw createDomainError('Action rejected: No computed draft results found for this sprint ID', 409);
  }

  const nowTimestamp = new Date().toISOString();

  // Fixed: Compiles perfectly now that types are extended in our ExtendedDatabase interface definition
  const { error: transactionRpcError } = await admin.rpc('execute_sprint_publication_pipeline', {
    p_sprint_id: sprintId,
    p_published_at: nowTimestamp
  });

  if (transactionRpcError) {
    throw createDomainError(`Database publication transaction rejected: ${transactionRpcError.message}`, 500);
  }

  void audit({
    actor_id: adminId,
    action: 'sprint.results_published',
    entity_type: 'sprint',
    entity_id: sprintId,
    metadata: {},
  });

  void sendResultsEmails(sprintId).catch((err: unknown) => {
    console.error('[CRITICAL SEVERITY RECOVERY] Notification mail thread pool crashed:', err);
  });
}

/**
 * Returns published results for a sprint (Public Accessor API Layout).
 */
export async function getPublishedResults(
  sprintId: string,
  client?: SupabaseClient<Database>
): Promise<PublishedResultView[]> {
  const supabase = client ?? getSupabaseAdmin();

  const { data, error } = await supabase
    .from('results')
    .select(`
      sprint_id,
      submission_id,
      rank,
      normalized_score,
      points_awarded,
      published_at,
      submissions!inner (
        user_id,
        main_file_url,
        main_file_type,
        brief_interpretation,
        tools_used
      )
    `)
    .eq('sprint_id', sprintId)
    .not('published_at', 'is', null)
    .order('rank', { ascending: true });

  if (error) {
    throw createDomainError(`Failed to fetch finalized historical sprint results: ${error.message}`, 500);
  }

  const resultRows = (data ?? []) as unknown as PublishedResultView[];
  const userIds = [
    ...new Set(
      resultRows
        .map((result) => result.submissions?.user_id)
        .filter((userId): userId is string => !!userId)
    ),
  ];

  if (userIds.length === 0) {
    return resultRows;
  }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, avatar_url, rank_tier')
    .in('user_id', userIds);

  if (profileError) {
    throw createDomainError(`Failed to fetch finalized result profiles: ${profileError.message}`, 500);
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile])
  );

  return resultRows.map((result) => ({
    ...result,
    submissions: result.submissions
      ? {
          ...result.submissions,
          profiles: profileMap.get(result.submissions.user_id) ?? null,
        }
      : null,
  }));
}

// ─── SAFE NON-BLOCKING BACKGROUND DISPATCH CHANNELS ─────────────────────────

/**
 * Distributes scored results notifications to all participants.
 */
async function sendResultsEmails(sprintId: string): Promise<void> {
  const admin = getExtendedAdminClient();

  const { data: records, error } = await admin
    .from('results')
    .select(`
      rank,
      submissions!inner (
        user_id
      )
    `)
    .eq('sprint_id', sprintId)
    .not('published_at', 'is', null);

  if (error || !records || records.length === 0) return;

  const typedRecords = records as unknown as NotificationResultRecord[];
  const userIds = typedRecords.map(r => r.submissions?.user_id).filter((id): id is string => !!id);

  // Fixed: Compiles perfectly now that types are extended in our ExtendedDatabase interface definition
  const { data: userEmailMap, error: emailFetchError } = await admin.rpc('get_emails_for_users_list', {
    p_user_ids: userIds
  });

  if (emailFetchError || !userEmailMap) {
    console.error(`[MAIL RECOVERY ENGINE] Failed to fetch participant address matrix: ${emailFetchError?.message}`);
    return;
  }

  const emailDirectory = new Map<string, string>();
  for (const entry of userEmailMap) {
    emailDirectory.set(entry.user_id, entry.email);
  }

  const deliveryPromises = typedRecords.map(async (record) => {
    const currentUserId = record.submissions?.user_id;
    if (!currentUserId) return;

    const targetEmail = emailDirectory.get(currentUserId);
    if (!targetEmail) return;

    try {
      await sendResultsNotification(targetEmail, record.rank, sprintId);
    } catch (loopMailError: unknown) {
      const msg = loopMailError instanceof Error ? loopMailError.message : 'Provider Timeout';
      console.error(`[TELEMETRY DROP] Failed to send email to client user: ${currentUserId}. Exception: ${msg}`);
    }
  });

  await Promise.allSettled(deliveryPromises);
}
