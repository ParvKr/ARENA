-- =========================================
-- ARENA V0.1P PRODUCTION ROW LEVEL SECURITY
-- 003_rls.sql
-- =========================================

-- =========================================
-- A) ENABLE RLS ON ALL TABLES
-- =========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judging_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =========================================
-- B) RECURSION BYPASS & ADMINISTRATIVE UTILITIES
-- =========================================

-- FIXED: Runs under SECURITY DEFINER with a secure search path to bypass RLS loops.
-- This checks a user's role without causing Postgres to trigger an infinite recursion check.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.arena_role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- =========================================
-- C) SECURITY INTEGRITY SHIELD (TRIGGER INTERCEPT)
-- =========================================

-- FIXED: Now handles both INSERT and UPDATE phases seamlessly.
CREATE OR REPLACE FUNCTION public.protect_profile_system_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- PHASE 1: INSERT VALIDATION (Bypasses service role / blocks rogue admin signups)
    IF TG_OP = 'INSERT' THEN
        -- Force system defaults on insert if the user is attempting to self-escalate privileges
        IF (NEW.arena_role IS DISTINCT FROM 'competitor' OR 
            NEW.rank_tier IS DISTINCT FROM 'Contender' OR 
            NEW.total_points IS DISTINCT FROM 0 OR 
            NEW.sprint_count IS DISTINCT FROM 0) THEN
            
            -- Allow if explicitly invoked by an existing admin account
            IF NOT public.check_is_admin() THEN
                -- Clamp variables down tightly to non-privileged defaults
                NEW.arena_role   := 'competitor';
                NEW.rank_tier    := 'Contender';
                NEW.total_points := 0;
                NEW.sprint_count := 0;
            END IF;
        END IF;
        
    -- PHASE 2: UPDATE VALIDATION (Prevents manipulation of accumulated stats)
    ELSIF TG_OP = 'UPDATE' THEN
        IF (NEW.arena_role IS DISTINCT FROM OLD.arena_role OR 
            NEW.rank_tier IS DISTINCT FROM OLD.rank_tier OR
            NEW.total_points IS DISTINCT FROM OLD.total_points OR
            NEW.sprint_count IS DISTINCT FROM OLD.sprint_count) THEN
            
            IF NOT public.check_is_admin() THEN
                RAISE EXCEPTION 'Privilege Escalation Blocked: You are unauthorized to modify protected system variables.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIXED: Bind to BOTH INSERT and UPDATE actions
CREATE TRIGGER tr_profiles_privilege_escalation_guard
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_system_fields();


-- =========================================
-- D) PROFILES POLICIES
-- =========================================
-- FIXED: Public lookups locked down to authenticated session context
CREATE POLICY "profiles_select_authenticated" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FIXED: Admin bypass relies on the non-recursive function helper
CREATE POLICY "profiles_admin_all" ON public.profiles
    FOR ALL USING (public.check_is_admin());


-- =========================================
-- E) SPRINTS POLICIES
-- =========================================
CREATE POLICY "sprints_select_authenticated" ON public.sprints
    FOR SELECT USING (
        sprint_status IN ('live', 'judging', 'complete')
        OR public.check_is_admin()
    );

CREATE POLICY "sprints_admin_all" ON public.sprints
    FOR ALL USING (public.check_is_admin());


-- =========================================
-- F) SUBMISSIONS POLICIES (Showcase Enhancement Integrated)
-- =========================================
-- FIXED: Competitors see their own entries OR ANY submission once the sprint is completed
CREATE POLICY "submissions_select_policy" ON public.submissions
    FOR SELECT USING (
        user_id = auth.uid()
        OR public.check_is_admin()
        OR EXISTS (
            SELECT 1 FROM public.sprints 
            WHERE sprints.id = sprint_id AND sprints.sprint_status = 'complete'
        )
    );

CREATE POLICY "submissions_insert_own_live" ON public.submissions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM public.sprints WHERE sprints.id = sprint_id AND sprints.sprint_status = 'live')
    );

CREATE POLICY "submissions_admin_all" ON public.submissions
    FOR ALL USING (public.check_is_admin());


-- =========================================
-- G) JUDGING ASSIGNMENTS POLICIES
-- =========================================
CREATE POLICY "judging_select_own" ON public.judging_assignments
    FOR SELECT USING (judge_user_id = auth.uid() OR public.check_is_admin());

CREATE POLICY "judging_admin_all" ON public.judging_assignments
    FOR ALL USING (public.check_is_admin());


-- =========================================
-- H) SCORES POLICIES (Airtight Assignment Validation)
-- =========================================
CREATE POLICY "scores_select_own" ON public.scores
    FOR SELECT USING (judge_user_id = auth.uid() OR public.check_is_admin());

CREATE POLICY "scores_insert_assigned" ON public.scores
    FOR INSERT WITH CHECK (
        judge_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.submissions sub
            JOIN public.judging_assignments ja ON ja.sprint_id = sub.sprint_id
            WHERE sub.id = submission_id AND ja.judge_user_id = auth.uid() AND ja.is_complete = false
        )
    );

CREATE POLICY "scores_update_assigned" ON public.scores
    FOR UPDATE USING (
        judge_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.submissions sub
            JOIN public.judging_assignments ja ON ja.sprint_id = sub.sprint_id
            WHERE sub.id = submission_id AND ja.judge_user_id = auth.uid() AND ja.is_complete = false
        )
    )
    WITH CHECK (
        judge_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.submissions sub
            JOIN public.judging_assignments ja ON ja.sprint_id = sub.sprint_id
            WHERE sub.id = submission_id AND ja.judge_user_id = auth.uid() AND ja.is_complete = false
        )
    );

CREATE POLICY "scores_admin_all" ON public.scores
    FOR ALL USING (public.check_is_admin());


-- =========================================
-- I) RESULTS POLICIES
-- =========================================
CREATE POLICY "results_select_published" ON public.results
    FOR SELECT USING (published_at IS NOT NULL OR public.check_is_admin());

CREATE POLICY "results_admin_all" ON public.results
    FOR ALL USING (public.check_is_admin());


-- =========================================
-- J) AUDIT LOG POLICIES (Strict Isolation)
-- =========================================
-- System logs are completely un-insertable from public client tokens.
CREATE POLICY "audit_admin_all" ON public.audit_log
    FOR ALL USING (public.check_is_admin());