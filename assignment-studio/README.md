# Assignment Studio — MVP (2026-09-06)

**Governing document:** `~/Documents/Claude/Projects/TSA/projects/teach-back-flywheel/TRANSFORMATION-CONTRACT-v0.1.md` (owner-issued).
**Promise:** Bring an assignment you already trust. Assignment Studio adapts it for the students in front of you while protecting what you intended them to learn.

Additive to the hub. Deleting `assignment-studio/`, the `as-studio` edge function, and the `as_*` tables returns the hub to its prior state. The Stress Test (`/stress-test/`) is untouched and stays unpublished as a customer proposition.

## The teacher journey (one page, four steps)

`/assignment-studio/studio/`

1. **Upload** — .docx (text extracted in the browser), PDF, image, or pasted text. Subject, grade, optional one-line intent, provenance, two confirmations. Email optional. No account.
2. **Learning Contract** — the engine infers *learning target · required thinking · required evidence · teacher constraints*; the teacher confirms or corrects. Nothing transforms before confirmation. Corrections are stored as a per-field diff.
3. **Choose a version** — Support / Advanced / Make Thinking More Visible; optional instructional requests (checklist, never learner characteristics) and classroom constraints in the teacher's words.
4. **Original vs new** — side by side; *What we changed · What we protected · Check this*; preservation status per contract field (`PRESERVED · ADAPTED_AS_PERMITTED · INTENTIONALLY_EXTENDED · REVIEW_REQUIRED`); workload note; Edit in place; Download Word (.docx built client-side); Print/PDF; the signature question (*Did this version change something … you wanted preserved? No / Yes → correction*); I'll use this · I used it · another version · another assignment · delete everything.

The page resumes from `?t=<token>`; recent assignments are listed per browser. `?pilot=<code>` tags a school pilot.

## What is where

```
assignment-studio/
  index.html                landing (promise, three modes, the receipt, never-do list, pilot paragraph)
  studio/index.html         the whole journey (one page, four views)
  as.css                    stress-test/ast.css + studio additions (compare grid, trace, statuses)
  as.js                     client: events, markdown→html, .docx builder (JSZip), api helpers, teacher key
  functions/_shared/contract.ts   THE CONTRACT AS CODE — modes, permissions, expected statuses, prompts built from tables
  functions/_shared/engine.ts     model calls: infer contract, transform, three audits, one bounded repair (background; stage is pollable)
  functions/_shared/audits.ts     the three audits: prompts built from the contract tables, structured outputs, verdicts derived from evidence
  functions/_shared/lib.ts        unchanged from the Stress Test
  functions/as-studio/index.ts    the one public endpoint (token = credential)
  sql/2026-09-05-assignment-studio.sql   as_assignments, as_versions, views (applied)
  gold/                     four gold assignments + gold contracts + mode boundaries (DRAFT until approved)
  harness/run.mjs           runs gold × modes through the deployed endpoint; writes review packets
```

Deploy with `deploy.mjs` — it bundles `_shared/*.ts` beside `index.ts`, rewrites `../_shared/` → `./`,
deploys `as-studio` with `verify_jwt=false` (custom token auth in-function), then reads the function back
and diffs it against the repo:

```
SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy.mjs          # deploy, then verify
SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy.mjs --check  # verify only
```

**Source parity is not proof the new code is serving.** On 2026-09-08 an evaluator fix
(`audit-2026-09-08-v5`) was uploaded and the deployment reported it, while warm edge instances kept
answering with the previous bundle for roughly 20–40 minutes — long enough for a fixture re-run to
report the *old* behaviour and look like model nondeterminism. Always confirm at runtime by reading
the audit prompt version out of a fresh run:

```
node assignment-studio/harness/run.mjs --fixtures
grep -h prompt_version assignment-studio/harness/runs/<newest>/*.json | head -1
```

## Three internal quality loops (narrow by design)

Run on every transformation, in parallel, after the version is made (`functions/_shared/audits.ts`):

| Audit | Question it answers — and nothing else | Verdicts | Persisted |
|---|---|---|---|
| Instructional Preservation | Did the version hold every invariant, and did any change exceed the mode's permissions? Evidence names the specific field/rule with a quote. | `PASS · REVIEW · BLOCK` (BLOCK requires a block-severity `exceeded` finding; the verdict is derived from findings, not trusted) | `as_versions.audits.rounds[].preservation` |
| Teacher Usefulness | Would a real teacher use this tomorrow? Clarity, feasibility, editing required, grading burden, materially improves the original. Separate from validity. | `USEFUL · USEFUL_WITH_EDITS · NOT_USEFUL` (derived from the rubric) | `…rounds[].usefulness` |
| Adversarial Student | Cheapest path to satisfy it with AI while skipping the thinking; what learning signal survives that path. | `SURVIVES · WEAKENED · UNDERMINED` + `repair_hint` | `…rounds[].adversarial` |

`BLOCK` or `UNDERMINED` triggers **one** bounded repair cycle (the transform is re-run with the audit reason and the previous version; smallest change), then all three audits run again. The pre-repair output is kept in `output_prerepair`; `repaired=true`. There is no second cycle. Audit findings that a teacher should see are folded into *Check this* (and a BLOCK forces the matching status to `REVIEW_REQUIRED`); the three verdicts are shown as a short "our own checks" block. Nothing is hidden from the teacher and nothing is gated.

Teacher signal after review: **Would you use this version?** `yes_as_is · yes_with_changes · no` (+ optional comment for the latter two) → `as_versions.use_answer / use_comment`. `as_audit_vs_teacher` puts model verdicts beside teacher acceptance per version — the comparison the audits exist for.

Fixtures for calibrating the audits (`gold/<case>/fixtures/`, expected verdicts in `gold.json.fixtures`): a polished Support version that states the author's position (must BLOCK); a valid Visible version with four boxes per item + reflection + conferences (must be NOT_USEFUL); a "personalised, own words, honesty signature" Science version (must be UNDERMINED); a clean Support version of the document analysis (must PASS/USEFUL). `node harness/run.mjs --fixtures` audits them through `audit_text` and writes `FIXTURES.md`.

## Data model (minimum)

- `as_assignments` — the upload, teacher context, `contract_inferred` (jsonb incl. the transcribed original), `contract_confirmed`, `contract_corrected`, `contract_corrections` (diff), `teacher_key`, `pilot_id`, provenance (`model`, `prompt_version`, `contract_version`).
- `as_versions` — one row per transformation: `mode`, `request`, `output` (new version + trace + statuses + workload), `stage` (queued → transforming → auditing → repairing → reauditing → done), `audits`, `audit_verdicts`, `repaired`, `output_prerepair`, `use_answer`/`use_comment`, timestamps for viewed / accepted / edited (+ `edited_text`, kept separate from the machine's) / used / export_docx / export_print, and `preservation_answer` + `preservation_correction`.
- `ast_events` (reused) — `as_*` funnel events, no PII.
- `ast_settings` (reused) — `anthropic_model` only (default `claude-sonnet-4-5`). No provider credential is ever stored here.

The chain the contract asks for — original → inferred contract → confirmed contract → request → output → trace → edit/correction → acceptance/use — is one assignment row plus its version rows. Nothing is overwritten: the teacher's edit is a column beside the machine's output.

## Pilot metrics (no dashboard; SQL views)

```sql
select * from as_behaviour;        -- uploads, confirmed, corrected, transformations by mode, accepted, edited, preservation corrections, exported, used, repeat teachers
select * from as_pilot_summary;    -- the same, per pilot_id — the school report
select * from as_preservation;     -- every "Yes, you changed something I wanted kept" with the correction and the statuses the engine claimed
select * from as_teacher_words;    -- contract corrections + preservation corrections + use notes, verbatim
select * from as_audit_vs_teacher; -- audit verdicts beside "would you use this?" / preservation answer / accepted / edited / used
select * from as_launch_metrics;   -- the two launch metrics: Preservation Error Rate · Use Rate (as is / with changes / no)
select * from as_audit_disagreements; -- audits said PASS/USEFUL, teacher rejected (or the reverse) — the high-value learning cases
```
Rows with `pilot_id = 'harness'` are the gold harness; exclude them from pilot reads.

## Release rule (no owner gate)

PASS releases. REVIEW releases with its findings in *Check this*. BLOCK gets the one bounded repair; if it is still BLOCK the version is shown with a top-of-page "Not preserved — read before using" notice, the blocked field is forced to `REVIEW_REQUIRED`, and it is never presented as having preserved the contract.

## Launch checklist (minimum)

1. Supabase → Edge Functions → Secrets → `ANTHROPIC_API_KEY`. (Everything else is deployed and waiting on this.)
2. On the Mac: `cd ~/projects/sovereign-academy-hub && node assignment-studio/harness/run.mjs --fixtures` → read `harness/runs/<stamp>/FIXTURES.md` (expected vs actual for the four planted cases). Then `node assignment-studio/harness/run.mjs` for the 12 live cases → `REVIEW.md`, `INFERENCE.md`.
3. Commit and deploy: `git add assignment-studio vercel.json && git commit -m "feat(assignment-studio): MVP, audits, gold harness" && git checkout master && git merge feat/assessment-stress-test && git push` (Vercel deploys master). The pilot link for a school is `https://thesovereign.academy/assignment-studio/studio/?pilot=<code>`.
4. Walk one of your own assignments through `/assignment-studio/studio/` once before sending the link to anyone.

## Known limitations carried into the pilot

- **Transform JSON envelope.** The model returns the whole rewritten assignment inside a JSON string.
  Before 2026-09-08 an unescaped quotation mark in the document ended the string early and the whole
  transformation failed: on the first full 12-case run, 5 of 12 failed this way — 3 of 3 on the Science
  case, which both quotes a student and contains a data table, and 0 of 3 on the Fractions case, which
  contains no quotation marks at all. `extractJson` now retries with a bounded repair that escapes
  quotes and control characters left unescaped inside a string. It runs *only* after a strict parse
  fails, so well-formed JSON is never touched, and anything it cannot repair still throws rather than
  yielding half a document. A quotation mark immediately followed by a colon inside the assignment text
  is a known unrepaired case; it fails loudly.
- **The bounded repair cycle has never executed.** No version row has `repaired = true`, so
  `output_prerepair`, the re-audit round, and the repair prompt are untested end to end.
- **Teacher-facing signals are unexercised.** No row has `use_answer` or `preservation_answer` — the
  two launch metrics have never been written by a human.

## Deliberately not built

Accounts, student anything, LMS/SSO/rostering, standards DB, dashboards, grading, IEP/504, Class Profile, marketplace, review-before-release gate (see the decision note in the session summary), Language Support as a mode.

## Setup only the owner can do

1. Supabase → Edge Functions → Secrets → `ANTHROPIC_API_KEY`. This is the only place the credential can live: there is no database or UI fallback by design. Until it is set, model generation is disabled with a clear server-side error.
2. Merge/deploy the hub so `/assignment-studio/` is live (rewrites added to `vercel.json`).
3. Approve `gold/` as evaluation truth, then `node assignment-studio/harness/run.mjs`.
