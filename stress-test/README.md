# Assessment Stress Test — MVP (validation experiment)

**Status: experimental, additive.** Deleting `/stress-test/` and the three `ast-*` edge
functions returns the hub to its prior state. Nothing outside this folder was changed
except four rewrites in `vercel.json`.

Governing document: `~/Documents/Claude/Projects/TSA/projects/teach-back-flywheel/ASSESSMENT-STRESS-TEST-PLAN.html`.
Locked decisions from it that this build honours: no numeric score; assessments only,
never student work or PII; the result belongs to the teacher; free deliverable is a real
value exchange; human-reviewed before release.

## What we are trying to learn

> Does seeing one concrete weakness in their own assessment make a teacher willing to pay
> to understand the rest?

The one number: **free finding viewed → paid** (`select * from ast_conversion`).

## The loop

1. `/stress-test/` landing → `/stress-test/submit/` (paste text or attach PDF/PNG/JPG).
2. `ast-submit` stores the row (+ file in the private bucket `ast-uploads`) and drafts an
   analysis in the background with the Anthropic API. Status `received → drafting → draft_ready`
   (or `draft_failed` with the reason).
3. **Dalia reviews** at `/stress-test/review/` (token in the browser, hash on the server):
   edits the findings, picks the one to release, clicks *Approve & release*. Status → `delivered`.
4. Dalia emails the teacher (the review page opens a prefilled mail; nothing is sent automatically).
5. Teacher opens `/stress-test/result/?t=<token>`: one finding as a paper document, the $49 offer,
   and three feedback questions.
6. Purchase: if `stripe_payment_link` is set (Review → Settings), the button goes to Stripe with
   `client_reference_id=<submission id>`. If not, the teacher files a firm "send me the payment
   link" request (`purchase_status=requested`) and Dalia sends the link by email.
7. Dalia marks the row paid (writes to the existing `purchases` ledger), writes the complete
   report in the review page, and publishes it to the same result page.

## Deliberately manual for cohort 1

Email (prefilled mailto), payment confirmation (mark paid by hand after checking Stripe),
the complete report (machine draft as raw material, written by Dalia), release of the free
finding (one click, or flip `auto_release_free_finding` when the drafts earn trust).

## Setup — two things only Dalia can do

1. **Anthropic API key.** Supabase → Edge Functions → Secrets → `ANTHROPIC_API_KEY`.
   (Fallback: paste it in Review → Settings; stored service-role-only in `ast_settings`.)
   Until set, submissions still land; drafts fail with a clear message; *Re-run machine draft*
   works once the key exists.
2. **Stripe Payment Link** (optional but recommended): Stripe → Payment Links → one-time $49,
   "Assessment Stress Test — complete". Paste the URL in Review → Settings.

Review token: generated at build time and handed to Dalia privately; only its SHA-256 is stored
(`ast_settings.admin_token_sha256`). To rotate: `update ast_settings set value = encode(sha256('newtoken'::bytea),'hex') where key='admin_token_sha256';`

## Data and privacy

| What | Where | Who can read | How long |
|---|---|---|---|
| Teacher email, name, context, worry text | `public.ast_submissions` | service role only (Review page) | until the teacher asks for deletion (*Withdraw* in Review) |
| Assessment text / file | `ast_submissions.assessment_text` / bucket `ast-uploads` (private) | service role only | same |
| Machine draft, approved findings, full report | `ast_submissions` jsonb/text | service role; the approved parts via the teacher's token | same |
| Funnel events | `public.ast_events` | insert-only from the browser; no PII, random session id | indefinitely (aggregate only) |

No model training on submissions. Publisher-derived material (`copyright_bucket='publisher'`)
is analysed for the teacher only and must be excluded from any aggregate use.

## Analytics layer — views, no dashboard

```sql
select * from ast_funnel;         -- landing → submit → delivered → viewed → intent → paid → full → would-use-again
select * from ast_conversion;     -- the number that matters
select * from ast_pipeline;       -- queue
select * from ast_finding_value;  -- which finding types teachers value (feedback × type × paid)
select * from ast_teacher_words;  -- verbatim teacher language: read this first
select * from ast_event_counts;
```

## Files

```
stress-test/index.html          landing
stress-test/submit/index.html   submission form
stress-test/result/index.html   teacher result (free finding, offer, feedback, full report)
stress-test/review/index.html   internal review (Dalia)
stress-test/ast.css             styles on top of /css/tsa-brand.css
stress-test/ast.js              shared client: config, event tracking, finding renderer
stress-test/functions/          edge-function source (deployed to Supabase as ast-submit, ast-teacher, ast-admin)
stress-test/sql/schema.sql      the migration as applied
```

Redeploy a function (imports are flattened at deploy): copy `_shared/*.ts` beside `index.ts`,
rewrite `../_shared/` → `./`, deploy with `verify_jwt=false` (custom auth in-function).
