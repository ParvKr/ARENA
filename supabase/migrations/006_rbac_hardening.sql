-- =========================================
-- ARENA RBAC RPC HARDENING
-- =========================================

REVOKE EXECUTE ON FUNCTION public.execute_sprint_publication_pipeline(uuid, timestamptz)
  FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_emails_for_users_list(uuid[])
  FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_judge_progress(uuid, uuid)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_judge_progress(uuid, uuid)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.check_all_judges_complete(uuid)
  FROM PUBLIC, anon, authenticated;
