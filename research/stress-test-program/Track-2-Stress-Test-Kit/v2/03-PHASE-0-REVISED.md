# Phase 0, revised — the dry run around the new question

**Status:** draft · 2026-09-04 · replaces plan §6 "Phase 0" and the Phase 0 items in the v1 approval checklist.
**Question Phase 0 answers:** does a supervised verification moment give a teacher evidence the take-home didn't, at a cost she would pay again — and who owns the decision to let it carry the grade?

Phase 0 does *not* answer the sufficiency question (how few moments a semester needs). It establishes cost, an existence proof of the evidence gap, and the adoption gate. Phase 1 is redesigned only after these three are known.

---

## Two tracks, same fortnight

### Track A — five audits, five runs

Five assignments: three of Dalia's own, two from friendly colleagues (secondary math; one may be Geometry or Precalc to test the variant rule outside quadratics). For each:

1. Write the v2 audit (template 01). Log the minutes.
2. Build the item sheet and keys. Log the minutes.
3. The teacher runs the moment in every section that did the assignment.
4. The teacher scores it against the keys and records the cross-tab below.
5. One follow-up conversation, ≤15 min, the questions in the next section, answers verbatim.

Dalia runs it herself where the assignment is hers. Where it is a colleague's, she may sit in but does not touch student work; the counts come from the teacher.

### Track B — three chair conversations

Three department chairs (math, ideally different schools; one may be a C&I coordinator). One question, asked before anything about the product is explained:

> "If a math teacher in your department wanted homework and projects to count as practice only, and one short in-class transfer item to carry the grade those used to carry — could she do that this semester on her own? If not, who would have to agree, and how long would it take?"

Record the answer verbatim. Then, and only then, show the worked example and ask what they'd want to see before letting a teacher try it. Nothing is offered or priced.

---

## What is recorded

### Per audit (Track A)

| Field | Type | Why |
|---|---|---|
| `audit_write_min` | int | Dalia's capacity — the real constraint |
| `item_build_min` | int | Cost of variants + keys; should fall with practice |
| `claims_confirmed` | 0–3 + verbatim correction | Section 1 accuracy (≥75% threshold carries over) |
| `delegation_answer` | yes / no-because | Expect yes; a no is interesting |
| `checked_by` | judgment / models-run | Whether the two-model check ever changes the answer |

### Per section run (Track A) — counts only, never names

| Field | Type | Why |
|---|---|---|
| `n_students` | int | |
| `run_min_actual` | int | Clock time including handout and collection |
| `score_min_per_student` | decimal | The number the whole §11 risk turns on |
| `project_full__item_yes` | int | |
| `project_full__item_no` | int | **The evidence gap.** The cell the article is about |
| `project_partial__item_yes` | int | The reverse gap: understood, didn't produce |
| `project_partial__item_no` | int | |
| `project_low__item_yes` / `_no` | int | |
| `phone_or_notes_incident` | int | Residual risk, observed |
| `student_reaction_verbatim` | text | One or two lines the teacher heard |

### Per teacher, after the run

| Field | Type | Why |
|---|---|---|
| `told_you_something_new` | yes / no + verbatim | The value question, in her words |
| `would_run_again_next_cycle` | yes / no / modified + why | Behavioural adoption signal |
| `can_carry_grade_unilaterally` | yes / no / unsure | **The adoption gate** |
| `gradebook_owner` | text | Chair / dept vote / district / "me" |
| `minutes_comparison_verbatim` | text | "Compared with grading the original, this took…" |
| `would_prefer_oral_sample` | yes / no + why | Whether written-to-all was the right default |
| `unprompted_forward_or_ask` | text | Did she show it to anyone, ask for another |

### Per chair (Track B)

| Field | Type | Why |
|---|---|---|
| `unilateral_possible` | yes / no / conditional + verbatim | Where the funnel starts |
| `approval_path` | text | Who, how long |
| `wants_to_see_before_yes` | verbatim | The department product spec, in their words |
| `raised_cost_or_scale` | yes / no + verbatim | Monetisation signal, if any; not solicited |

Add these to the v1 tracking schema (06) as a new tab; the v1 source/friction/refusal fields still apply to colleagues and chairs.

---

## Pre-registered thresholds

Set now, judged on the five runs and three conversations. Uncomfortable on purpose.

**Proceed to Phase 1 if all of:**

- Median `score_min_per_student` ≤ 1.5 and median `run_min_actual` ≤ 10.
- `project_full__item_no` > 0 in at least three of five assignments — the gap exists.
- At least three of five teachers say `would_run_again_next_cycle` = yes or modified, unprompted by us.
- `claims_confirmed` ≥ 2 of 3 on at least four of five audits.

**Stop and re-diagnose if any of:**

- Median `score_min_per_student` > 2.5 — the moment costs more than the grading it replaces.
- `project_full__item_no` = 0 across all runs — the evidence problem isn't showing up in math at this grain; revisit the item design (too easy? too close to the project?) before revisiting the thesis.
- Fewer than two teachers would run it again.

**Route, don't stop:**

- If 3 of 3 chairs say a teacher cannot do this unilaterally → the free deliverable still goes to teachers (they want it) but the *offer* is designed for chairs from day one, and Phase 1 recruits through them. The plan's Stage 3 becomes Stage 1.
- If ≥ 2 chairs say a teacher can → the teacher funnel stands; Phase 1 as planned, with the gradebook question kept in every audit.

---

## Capacity

Five audits at ~60 min each plus ~20 min per item build ≈ 7 hours of Dalia's time, plus three conversations. Two weeks. This replaces the plan's Phase 0 (5 audits, 1 week) at roughly the same cost, with the runs added.

---

## What Phase 1 becomes if Phase 0 passes

The sufficiency experiment. Same instrument, varied deliberately across the 15 teachers:

- **Items per claim:** one vs. two. Does a second item change the yes/no for more than ~10% of students? If not, one is sufficient.
- **Coverage:** all students every cycle vs. a rotating sample reaching everyone twice a semester. Same evidence gap detected?
- **Timing:** due-day vs. one week later. Does the gap widen (forgetting) or close (consolidation)?

Each variation is one question a teacher can answer with counts. Together they are the beginning of an answer to "minimum sufficient evidence" — which is the only thing here a free generator cannot ship.

---

## What Dalia must approve before Phase 0 starts

1. The reframed question at the top of this file, as the project's organising question.
2. Locked decision 1 changed in form: binary delegation answer, three bands retired for take-home evidence, disclaimer kept, qualitative judgment moved to the moment itself.
3. Locked decision 4 confirmed as math-first, with the contrast cell's purpose restated (different machine, not pain comparison).
4. Written-to-all as the default moment; oral-sample as the recorded fallback.
5. The gradebook question asked verbatim in every audit, and the three chair conversations run *before* any teacher outreach.
6. The thresholds above, especially the stop criteria.
7. Which three of her own assignments, and which two colleagues.
8. The Substack piece written as the honest history — hypothesis, falsification, new question — and not published until Phase 0 has at least one real cross-tab in it.

## Strongest argument against this Phase 0

It measures math, with Dalia's own assignments, in classes she can influence, and it will probably pass. A pass here says the machine works where it was built to work. It says nothing about whether a teacher who didn't write the audit will run six minutes she didn't design, and it says nothing about writing-heavy subjects, where the same architecture costs ten times more to score. Both are Phase 1 questions, and the honest reading of a Phase 0 pass is "cheap enough to be worth a real test," not "validated."
