# Assignment Studio — migration plan from the Assessment Stress Test branch

**2026-09-05 · analysis only, nothing rebuilt · governs: the pivot memo of 2026-09-05; supersedes the $49 conversion experiment as the objective**

The Stress Test branch (`feat/assessment-stress-test`, pushed) is a working intake → machine draft → human review → release → teacher result loop with privacy, telemetry, and a finding renderer. About 70% of it survives the pivot unchanged; the rest is a rename or a generalisation, not a rewrite. The new work is almost entirely in three places: the **transformation contract** (invariants + preservation trace as data, not prose), the **classroom-needs input**, and the **multi-version output**. Everything below is ordered so that a school administrator can be shown something real in roughly two weeks of build, without touching the marketplace, accounts, or integrations.

Two housekeeping items first, because they block a clean start.

- **Git.** The pushed branch contains three commits: my two (stress-test only) and `da9440d`, which deletes `deep-dives/chart.umd.js`. That file is still referenced by `deep-dives/bitcoin-backed-mortgages.html`, so the deletion is almost certainly unintentional and will break that page when merged. I could not revert it from here: git on the mounted clone cannot take its index lock. One command on your Mac fixes it without rewriting pushed history: `cd ~/projects/sovereign-academy-hub && rm -f .git/index.lock && git revert --no-edit da9440d && git push`. Then the branch is exactly the Stress Test work plus your existing `CLAUDE.md` commit.
- **Token.** The review token is rotated. The hash in `ast_settings` is updated; the old token no longer works. The new one is only at `~/projects/_secrets/ast-review-token.txt` on your Mac — outside every repo, not in chat.

---

## 1 · What stays exactly as it is

These pieces are correct for the new product without modification, and several are the parts competitors do not have.

| Piece | Why it survives untouched |
|---|---|
| **No-student-data boundary** (form copy, confirmations, review-time deletion, withdrawal that removes file + text) | This is now the wedge against the NYC-style procurement problem. Word for word. |
| **Teacher ownership / privacy rules** (result belongs to the teacher, no sharing with school without written permission, no training on submissions, right of withdrawal) | The school pilot promises aggregate findings only; these rules are what make that promise credible. Keep, and add one line: aggregate, anonymised pilot analytics are shared with the school. |
| **Private uploads** (`ast-uploads`, service-role only, signed URLs for review) | Unchanged. DOCX support is the only addition (see §4). |
| **Intended-understanding field + "what we understood you to be measuring" callout** | This *is* the Intent Map's seed. It becomes step 1 of the workflow rather than a sidebar. |
| **Machine draft → human review → release** (`draft` / `free_finding` / `status` state machine, review page, `auto_release` toggle off) | Identical shape for transformations: draft → Dalia reviews → release. Nothing about the pilot requires removing the human. |
| **Finding taxonomy + the "no strong evidence" path** | Becomes the AI Substitution Check module inside the studio. The clean-result path is the proof the engine does not manufacture problems. |
| **"What did not change" + "cost to you" fields on every finding** | These are the preservation trace and teacher-time estimate in embryo. Promote, do not replace. |
| **Worry text, least-confident item** | Teacher language capture; the plan's most valuable table. Keep. |
| **Insert-only, no-PII event telemetry** (`ast_events`, publishable key, random session id) | Same contract; only the event vocabulary grows. |
| **Review page as the operator console** (queue, detail, edit, release, settings, numbers) | Grows, is not replaced. |
| **Paper-document renderer** (`renderFinding`) and the TSA token/skin decisions | The preservation card and every version render through the same document component. |

## 2 · What gets generalised or renamed

The submission row is really a **transformation job** with one input artifact and several output artifacts. Today it has exactly one output shape (a finding). The generalisation is to make outputs a list with types.

| Today | Becomes | Note |
|---|---|---|
| `ast_submissions` (one assessment, one free finding, one paid report) | **`ast_assignments`** (the uploaded artifact + teacher context + confirmed intent) and a new **`ast_versions`** table (one row per produced artifact: `core_redesign`, `support`, `advanced`, `language_support`, `verification`, `teacher_pack`, `student_pack`, `substitution_check`) | Rename via view first (`create view ast_submissions as select … from ast_assignments`) so the existing functions keep working while the new ones ship. |
| `draft.intended_measure` (free text) | **`intent_map`** jsonb: `{objective, cognitive_demand, required_evidence[], standards[] (optional), teacher_constraints[]}` + `intent_confirmed_at`, `intent_corrections` jsonb | The confirm/correct step is the single most important new datum (§6). |
| `free_finding.what_did_not_change` (prose) | **`preservation_trace`** jsonb per version: `{changed:[{what, why}], preserved:[{invariant, how_shown}], invariants_checked:[7 keys → pass/adjusted/violated]}` + rendered prose | Same content the teacher already sees; now structured so it can be scored. |
| `finding_type` (six values) | Unchanged, but **scoped to the substitution-check version** rather than being the whole product | |
| `purchase_*` columns, Stripe link setting, request flow | **Dormant, not deleted.** School pilots are free; individual purchase may return as a channel. Hide the offer block behind a `pilot_mode` setting. | Deleting columns buys nothing and costs the option. |
| `teacher_cost` (free text per finding) | **`time_estimate`** per version: `{prep_minutes_original, prep_minutes_new, review_minutes_original, review_minutes_new, basis}` — still an estimate, labelled as one | Feeds the school's "time" aggregate. |
| `ast-teacher` result page | **Studio result page**: tabs per version, preservation card per tab, export buttons, one feedback block | Same token-link access model; no accounts. |
| `ast-submit` | **`ast-submit` + a second step `ast-confirm-intent`** (teacher POSTs corrections/confirmation; transformation starts only after confirmation) | The pause between upload and transform is the product's signature interaction. |
| Landing page `/stress-test/` | `/assignment-studio/` with `/stress-test/` redirecting; copy re-centred on "What must survive when we change this?" | Wording only. |
| Funnel views (`ast_funnel`, `ast_conversion`) | Replace the conversion view with **`ast_behaviour`** (uploaded → intent confirmed/corrected → versions accepted/edited → exported → used → 2nd/3rd upload → invite) and **`ast_preservation`** (corrections per invariant per version type) | §6 has the fields. |
| Channel/cohort tags | Add **`school_id`** and **`pilot_id`** (text, no accounts) so the school aggregate is a `group by` | This is the entire multi-tenancy the pilot needs. |

## 3 · What is now unnecessary

- The **$49 offer block, price copy, Stripe Payment Link setting, purchase-request flow, `purchases` ledger write** — keep the code, hide it behind `pilot_mode`. Do not spend a minute improving it.
- The **"free finding is 1 of N" framing** and the choice of a single best finding as the deliverable. In the studio the teacher gets the whole substitution check.
- The **individual-teacher recruiting script** and the 10-teacher experiment.
- `ast_conversion` as the governing view.
- The `ast-smoke` bucket (empty, private) — delete from the Storage dashboard.

Nothing in the edge-function auth, storage, or telemetry design is wasted.

## 4 · Smallest additional functionality for a credible Assignment Studio demo

In build order. Each item is independently useful; stop anywhere and you still have more than today.

1. **Intent Map step.** After upload, the machine drafts `{objective, cognitive_demand, required_evidence[]}`; the teacher sees "We believe this assignment is measuring these three things" with edit boxes and a *Confirm* button. Transformation does not start until confirmation. Store the diff between draft and confirmed as `intent_corrections`. (Half a day. The prompt for it already exists inside the current analysis prompt; it is being split out, not written.)
2. **Classroom-needs input.** One screen: grade, subject, time available, learning objective if known, a checklist of the supports from the memo (chunked directions, reduced language complexity without reduced rigor, vocabulary support, visual supports, reduced visual clutter, alternate response format, EF checkpoints, language scaffolds, extended processing structure, enrichment, greater abstraction, transfer challenge, advanced extension), a free-text "constraints" box ("I can't grade anything additional"), and an optional "these accommodations are already prescribed — preserve them" box. No disability fields anywhere. (Half a day.)
3. **Transformation contract as code.** A `transform(assignment, intent_map, needs, version_type)` call whose prompt is built from the seven invariants and whose output schema *requires* the preservation trace with every invariant marked `pass | adjusted | violated`. Any `violated` blocks release until Dalia overrides. This is the intellectual centre; it is one file (`analysis.ts` → `transform.ts`) and one prompt per version type. (Two days, most of it prompt design and testing against the benchmark.)
4. **Four output versions** for the demo: substitution check + core redesign, support version, advanced version, teacher pack (key/rubric/one verification mechanism). Language-support version only if the benchmark cell needs it. Student pack = the clean printable of whichever version. (Rendering is the existing document component; one day.)
5. **Preservation card** rendered at the top of every version: *What changed · What did not · Why*. Same component, three columns. (Hours.)
6. **Export.** Print-to-PDF already works via the paper skin; add "Download .docx" using the existing docx tooling on the review side, generated at release time and stored in the bucket. Teachers live in Word/Google Docs; PDF-only will read as "not usable". (One day.)
7. **DOCX intake.** Convert to text server-side (mammoth or equivalent in the edge function) so Word files are a first-class input. (Half a day.)
8. **Teacher actions on the result page:** *Accept · I edited this (paste) · I used this with students · Upload another*. Four buttons; each is an event and a column. This is where the behavioural metrics come from. (Half a day.)

That is roughly six to seven build days for a demo that runs one assignment through the whole pipeline with Dalia reviewing in the middle.

## 5 · What stays manual behind the scenes for the first pilots

- **Release of every version.** Dalia reads each transformation and its preservation trace before it goes live; `auto_release` stays off. This is also how the preservation-correction data gets its ground truth.
- **Any `violated` invariant.** Machine may not release; Dalia rewrites or rejects.
- **Rubrics and keys for open-response items.** Machine drafts; Dalia checks the mathematics/facts (the plan's factual gate).
- **Language-support versions in Spanish.** Dalia is the bilingual reviewer; do not automate the Spanish register.
- **Delivery email.** Prefilled mailto, as now. A pilot of 20 teachers × 3 assignments is 60 emails over four weeks — fine.
- **The school aggregate report.** Built from the views by hand at week 2 and week 4, as a paper-skin document. Do not build a dashboard.
- **Pilot onboarding.** A 20-minute department meeting, in person or video, not an in-product tour.

## 6 · Data to start capturing now

These fields are cheap to add today and impossible to reconstruct later. They are what turns corrections into product intelligence.

| Field / event | Where | Why |
|---|---|---|
| `intent_draft`, `intent_confirmed`, `intent_corrections` (diff), `intent_confirmed_at` | `ast_assignments` | Objective-identification accuracy — the plan's ≥75% gate — measured on every job, automatically. |
| `needs_requested[]` (which supports were ticked), `constraints_text`, `prescribed_accommodations_text` | `ast_assignments` | Adaptation demand discovery; the "which supports do teachers actually ask for" asset. |
| Per version: `status` (draft/released/accepted/edited/rejected), `teacher_edit_text`, `accepted_at`, `used_with_students_at` | `ast_versions` | Acceptance rate, edit rate, actual use — the three metrics that replace "would you pay". |
| Per version: `preservation_trace` with per-invariant status, and **`preservation_correction`** = teacher answer to "Did we change what you intended students to learn or demonstrate?" (yes/no + which invariant + free text) | `ast_versions` | The signature quality metric. Keyed by invariant so you learn *which* invariant the engine breaks most. |
| `time_estimate` per version + teacher-reported `minutes_saved` (optional, on the feedback block) | `ast_versions` | Economic value for the school report; estimate vs report tells you whether the estimate is honest. |
| `school_id`, `pilot_id`, `teacher_key` (random per-teacher token issued at onboarding, no account) | `ast_assignments` | Repeat behaviour (2nd/3rd assignment) and per-school aggregation without accounts or PII. |
| Events: `intent_view`, `intent_confirmed`, `intent_corrected`, `version_view`, `version_accept`, `version_edit`, `version_used`, `export_pdf`, `export_docx`, `second_upload`, `invite_sent` | `ast_events` | Behaviour inside the product replaces emailed PDFs as the evidence. |
| `archetype` (from the benchmark grid: e.g. `math.error_analysis`) — machine-tagged, Dalia-confirmed | `ast_assignments` | Lets acceptance and correction rates be compared across resource shapes, which is the marketplace's future taxonomy. |
| `model`, `prompt_version`, `generated_at` on every machine artifact | `ast_versions` | You cannot improve rejected transformations if you cannot tell which prompt produced them. |

Marketplace-proofing (assess only, per your instruction): keep **artifact provenance** as a chain (`ast_versions.parent_version_id`, `derived_from_assignment_id`), store the teacher's **edited text as a new version** rather than overwriting the machine's, and keep **author identity separable** from the school (a `teacher_key`, later a real account id). With those three habits the future "publish → another teacher adapts under constraints" flow is a new table and a permission model, not a migration. What would make it hard: overwriting versions in place, storing school identity inside artifacts, and putting rubrics/keys inside the same blob as the student-facing text.

## 7 · The 36-assignment benchmark / evaluation harness

**Corpus.** Grade 5 / 8 / 10 × Math / ELA / Science / Social Studies × 3 archetypes = 36, all original or CC-BY/CC0. Archetypes chosen from what teachers demonstrably buy (TPT categories as intelligence only): Math — practice set, word problems/error analysis, exit ticket; ELA — reading comprehension, evidence paragraph, argument/analysis; Science — CER response, data interpretation, concept check; Social Studies — document analysis, source comparison, cause/effect argument. Each item ships with: the assignment, a *stated* intended objective, a *hidden* gold intent map (objective, cognitive-demand band, required evidence) written by Dalia, and a note of which items are deliberately sound (at least 8 of 36 should have no strong substitution or validity problem, so the harness measures false positives).

**Layout.** `benchmark/<grade>/<subject>/<archetype>/` with `assignment.md`, `gold.json`, `needs.json` (two or three classroom-needs profiles per item), `LICENSE`. Generated outputs go to `runs/<date>-<prompt_version>/` and are never committed to the repo history beyond a summary.

**Runner.** One script: for each item × needs profile × version type, call the transform, store outputs, then score. Scores fall into three groups. Automatic: JSON validity; every invariant present; `violated` count; length and reading-level deltas per version (support versions should drop reading level and *not* drop the required-evidence list); numerical/answer-key checks for math (recompute); duplicate-content checks (an "advanced" version that is the core version plus one sentence fails). Model-graded against gold: intent-map agreement on objective and cognitive-demand band; whether required evidence survived in each version (the preservation score); whether the substitution check found the planted shortcut/false-positive and stayed quiet on the sound items. Human: Dalia grades a fixed random 12 per run on a 3-point scale (ship / edit / reject) and records the reason; her grades calibrate the model grader.

**Reported numbers, per prompt version.** Intent-map accuracy; preservation pass rate by invariant and by version type; false-positive rate on sound items; edit/reject rate on the human sample; mean time estimate honesty (later, against pilot reports). A prompt change ships when it does not regress any of these on the 36. The same 36, with gold answers stripped, are the public before/after demo library — the harness and the marketing asset are the same files.

## 8 · Minimum screens for the school-pilot version

1. **Landing** (`/assignment-studio/`): the promise, the seven invariants in plain language, three before/after examples from the benchmark, "no student accounts, no student data", and one button.
2. **Upload** (existing submit page, re-labelled): file/text + subject/grade + intended objective + classroom needs + constraints + confirmations.
3. **Confirm intent**: "We believe this assignment is measuring…" — edit, confirm. The only new screen with new interaction design.
4. **Result / Studio**: tabs (Substitution check · Core · Support · Advanced · Teacher pack), preservation card on each, export buttons, the four teacher actions, the feedback block (now: surprising? changed what you meant? would use again? minutes saved?).
5. **Review** (existing, extended): queue by school, per-version editor, invariant status, release, export generation, numbers by school.
6. **Founding School Pilot page**: one page an administrator reads in under three minutes — what teachers do, what the school receives, what is never collected, the design-partner terms, one contact action.

Six screens. Two are new (3 and 6); the other four are the existing pages grown.

## 9 · What must not be built yet

Student accounts or any student-facing surface · LMS, SSO, rostering · marketplace, payments to creators, publishing flow · a standards database (accept a standard code as a string when the teacher supplies one; nothing more) · district dashboard (the school report is a hand-built document) · grading engine · IEP/504 management or any disability field · Class Profile as a persistent object (capture needs per assignment now; the profile is a later convenience) · every subject and grade (12 cells, and only what the benchmark covers) · automated email · automated release · a chatbot.

## 10 · Fastest realistic sequence from today's branch to a school-administrator demo

| Days | Work | Done when |
|---|---|---|
| 0 | Revert the `chart.umd.js` deletion; merge the branch as-is (additive) so `/stress-test/` is live under the TSA domain; add `ANTHROPIC_API_KEY`; run your own quiz through it to see the machine draft for the first time | The existing loop works end to end on production with a real draft |
| 1–2 | **Transformation contract**: write `transform.ts` with the seven invariants, the per-version prompts, the preservation-trace schema; port the substitution check into it; unit-test parsing | Two different models produce comparable traces on three benchmark items |
| 2–3 | **Schema generalisation**: `ast_assignments` + `ast_versions` + intent fields + needs fields + new events; compatibility view for the old name | Old pages still work; new columns fill |
| 3–4 | **Confirm-intent step** and **classroom-needs input** on the submit flow | A teacher can upload, correct the intent map, tick needs, and submit |
| 4–6 | **Studio result page** with tabs, preservation cards, teacher actions; review-page editor per version; DOCX in and out | One assignment goes upload → confirm → four versions → Dalia releases → teacher exports .docx |
| 6–10 | **Benchmark**: write the 36 (Dalia authors gold intent maps; the machine drafts assignments in the archetype, Dalia edits); build the runner; iterate prompts until preservation pass rate and false-positive rate are presentable | 36 before/after packets exist; a summary table of harness scores exists |
| 10–12 | **Demo library** page (12 cells, click into any item, toggle versions) and the **Founding School Pilot** page; re-centre landing copy | An administrator understands it unassisted in under three minutes (test on two people) |
| 12–14 | Outreach list of 50 leaders (C&I, instructional tech, department heads, SPED directors, AI committees) + 15 teacher champions; the offer text from the memo; a 20-minute demo script that runs one of *their* assignments live | First five conversations booked |

Two weeks of build, then selling. The build is deliberately front-loaded on the contract and the benchmark because those are the two things a competitor cannot copy by adding a feature, and they are what an administrator will actually be looking at when you say "this is what we changed and this is what we refused to change".

**Where I would push back on the memo, briefly.** First, "Days 6–12: working MVP" is realistic only because the intake/review/telemetry half already exists — which is the argument for merging the current branch rather than starting a new repo. Second, the seven-invariant contract is the product; if the benchmark shows the engine cannot hold *cognitive demand* and *required evidence* reliably on support versions, no pilot should start, because the school report would document exactly that failure. Make the harness the go/no-go, not the calendar. Third, Class Profile is the feature administrators will want first and it is the one most likely to drift toward per-student decisions; keep it per-assignment until the preservation numbers are trustworthy.
