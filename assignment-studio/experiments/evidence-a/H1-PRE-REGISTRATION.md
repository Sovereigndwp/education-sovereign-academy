# H1 — the intervention hierarchy

**Branch:** `exp/evidence-h1-hierarchy`, cut from **`a0096e0`**. A1–A4 are preserved untouched, and all four
packets re-score to exactly their recorded numbers through the updated checker (A1 12/0/5/26 · A2 12/0/1/30
· A3 0/0/1/5 · A4 1/0/0/4 stable · zero violations everywhere). The change is additive.

## Why this experiment exists

Every experiment so far only ever asked for an **additional** observation. "Modify one existing item" — the
tier the product hierarchy puts second, and the one the fractions case actually needs — is a behaviour the
engine has **never been asked to produce**. Writing it into the prompt and hoping is exactly the move that
put an unnecessary intervention on the over-verified fixture in A1. So it gets pre-registered and tested
before a teacher sees it.

## The one change, downstream of the gates

Gates 1–3, the component map, the verdict rule and the restraint logic are **byte-identical to A3/A4** —
verified, not asserted. The change begins only after an intervention has already been authorised:

| tier | rule |
|---|---|
| **1 · modify one existing item** | Can ONE item already on this assessment be changed so it exercises the missing component — no added item, no added minute, and without removing what another item currently evidences? Give the item number, its current text, its replacement, and what the replacement now forces. **This tier costs the teacher nothing, so it is the right answer whenever it is available.** |
| **2 · add one short observation** | Only once tier 1 is established to be unavailable, and the reason is stated. One primitive, written out, supervised, with its variant rule and sufficiency line. Five to ten minutes and often less. Not an exit ticket by default — say why that primitive. |
| **3 · no cheap check** | Unchanged from A2. |

**The limit written into tier 1, and the thing being tested:** a modification can only repair a gap about
what the **items** elicit. It cannot repair a gap that comes from the **conditions**. If the work goes home
with AI permitted, no rewording of any item makes the artifact observable.

## What is being run

18 jobs, same model, same execution path, no per-case tuning.

- **13 cases** from the frozen A2/A3 set (S1 once, not five times) — a direct regression against A2's numbers.
- **5 repeats** of the A4 split-claim case — stability, and the clearest tier-1 opportunity in the corpus.

## Pre-registered criteria

| | criterion | must reach |
|---|---|---|
| **H1-1** | Restraint must not degrade. More ways to intervene must not mean more intervening. | `unnecessary_proposed ≤ 1` and `restraint_rate ≥ 0.95` (A2 was 0.968) |
| **H1-2** | Detection recall must not degrade. | `≥ 0.90` (A2 and A4 were 1.000) |
| **H1-3** | **The over-verified fixture stays clean.** | **0 interventions of any tier on V1 — hard kill** |
| **H1-4** | **Tier 1 is used where it exists.** | `P2/G5C1` and `A4/G5C2a` both return `modify_item` |
| **H1-5** | **A conditions gap is never "fixed" by rewording an item.** *The sharp test.* | **0 `modify_item` on any of the 9 take-home claims — hard kill** |
| **H1-6** | Skipping tier 1 is justified, not silent. | every `add_observation` carries a `why_not_tier_1` |
| **H1-7** | Stability. | 5 A4 repeats identical in verdict, intervention and tier |
| **H1-8** | No structural violations, including the new tier violations. | 0 |

`P1/G5C3` and `P3/S4c` deliberately allow **either** tier: in both a deleted item might be replaced by
adding, or arguably reached by extending a neighbouring item. Both are defensible, so the reasoning is what
gets read rather than the label.

## If H1 fails

Report it and stop. Do not tune the hierarchy after seeing a result, and do not proceed to the build. A
failure on H1-5 in particular would mean the hierarchy has become a cheap way to always have an answer —
which is the A1 disease in a new costume, and worth more than the convenience of a modify tier.
