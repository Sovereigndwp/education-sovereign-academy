# 04 — Ontology stress test (Part 5)

**Status:** 2026-09-04 · Ontology v0.1 applied to eight Algebra I learning claims (`03-EXAMPLE-RECORDS.json`). Verdict at the end: **no v0.2 issued** — the test produced field-level changes (already folded into v0.1 before publication) and one structural finding that is recorded rather than patched.

---

## 1. Claims tested, by type

| Claim | Type | Existing activity → delegability | Primitive(s) that reached it | Cheap independent check designed? |
|---|---|---|---|---|
| LC-1 equation from two points | procedural | problem set → full | Perturb, Reverse | Yes (EC-01, EC-02) |
| LC-2 slope = rate, intercept = start; which feature controls which parameter | conceptual | modelling worksheet → full | Diagnose, Perturb | Yes (EC-03, EC-04) |
| LC-3 table ↔ equation ↔ graph | representational | Desmos task → full; pair matching → low | Represent ×2 | Yes (EC-05, EC-06) |
| LC-4 linear iff constant rate per unit x (uneven x) | conceptual | sorting homework → full | Classify, Predict | Yes (EC-07, EC-08) |
| LC-5 find and fix a slope error | diagnostic | error-finding sheet → full | Diagnose | Yes (EC-09) |
| LC-6 build a linear model from indirect information | application | take-home modelling → full | Transfer, Generate | Yes (EC-10, EC-11) |
| LC-7 solve a two-step equation from context | procedural | auto-scored drill → full | Reverse | Yes (EC-12) |
| LC-8 judge whether linear is reasonable for real data | application (judgment) | data project → partial | — | **No.** Recorded, not forced. |

Coverage: five of the eight primitives were used on more than one claim type; **Predict** and **Classify** each reached only one claim type in this topic (conceptual). That is a property of the topic, not a defect — both are expected to matter more in functions-family and quadratics units. **Transfer** and **Generate** were the two most expensive to write and to score, as predicted.

---

## 2. Where Practice / Production / Evidence failed to describe what is happening

**F1 — "Evidence" is not a kind of activity.** Tagging the pair card-matching activity (LC-3) as `practice + evidence` was correct in the teacher's sense (she watches it and learns something) and wrong in the ontology's sense (there is no artifact, and the observation is of the *pair*, not the student). The triad treats Evidence as a third role of an *activity*; assessment science treats evidence as a role an *observation* plays relative to a *claim*, under *conditions*. Resolution: `Existing Activity` now carries `supervision_condition` and `what_it_supports`, and the machine-readable structure is ECD's claim–evidence–task, with the triad kept as teacher-facing vocabulary only (01 §0, §7). **Structural, recorded; not patched away.**

**F2 — Delegability of production says nothing about feed-forward.** The LC-8 data project is `partial` (the data are collected in class), which under the original hypothesis would have made it a decent evidence source. It is not: everything downstream of the data table is producible from a photo of the table. This is the Track-2 falsification appearing inside the ontology. Resolution: `feed_forward_risk` field added; rule in 01 §1.3 that `partial`/`full` artifacts are never the *sole* evidence for a claim when independence is wanted.

**F3 — Some claims have no cheap independent check, and the ontology had no way to say so.** LC-8 is a judgment over a data set. Every short item we drafted either pre-digested the data (removing the judgment) or became a 15-minute task (no longer "short"). Two drafts are recorded here so they are not redrafted later: (a) "Here are five points; is a line reasonable? Explain" — 3 minutes, but the points are chosen by us, so the judgment is trivialised; (b) "Which of these three scatterplots would you model with a line?" — a Classify item that reaches *recognition* of linear-ish data, which is a neighbouring claim, not LC-8. Resolution: `no_short_check_reason` field added; the pack says so on p. 2. **This is the most important honest line in the product.**

**F4 — Practice-and-evidence with no artifact.** A watched mini-whiteboard warm-up is Practice + Evidence and produces no artifact. The schema originally required an artifact per activity. Resolution: the `Existing Activity` object requires an *observation*, which may be transient; `supervision_condition: observed_live` covers it.

---

## 3. Ambiguous classifications

| Case | Ambiguity | Ruling |
|---|---|---|
| EC-03 (candle) part (b) | Is the item Diagnose (part a) or Reverse (part b)? | One item, two claims: the record scores (a) for LC-2 and (b) for LC-7. Allowed, but the evidence statement must separate them — it does. Rule: an item may serve two claims only if the scoring rule separates them. |
| EC-04 (perturb the taxi) | Perturb or Predict? The student predicts which parameter changes. | Perturb: the novelty target is the *change* to a familiar base problem; Predict stands alone with no base. |
| EC-08 (two plans) | Predict or Represent (comparing two equations)? | Predict: the evidence is a qualitative claim made before computation. The overlap is real and is documented in 01 §3. |
| EC-11 (generate a line) | Generate or Reverse? | Generate: the response space is large and the key is a constraint list. Reverse has a unique keyed answer. The distinction changed the scoring rule, which is why it is worth keeping. |
| LC-5 claim type | "diagnostic" as a claim type overlaps with Diagnose as a primitive. | Kept both: the claim type says what the *student* is claimed to be able to do (find errors); the primitive is a transformation that can be applied to *any* claim type (EC-03 is Diagnose applied to a conceptual claim). |

---

## 4. Primitives that overlap

- **Perturb ↔ Predict** (EC-04 vs EC-08): overlap in response form (a choice + a reason). Kept separate because the novelty target differs and because Predict works without a base problem. If a later topic shows every Predict item is also a Perturb, merge.
- **Reverse ↔ Generate** (EC-02/EC-12 vs EC-11): overlap in direction (from constraints to object). Kept separate because unique key vs constraint checklist changes scoring time by ~3×.
- **Diagnose ↔ Classify**: EC-07's "P is not linear" is a classification; asking a student to say *why* P is not linear and *fix* a claim that it is would be Diagnose. The rule "repair = Diagnose, sort = Classify" held on every item.
- **Represent ↔ Transfer** (EC-05 vs EC-10): both change the form information arrives in. Represent stays inside mathematical representations; Transfer changes the *situation*. Held.

No merges. No primitive went unused. **Explain** remains rejected as a standalone (01 §3) — the test confirmed that every place an explanation was wanted, a one-line reason scored for a named feature did the same evidentiary work at a fraction of the scoring cost.

---

## 5. Fields

**Removed from the kickoff candidate list (did not earn their complexity):**
- `estimated_class_minutes` — derivable (student minutes + 1–2 min handling); storing it invites drift between two numbers.
- `novelty_requirement` — subsumed by `variant_rule`, which is operational rather than descriptive.
- `observable` — definitional.
- `limited_external_assistance` — folded into `supervision_condition` + `tools_allowed`.

**Added (load-bearing):**
- `variant_rule` (vary / fix / key_change / avoid) — the single most useful field in the product; it is what makes "fresh" producible.
- `claim_type` — decides which primitives can reach a claim.
- `feed_forward_risk` — F2.
- `no_short_check_reason` — F3.
- `cost_status` (`modeled` / `reported`) — every number in the pack is modelled; the field forces that to be visible and lets it change.
- `parallel_forms` — three forms per item turned out to be what "administered simultaneously" actually requires.
- `distractor_rationale` — a selected-response item without it cannot be reviewed; it is also what makes the *flag* rule writeable.
- `review.status` / `key_verified_method` — human review and script-checked keys are the Track-1 moat; they must be visible in the record.

**Kept but weak:** `transfer_distance` was populated once (EC-10). Barnett & Ceci's dimensions are the right vocabulary, but at exit-ticket grain "near / moderate / far" plus a one-line summary did all the work. Keep as optional; do not expand.

**Missing, deliberately not added:** a per-item *reliability* or *evidence weight* field. It would be a number pretending to be a measurement (locked decision 1). Aggregation across items is left to the teacher and stated as such.

---

## 6. Key verification

All 12 items × 3 forms (36 keys) recomputed programmatically on 2026-09-04 (Python `fractions`; linearity test; intersection points; divisibility checks that make the "divide-first" error non-integer in every EC-12 form; uneven-step tables confirmed to defeat the "same y-difference" rule in every EC-07 form). Script output: `ALL KEYS VERIFIED`. Selected-response keyed positions: EC-05 A/C/B across forms; EC-04 B/A/C; EC-08 (yes, A)/(yes, A)/(yes, B); EC-07 QR/PR/PQ. No position is fixed across forms.

Not verified: any classroom time figure (all `modeled`); the claim that the contexts are "fresh" for a given class (depends on the textbook in use); language load for multilingual learners (a judgment, not a test).

---

## 7. Decision

**v0.2 is not issued.** The changes above were made before v0.1 was published, so v0.1 already carries them; issuing a v0.2 for the same content would misrepresent how many iterations the ontology has survived (one). Trigger conditions for a real v0.2, recorded so they are not rationalised later:

1. A second topic (quadratics or exponential functions) where a primitive is unused *and* a needed transformation has no home — e.g. "Estimate" (order of magnitude before computing) or "Constrain" (find the domain where a model holds), both of which LC-8 hints at.
2. Teacher-reported costs that differ from modelled costs by more than 2× on more than a third of items — that would mean the cost fields are not just uncalibrated but structurally mis-specified (e.g., scoring time depends on class size non-linearly).
3. Any claim type for which Practice / Production / Evidence *and* ECD both fail to describe the activity. None found yet.
