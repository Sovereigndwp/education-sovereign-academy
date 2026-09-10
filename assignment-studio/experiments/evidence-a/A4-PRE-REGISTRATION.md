# A4 — split-claim follow-up

**Branch:** `exp/evidence-a4-split-claim`, cut from **`9616043`**.
**`616eefa` and `9616043` are preserved untouched.** They remain the evidence that the original compound
claim produced a *decision-level* ambiguity — not a restraint failure — and re-scoring the A3 packet after
this branch's plumbing change reproduces it exactly (V1 zero interventions, zero violations).

## Purpose

Test whether explicitly separating the two meanings currently joined by "or" produces **stable** evidence
judgments.

## The only substantive change

The original `G5C2` stays **as written** in `groundtruth/claims.json`. For this follow-up only, a
**separate, additive** claim set supplies its expectations explicitly. New files; nothing existing edited:
`cases/cases-a4.json`, `groundtruth/claims-a4.json`, `groundtruth/expected-a4.json`, loaded with `--set=a4`.

| claim | statement |
|---|---|
| `G5C2core` | Constructs equivalent fractions with a common denominator and combines or compares the resulting like-sized parts. |
| `G5C2a` | Simplifies a reducible fraction result to lowest terms when the item requires it. |
| `G5C2b` | Regroups an improper fraction result to a mixed number when the item requires it. |

`G5C1` and `G5C3` are byte-identical to the original set.

### One judgment call, flagged rather than buried

The original `G5C2` named **three** things: construct equivalent fractions with a common denominator ·
combine or compare the like-sized parts · simplify **or** regroup. Only the third is ambiguous. Supplying
only `G5C2a` and `G5C2b` would silently drop the first two — which every A3 repeat found present, without
disagreement — and would narrow the claim below what the original intended. So they are carried as
`G5C2core`, worded verbatim from the original minus its ambiguous tail. **Nothing is broadened.** If you
would rather test the strict two-claim split, say so and it is a one-line change and five more runs.

## Held constant

A2 gates · A3 component map · model · prompt logic · thresholds · scoring logic · the assessment file ·
every declared administration condition · the intervention hierarchy · the execution path. The user prompt
differs only in the claim list it carries, which is the change under test.

## Pre-registered expectation — a new hypothesis, not a correction of prior ground truth

Prior ground truth is not modified, reinterpreted or re-scored. This is recorded as a hypothesis arising
from the ambiguity found in `616eefa`.

Every computed result in the assessment is already irreducible — 5/6, 7/12, 4 1/12, 1 7/12, 5/12, verified
by hand — while items 6 and 7 do force regrouping. So:

| claim | expected verdict | intervention |
|---|---|---|
| `G5C1` | `KEEP` | no |
| `G5C2core` | `KEEP` | no |
| **`G5C2a`** | `LIMITED` **or** `NOT_SUPPORTED` | **yes** |
| **`G5C2b`** | `KEEP` | **no** |
| `G5C3` | `KEEP` | no |

`G5C2a` allows either verdict deliberately: both are defensible, and the experiment wants to see which it
gives. **The decision-level expectation is the distinction itself** — a warranted intervention on
simplification, none on regrouping. These outcomes are not forced, and nothing will be tuned after a result
is seen.

## Success

All five repetitions must consistently distinguish:

- **simplification absent → limited / minimal intervention**, from
- **regrouping present → keep / no intervention**.

Secondary, and reported per run rather than as an aggregate: whether the proposed simplification
intervention stays **minimal and materially the same** across repeats.

Every run is reported individually.

## If it does not stabilise

Stop again and report why. Nothing is merged, deployed, or connected to any teacher-facing surface during
this follow-up.
