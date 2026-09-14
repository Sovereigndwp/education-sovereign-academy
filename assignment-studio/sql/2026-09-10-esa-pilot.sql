-- ESA — the five-teacher pilot. Additive and idempotent; nothing existing is touched.
--
-- Apply once:  psql "$DATABASE_URL" -f assignment-studio/sql/2026-09-10-esa-pilot.sql
-- or paste into Supabase → SQL editor. Apply BEFORE deploying the esa-review function.
--
-- Scope note. These tables never hold student work or student PII. The teacher pastes an assessment —
-- the items students see — and confirms that it contains no student names, work or grades. There is
-- no upload path in the pilot, so there is no file to inspect after the fact.

create extension if not exists pgcrypto;

-- ── invites ─────────────────────────────────────────────────────────────────
-- The token IS the credential. No accounts, no passwords, no email verification: five teachers,
-- each with a link. reviews_allowed is per-invite so one teacher can be given more without a schema
-- change if the pilot turns up a reason.
create table if not exists esa_invites (
  token            text primary key,
  teacher_label    text not null,                 -- how Dalia refers to them; not necessarily a real name
  reviews_allowed  int  not null default 3,
  revoked          boolean not null default false,
  note             text,
  created_at       timestamptz not null default now()
);

comment on table esa_invites is
  'ESA pilot invites. One row per teacher. The token is the credential and appears in the invite link as ?i=<token>.';

-- ── reviews ─────────────────────────────────────────────────────────────────
create table if not exists esa_reviews (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  access_token      text not null unique,          -- the teacher's link to THIS review
  invite_token      text not null references esa_invites(token),

  -- what she pasted
  title             text,
  subject           text not null,
  grade             text not null,
  teacher_notes     text,
  email             text,
  assessment_text   text not null,

  -- screen 2: what she is trying to know
  claims_inferred   jsonb,
  claims_confirmed  jsonb,
  claims_corrected  boolean,                       -- did she edit what ESA proposed? the useful signal
  left_out_question text,

  -- screen 3: how students complete it, including what she needs to conclude
  conditions        jsonb,

  -- the two stages
  status            text not null default 'inferring',   -- inferring | awaiting_confirmation | running | ready | failed
  stage             text,                                -- reading | claims | queued | diagnosing | choosing | done
  stage_at          timestamptz not null default now(),
  error             text,

  diagnosis         jsonb,                          -- Stage A, one frozen record per claim
  diagnosis_hash    jsonb,                          -- sha256 over canonical JSON, per claim
  remedies          jsonb,                          -- Stage B, only for a material limitation
  span_violations   jsonb,                          -- components the teacher's own words did not authorise
  arch_violations   jsonb,                          -- mutation / overreach / rewrite-on-conditions

  model             text,
  arch_version      text,
  prompt_sha        jsonb
);

create index if not exists esa_reviews_invite_idx      on esa_reviews (invite_token, created_at desc);
create index if not exists esa_reviews_token_idx       on esa_reviews (access_token);
-- The sweep only ever looks at rows that are not yet terminal.
create index if not exists esa_reviews_running_idx     on esa_reviews (stage_at) where status = 'running';

comment on column esa_reviews.stage_at is
  'When stage last changed. Read by reapIfStale() so a background run killed mid-flight reaches a terminal failure state instead of sitting on "running" forever.';
comment on column esa_reviews.claims_corrected is
  'True when the teacher edited the claims ESA proposed. The correction is the signal, not the confirmation.';
comment on column esa_reviews.diagnosis is
  'Stage A, frozen. Stage B may not write here; the merge re-hashes this and records DIAGNOSIS_MUTATED if it ever changes.';

-- ── feedback ────────────────────────────────────────────────────────────────
-- Two questions. Anything longer would be answered by nobody.
create table if not exists esa_feedback (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  review_id            uuid not null references esa_reviews(id) on delete cascade,
  invite_token         text not null,
  was_useful           boolean,
  -- Asked only AFTER a teacher has actually submitted a second assessment. We deliberately do not
  -- ask anyone whether they intend to come back: a stated intention is not the pilot's signal, and
  -- asking for one invites a polite answer that means nothing.
  return_reason        text,
  wants_upload         boolean not null default false,   -- product evidence, only if a teacher asks unprompted
  comment              text
);

create index if not exists esa_feedback_invite_idx on esa_feedback (invite_token, created_at desc);

comment on column esa_feedback.return_reason is
  'Why she came back, in her words. Collected only from the second submission onward. The fact of a second submission is the signal; this says what drove it.';
comment on column esa_feedback.wants_upload is
  'Set only when a teacher asks for file upload themselves. The pilot is paste-only on purpose; this is how upload would earn its way in.';

-- ── row level security ──────────────────────────────────────────────────────
-- The edge function uses the service role and bypasses RLS. Enabling it with no policy means the
-- anon and authenticated keys can read nothing, which is what we want: the browser never talks to
-- PostgREST directly.
alter table esa_invites  enable row level security;
alter table esa_reviews  enable row level security;
alter table esa_feedback enable row level security;
