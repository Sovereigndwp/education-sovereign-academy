# H1 — four-dimension scoring and gate decision

Scored from the single pre-registered run at `runs/2026-09-10-17-57` (18 jobs, executed once).
Nothing was re-run. Hierarchy, prompts, ground truth, expected results, scoring and cases are
unchanged since `1363ba6`. This document only reads and reports what that run produced.

Denominator: the same 45 claim-level expectations A2 was scored against (13 cases), plus the
5-repeat A4 split-claim set scored against its own 5 expectations. The two sets are never merged.

---

## A · Restraint preservation

| | A2 (baseline) | H1 | direction |
|---|---|---|---|
| claims where ground truth says KEEP and no intervention (opportunities) | 31 | 31 | — |
| of those, KEEP decisions actually returned (`restraint_correct`) | 30 | **27** | −3 |
| unnecessary interventions (`unnecessary_proposed`) | 1 | **4** | +3 |
| **restraint score** | **0.968** | **0.871** | **−0.097** |
| verdicts matching ground truth | 43 / 45 | **41 / 45** | −2 |

Pre-registered floor was `unnecessary_proposed ≤ 1` and `restraint_rate ≥ 0.95`. **Both missed.**

The four unnecessary interventions, all on assessments the gold record calls sound:

| case | claim | A2 | H1 | tier proposed |
|---|---|---|---|---|
| S1-g5-supervised | G5C2 | KEEP | LIMITED + fix | `modify_item` (item 5) |
| S1-g5-supervised | G5C3 | KEEP | LIMITED + fix | `modify_item` (item 9) |
| S2-g8ela-supervised | E2 | KEEP | LIMITED + fix | `modify_item` (task bullet 3) |
| S3-g8sci-supervised | S3c | KEEP | LIMITED + fix | `modify_item` (item 5) |

One unnecessary intervention was *repaired*: `P2/G5C2` was A2's single restraint failure and returns
KEEP under H1. Net −3.

**Every one of the four is `modify_item`.** None is an added observation. The regression is entirely
inside the tier the hierarchy introduced.

**They did not bypass the gates.** All four passed gate 1 (a component genuinely marked absent, with
`belongs=true`, `assessed_elsewhere=false`, `narrows_support=true`), gate 2 `material: true`, gate 3
`worth_it: true`. The gates worked as specified. What changed is what gate 1 was handed to judge — see
dimension D.

**A4 split-claim set:** 1 justified / 0 missed / 0 unnecessary / 4 restraint_correct, identical to the
A4 baseline — but that is the scored representative run only, and it conceals an instability (D4).

---

## B · Evidence recall

| | A2 | H1 |
|---|---|---|
| interventions ground truth says are warranted (opportunities) | 12 | 12 |
| produced (`justified_proposed`) | 12 | **12** |
| missed (`justified_missed`) | 0 | **0** |
| **recall score** | 1.000 | **1.000** |

All twelve: `X1/G5C1`, `X1/G5C2`, `X1/G5C3`, `X2/H1`, `X2/H2`, `X2/H3`, `X3/K1`, `X3/K2`, `X3/K3`,
`P1/G5C3`, `P2/G5C1`, `P3/S4c`. Plus `A4/G5C2a` on the split set.

Recall is intact. Restraint was not traded for recall — it was lost without buying anything.

Two claims are `not_scored` by design (`X2/H4`, `X3/K4`, both scoped out of their case's inference).
`X3/K4` nonetheless received an `add_observation`; it carries no penalty under the pre-registered
scoring, and is recorded here rather than absorbed.

---

## C · Hierarchy correctness

Every claim carrying a tier expectation in `groundtruth/h1-tiers.json`:

| case | claim | expected tier | actual tier | PASS/FAIL | reason |
|---|---|---|---|---|---|
| P2-g5-selected-response | G5C1 | modify_item | `modify_item` | **PASS** | Restored the "show how you know" instruction on the three Part A items. No item added, no minute added. Cheapest tier that establishes the evidence. |
| S1split-g5-supervised | G5C2a | modify_item | `modify_item` | **PASS** | Item 4 `1/2 + 1/3` → `1/3 + 1/6`. Mathematics and evidence function verified independently below. |
| P1-g5-no-diagnose | G5C3 | add_observation \| modify_item | `modify_item` | **PASS** | Either allowed; the reasoning is what is judged. Converted an existing item rather than adding one, and did not strip evidence another claim depends on. |
| P3-g8sci-no-item6 | S4c | add_observation \| modify_item | `modify_item` | **PASS** | Either allowed. Extended item 7 to also demand the proportional-reasoning step. |
| X1-g5-takehome | G5C1 | add_observation | `add_observation` | **PASS** | Conditions gap. Correctly refused tier 1 and said why. |
| X1-g5-takehome | G5C2 | add_observation | `add_observation` | **PASS** | Conditions gap. |
| X1-g5-takehome | G5C3 | add_observation | `add_observation` | **PASS** | Conditions gap. |
| X2-g10ss-takehome | H1 | add_observation | `add_observation` | **PASS** | Conditions gap. |
| X2-g10ss-takehome | H2 | add_observation | `add_observation` | **PASS** | Conditions gap. |
| X2-g10ss-takehome | H3 | add_observation | `add_observation` | **PASS** | Conditions gap. |
| X3-calc-takehome | K1 | add_observation | `add_observation` | **PASS** | Conditions gap. |
| X3-calc-takehome | K2 | add_observation | `add_observation` | **PASS** | Conditions gap. |
| X3-calc-takehome | K3 | add_observation | `add_observation` | **PASS** | Conditions gap. |

**13 / 13 PASS. Zero hierarchy violations in either direction.**

- No costlier tier chosen where a cheaper one gives equivalent valid evidence: every tier-1 opportunity
  in the corpus was taken as tier 1.
- No cheaper tier chosen that does not actually establish the evidence: **0 `modify_item` across all
  nine take-home claims.** This was the pre-registered sharp test (H1-5), and it is the strongest
  result in the run. Each of the nine states, unprompted, that a conditions gap cannot be reworded away.
- H1-6: every `add_observation` in all 18 jobs carries a non-empty `why_not_tier_1`. **10/10.**

Tier totals across all 18 jobs: `modify_item` 14 · `add_observation` 10 · none 46.
Of the 14 `modify_item`, **4 sit on claims ground truth says need no intervention at all** — correct
tier, wrong to be there. Hierarchy correctness and restraint are separate axes and are reported
separately; a tier can be the right answer to a question that should not have been asked.

---

## D · Baseline preservation

The hierarchy is downstream of everything. Lines 1–117 of the system prompt — the evidence conditions,
the primitives, the verdict rule, the component map, and **all three gates** — are byte-identical
between A3/A4 and H1 (`diff` first differs at line 118, inside the remedy section). Any upstream change
is therefore caused by the presence of the remedy, not by an edit to the upstream text.

### D1 · Component mapping — **changed**

`S1` and `V1` are the only two cases with an A3 baseline. Comparing component maps:

| claim | A3 | H1 | change |
|---|---|---|---|
| S1/G5C1 | 3 components, all `present` | **5** components, one `absent` | +2, incl. an invented "identifies the equal case" component marked absent |
| S1/G5C2 | 4 components, 1 absent (simplification) | 4 components, 1 absent | equivalent |
| S1/G5C3 | 3 components, **all present** | 3 components, **one absent** ("states the conceptual reason…") | a component that A3 read as present is now absent |
| V1/G5C1–3 | all present | all present | equivalent wording |

Gate 1 decomposes **more finely** under H1 and then finds the finer pieces absent. `S1/G5C3` is the
clean case: A3 returned KEEP in 5/5 runs on identical gate-1 text; H1 splits "names the error" into
"names the error" + "states the conceptual reason", marks the second absent, and intervenes.

### D2 · Gate decisions — **changed as a consequence**, not bypassed

No gate was skipped, and no gate returned an inconsistent pair. Gates 1–3 all passed legitimately on
each of the four unnecessary interventions. The gates are functioning; their input changed.

### D3 · KEEP vs NOT_SUPPORTED — **one regression**

| claim | A2 | H1 | ground truth |
|---|---|---|---|
| P2-g5-selected-response / G5C1 | LIMITED | **NOT_SUPPORTED** | LIMITED |
| P2-g5-selected-response / G5C2 | LIMITED (unnecessary) | **KEEP** | KEEP — *improvement* |
| S1 / G5C2 | KEEP | LIMITED | KEEP — *regression* |
| S1 / G5C3 | KEEP | LIMITED | KEEP — *regression* |
| S2 / E2 | KEEP | LIMITED | KEEP — *regression* |
| S3 / S3c | KEEP | LIMITED | KEEP — *regression* |

6 of 45 claims differ from A2. Verdict accuracy 43/45 → 41/45.

### D4 · Ambiguity / stability behaviour — **regressed**

The A4 split-claim case was 5/5 stable under A4 and is **not stable under H1**:

| run | G5C1 | G5C2core | G5C2a | G5C2b | G5C3 |
|---|---|---|---|---|---|
| 1 | KEEP | KEEP | NOT_SUPPORTED + fix | KEEP | KEEP |
| 2 | KEEP | KEEP | NOT_SUPPORTED + fix | KEEP | KEEP |
| 3 | KEEP | KEEP | NOT_SUPPORTED + fix | KEEP | KEEP |
| 4 | KEEP | KEEP | NOT_SUPPORTED + fix | KEEP | **LIMITED + fix** |
| 5 | KEEP | KEEP | NOT_SUPPORTED + fix | KEEP | **LIMITED + fix** |

Every run is reported. The aggregate confusion for this set (1/0/0/4) is the scored representative run
and does not show this; the split is recorded here so it is not absorbed. A4 was 5/5 identical on the
same case, same claims file, same gate text. The instability appeared with the hierarchy.

### D5 · Feed-forward behaviour — **intact**

Every one of the 10 added observations is proctored and in the room. Zero process artifacts, zero
take-home checkpoints, zero "have them submit an outline". One `FEED_FORWARD` flag fired on `X3/K4`
and is a checker artifact: the observation's own conditions read `proctored_in_class, individual, no
calculator, notes, AI, or CAS, about 4 minutes`, and the flag matched the phrase "your take-home"
inside the item's *variant instruction* ("different from anything on your take-home") — a reference to
the source assessment, which `stripSourceRefs` covers for "the/this/that take-home" but not "your".
The behaviour is correct; the detector is not. Recorded, not repaired.

### D6 · Banned language — **one real occurrence**

`S4/H2` used "sufficient": *"the parallel-sentence structure of item 2 is a sufficient, standard way to
produce a contrast."* Ordinary-English sense, and it appears in prose arguing **not** to intervene —
so it is not intervention pressure. It is still a boundary leak, and A2/A3/A4 had **zero** violations
of any code. Recorded as a real regression, small.

### D7 · Structural violations — 26 raw, 24 of them instrument

| code | count | real? |
|---|---|---|
| CARRIED_UNKNOWN | 6 | **no** |
| GATE1_BYPASSED | 6 | **no** — cascade of the above |
| PROPOSED_UNWARRANTED | 6 | **no** — cascade |
| UNEXPLAINED_RESTRAINT | 6 | **no** — cascade |
| BANNED_LANGUAGE | 1 | **yes** (D6) |
| FEED_FORWARD | 1 | **no** (D5) |

All six `CARRIED_UNKNOWN` were checked by hand against the replies. In every case the carried component
**is** in the map, correctly marked absent with all three tests holding; the checker's name match failed
on a paraphrase. Two of the six differ from the component's own text only by `is` → `are`
(`X2/H1`, `X2/H3`). The reasoning is sound in all six; the string comparison is not. `gate1Pass` then
goes false and drags three more codes with it.

This defect is in the checker, was introduced with the A3 component map, and would have fired on A3 too
had A3 exercised these cases. It is **not** evidence about the hierarchy, and it is **not repaired here.**

One further instrument discrepancy: `run.mjs` line 277 states F4's threshold as "kill if any intervention
on the over-verified case, **or any menu or feed-forward violation**", but line 278 computes the verdict
from the over-verified count alone. F4 reports PASS with `feed_forward_violations: 1`. Under the stated
threshold F4 is FAIL; under the implemented one it is PASS. Both are recorded. Given D5, the behaviour
is correct either way. The mismatch predates H1 and is left unrepaired.

---

## The Grade 5 simplification claim — verified independently

Not assumed. Computed.

**1 · Every computed answer in the gold assessment is already irreducible.**

| item | expression | answer | reduces? |
|---|---|---|---|
| 4 | 1/2 + 1/3 | 5/6 | no |
| 5 | 5/6 − 1/4 | 7/12 | no |
| 6 | 2 1/3 + 1 3/4 | 4 1/12 | no |
| 7 | 3/4 + 5/6 | 1 7/12 | no |
| 8 | 2/3 − 1/4 | 5/12 | no |
| 9 | 1/2 + 1/4 (the correct answer) | 3/4 | no |

Items 1–3 are comparisons and produce no computed fraction. **"Answers in simplest form" is instructed
on the page and never once exercised.** The absence gate 1 found is real. Ground truth was left unchanged.

**2 · The proposed modification is arithmetically correct.**
`1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2`. A common denominator is still required (1/3 must be rewritten as
2/6), the numerators are still combined, and the result is now **not** in lowest terms, so reduction is
unavoidable to be marked correct. The original `1/2 + 1/3 = 5/6` requires no reduction. Correct.

**3 · The engine's stated reason is a true theorem, and it is not one I fed it.**
It wrote that "the current item's denominators (2 and 3, coprime) can never produce a reducible sum for
any pair of already-reduced proper fractions." That is provable: with `gcd(b,d)=1`, `a/b ± c/d` has
numerator `ad ± cb` over `bd`; modulo `b` this is `±cb ≡ ... ad`, and since `gcd(a,b)=gcd(d,b)=1`, the
numerator is coprime to `b`, and symmetrically to `d`. Brute force over all reduced proper fractions with
denominators 2–20 finds **0 counterexamples**. No renumbering of a coprime pair can ever force reduction.

**4 · The cost the modification pays, and whether it was avoidable.**
`1/3 + 1/6` makes one denominator a multiple of the other, so the LCD is 6 rather than 12 and the
common-denominator step is slightly easier than in the original. **The engine named this cost itself**,
in `what_it_now_forces`: it recorded that the pairing "newly exercises the case where one denominator
divides the other evenly (6 and 3), a relationship no current item tests." It declared the trade rather
than hiding it.

The question is whether the trade was necessary. Brute force over all reduced proper fractions with
denominators 2–12, requiring **neither denominator to divide the other** and the answer to reduce:

- Restricted to this assessment's own denominator vocabulary `{2, 3, 4, 6, 8, 9, 12}` — **no solution
  exists.** Not one pair, addition or subtraction.
- Across the full 2–12 range, exactly one family survives: denominators **6 and 10**, e.g.
  `1/6 + 1/10 = 4/15`, LCD 30 — outside the assessment's vocabulary and a heavier computation than
  anything currently on the page.

**The trade-off is forced, not careless.** Within the numbers this assessment already uses, making
simplification necessary *requires* accepting a denominator pair where one divides the other. The
engine took the only available move and said what it cost.

**5 · Evidence function preserved.** The coprime common-denominator construction that item 4 carried is
not lost: item 6 (`1/3` and `3/4`) and item 8 (`2/3` and `1/4`) both still require it, as does item 5.
Item 4 never produced a result above one whole, so the regrouping component (G5C2b) loses nothing.
The modification adds a component without removing one — which is exactly what tier 1 requires.

**6 · The other simplification modification is weaker.** `S1/G5C2` proposed item 5 `5/6 − 1/4` →
`5/6 − 1/3`. The arithmetic is right (`3/6 = 1/2`), but this intervention is **unnecessary** by ground
truth, and unlike the A4 one its `what_it_now_forces` does **not** name the LCD it gives up (12 → 6).
Same move, no declared cost.

---

## Confound to record

**There is no A3 baseline for 11 of the 13 cases.** A3 ran only `S1` and `V1`. For every other case, an
A2→H1 difference confounds two changes: the A3 component map and the H1 hierarchy. Only **`S1/G5C3`**
attributes cleanly to the hierarchy — KEEP in 5/5 A3 runs, intervention under H1, with byte-identical
gate-1 text.

That single clean case is enough to establish the mechanism, and the direction of the other three
unnecessary interventions is consistent with it. It is not enough to quantify how much of the −0.097
belongs to the hierarchy. The number is reported as the observed regression, not as an isolated effect.

---

## Decision

### H1 FAIL — ESA BUILD NOT AUTHORIZED

Against the pre-registered rule:

| condition | result |
|---|---|
| restraint intact | **NO** — 0.968 → 0.871, unnecessary 1 → 4, floor was ≤1 and ≥0.95 |
| recall intact | YES — 1.000 |
| all hierarchy choices match ground truth | YES — 13/13, both directions |
| no baseline regressions | **NO** — verdicts 43/45 → 41/45; A4 stability 5/5 → 3/5; one banned-language occurrence |
| zero prohibited intervention-pressure behaviour | YES — 0 modify_item on 9 conditions gaps; 0 feed-forward; V1 clean |

Two of five conditions fail. No discrepancy here is a ground-truth error: the four unnecessary
interventions land on assessments the owner's gold record calls sound, and the instrument defects
(D5, D7) all run in the direction of over-reporting failure, not under-reporting it.

### The smallest evidenced failure

**Making the remedy cheap removed the brake.**

Restraint in this system was never dispositional. It was structural, and part of the structure was
**cost**: to intervene, gate 3 had to justify spending a teacher's minutes. Tier 1 is explicitly
described to the model as costing "nothing — same item count, same page, same minutes, same grading —
so it is the RIGHT answer whenever it is available, and it is available more often than it looks."

Once a remedy is free, gate 3 can never refuse it, and the pressure moves upstream to the only place
left: gate 1's reading of what the claim requires. And that is exactly where the regression shows up.
Gate 1's instructions did not change by one byte, yet under H1 it decomposes claims more finely and
marks the finer pieces absent — `S1/G5C1` grows from three components to five; `S1/G5C3` splits "names
the error" into "names the error" and "states the conceptual reason" and calls the second one missing.
Nothing was bypassed. The bar moved.

The failure is **not** in the tier ordering, which was correct 13 out of 13 and held the sharp test
perfectly. It is that a zero-cost tier makes gate 3 non-binding, and a non-binding gate 3 transfers the
work of restraint to a gate that was never designed to carry it.

Not repaired.
