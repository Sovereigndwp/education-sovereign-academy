# A4 — split-claim follow-up · results

Pre-registered at `5d967b0`, before the run. `616eefa` and `9616043` untouched and still scoring as
recorded. Five identical repeats, `--a3 --set=a4`. Nothing tuned after a result was seen.

## Every run, not an aggregate

| run | G5C1 | G5C2core | **G5C2a** simplification | **G5C2b** regrouping | G5C3 |
|---|---|---|---|---|---|
| 1 | KEEP | KEEP | **NOT_SUPPORTED + 1 item** | **KEEP, no intervention** | KEEP |
| 2 | KEEP | KEEP | **NOT_SUPPORTED + 1 item** | **KEEP, no intervention** | KEEP |
| 3 | KEEP | KEEP | **NOT_SUPPORTED + 1 item** | **KEEP, no intervention** | KEEP |
| 4 | KEEP | KEEP | **NOT_SUPPORTED + 1 item** | **KEEP, no intervention** | KEEP |
| 5 | KEEP | KEEP | **NOT_SUPPORTED + 1 item** | **KEEP, no intervention** | KEEP |

**5 of 5 on every claim.** 25 of 25 claim-decisions match the pre-registered expectation.
Stability **PASS** — identical verdicts *and* identical intervention decisions across all repeats.
Zero structural violations. Restraint rate **1.000**, detection recall **1.000**.

`G5C2a` returned `NOT_SUPPORTED` rather than `LIMITED` in all five — inside the allowed set, and the
stricter of the two: no item produces an independent observation of reduction at all.

## Is the proposed intervention minimal and materially the same?

Yes. All five: one **Perturb** item, ~2 student-minutes, 15–20 scoring seconds. Only the numbers differ,
and every one is chosen so the answer is genuinely reducible:

| run | item | answer | reducible? |
|---|---|---|---|
| 1 | 5/6 − 1/3 | 3/6 → 1/2 | yes |
| 2 | 1/6 + 1/3 | 3/6 → 1/2 | yes |
| 3 | 1/6 + 1/3 | 3/6 → 1/2 | yes |
| 4 | 1/6 + 1/3 | 3/6 → 1/2 | yes |
| 5 | 1/4 + 1/12 | 4/12 → 1/3 | yes |

Verified by hand. Same primitive, same cost, same design intent, same size — one added computation item
whose result is not already in lowest terms. No run proposed a second observation, a redesign, or a menu.

## Why regrouping came back present, every time

Gate 1 cited the assessment in all five runs, with correct arithmetic:

> run 3 — *"Item 6's fractional sum 13/12 exceeds 1; item 7 explicitly instructs 'write your answer as a mixed number.'"*
> run 4 — *"13/12 → 1 1/12 in item 6; 19/12 → 1 7/12 in item 7."*

## What this establishes

The A3 instability was **not** a restraint failure and **not** model noise. It was one ambiguous "or"
inside a compound claim. Remove the ambiguity by naming the two expectations explicitly, and the judgment
is stable at 5 of 5 — including the harder half, where the engine correctly declines to intervene on the
component that *is* exercised while intervening on the one that is not, in the same assessment, in the
same run.

Phase 1 is resolved for the purposes of the ESA pilot design.
