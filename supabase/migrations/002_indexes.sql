-- =========================================
-- ARENA V0.1P PERFORMANCE INDEXES
-- 002_indexes.sql
-- =========================================

-- =========================================
-- A) PROFILES
-- =========================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_arena_role ON public.profiles (arena_role);


-- =========================================
-- B) SPRINTS
-- =========================================
-- Dashboard Optimization: Filters active sprints out from background drafts
CREATE INDEX IF NOT EXISTS idx_sprints_active_status ON public.sprints (sprint_status) WHERE sprint_status IN ('live', 'judging');
CREATE INDEX IF NOT EXISTS idx_sprints_open_at_desc ON public.sprints (open_at DESC);
CREATE INDEX IF NOT EXISTS idx_sprints_discipline ON public.sprints (discipline);


-- =========================================
-- C) SUBMISSIONS
-- =========================================
CREATE INDEX IF NOT EXISTS idx_submissions_sprint_id ON public.submissions (sprint_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions (user_id);

-- Performance Filter: Reads non-disqualified submissions instantly for judging
CREATE INDEX IF NOT EXISTS idx_submissions_active_sprint ON public.submissions (sprint_id) WHERE is_disqualified = false;


-- =========================================
-- D) JUDGING ASSIGNMENTS
-- =========================================
CREATE INDEX IF NOT EXISTS idx_judging_assignments_sprint_id ON public.judging_assignments (sprint_id);
CREATE INDEX IF NOT EXISTS idx_judging_assignments_judge_id ON public.judging_assignments (judge_user_id);
CREATE INDEX IF NOT EXISTS idx_judging_incomplete_assignments ON public.judging_assignments (sprint_id) WHERE is_complete = false;


-- =========================================
-- E) SCORES (Tiebreaker Optimization & Anonymity Guard)
-- =========================================
-- Tiebreaker Matrix: Combines submission references with scoring criteria to protect anonymity
-- and prevent sequential table scans during dynamic standings calculations.
CREATE INDEX IF NOT EXISTS idx_scores_submission_criteria ON public.scores (submission_id, judge_user_id, adherence_score, craft_score, raw_total_score);


-- =========================================
-- F) RESULTS
-- =========================================
-- Leaderboard Sort: Builds an accelerated index road map for rendering published rankings instantly
CREATE INDEX IF NOT EXISTS idx_results_sprint_rank ON public.results (sprint_id, rank);
CREATE INDEX IF NOT EXISTS idx_results_published_sprint ON public.results (sprint_id) WHERE published_at IS NOT NULL;