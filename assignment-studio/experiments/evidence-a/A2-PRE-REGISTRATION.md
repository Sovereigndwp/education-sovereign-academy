# Experiment A2 — pre-registration

**Written and committed before the gated prompt was run.** Git history is the proof: this file and the A2
prompt land in one commit; the A2 replies land in a later one.

**Branch:** `exp/evidence-a-instrument` (continues from the instrument repair `88250bc`).
**Version:** `evidence-a2-2026-09-10-gates-v1`. A1 remains `evidence-a-2026-09-09-v1`.

## The one question

**Can the system reliably withhold intervention unless it can establish a material evidentiary reason to
intervene?**

Everything else is held constant so the answer means something.

## The single reasoning change

Before an intervention may be proposed, it must pass three gates, worked in order, stopping at the first
failure. **Permission is derived in code from the gate answers — the model no longer asserts
`intervention_warranted`.** That is the same discipline the verdict already uses, applied to the decision
that failed.

| gate | question | fails when |
|---|---|---|
| **1 · actual absence** | Name the single observable evidentiary element that would have to be MISSING before this assessment fails to support this claim — a thing you can point at, not a quality. Is it actually absent? Cite the item that supplies it, or say plainly that none does. | The element is present. Explicitly *not* absences: "it could be stronger", "only one item covers it", "a second instance would help". An element present once is present. |
| **2 · materiality** | Does that absence materially limit the inference the teacher intends to draw from THIS assessment, for its stated purpose? | The claim was silently widened; the dimension is assessed elsewhere; the narrowness is one the teacher would accept or already knows. A LIMITED verdict never implies an intervention. |
| **3 · value against burden** | Would one additional observation improve support enough to justify its classroom minutes and per-student scoring cost? | It would not. **If the assessment already collects more evidence than the claim needs, the answer is no, and the honest note is that some existing burden is redundant — never that more should be collected.** |

### What is held constant — verified mechanically, not asserted

- **All 22 user prompts byte-identical to A1** (`diff` clean across the whole set).
- **The reconstruction prompt byte-identical to A1.**
- **The judgment prompt differs by 49 lines, all of them the gate block and its three output fields.**
  Everything preceding the task — the stance, the three evidence conditions, the feed-forward rule, the
  eight primitives, the rejection of "Explain", the variant rule — is byte-identical.
- **A1's v1 prompt is now read from the frozen A1 run packet**, so it cannot drift while A2 is edited.
- **Same cases, same ground truth, same scorer, same execution path.** Nothing was tuned per case.
- **No model change.** The reasoning architecture is tested on the same path A1 ran on; switching to a
  larger model to rescue the logic is explicitly out of scope, and a model comparison, if wanted, is a
  separate cost/quality decision on the frozen case set afterwards.

## Epistemic boundaries — unchanged

No sufficiency claims, no numerical validity scores, no percentages, no composite ratings. The judgment
remains: what this assessment supports · what it does not support · under what declared conditions ·
whether there is a material reason to collect more. The engine audits the instrument and the inference,
never student learning. Enforced in code, and the checker that enforces it was repaired first (`88250bc`).

## Ground truth

**`groundtruth/expected.json` is reused unchanged.** Ground truth is a statement about the assessments,
not about the prompt, so re-deriving it for A2 would destroy comparability and invite tuning. 45
claim-level expectations, 12 warranted interventions, 31 expecting restraint, 2 not scored.

Gate-level expectations are added for the diagnostic cases in `groundtruth/a2-gates.json`, written now:

| case / claim | gate expected to stop it | why |
|---|---|---|
| `V1/G5C2` | **gate 1**, or gate 3 | The element is present three times over — a solution box, an explanation box and a conference. If it somehow reaches gate 3, "already collecting more than the claim needs" must stop it there. |
| `S5/K3` | **gate 1** | Item 6 already *is* a Diagnose item. A1 proposed a Diagnose item for a claim carried by a Diagnose item. |
| `S3/S3c` | **gate 1 or 2** | Item 5 compels the energy explanation. If judged narrow, the narrowness is not material for a 30-minute class assessment. |
| `P1/G5C3` | **passes all three** | Item 9 is deleted and the teacher's note states the claim. Genuine absence, material, cheap to fix. |
| `P2/G5C1` | **passes all three** | Work is explicitly forbidden; strategy execution is unobservable. |
| `P3/S4c` | **passes all three** | Item 6 is deleted; extrapolation does not reach misconception separation. |
| `X1/X3` all claims | **passes all three** | Nothing is independently observed under unsupervised conditions. |

## Success criteria — stricter on restraint, and detection may not be traded for it

Reported as four separate counts. **Restraint bought by going blind to real gaps is not an improvement,
and the confusion table is structured so that trade cannot hide inside one number.**

| | criterion | A1 | A2 must reach |
|---|---|---|---|
| **A2-1** | **Over-verified case, hard kill.** Interventions on V1. | 1 | **0** |
| **A2-2** | Restraint rate — restraint correct ÷ (restraint correct + unnecessary proposed). | 0.839 | **≥ 0.95** |
| **A2-3** | Sound-case clean rate (F1). | 0.60 | **≥ 0.80** |
| **A2-4** | **Detection recall may not degrade** — justified proposed ÷ warranted. | 1.000 | **≥ 0.90** |
| **A2-5** | Context (F2): pairs changed, none in the wrong direction. | PASS | **PASS** |
| **A2-6** | Stability (F6): 5 repeats of S1 identical in verdict and intervention. | FAIL | **PASS** |
| **A2-7** | Structural violations, including the new gate violations. | 0 | **0** |
| **A2-8** | `LIMITED` without intervention survives (the S4/H2 behaviour). | present | **present** |

**A2 fails if A2-4 drops below 0.90, whatever happens to restraint.** A system that stops proposing
because it stopped noticing has not solved the problem; it has moved it.

## What is still not measured

- **F5 claim reconstruction** — still not scored automatically, for the same reason as A1. The forced-choice
  readings are produced and recorded; the scoring fields are left null for a human.
- **The owner's own Honors Precalculus/Calculus assessments** remain absent, by her decision: they are a
  sample of her past student assessments and are not to be treated as representative of the market. The
  machine-authored calculus case stays labelled as machine-authored and is not a substitute for
  expert-authored negative controls.
- **The live product-model path.** The device VM's egress allowlist permits `api.anthropic.com` but not
  `*.supabase.co`, and the cloud container's proxy refuses `*.supabase.co` too, so the credential — which
  lives only as an edge-function secret — could not be reached from either side. A1 and A2 therefore ran
  on the identical non-pinned path, which preserves the A1↔A2 comparison exactly, and leaves absolute
  fidelity to the product path unmeasured for both. See the report for how to close this.

## If A2 fails

Report it plainly and change nothing. If the system still cannot withhold intervention with an explicit
three-gate permission structure in front of it, that is strong evidence the disposition cannot be prompted
into a system whose job is to produce output — and the defensible product is a human-delivered Assessment
Evidence Audit with machine assistance, not an autonomous judgment engine.
