# Gold harness — four assignments, twelve cases

**Status: corrected 2026-09-08 per owner review (fractions strategy choice · science extrapolation + energy-transfer framing · ELA paragraph-as-constraint and framing/selected detail · preservation kept separate from usefulness); awaiting final approval as evaluation truth.**

| id | cell | archetype | difficult part the transformation must not remove |
|---|---|---|---|
| `g5-math-fractions` | Grade 5 · Math | practice set + word problems + error analysis | students construct the common denominator; regrouping to a mixed number (items 6–7); stated reason in item 9 |
| `g8-ela-evidence` | Grade 8 · ELA | evidence paragraph on informational text | the author's position is never stated — it must be inferred from technique; rubric point 3 needs connected explanation |
| `g8-sci-ramp-data` | Grade 8 · Science | data interpretation + CER | recognising the data contradict proportional reasoning (item 6); energy reasoning in item 5 |
| `g10-ss-gilded-age` | Grade 10 · Social Studies | primary-source comparison + argument | sourcing/POV used to *weigh* contradictory evidence (item 4, rubric point 4); documents untouched |

Each folder holds:

- `assignment.md` — the assignment exactly as a teacher would upload it (original material; the two Gilded Age excerpts are public-domain primary sources, checked by the owner against published transcriptions on 2026-09-08 — provenance in `gold.json.provenance`).
- `gold.json` — answer key; the **gold Learning Contract** (four fields, the same four the product shows a teacher); `notes_for_reviewer`; and for each of the three modes a `mode_boundaries` record: *pass looks like*, *violation looks like*, and *expected statuses*.

What the gold record is for:

1. **Inference accuracy.** The engine's inferred Learning Contract is compared to the gold contract (`INFERENCE.md` in each run). Disagreement on *learning target* or *required thinking* is the finding that matters; wording differences are not.
2. **Transformation validity.** Each mode's output is judged against `mode_boundaries` by a human (`REVIEW.md`: ship / edit / reject + which boundary). The automatic columns (statuses within expected range, count of `REVIEW_REQUIRED`, item counts) are telemetry, never proof.
3. **Contract soundness.** If a case cannot be transformed within its boundaries by any reasonable output — i.e. the boundary itself is wrong — that is a contract problem and goes back to `TRANSFORMATION-CONTRACT-v0.1.md` before anything else is built.

Each case also carries **expected audit behaviour** (`mode_boundaries.<mode>.expected_audits`) for the live transforms, and one **planted fixture** (`fixtures/`, expectations in `gold.json.fixtures`) that tests the audits themselves rather than the transformer:

| case | fixture | what it plants | must produce |
|---|---|---|---|
| g8-ela-evidence | `support-polished-violation.md` | clean scaffolds, but Step 1 states the author's position and Step 2 pre-selects the evidence | Preservation **BLOCK** on required_thinking; usefulness may still say usable — validity and usefulness are separate |
| g5-math-fractions | `visible-valid-excessive-burden.md` | every invariant kept; three boxes per item (prediction, solution by any method, explanation in words or a labelled picture), a one-page reflection, a 5-minute conference per student | Usefulness **NOT_USEFUL** (grading much more, feasibility 1); preservation **PASS or REVIEW** — a REVIEW on the explicit 25-minute constraint is fine, a BLOCK for generic burden is a miss (tests 'instructionally faithful but practically bad') |
| g8-sci-ramp-data | `visible-apparent-resistance-bypassable.md` | personalised digit, "own words", "don't copy the textbook", honesty signature — no prediction, no in-class check | Adversarial **UNDERMINED** with a concrete cheapest path and a repair hint that is not detection |
| g10-ss-gilded-age | `support-clean-pass.md` | documents intact, glosses beside text, sourcing + planning tables, same rubric | Preservation **PASS**, usefulness **USEFUL** |

Deliberate design choices:

- All four assignments are *sound* — none has a planted flaw. The harness measures whether transformation preserves, not whether the engine can find cracks (that was the Stress Test's question).
- Boundaries include what **must not** happen in each mode (the counterfeits: pre-filled denominators, position stated in directions, linearised data, paraphrased sources; "five more questions" as Advanced; "explain your thinking" everywhere as Visible).
- Teacher constraints include the rubric where one exists, so "same rubric" is a testable preservation claim.

Run: `node assignment-studio/harness/run.mjs` (needs the `ANTHROPIC_API_KEY` secret on the `as-studio` edge function). Outputs land in `harness/runs/<stamp>/`, tagged `pilot_id=harness` in the database.
