# Experiment A2 — results

Run `2026-09-10-13-43` · `evidence-a2-2026-09-10-gates-v1` · same 13 cases, same ground truth, same
scorer, same execution path, same model. Pre-registered at `7378871`, before the gated prompt ran.
Nothing was tuned per case and no threshold moved after seeing a result.

## Against the pre-registered criteria

| | criterion | A1 | A2 | |
|---|---|---|---|---|
| A2-1 | interventions on the over-verified case (hard kill) | 1 | **0** | **PASS** |
| A2-2 | restraint rate ≥ 0.95 | 0.839 | **0.968** | **PASS** |
| A2-3 | sound-case clean rate ≥ 0.80 | 0.60 | **1.00** | **PASS** |
| A2-4 | detection recall ≥ 0.90 | 1.000 | **1.000** | **PASS** |
| A2-5 | context (F2) | PASS | **PASS** | **PASS** |
| A2-6 | stability across 5 repeats | FAIL | **FAIL** | **FAIL** |
| A2-7 | structural violations = 0 | 0 | **0** | **PASS** |
| A2-8 | `LIMITED` without intervention still present | present | **absent** | **FAIL** |

**Intervention confusion, the four cells kept separate**

| | A1 | A2 |
|---|---|---|
| justified intervention proposed | 12 | **12** |
| justified intervention missed | 0 | **0** |
| unnecessary intervention proposed | 5 | **1** |
| restraint correctly exercised | 26 | **30** |
| not scored | 2 | 2 |

Restraint improved **without** detection degrading: recall stayed at 1.000, all three planted gaps were
found, and the false-positive control returned no unexpected claims. Verdict match against ground truth
rose from **39/45 to 43/45**.

## The gates did the work, and they did it the way they were meant to

Five of the six claims where A1 manufactured or nearly manufactured an intervention **stopped at gate 1**,
each citing the item that supplies the element:

- `S5/K3` — *"item 6 already supplies an incorrect antiderivative, novel to the student, requiring both
  fault-location and repair in the room — the element the claim calls for is present."* A1 proposed a
  Diagnose item for a claim carried by a Diagnose item.
- `V1/G5C2` — *"Five separate items (4–8) already require constructing a common denominator and combining,
  and two of them (6, 7) also require regrouping to a mixed number, so nothing this claim needs is
  missing."* The over-verified case, clean.
- `S3/S3c` — *"Item 5 already asks for exactly the causal explanation the claim names. That only one item
  covers this claim, and that its response format is open prose rather than a tighter form, are **not**
  absences."*
- `S4/H2` stopped at gate 2; `P1/G5C2` and `S1/G5C2` at gate 1.

## The one remaining unnecessary proposal is probably my ground truth being wrong

`P2/G5C2` passed all three gates. Its gate-1 answer:

> *"An item whose correctly computed sum or difference is not already in lowest terms, so the student must
> actively reduce it to comply with 'Answers in simplest form.' … 1/2+1/3=5/6, 5/6−1/4=7/12,
> 2 1/3+1 3/4=4 1/12, 3/4+5/6=1 7/12, 2/3−1/4=5/12 — every one is already irreducible, so no item in the
> assessment as given ever requires the reduction step."*

**I checked all five by hand. They are all correct.** In the gold Grade 5 assessment, the directions say
"Answers in simplest form" and **no item ever exercises simplification.** That is a real, subtle and
non-obvious property of the owner's own gold material, found by computing every answer.

Ground truth is **not** being changed — no post-hoc tuning. But this row should be read as a likely
ground-truth error rather than an engine failure, and it means the true unnecessary-proposal count may be
**0 of 31**.

## Why stability still fails — and it is not noise

The two flipping repeats of `S1` are the *same* observation as `P2/G5C2`:

| run | element gate 1 named | absent? | outcome |
|---|---|---|---|
| 1, 3, 5 | constructing a common denominator, combining, **regrouping** | no | KEEP |
| 2, 4 | an answer **not already in lowest terms**, requiring reduction | yes | LIMITED + one item |

`G5C2` is a **compound claim** — "constructs equivalent fractions, combines like-sized parts, **and
simplifies or regroups** where the item requires it". Gate 1 asks for *the single* element whose absence
would break the claim. Both picks are defensible; one is present and one is genuinely missing, so the
outcome depends on which sub-element gets named.

**The instability is in the claim decomposition, not in the engine's reasoning.** Every one of the five
runs is internally correct. This is a design defect with an obvious repair — gate 1 should enumerate the
claim's components and test each, or claims should carry one component each — and it is the single change
I would make before anything else.

## A2-8: the criterion failed, the behaviour did not

No claim came back `LIMITED` without an intervention, so the criterion as I wrote it fails. But the
behaviour it was meant to protect — naming narrower-than-ideal support while declining to act — is plainly
present; it now files under `KEEP` with the narrowness stated in `why_no_intervention`, as in the S3/S3c
quotation above. **My operationalisation conflated a verdict label with a behaviour.** The verdict
distribution moved `LIMITED` 8 → 3 while verdict match went *up* 39 → 43, so the `KEEP`s are closer to
ground truth, not a flattening of real narrowness.

## Honest limits

- **n is small.** 45 claim-level expectations, one execution path, and ground truth I derived from her
  gold contracts and she has not confirmed. F5 remains unmeasured.
- **Same execution path as A1.** Comparable to A1 by construction; absolute fidelity to the deployed
  product path is unmeasured for both, because the credential lives only as an edge-function secret and
  the egress allowlists on both the device VM and the cloud container block `*.supabase.co`.
- **Four of five sound assessments were written to be sound.** Real teacher material is messier.
- **The improvement could in principle be a lower bar rather than better reasoning.** Evidence against:
  recall held at 1.000, every planted gap was still found, gate-1 refusals quote specific items, and
  verdict match improved. It is not restraint bought by blindness.
