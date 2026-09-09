-- Assignment Studio — minimum schema. Applied to Supabase project rdqwoqdvqpedlsbaghtr
-- as migration `assignment_studio_mvp` on 2026-09-05.
-- Reuses: ast_events (telemetry, insert-only via publishable key), ast_settings (admin token, api key),
-- bucket ast-uploads (private). The ast_submissions table is left untouched (Stress Test, dormant).

create extension if not exists pgcrypto;

create table if not exists public.as_assignments (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  access_token           text not null unique default encode(gen_random_bytes(16), 'hex'),
  -- who (no accounts): a random per-browser key + an optional pilot code typed/linked at onboarding
  teacher_key            text,
  pilot_id               text,
  channel                text,
  email                  text,                       -- optional; only if the teacher wants the link mailed back
  -- what
  title                  text,
  subject                text not null,
  grade                  text not null,
  teacher_notes          text,                       -- "what should students learn from this?" in the teacher's words (optional)
  source_kind            text not null check (source_kind in ('text','pdf','image','docx')),
  assignment_text        text,                       -- pasted text, or text extracted from docx
  file_path              text,
  file_mime              text,
  file_bytes             integer,
  copyright_bucket       text check (copyright_bucket in ('teacher','district','publisher')),
  confirm_no_student_data boolean not null default false,
  confirm_rights         boolean not null default false,
  -- Learning Contract: inferred → confirmed/corrected
  contract_inferred      jsonb,
  contract_inferred_at   timestamptz,
  contract_error         text,
  contract_confirmed     jsonb,
  contract_confirmed_at  timestamptz,
  contract_corrected     boolean,                    -- did the teacher change anything?
  contract_corrections   jsonb,                      -- per-field {field, before, after}
  -- provenance
  model                  text,
  prompt_version         text,
  contract_version       text default 'v0.1',
  status                 text not null default 'received'
                         check (status in ('received','contract_ready','contract_failed','confirmed','withdrawn'))
);
create index if not exists as_assignments_teacher_key_idx on public.as_assignments (teacher_key);
create index if not exists as_assignments_pilot_idx on public.as_assignments (pilot_id);

create table if not exists public.as_versions (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  assignment_id          uuid not null references public.as_assignments(id) on delete cascade,
  mode                   text not null check (mode in ('support','advanced','visible')),
  request                jsonb,                      -- {constraints_text, supports[] , notes}
  output                 jsonb,                      -- {new_version, changed[], protected[], why, check_this[], statuses{}, teacher_workload}
  status                 text not null default 'generating'
                         check (status in ('generating','ready','failed')),
  error                  text,
  model                  text,
  prompt_version         text,
  contract_version       text default 'v0.1',
  generated_ms           integer,
  -- the chain: machine output → teacher edit/correction → acceptance/use
  viewed_at              timestamptz,
  accepted_at            timestamptz,
  edited_at              timestamptz,
  edited_text            text,                       -- the teacher's edited version, kept separately from the machine's
  used_at                timestamptz,
  used_note              text,
  export_docx_at         timestamptz,
  export_print_at        timestamptz,
  preservation_answer    text check (preservation_answer in ('no','yes')),
  preservation_correction text,
  preservation_at        timestamptz
);
create index if not exists as_versions_assignment_idx on public.as_versions (assignment_id);

-- Service-role only. No policies = no anon/authenticated access; edge functions use the service key.
alter table public.as_assignments enable row level security;
alter table public.as_versions enable row level security;

-- ── behaviour views (no dashboard) ─────────────────────────────────────────
create or replace view public.as_behaviour as
select
  count(*)                                                        as uploads,
  count(*) filter (where contract_confirmed_at is not null)       as contracts_confirmed,
  count(*) filter (where contract_corrected)                      as contracts_corrected,
  (select count(*) from public.as_versions)                       as transformations,
  (select count(*) from public.as_versions where mode='support')  as t_support,
  (select count(*) from public.as_versions where mode='advanced') as t_advanced,
  (select count(*) from public.as_versions where mode='visible')  as t_visible,
  (select count(*) from public.as_versions where accepted_at is not null) as accepted,
  (select count(*) from public.as_versions where edited_at is not null)   as edited,
  (select count(*) from public.as_versions where preservation_answer='yes') as preservation_corrections,
  (select count(*) from public.as_versions where preservation_answer is not null) as preservation_answered,
  (select count(*) from public.as_versions where export_docx_at is not null or export_print_at is not null) as exported,
  (select count(*) from public.as_versions where used_at is not null)     as used_in_class,
  (select count(*) from (select teacher_key from public.as_assignments where teacher_key is not null group by teacher_key having count(*) >= 2) r) as repeat_teachers,
  (select count(distinct teacher_key) from public.as_assignments where teacher_key is not null) as teachers
from public.as_assignments where status <> 'withdrawn';

create or replace view public.as_pilot_summary as
select a.pilot_id,
  count(distinct a.id) as uploads,
  count(distinct a.teacher_key) as teachers,
  count(distinct a.id) filter (where a.contract_confirmed_at is not null) as confirmed,
  count(distinct a.id) filter (where a.contract_corrected) as corrected,
  count(v.id) as transformations,
  count(v.id) filter (where v.accepted_at is not null) as accepted,
  count(v.id) filter (where v.edited_at is not null) as edited,
  count(v.id) filter (where v.preservation_answer='yes') as preservation_corrections,
  count(v.id) filter (where v.export_docx_at is not null or v.export_print_at is not null) as exported,
  count(v.id) filter (where v.used_at is not null) as used_in_class,
  (select count(*) from (select teacher_key from public.as_assignments x where x.pilot_id = a.pilot_id and teacher_key is not null group by teacher_key having count(*) >= 2) r) as repeat_teachers
from public.as_assignments a left join public.as_versions v on v.assignment_id = a.id
where a.status <> 'withdrawn'
group by a.pilot_id;

-- Preservation corrections by mode and by contract field named in the correction (read this first).
create or replace view public.as_preservation as
select v.mode, a.subject, a.grade, v.preservation_answer, v.preservation_correction, v.output->'statuses' as statuses, v.created_at
from public.as_versions v join public.as_assignments a on a.id = v.assignment_id
where v.preservation_answer is not null order by v.created_at desc;

-- Teacher language: contract corrections and preservation corrections, verbatim.
create or replace view public.as_teacher_words as
select a.created_at, a.subject, a.grade, a.teacher_notes, a.contract_corrections, null::text as mode, null::text as preservation_correction, null::text as used_note
from public.as_assignments a where a.contract_corrected
union all
select v.created_at, a.subject, a.grade, null, null, v.mode, v.preservation_correction, v.used_note
from public.as_versions v join public.as_assignments a on a.id = v.assignment_id
where v.preservation_correction is not null or v.used_note is not null
order by 1 desc;

-- 2026-09-06 · migration `assignment_studio_exclude_harness`: as_behaviour recreated with
-- `pilot_id is distinct from 'harness'` on every count, so gold-harness runs never inflate pilot numbers.
-- (as_pilot_summary groups by pilot_id, so the harness appears there as its own row and is simply ignored.)

-- 2026-09-06 · migration `assignment_studio_audits_and_use_signal`:
--   as_versions + stage, audits, audit_verdicts, repaired, output_prerepair, use_answer, use_comment, use_at
--   view as_audit_vs_teacher (model verdicts beside teacher acceptance); as_preservation recreated with use_answer/use_comment/audit_verdicts.

-- 2026-09-08 · migration `assignment_studio_launch_metrics`: views as_launch_metrics (Preservation Error Rate · Use Rate)
--   and as_audit_disagreements (audit PASS/USEFUL vs teacher reject, and the reverse).
-- 2026-09-08 · migration `assignment_studio_classroom_set_telemetry`: views as_set_behaviour (≥2 versions, combinations,
--   % who go on to another) and as_mode_outcomes (Use Rate and Preservation Error Rate per mode).
