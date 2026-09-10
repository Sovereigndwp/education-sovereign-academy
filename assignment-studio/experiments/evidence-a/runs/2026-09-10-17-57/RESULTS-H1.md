# H1 — the intervention hierarchy · results

Pre-registered at `1363ba6`, before the run. 18 jobs. Nothing tuned after a result was seen.

## Verdict: **H1 FAILS.** Do not build.

| | criterion | result | |
|---|---|---|---|
| H1-1 | restraint must not degrade (≥0.95) | **0.871** — unnecessary interventions 1 → **4** | **FAIL** |
| H1-2 | recall must not degrade (≥0.90) | 1.000 | PASS |
| H1-3 | over-verified fixture, 0 interventions *(hard kill)* | **0** | PASS |
| H1-4 | tier 1 used where it exists | `P2/G5C1` and `A4/G5C2a` both `modify_item` | PASS |
| H1-5 | **no `modify_item` on a conditions gap** *(hard kill, the sharp test)* | **0 of 9 take-home claims** | **PASS** |
| H1-6/8 | structural violations | 6 claims flagged — see below, largely instrument | inconclusive |
| H1-7 | stability across 5 repeats | runs 4–5 add an intervention runs 1–3 do not | **FAIL** |

## What went right, and it is not nothing

**The conditions rule held perfectly.** All nine take-home claims returned `add_observation`. Not one
attempt to reword an item as a way of repairing evidence that fails because the work goes home. That was
the sharp test and the engine passed it cleanly.

**The over-verified fixture stayed at zero.** Making intervention cheaper did not make V1 intervene.

**Tier 1 was chosen correctly where it genuinely exists**, and the modifications are good:

> `A4/G5C2a` — item 4, `1/2 + 1/3` → `1/3 + 1/6`: *"= 2/6 + 1/6 = 3/6, which is not in lowest terms, so the
> student must recognize the common factor of 3 and reduce it."*
> `P2/G5C1` — Part A instructions, *"Circle the correct symbol. Do not show work."* → *"Circle the correct
> symbol. Then show how you know."*

Both close the gap at zero added time, which is exactly what the tier is for.

## Why it fails — and it is not the failure I predicted

I expected the gates to be bypassed. **They were not.** All four unnecessary interventions passed gates 1,
2 and 3 legitimately, with `material: true` and `worth_it: true`. What changed is *upstream*:

**Gate 1 started decomposing claims more finely, and finding the finer pieces absent.**

| claim | the component gate 1 carried | the claim actually says |
|---|---|---|
| `S1/G5C3` | "States the **conceptual** reason that adding denominators yields pieces of the **wrong size**" | "States why adding denominators produces a wrong-sized part" — item 9 already asks for it |
| `S2/E2` | "**Names which technique** each piece of evidence exemplifies" | "names the technique by which each signals it" — the rubric already demands the connection |
| `S3/S3c` | "Connects the energy-transfer mechanism **specifically to the pattern in this dataset**" | "Explains the pattern using GPE→KE" — item 5 compels exactly that |

Each is a **stricter sub-component than the claim states**, invented and then found missing.

### The mechanism, stated plainly

**The cost of the remedy was doing load-bearing work as a restraint mechanism, and we removed it.**

When the only available fix was "add a five-minute supervised item", finding an absence was expensive, so
the engine was conservative about what counted as absent. Once "change one word of an item you already
have" became available, the price of an absence collapsed — and gate 1 started finding absences at a finer
and finer grain, because there was no longer much cost to being wrong.

A2 solved restraint by making the model *earn* permission. H1 quietly made permission cheap again.

## The violation counts are mostly instrument, again

24 raw violations collapse to **6 claims with one root cause**: `carried_forward` named a component in
wording that did not match any entry in the component map closely enough for the checker's matcher, which
then cascaded into `CARRIED_UNKNOWN` → `GATE1_BYPASSED` → `PROPOSED_UNWARRANTED` → `UNEXPLAINED_RESTRAINT`
on the same claim. That is a name-matching defect in `derive.mjs`, not four separate model failures. It
needs fixing before those codes mean anything — but it does not change the H1-1 or H1-7 result, which are
computed from verdicts and interventions, not from violations.

One real `FEED_FORWARD` and three `BANNED_LANGUAGE` hits remain unexamined and should be read before H2.

## Stability

Runs 1–3 and runs 4–5 differ: the last two add an intervention on `G5C3` that the first three do not —
the same over-reach, intermittently. `G5C2a`/`G5C2b`, the distinction A4 established, held at 5/5.

## What I would test next — H2, one change

Make gate 1's component granularity **independent of the remedy's cost**: require every component to be
traceable to specific words in the teacher-confirmed claim, rather than to a refinement of them. A
component the teacher did not write is not a component. That directly attacks the mechanism above and
leaves the tier hierarchy — which passed its own tests — intact.

Pre-register it, run the same 18, and hold it to H1-1 ≥ 0.95 and H1-7 stable.
