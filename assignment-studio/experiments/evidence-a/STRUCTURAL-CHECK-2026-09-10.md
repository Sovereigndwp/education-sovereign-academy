# ESA structural check — coverage and conditions as two paths

The two-stage separation from `2cd763e` is unchanged and was not redesigned. What changed is Stage A's
model of *why* evidence can be limited, and the representation of a claim's components.

Architecture `esa-two-path-2026-09-10-v2`. One run, `rc2-runs/2026-09-10-19-37`. 9 Stage A calls,
11 Stage B calls, each in an isolated context that could read nothing but its two prompt files.

## STRUCTURAL CHECK: **PASS — ESA BUILD AUTHORIZED**

| | check | result |
|---|---|---|
| A | over-decomposition — `S1/G5C3`, `S2/E1` | every component span-anchored; both KEEP | **PASS** |
| B | conditions branch — nine take-home claims | coverage sufficient · conditions limited · 0 pseudo-components · 0 `modify_item` | **PASS** |
| C | known successes — coverage gap, A4 split, V1 | `modify_item` twice, V1 clean 3/3 | **PASS** |
| — | architecture | 0 mutations, 0 overreach, 0 assessment rewrites on a conditions limitation | **PASS** |

---

## The two corrections, and why neither is an instruction

**1 · Components are now anchored to the teacher's own words, checked in code.**

Every component must carry `claim_span` — a verbatim, non-overlapping substring of the teacher-confirmed
claim — and the student `verb` inside that span. `validateSpans()` checks the substring against the claim
string, checks the verb sits inside its own span, and checks no two spans overlap. A component the
teacher's words do not contain cannot exist.

Tested by hand against both failures **before** the prompt was written:

```
G5C3  "States why adding denominators produces a wrong-sized part, and gives the correct sum."
      "Identifies the error in the worked example ..."          → NOT IN CLAIM, rejected
      "States why adding denominators produces a wrong-sized part" → anchored
E1    "Infers the author's unstated position ... from the text's choices rather than
       from any sentence that states it."
      all three components from the failed run                  → NOT IN CLAIM, all rejected
```

A manner qualifier fails automatically, because a phrase describing *how* a move is done has no verb of
its own. That is the operational form of your test.

**2 · Coverage and conditions are two independent paths, and the conditions remedy has no `modify_item`.**

Stage A judges them separately and may never express one in the other's terms. A conditions limitation is
recorded as a conditions limitation — not as an absent component.

Stage B has **two prompts**. The conditions prompt contains no tier hierarchy and the string `modify_item`
does not appear in it. Rewriting a worksheet to repair the room is not forbidden; it is absent. Same move
as the leak check: remove the option rather than argue with it.

---

## A · Over-decomposition — the two component maps

**`S1/G5C3`** — was 3 components, one absent, gap. Now:

```
[present]  Explains in writing what is wrong with adding the denominators, in terms of the size of the parts
           span "States why adding denominators produces a wrong-sized part"   verb: States   items: 9
[present]  Produces the correct value of the sum that was done wrongly
           span "gives the correct sum"                                        verb: gives    items: 9
coverage: sufficient
why: "Item 9 asks for both moves the claim names ... That a single item exercises the claim is not an absence."
```

Two components, both verbatim-authorised, both present. The unauthorised "Identifies the error in the
worked example" is gone — the teacher never said it.

**`S2/E1`** — was 3 components, one absent, gap. Now:

```
[present]        Arrives at and states the author's position on replacing the bridge, which the passage
                 never states outright
                 span "Infers the author's unstated position on replacing the Mill Street bridge"
                 verb: Infers   items: Task prompt question, Task bullet 1
[not_called_for] Manner qualifier on the inference move — names the route the inference must take,
                 not a second observable move
                 span "from the text's choices rather than from any sentence that states it"
                 verb: (none)   items: none
coverage: sufficient
```

**The engine identified the manner qualifier as a manner qualifier and refused to make it a requirement.**
That is the behaviour, stated in its own words.

One span violation fired here — `NO_VERB` on that second entry — and it is correct: the entry is not a
component. It is the model showing which candidate it rejected, using the only array the schema gives it.
No finer requirement was produced, no limitation followed, coverage is sufficient. Recorded as a **schema
affordance gap**, not an over-decomposition failure: there is no `rejected_candidates` field. The review
page renders only components that carry a verb, so nothing changes in the engine.

## B · The conditions branch

All nine claims (plus the two scoped-out ones): **coverage `sufficient`, conditions `limited`,
`limitation_type: conditions`.**

- **0 pseudo-components** across all 68 components in the run — scanned for "independent production",
  "own work", "unaided", "attributable" and their neighbours. The `H1` fiction is gone.
- **0 `modify_item`.** Structurally impossible: the option is not in the prompt.
- **`assessment_change: none` on all nine.** The assessment is not rewritten to solve an administration
  problem.
- Every one returned an `inference_boundary` a teacher can read. `X1/G5C2`:

  > These returned pages support that the assignment asks for the whole of G5C2 across nine items and that
  > a student hands back worked common denominators, combined parts, and simplest-form or mixed-number
  > results, produced at home over a week with calculators, the internet and an AI assistant available.
  > They do not support a summative individual judgment that a named student carried out that procedure
  > herself.

**The distinction you asked for is real, and here is the proof.** The same assessment, the same declared
conditions, one different confirmed intention:

| | attribution required | attribution not required |
|---|---|---|
| coverage | sufficient | sufficient |
| conditions | limited | limited |
| **limitation_type** | **`conditions`** | **`none`** |
| Stage B | short supervised observation, assessment unchanged | *never runs* |

The engine's own words on the second: *"the attribution limit does not obstruct a resource-available
inference — that is the inference the teacher declared."* A good take-home assignment stayed a good
take-home assignment. Conditions matter only relative to the inference.

Where attribution *is* required, Stage B returned `verification: short_supervised_observation`, three to
five minutes, assessment untouched — e.g. for `X1/G5C2` a Reverse item: *"Fill in the missing fraction.
2/3 + ______ = 1 1/12. Show your steps."*

## C · Known successes preserved

| case | result |
|---|---|
| `P2/G5C1` — genuine coverage gap | `coverage: limited` → Stage B `modify_item`, Part A item 3 |
| split `G5C2a` — simplification | `coverage: limited` → Stage B `modify_item`, item 4 `1/2 + 1/3` → `1/2 + 1/6` |
| split `G5C1`, `G5C2core`, `G5C2b`, `G5C3` | KEEP — the A4 distinction preserved exactly |
| `V1` over-verified | KEEP on all three, no limitation of either kind |
| `S1`, `S2` (all claims) | KEEP |

`1/2 + 1/6 = 4/6 = 2/3` — reducible, common denominator still required, the same forced LCD trade-off
documented in `SCORING-H1.md`. Independently verified; unchanged from the previous run's answer.

## The three findings the data model now carries

Preserved as separate fields, so the review page can say the right thing rather than a verdict label:

| finding | data | teacher-facing meaning |
|---|---|---|
| strong evidence | `coverage: sufficient` · `conditions: strong` | "This gives you good evidence for what you want to know." |
| coverage limitation | `coverage: limited` | "This does not actually ask students to demonstrate one part of it." |
| conditions limitation | `conditions: limited` · `limitation_type: conditions` | "It asks for the right thing, but under these conditions the results cannot establish that each student can do it alone." |

**Note for the review page.** The derived verdict word is now a summary, not the finding. A take-home
assessment with sufficient coverage derives to `NOT_SUPPORTED`, which reads far harsher than the truth —
the assignment is fine. The page leads with the two axes and the boundary sentence; the verdict label
stays internal.

## Recorded, not repaired

- One span violation (`S2/E1`), examined above: schema affordance, not over-decomposition.
- `needs_individual_attribution` was **derived** for this check from `purpose="summative"` and
  `collaboration="individual"`. The corpus does not contain it. In the pilot the teacher answers it
  directly on the conditions screen — it is now a required product input, not an inference.
- The H1 checker defects (paraphrase matching, feed-forward false positive) are untouched.
