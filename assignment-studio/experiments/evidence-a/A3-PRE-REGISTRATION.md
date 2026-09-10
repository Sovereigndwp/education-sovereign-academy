# A3 — one contained representation repair

**Branch:** `exp/evidence-a3-components`, cut from **`90b124b`**. A2 is frozen there: prompt, gates, cases,
ground truth, scoring and thresholds are all untouched.

## What is changed — and only this

Gate 1 previously asked for **the single** observable element whose absence would break the claim. On a
compound claim that made the answer depend on which component happened to get named, which is what the A2
stability failure was.

Gate 1 now asks for a **component map**, and reasons across the whole set.

**The teacher-confirmed claim is not split, rewritten, narrowed or atomised.** It stands exactly as
confirmed, it is still the claim being judged, and it is still what a teacher would see. Verified
mechanically: the user prompts are byte-identical to A1 and A2. The decomposition is internal working
structure for the gate only.

For every component: the observable thing · the items that exercise it (or none) · a status of
**present** / **absent** / **not_called_for** · evidence cited from this assessment. Typically two to five;
past five the prompt says stop and merge, and the checker records `COMPONENT_INFLATION`.

**An unexercised component warrants nothing by itself.** Before any component may go further, the existing
A2 logic is applied to it, per component:

- does it **materially belong** to the inference the teacher confirmed for this assessment?
- is it **assessed elsewhere or out of scope**?
- does its absence **materially narrow** what this assessment supports?

At most one component is carried to gate 2. If none qualifies, gate 1 fails and no intervention is
warranted, whatever else was noticed. **Permission is still derived in code**, never asserted: a carry
only counts when the component is not present, belongs, is not assessed elsewhere, and narrows support.

### Held constant, verified not asserted

- Everything before the gates is byte-identical to A2.
- **Gates 2 and 3 and the minimum-observation block are byte-identical to A2.**
- User prompts byte-identical. Cases, ground truth, thresholds, verdict rule, restraint logic: unchanged.
- Re-scoring the frozen A2 replies through the updated checker reproduces A2 exactly — 12 / 0 / 1 / 30,
  recall 1.000, restraint 0.968, zero violations. The change is additive.
- Same model, same execution path.

## What is being run

**Six runs only**, per instruction: the five identical `S1/G5C2` stability repeats, and `V1` as the
inflation safety check. Reconstruction jobs are skipped — a gate change cannot affect them.

## What counts as success

1. **Stability** — the same component-level reasoning and the same verdict/intervention decision across
   all five repeats. **KEEP is not the target.** If the system consistently finds that simplification is
   genuinely unexercised and materially part of the claim, then `LIMITED` plus one minimal observation is
   the correct stable answer, and it will be reported as correct. Nothing is pushed toward the old ground
   truth to manufacture agreement.
2. **V1 safety** — still zero interventions, and no long list of missing sub-skills. If decomposition
   makes the engine start adding burden to an already over-verified task, **the repair is invalid and I
   stop.**

## Scope limit, stated plainly

Gate 1 changed for every case, but A3 is being validated on two. **A2 remains the frozen record for the
other eleven cases**, and nothing in this run licenses a claim about them. A full re-run is the obvious
next step and is not authorised here.
