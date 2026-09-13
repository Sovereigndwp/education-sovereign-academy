# ESA — Education Sovereign Academy · the five-teacher pilot

**What it answers.** *What can I legitimately learn from the results of this assessment?*

Not whether the assessment is good. Not how to improve it. Not whether a student used AI. A teacher
brings an assessment she already gives, says what she is trying to find out and how students take it,
and ESA tells her what the results will and will not support — including, often, that it is already
doing its job and she should change nothing.

ESA is the fourth brand under The Sovereign Academy, beside BSA (individuals and families) and
FSA (advisors and institutions). It inherits the TSA design system; the only difference is the accent,
which is blue where BSA is orange/yellow and FSA is teal/emerald/mint.

---

## The architecture, and why it is shaped this way

Two stages, with the separation enforced in code rather than asked for in a prompt.

**Stage A — diagnosis.** What can this assessment legitimately tell the teacher? It runs against a
system prompt that contains no remedy vocabulary at all, and every assembled Stage A prompt is scanned
by `assertNoRemedyLeak()` before it may be sent. A hit throws.

**Stage B — remedy.** Runs only for a limitation Stage A already recorded, and receives only that one
claim. Its reply is filtered to an 8-key whitelist, and the Stage A record is re-hashed after merge;
a mismatch is recorded as `DIAGNOSIS_MUTATED`.

**Why.** Running both in one context regressed restraint — unnecessary interventions went 1 → 4 and the
restraint rate 0.968 → 0.871 — with nothing bypassed. Gate 1's instruction text had not changed by one
byte, yet the presence of an attractive zero-cost remedy downstream made it decompose claims more finely
and read the finer pieces as absent. Telling a model to ignore the remedy leaves the remedy in the
context, and the context was the problem.

### Two independent failure paths

Evidence can be limited in two ways, and forcing both through one is how the first version broke.

| path | question | what a limitation means |
|---|---|---|
| **coverage** | does the assessment *ask* the student to do what the claim names? | one component is not exercised |
| **conditions** | under the declared conditions, how strongly can the work be *attributed* to the student? | the items are right; the room is not |

A conditions limitation is **never** recorded as a missing component. An earlier version smuggled it
through gate 1 by inventing a component called *"independent production"* — the independence condition
wearing a component's clothes — which is also what produced every name-matching violation in that run.

Stage B has **two prompts**, and **neither** offers `modify_item`. The conditions prompt never did:
rewriting a worksheet cannot repair the room, so the option is absent rather than forbidden. The
coverage prompt lost it on 2026-09-13, when the hierarchy was pinned to A4.

The shipped hierarchy is exactly three tiers — **no change → add one short independent check → no
cheap check**. `MODIFY ONE EXISTING ITEM` is out of pilot scope. It is not omitted because it is a
bad idea; H1 showed it is a *load-bearing* one. When the cheapest available remedy was a five-minute
added item, finding an absence was expensive and the engine was conservative. Once "change one word"
became available, the price of an absence collapsed and gate 1 began decomposing claims more finely
to find absences it had previously let stand — restraint 0.968 → 0.871, stability failed. The cost of
the remedy had been doing the restraint work. Restraint is structural, not dispositional.

### Conditions matter only relative to the intended inference

The same take-home assessment, same conditions, two different things the teacher needs to conclude:

| she needs to conclude | limitation | what ESA says |
|---|---|---|
| each student individually can do this | `conditions` | assessment unchanged, plus one short check in the room |
| what students can produce with the resources they have | `none` | nothing to report — that is the inference she declared |

So ESA **asks** her, on the conditions screen. It does not infer it.

### Components are anchored to the teacher's own words

Every component in the coverage map must carry a verbatim, non-overlapping span of the teacher's
confirmed claim, plus the student verb inside that span. `validateSpans()` checks all three against the
claim string. A manner qualifier — a phrase saying *how* a move is done — has no verb of its own and
fails automatically. **ESA interprets the teacher's claim. It does not silently upgrade it.**

---

## The three findings

Preserved as separate fields so the review page can say the right thing:

| finding | data | what the teacher reads |
|---|---|---|
| **strong** | coverage sufficient · conditions strong | "This gives you evidence for what you want to know. I would not change it." |
| **coverage limited** | coverage limited | "It does not actually ask students to demonstrate one part of this." |
| **conditions limited** | conditions limited, material | "It asks the right thing. Under these conditions the results cannot establish that each student can do it independently." |

**The derived verdict word never reaches a teacher.** A good take-home with full coverage derives to
`NOT_SUPPORTED`, which is not what is true about it. The page leads with the two axes and the boundary
sentence; the label stays internal.

---

## Pilot scope

- **Five teachers**, three reviews each, 15 analyses. Server-side quota, counted from rows.
- **Invite token only.** No accounts, no billing, no public marketing page. `noindex, nofollow`.
- **Paste only.** No DOCX/PDF/photo extraction. If a teacher asks for upload unprompted, that is
  recorded (`esa_feedback.wants_upload`) and it is how upload earns its way in.
- **Never student work or student PII.** Assessments only, and the teacher confirms it.
- **The Assignment Studio transformer stays dormant.** ESA does not rewrite assessments. If teachers
  repeatedly ask it to, that becomes the evidence for connecting the transformer — not before.

**The question the pilot is asking:** does a teacher voluntarily bring a second assessment? Fifteen
analyses will not give a rate. What will tell you something is *which* assessment each teacher brings
second, and what she says when she brings it.

---

## Files

| path | what |
|---|---|
| `esa/index.html` · `esa.css` · `esa.js` | the four-screen teacher flow |
| `esa/admin.html` · `admin.js` | the pilot view |
| `assignment-studio/functions/esa-review/index.ts` | the one endpoint |
| `assignment-studio/functions/_shared/esa.ts` | the two-stage engine |
| `assignment-studio/functions/_shared/esa-prompts.ts` | **generated** — see provenance below |
| `assignment-studio/sql/2026-09-10-esa-pilot.sql` | the migration |
| `assignment-studio/deploy-esa.mjs` | deploy + prove what is live |

`esa.ts` imports `db`/`json`/`preflight` from `_shared/lib.ts` and `callModel` from `_shared/engine.ts`.
It adds nothing to either and does not touch `as-studio`, `as_assignments` or `as_versions`.

---

## Provenance

`esa-prompts.ts` is generated, not written. The three system prompts are emitted from
`assignment-studio/experiments/evidence-a/lib/stages2.mjs` — the same module that produced the run
which passed the structural check — so what ships is byte-identical to what was verified. Each prompt
carries its sha256 in the generated header, and the running function records `prompt_sha` on every
review.

That experiment record lives on branch **`exp/esa-two-stage`**, deliberately not merged here:

| commit | what |
|---|---|
| `197ac63` | coverage/conditions as two paths — structural check **PASSES** |
| `2cd763e` | the two-stage separation — release check **FAILS**, and why |
| `ceb6455` | H1 four-dimension scoring — **FAIL**, the finding that caused all of this |

To regenerate the prompts, check out that branch and run
`node assignment-studio/experiments/evidence-a/emit-esa-prompts.mjs`.

---

## Deploying

Order matters.

```bash
# 1. migration FIRST — the function writes columns it creates
psql "$DATABASE_URL" -f assignment-studio/sql/2026-09-10-esa-pilot.sql

# 2. secrets, in Supabase → Edge Functions → Secrets
#    ANTHROPIC_API_KEY   already set for as-studio; the same key
#    ESA_ADMIN_KEY       anything long and random; gates /esa/admin.html only

# 3. the function
SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy-esa.mjs

# 4. five invites
```

```sql
insert into esa_invites (token, teacher_label, reviews_allowed) values
  (encode(gen_random_bytes(16), 'hex'), 'Teacher 1', 3),
  (encode(gen_random_bytes(16), 'hex'), 'Teacher 2', 3),
  (encode(gen_random_bytes(16), 'hex'), 'Teacher 3', 3),
  (encode(gen_random_bytes(16), 'hex'), 'Teacher 4', 3),
  (encode(gen_random_bytes(16), 'hex'), 'Teacher 5', 3);
```

The links are `https://thesovereign.academy/esa/review/?i=<token>` and the admin view lists them.

Static hosting is Vercel with explicit rewrites; `vercel.json` gains `/esa/review` and `/esa/review/`; `/esa` and `/esa/` belong to the public ESA homepage.
No TSA, BSA, FSA or Assignment Studio route is changed.
