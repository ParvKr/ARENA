-- =========================================
-- ARENA V0.1P PUBLICATION PIPELINE FUNCTIONS
-- 005_publication_pipeline_functions.sql
-- =========================================

-- Function: execute_sprint_publication_pipeline
-- Publishes computed results and advances the sprint lifecycle in one transaction.
CREATE OR REPLACE FUNCTION public.execute_sprint_publication_pipeline(
    p_sprint_id uuid,
    p_published_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated_results integer;
BEGIN
    UPDATE public.results
    SET published_at = p_published_at
    WHERE sprint_id = p_sprint_id
    AND published_at IS NULL;

    GET DIAGNOSTICS v_updated_results = ROW_COUNT;

    IF v_updated_results = 0 THEN
        RAISE EXCEPTION 'No unpublished computed results found for sprint %', p_sprint_id;
    END IF;

    UPDATE public.sprints
    SET
        sprint_status = 'complete',
        results_at = p_published_at
    WHERE id = p_sprint_id
    AND sprint_status = 'judging';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sprint % is not in judging state', p_sprint_id;
    END IF;
END;
$$;


-- Function: get_emails_for_users_list
-- Maps profile/auth user IDs to email addresses for notification fan-out.
CREATE OR REPLACE FUNCTION public.get_emails_for_users_list(p_user_ids uuid[])
RETURNS TABLE (user_id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
    SELECT users.id, users.email::text
    FROM auth.users
    WHERE users.id = ANY(p_user_ids)
    AND users.email IS NOT NULL;
$$;
