-- =========================================
-- ARENA V0.1P FUNCTIONS & TRIGGERS
-- 004_functions.sql
-- =========================================

-- =========================================
-- 1. UTILITY & ANALYTICS FUNCTIONS
-- =========================================

-- Function: get_sprint_entry_count
-- Returns count of non-disqualified submissions for a sprint
CREATE OR REPLACE FUNCTION public.get_sprint_entry_count(p_sprint_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT count(*)::integer
    FROM public.submissions
    WHERE sprint_id = p_sprint_id
    AND is_disqualified = false;
$$;


-- Function: get_judge_progress
-- Tracks true assignment metrics directly from judging_assignments instead of leaking full table pools
CREATE OR REPLACE FUNCTION public.get_judge_progress(
    p_sprint_id uuid,
    p_judge_id uuid
)
RETURNS TABLE (scored integer, total integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_total_assigned integer;
    v_total_scored   integer;
BEGIN
    -- Verify first that the judge is actually assigned to this sprint
    IF EXISTS (
        SELECT 1 FROM public.judging_assignments
        WHERE sprint_id = p_sprint_id AND judge_user_id = p_judge_id
    ) THEN
        -- 1. Total is the count of valid, non-disqualified submissions in the sprint
        SELECT count(*)::integer INTO v_total_assigned
        FROM public.submissions
        WHERE sprint_id = p_sprint_id 
        AND is_disqualified = false;

        -- 2. Scored is the count of scores submitted by this judge for those valid submissions
        SELECT count(*)::integer INTO v_total_scored
        FROM public.scores s
        JOIN public.submissions sub ON sub.id = s.submission_id
        WHERE sub.sprint_id = p_sprint_id
        AND sub.is_disqualified = false
        AND s.judge_user_id = p_judge_id;
    ELSE
        -- If no active assignment record exists, return zero baselines safely
        v_total_assigned := 0;
        v_total_scored   := 0;
    END IF;

    RETURN QUERY SELECT v_total_scored, v_total_assigned;
END;
$$;


-- Function: check_all_judges_complete
-- Returns true when all assigned judges have completed evaluation
CREATE OR REPLACE FUNCTION public.check_all_judges_complete(p_sprint_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM public.judging_assignments
        WHERE sprint_id = p_sprint_id
        AND is_complete = false
    )
    AND EXISTS (
        SELECT 1 FROM public.judging_assignments
        WHERE sprint_id = p_sprint_id
    );
$$;


-- =========================================
-- 2. AUTOMATED LEADERBOARD & REWARDS ENGINE
-- =========================================

-- Function: update_profile_on_results
-- CLEANED UP: Removed unused variable v_points_to_add
CREATE OR REPLACE FUNCTION public.update_profile_on_results()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id       uuid;
    v_current_total integer;
    v_new_tier      text;
BEGIN
    -- Only execute calculations if a valid result podium entry is officially published
    IF (NEW.published_at IS NOT NULL AND OLD.published_at IS NULL) THEN
        
        -- Pull identity coordinates linked to the target submission
        SELECT user_id INTO v_user_id
        FROM public.submissions
        WHERE id = NEW.submission_id;

        IF v_user_id IS NOT NULL THEN
            -- Isolate the user row to prevent external write drift
            SELECT total_points INTO v_current_total
            FROM public.profiles
            WHERE user_id = v_user_id
            FOR UPDATE;

            -- Calculate new baseline
            v_current_total := v_current_total + NEW.points_awarded;

            -- Determine tier thresholds
            v_new_tier := CASE
                WHEN v_current_total >= 700 THEN 'Legend'
                WHEN v_current_total >= 350 THEN 'Elite'
                WHEN v_current_total >= 150 THEN 'Ranked'
                WHEN v_current_total >= 50  THEN 'Rising'
                ELSE 'Contender'
            END;

            -- Commit clean changes in a single atomic transaction step
            UPDATE public.profiles SET
                total_points = v_current_total,
                rank_tier    = v_new_tier,
                sprint_count = sprint_count + 1,
                updated_at   = now()
            WHERE user_id = v_user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- OPTIMIZED: Narrowed trigger scope strictly to column 'published_at' changes
DROP TRIGGER IF EXISTS tr_results_publication_reward_engine ON public.results;
CREATE TRIGGER tr_results_publication_reward_engine
    AFTER UPDATE OF published_at ON public.results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_on_results();


-- =========================================
-- 3. CHRONOLOGICAL METADATA TRACKING
-- =========================================

-- Trigger: auto-update updated_at timestamp parameters
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger 
LANGUAGE plpgsql 
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Re-instantiate tracking triggers cleanly
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS sprints_updated_at ON public.sprints;
CREATE TRIGGER sprints_updated_at
    BEFORE UPDATE ON public.sprints
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS scores_updated_at ON public.scores;
CREATE TRIGGER scores_updated_at
    BEFORE UPDATE ON public.scores
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
