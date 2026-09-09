-- Assignment Studio — stage timestamps, so an abandoned generation can reach a terminal state.
--
-- Why this exists. transformVersion() runs as background work via EdgeRuntime.waitUntil. If the edge
-- isolate is reclaimed mid-run (CPU limit, wall clock, eviction between the transform and the audits),
-- nothing catches it: the row keeps status='generating' and whatever stage it reached, forever. No
-- watchdog inside the function can help, because the process that would fire it is the one that died.
-- Detection therefore happens on the READ side, and the read side needs to know how long the row has
-- been sitting in its current stage.
--
-- created_at alone is nearly enough (the pipeline is bounded), but it cannot tell "queued for six
-- minutes because the isolate never started" from "still auditing after a slow repair", and the message
-- a teacher sees should be able to say which stage stopped.
--
-- Apply ONCE, and BEFORE deploying the matching function code: with no stage_at column the stage()
-- PATCH returns 400 and every transformation fails loudly.
--   psql "$DATABASE_URL" -f assignment-studio/sql/2026-09-09-stale-generation.sql
-- or paste into Supabase → SQL editor. Additive and idempotent; nothing is dropped or rewritten.

alter table as_versions
  add column if not exists stage_at timestamptz;

-- Rows that predate this migration have never recorded a stage transition. Seed them from created_at so
-- the sweep can also reason about generations that were already abandoned before the fix existed.
update as_versions
   set stage_at = created_at
 where stage_at is null;

alter table as_versions
  alter column stage_at set default now();

-- The sweep only ever looks at rows that are not yet terminal, so keep the index to that partition.
create index if not exists as_versions_unfinished_stage_at_idx
    on as_versions (stage_at)
 where status = 'generating';

comment on column as_versions.stage_at is
  'When stage last changed. Written by engine.ts stage(). Read by isStale()/reapIfStale() to decide that a background generation was abandoned and must reach a terminal failure state rather than remaining "generating" forever.';
