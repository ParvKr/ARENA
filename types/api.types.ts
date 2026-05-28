// =========================================
// ARENA V0.1P PRODUCTION APPLICATION TYPES
// types/api.types.ts
// =========================================

import type { Database } from './database.types';

// ─── 1. STRUCTURAL CONFIGURATIONS & LITERAL DERIVATIONS ─────────────────

// FIXED: Using single-source-of-truth arrays with read-only const assertions
export const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'] as const;
export type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

export const MAX_MAIN_FILE_BYTES = 25 * 1024 * 1024;    // 25MB Max Asset Cap
export const MAX_PROCESS_FILE_BYTES = 5 * 1024 * 1024;  // 5MB Max WIP Cap
export const MIN_PROCESS_FILES = 2;

// FIXED: Enforce strict positional scalar arrays to block out arbitrary array keys
export type Placement = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const PLACEMENT_POINTS: Record<Placement, number> = {
  1: 100, 2: 80, 3: 65,
  4: 50,  5: 50, 6: 50,
  7: 35,  8: 35, 9: 35, 10: 35,
} as const;

export const ENTRY_POINTS = 10; // Every valid submission automatically earns this entry index

// ─── 2. NATIVE CORE SCHEMA EXTRACTIONS ──────────────────────────────────
type RawProfile = Database['public']['Tables']['profiles']['Row'];
type RawSprint = Database['public']['Tables']['sprints']['Row'];
type RawSubmission = Database['public']['Tables']['submissions']['Row'];

// Strict System Type Enums
export type ArenaRole = 'competitor' | 'judge' | 'admin';
export const SPRINT_STATUSES = [
  'draft',
  'live',
  'judging',
  'complete',
] as const;
export type SprintStatus = typeof SPRINT_STATUSES[number];
export function isSprintStatus(value: string): value is SprintStatus {
  return SPRINT_STATUSES.includes(value as (typeof SPRINT_STATUSES)[number]);
}

export type RankTier = 'Contender' | 'Rising' | 'Ranked' | 'Elite' | 'Legend';

// Guard against weak types from auto-generated schema strings
export interface Profile extends Omit<RawProfile, 'arena_role' | 'rank_tier'> {
  arena_role: ArenaRole;
  rank_tier: RankTier;
}

export interface Sprint extends Omit<RawSprint, 'sprint_status'> {
  sprint_status: SprintStatus;
}

export interface Submission extends Omit<RawSubmission, 'main_file_type'> {
  main_file_type: AllowedFileType;
}

// Map pristine entities safely from Database type layout
export type JudgingAssignment = Database['public']['Tables']['judging_assignments']['Row'];
export type Score = Database['public']['Tables']['scores']['Row'];
export type Result = Database['public']['Tables']['results']['Row'];
export type AuditLog = Database['public']['Tables']['audit_log']['Row'];

// ─── 3. ANONYMISED REVIEW LAYER INTERFACES ─────────────────────────────
// CRITICAL: Raw database keys and identity nodes are fully omitted to block client-side traffic matching
export type AnonymisedSubmission = Omit<
  Submission,
  | 'id' // Scrubbed to safeguard against database metadata tracking exploits
  | 'user_id' 
  | 'is_disqualified'
  | 'disqualify_reason'
  | 'disqualified_at'
  | 'disqualified_by'
  | 'submitted_at'
>;

// Secure Admin View layout mapping for aggregate data lookups
export type AdminSubmissionView = Submission & {
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>;
};

// FIXED: Synchronized to perfectly match points thresholds configured within 004_functions.sql [cite: 570, 571, 572]
export const TIER_THRESHOLDS: Record<RankTier, number> = {
  Contender: 0,
  Rising: 50,
  Ranked: 150, // Match 004 loops exactly [cite: 570]
  Elite: 350,  // Match 004 loops exactly [cite: 570]
  Legend: 700,  // Match 004 loops exactly [cite: 570]
} as const;

// ─── 4. JSON METADATA SCHEMAS ──────────────────────────────────────────
export type BriefContent = {
  context: string;     // Explicit word limits are validated via Zod on data ingest rules
  challenge: string;   
  constraints: string; 
  criteria: string;    
  timeline: string;    
};

export type PrizeData = {
  first: { description: string; sponsor?: string; cash_amount?: number };
  second: { description: string; sponsor?: string };
  third: { description: string; sponsor?: string };
};

// ─── 5. RELIABLE API NETWORK SHAPES ──────────────────────────────────────
export type ApiSuccess<T> = { data: T; error: null };
export type ApiError = { data: null; error: { message: string; code?: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function ok<T>(data: T): ApiSuccess<T> {
  return { data, error: null };
}

export function err(message: string, code?: string): ApiError {
  return { data: null, error: { message, ...(code && { code }) } };
}

// Strict Discipline Enums to bypass empty generated Database.Enums blocks
export const SPRINT_DISCIPLINES = [
  'Visual Design',
  'Copywriting',
  'Video Editing',
  'UI/UX Design',
  'No-Code Building'
] as const;
export type SprintDiscipline = typeof SPRINT_DISCIPLINES[number];

// ─── 6. PROFILE LIFECYCLE EXTENSIONS ──────────────────────────────────
export type SprintHistoryEntry = {
  sprint_id: string;
  sprint_title: string;
  sprint_number: number;
  discipline: SprintDiscipline;
  completed_at: string;
  placement: Placement | null;
  points_earned: number;
  has_earned_tier_points: boolean;
};
