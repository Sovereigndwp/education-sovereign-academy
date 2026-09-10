# A3 — results of the contained representation repair

Six runs only, as authorised: `S1/G5C2` five times, and `V1` as the inflation safety check.
Pre-registered at `616eefa`. A2 remains frozen at `90b124b` and re-scores **identically** through the
updated checker (12 / 0 / 1 / 30, recall 1.000, restraint 0.968, zero violations).

## 1 · Stability — improved, not yet unanimous, and the disagreement changed character

| run | components | carried forward | decision |
|---|---|---|---|
| 1 | 4 | simplification to lowest terms | `LIMITED` + 1 |
| 2 | 4 | simplification to lowest terms | `LIMITED` + 1 |
| 3 | 4 | reduction of a computed result | `LIMITED` + 1 |
| **4** | **3** | **(none — gate 1 fails)** | **`KEEP`** |
| 5 | 5 | reduction of an un-simplified result | `LIMITED` + 1 |

Agreement went from **3–2 in A2 to 4–1 in A3**, and the majority answer flipped. More telling: the four
agreeing runs propose **the same item** — `1/6 + 1/3`, about 2 student-minutes and 10–15 scoring seconds.
In A2 the split was between *no change* and *add work*. In A3 it is between two readings of one word.

**The dissent has a single, nameable cause.** `G5C2` says *"simplifies **or** regroups to a mixed number
where the item requires it."* Run 4 read that "or" as **one** component and found it present — items 6 and
7 do require regrouping. The other four split the "or" into two components and found that the
*simplification* half is exercised by nothing. Both readings are defensible from the claim's own wording.

**The residual instability is in the claim's wording, not in the gate.** Gate 1 no longer picks a component
at random; it enumerates them and shows its work, so the disagreement is now visible and arguable instead
of silent.

## 2 · KEEP or LIMITED? LIMITED, and the ground truth is probably wrong

Every computed answer in the assessment is already irreducible — 1/2+1/3=5/6, 5/6−1/4=7/12,
2 1/3+1 3/4=4 1/12, 3/4+5/6=1 7/12, 2/3−1/4=5/12. **I verified all five by hand.** The directions say
"Answers in simplest form", the claim names simplification, and no item ever triggers it: a student who
cannot reduce a fraction scores identically to one who can.

Under the pre-registered rule — *"if the system consistently determines that simplification is genuinely
unexercised and materially part of the claim, LIMITED plus one minimal intervention may be correct"* —
**`LIMITED` + one 2-minute item is the correct answer**, and the KEEP in ground truth for `S1/G5C2` is
likely wrong, exactly as `P2/G5C2` was in A2.

**Ground truth was not changed.** Nothing was pushed toward the old expectation to manufacture agreement.

## 3 · V1 safety check — PASS, no inflation

| claim | components | not present | carried | intervention |
|---|---|---|---|---|
| G5C1 | 3 | 0 | none | **no** |
| G5C2 | 4 | 0 | none | **no** |
| G5C3 | 2 | 0 | none | **no** |

**Zero interventions**, and — the thing this check existed to catch — **zero components marked absent
anywhere**. Decomposition did not produce a list of missing sub-skills to fill. Maps stayed at 2–4
components, under the cap. And it still names the redundancy rather than adding to it:

> "The Prediction box asks for a guess at the final numeric answer before any conversion is done; for a
> procedural computation claim this tests nothing the Solution box does not already show, and scoring both
> adds per-item time without adding evidence."

## 4 · Did anything outside the narrow change move?

No.

- Everything before the gates, and **gates 2 and 3 and the minimum-observation block, are byte-identical to A2.**
- **User prompts byte-identical** — the teacher-confirmed claim is untouched and still what the model judges.
- Cases, ground truth, thresholds, verdict rule and restraint logic: unchanged.
- Frozen A2 replies re-score to exactly A2's numbers through the updated checker.
- **Zero structural violations** across all six A3 runs: no `COMPONENT_INFLATION`, no
  `CARRIED_WITHOUT_BASIS`, no `CARRIED_PRESENT_COMPONENT`, no `UNEVIDENCED_COMPONENT`.
- One harness bug was fixed mid-build — `pick()` was used in `derive.mjs` without being defined there. It
  threw loudly, before any A3 score existed, and A2's numbers are unchanged after the fix.

## 5 · Scope limit

Gate 1 changed for **every** case; A3 was validated on **two**. A2 remains the record for the other eleven.
Nothing here licenses a claim about them.
