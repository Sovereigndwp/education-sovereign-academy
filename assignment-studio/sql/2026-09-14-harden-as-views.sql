-- 2026-09-14 — close a live exposure of teacher-authored content in the as_* analytics views.
--
-- APPLIED TO BOTH PROJECTS:
--   rdqwoqdvqpedlsbaghtr (BSA)  migration `harden_as_views_revoke_anon_and_security_invoker`
--   svrbfpjoufhhxdshwlvt (ESA)  migration `esa_harden_as_views_revoke_anon_and_security_invoker`
--
-- WHAT WAS WRONG
-- `2026-09-05-assignment-studio.sql` creates the as_* views and never revokes them from
-- anon/authenticated. Postgres views default to SECURITY DEFINER, so they execute as the view
-- owner and bypass row level security on as_assignments and as_versions. Together with the
-- default grants, that made teacher-authored text readable by anyone holding the publishable
-- key — which is hardcoded in assignment-studio/as.js and is therefore public.
--
-- `2026-09-04` (assessment_stress_test_mvp) got this right for its own views: it ends with an
-- explicit `revoke all on ... from anon, authenticated`. All six ast_* views still carry no
-- anon/authenticated grants and are untouched by this file. The assignment-studio migration
-- simply omitted the equivalent line.
--
-- MEASURED BEFORE, with the publishable key (not inferred — actual HTTP reads):
--   as_teacher_words      3 rows   teacher_notes, contract_corrections, preservation_correction, used_note
--   as_preservation       2 rows
--   as_audit_vs_teacher   3 rows
--   as_launch_metrics     1 row
--   as_mode_outcomes      3 rows
--   as_set_behaviour      1 row
-- NOT affected: as_assignments, as_versions, esa_reviews, esa_invites and esa_feedback all
-- returned zero rows (RLS with no policy was working correctly), and the ast_* tables returned
-- permission denied. Invite tokens were never exposed.
--
-- MEASURED AFTER: all nine as_* views return "permission denied" to the publishable key; the
-- ast_* views are unchanged; the base tables are unchanged; privileged reads still return every
-- row (as_teacher_words 34, as_audit_vs_teacher 32, as_pilot_summary 6, as_mode_outcomes 3);
-- esa-review still answers a bad invite with a clean 403 and as-studio still routes. Supabase
-- security advisors went from 9 ERROR-level `security_definer_view` findings to zero on both
-- projects.
--
-- SCOPE. Views only. No base-table RLS is altered, no base-table grants are changed, no view
-- definition is rewritten, no data is touched, no unrelated object is modified. Application
-- behaviour is unchanged: both edge functions read through the service role, which bypasses RLS
-- and is affected by neither security_invoker nor anon/authenticated grants.
--
-- as_behaviour is deliberately absent from step 1: it already carried security_invoker=on.
-- as_pilot_summary likewise. Both are included in step 2 only where they actually held grants.

-- 1. Run the views as the querying role, so RLS on the base tables applies.
alter view public.as_audit_disagreements set (security_invoker = on);
alter view public.as_audit_vs_teacher    set (security_invoker = on);
alter view public.as_launch_metrics      set (security_invoker = on);
alter view public.as_mode_outcomes       set (security_invoker = on);
alter view public.as_preservation        set (security_invoker = on);
alter view public.as_set_behaviour       set (security_invoker = on);
alter view public.as_teacher_words       set (security_invoker = on);

-- 2. Remove the browser-facing roles from the internal analytics views.
revoke all on public.as_audit_disagreements,
              public.as_audit_vs_teacher,
              public.as_launch_metrics,
              public.as_mode_outcomes,
              public.as_pilot_summary,
              public.as_preservation,
              public.as_set_behaviour,
              public.as_teacher_words
       from anon, authenticated;

-- NOTE FOR FUTURE MIGRATIONS: any new view over as_* or esa_* must end with the same revoke,
-- or be created with security_invoker = on. These views exist for service-role reporting only.
