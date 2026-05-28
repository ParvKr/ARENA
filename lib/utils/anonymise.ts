import type { Submission, AnonymisedSubmission } from '@/types/api.types';

// Every field that must never appear in a judge-facing response
const IDENTITY_FIELDS = [
  'user_id',
  'username',
  'email',
  'display_name',
  'avatar_url',
  'is_disqualified',
  'disqualify_reason',
  'disqualified_at',
  'disqualified_by',
  'profiles', // Blocks nested relational lookups explicitly
] as const;

/**
 * Strips all identity fields from a submission record.
 * Leverages explicit key extraction to safely avoid relational data leaks.
 */
export function anonymiseSubmission(submission: Submission): AnonymisedSubmission {
  // Defensive structural check to protect against runtime exceptions
  if (!submission || typeof submission !== 'object') {
    throw new Error('[SECURITY EXCEPTION] Attempted to anonymize an invalid submission data payload');
  }

  // Explicitly map out the fields safe for presentation in the judge portal
    return {
        sprint_id: submission.sprint_id,
        main_file_url: submission.main_file_url,
        main_file_type: submission.main_file_type,
        process_file_urls: [...(submission.process_file_urls ?? [])],
        brief_interpretation: submission.brief_interpretation,
        tools_used: submission.tools_used,
        time_spent_hours: submission.time_spent_hours,
        note_to_judges: submission.note_to_judges,
    };
}

/**
 * Anonymizes an array of submissions safely.
 */
export function anonymiseSubmissions(submissions: Submission[]): AnonymisedSubmission[] {
  if (!Array.isArray(submissions)) return [];
  return submissions.map(anonymiseSubmission);
}

/**
 * SECURITY ASSERTION — throws if any identity field or nested profile block is discovered.
 * Call this on every judge API response payload right before network serialization.
 */
export function assertAnonymised(obj: Record<string, unknown>): void {
  for (const field of IDENTITY_FIELDS) {
    if (field in obj && obj[field] !== undefined) {
      throw new Error(
        `[SECURITY VIOLATION] Identity leak vector '${field}' detected in anonymized object payload. ` +
        `This record has been intercepted to protect participant identities.`
      );
    }
  }
}

/**
 * Type guard to check if an arbitrary object payload has been fully anonymized
 */
export function isAnonymised(obj: unknown): obj is AnonymisedSubmission {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const record = obj as Record<string, unknown>;
  return !IDENTITY_FIELDS.some(field => field in record && record[field] !== undefined);
}