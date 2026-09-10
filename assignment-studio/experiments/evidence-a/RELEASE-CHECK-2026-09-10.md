# ESA release check — the two-stage architecture

Not a new pre-registered study. A product safety check before five teachers see anything, run against
cases whose right answer is already on record from A2/A3/A4/H1 and the owner's gold README.

Architecture `esa-two-stage-2026-09-10-v1`. One run, `rc-runs/2026-09-10-19-08`. 11 Stage A calls,
6 Stage B calls. Nothing was tuned after a result was seen and nothing was re-run.

## RELEASE CHECK: **FAIL — ESA BUILD NOT STARTED**

| # | criterion | result |
|---|---|---|
| 1 | all four H1 false positives return to KEEP | **3 of 4** — `S1/G5C3` still manufactures a gap; a NEW false positive appears on `S2/E1` | **FAIL** |
| 2 | four genuine tier-1 cases detectable, `modify_item` still available | 4 of 4 detected, 4 of 4 chose `modify_item` | **PASS** |
| 3 | nine conditions-gap claims reject inappropriate `modify_item` | 0 `modify_item` — but only because **0 remedies were produced at all** | **FAIL** |
| 4 | Grade 5 split case preserves the A4 distinction | exact match, 5 of 5 claims | **PASS** |
| 5 | Stage B never changes a Stage A diagnosis; no remedy leaks into Stage A | 0 mutations, hash-verified on all 6; leak check passed mechanically | **PASS** |

Two failures. The second one is the important one, and it is a design finding, not a tuning problem.

---

## Failure 1 — one old false positive survives, and a new one appears

`S1/G5C3` — the Grade 5 "find the mistake" claim. Stage A split it into three components and marked the
third absent:

```
present  Identifies the error in the worked example (denominators added, no common denominator found)
absent   States why adding denominators produces a wrong-sized part
present  Gives the correct sum
```

A3 read this same claim as three components, **all present**, in 5 runs out of 5. H1 split it and
intervened. Stage A splits it again — with the remedy gone.

**That kills the tidy explanation.** The H1 report attributed this case to the cheap remedy pulling gate 1
finer. It cannot be that, because there is no remedy in this context and gate 1 still splits it. Either
A3's 5/5 was luckier than it looked, or the "states why" clause in the teacher's own claim wording is
genuinely ambiguous between *what was done wrong* and *why the result is the wrong size*. Stage A's
reasoning argues the second explicitly: *"the item's question is a different question, about what was
done rather than about why the resulting part is the wrong size."* That is a defensible reading of the
claim. It is also not the reading the gold record takes.

`S2/E1` is new — KEEP under A2 and under H1, a gap now:

```
present  States the author's position on replacing the bridge in the student's own words
present  Ties that position to specific choices the author made in the text
absent   Arrives at the position from the author's choices rather than from a sentence
         in which the author states it
```

The third component is not a separate observable thing. It is a *manner* qualifier on the second — how
the student got there, not another move. Stage A's prompt contains an explicit instruction against exactly
this (*"if a component you are about to write is a refinement of one already on your list … it is not a
separate component"*) and it was written anyway.

**Both failures are the same shape: gate 1 decomposing past the teacher's own granularity.** Removing the
remedy from the context did not fix that, which means the remedy was not its only cause. That is worth
knowing before another change is made.

## Failure 2 — gate 1 has no route for a conditions gap, and this is the one that matters

All nine take-home claims came back with `carried_forward: ""` — no gap, so Stage B never ran and no
remedy was produced. The engine's own reasoning on `X1/G5C1` says exactly why, and it is correct:

> Every component of G5C1 is exercised by at least one item in Part A … Nothing this claim names is
> missing from the instrument, so Gate 1 fails and there is no coverage gap to report. **What limits this
> claim is the declared administration condition, not an unexercised component.**

The diagnosis is right. The architecture then throws it away, because gate 1 only knows how to record
*"an item is missing"* and this is *"the room is missing"*.

**H1 hid this.** Under H1 the model smuggled the conditions failure through gate 1 by inventing a
pseudo-component — *"Independent production: the compute-and-simplify chain is visibly the student's own
work"* — and marking it absent. That is not a component of the teacher's claim; it is the independence
condition wearing a component's clothes. It is also the direct cause of every `CARRIED_UNKNOWN` violation
in H1, because a fabricated component is exactly the kind a model paraphrases when it names it again.

So H1's 9-for-9 on the sharp test was real, but it was riding on a fiction. Making the diagnosis honest
removed the fiction and exposed that the gate structure has one missing branch: an evidence failure can
come from the ITEMS or from the CONDITIONS, and only the first has a path.

**This is the finding the experiments were for.** It would have reached teachers as: a teacher uploads a
take-home assessment — the single most common thing an anxious teacher brings — and ESA tells her the
evidence does not support her claim and offers her nothing to do about it. That is worse than the H1
behaviour it replaced.

Not repaired. The fix is a structural one to gate 1 and it needs to be made deliberately.

---

## What passed, and it is not nothing

**The separation itself works, mechanically.**

- **Leak check.** `assertNoRemedyLeak` scans every assembled Stage A prompt against a 34-token remedy
  vocabulary and throws on a hit; nothing is emitted if it fires. It fired twice during construction and
  both were real: the shared STANCE contained *"never propose detection, surveillance…"*, and one user
  prompt matched *"repair"* inside the teacher's own assessment text. The first was reworded; the second
  showed the check needed to exclude teacher-authored content, which it now does. 1 system prompt and
  11 user prompts passed.
- **Isolation was executed, not just declared.** Each Stage A call ran in a separate agent context that
  had never seen the hierarchy, could not read any other file in the repository, and had the two prompt
  files as its entire input.
- **Immutability held.** Each Stage A claim record was deep-frozen and hashed (sha256 over canonical
  JSON). Stage B received it as rendered text. Stage B's reply was filtered to an 8-key whitelist before
  merge and the Stage A half re-hashed afterwards. **0 `DIAGNOSIS_MUTATED`, 0 `STAGE_B_OVERREACH`** across
  all six merges.
- **Restraint did not come from crippling the remedy.** Stage B chose `modify_item` on all six gaps it
  was given, including both genuine tier-1 opportunities. Modification is alive.
- **`V1`, the over-verified fixture: 0 gaps on all three claims.** The product's central promise — that
  "I would not change this" is a real answer — survives.
- **The Grade 5 split case is exact:** `G5C1` KEEP · `G5C2core` KEEP · `G5C2a` gap · `G5C2b` KEEP ·
  `G5C3` KEEP. Stage B proposed item 4 `1/2 + 1/3` → `1/2 + 1/6`, giving `4/6 = 2/3`. Verified: reducible,
  a common denominator is still required, and it pays the same forced LCD trade-off documented in
  `SCORING-H1.md` — within this assessment's denominator vocabulary no alternative exists.

## Instrument notes, recorded not repaired

- `STAGE_B_DISAGREED` fired once, on `P2/G5C1`, because Stage B filled its `disagreement` field with the
  word *"None."* rather than an empty string. False positive in a check I wrote today.
- The H1 `CARRIED_UNKNOWN` paraphrase defect did not recur: Stage A's instruction to copy the component
  text character for character held on all 6 carried components. That is a prompt-side mitigation, not a
  checker repair; the checker defect is still there.

## The two failures, ranked

1. **Gate 1 cannot represent a conditions failure.** Structural. Blocks the pilot outright — take-home
   assessments are the common case.
2. **Gate 1 decomposes past the teacher's granularity**, and the remedy was not the only cause.
   `S1/G5C3` and `S2/E1`. Smaller, but it is the behaviour that loses a teacher.

Both are in gate 1. Neither is repaired.
