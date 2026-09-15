-- 2026-09-15 — let Assignment Studio telemetry actually record.
--
-- APPLIED TO ESA ONLY: svrbfpjoufhhxdshwlvt, migration
-- `ast_events_allow_assignment_studio_event_names`. BSA is NOT modified.
--
-- WHAT WAS WRONG
-- as.js builds every event as `event: "as_" + event` (one place, as.js:47), so the browser sends
-- as_landing_view, as_view_upload and so on. The ast_events INSERT policy's WITH CHECK list was
-- written for the Assessment Stress Test vocabulary and holds only the unprefixed names, so every
-- Assignment Studio insert was rejected — and track() swallows the failure with
-- `.catch(function () {})`, which is why nobody noticed. The funnel has never recorded an event,
-- here or in BSA.
--
-- MEASURED, from the live ESA deployment:
--   before: AS.track("landing_view") -> POST /rest/v1/ast_events -> 401; the same POST with the
--           bare name "landing_view" -> 201; BSA holds 0 rows and 0 as_-prefixed rows under the
--           byte-identical policy
--   after:  a normal page load of /assignment-studio/ writes exactly one row,
--           event=as_landing_view, page=/assignment-studio/, and the browser console is clean
--
-- THE VOCABULARY IS ENUMERATED FROM SOURCE, NOT GUESSED
--   assignment-studio/index.html        landing_view, cta_click
--   assignment-studio/studio/index.html upload_submit, contract_inferred, transform_request,
--     transform_failed, transform_ready, set_make, set_download, version_edited, export_docx,
--     export_print, version_used, another_assignment, the ternary
--     contract_corrected | contract_confirmed, and show() -> track("view_" + view) where view is
--     drawn from the literal array ["upload","contract","mode","result"] (studio/index.html:286),
--     corroborated by the four panel ids v-upload / v-contract / v-mode / v-result and the four
--     show() call sites.
--   Two apparent matches were false positives and are deliberately absent: "preservation_" and
--   "use_" are AS.api({ action: "preservation" | "use_answer" }) calls to the edge function, not
--   events.
--
-- SCOPE. This one policy's WITH CHECK, and nothing else. The frontend event naming is unchanged —
-- the as_ prefix is preserved as shipped. No SELECT is granted; anon keeps INSERT only. No other
-- policy is altered; ESA has exactly one policy across all public tables. The insert surface stays
-- a closed enumeration of 31 names rather than a wildcard: an `event like 'as_%'` rule would have
-- been shorter and strictly worse, because it would accept anything a page chose to invent.

alter policy "ast_events_insert_anon" on public.ast_events
  with check (
    event = any (array[
      -- Assessment Stress Test (unchanged, still permitted)
      'landing_view', 'cta_click', 'submit_view', 'submit_start', 'submit_success',
      'submit_error', 'result_view', 'purchase_click', 'purchase_request',
      'full_report_view', 'feedback_submit',
      -- Assignment Studio (as_ prefixed, added)
      'as_landing_view', 'as_cta_click',
      'as_view_upload', 'as_view_contract', 'as_view_mode', 'as_view_result',
      'as_upload_submit',
      'as_contract_inferred', 'as_contract_corrected', 'as_contract_confirmed',
      'as_transform_request', 'as_transform_failed', 'as_transform_ready',
      'as_set_make', 'as_set_download',
      'as_version_edited', 'as_version_used',
      'as_export_docx', 'as_export_print',
      'as_another_assignment'
    ])
  );

-- NOTE FOR FUTURE WORK: a new track() call site needs its name added here, or it will fail
-- silently exactly as these twenty did.
