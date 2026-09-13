# ESA pilot — pre-registration

Written **2026-09-13, before any teacher has seen the pilot.** Committed before the first
invite goes out, so that what counts as failure was fixed in advance and cannot be renegotiated
after the fact by whichever result arrives.

Scope: ~5 invited teachers, 3 complimentary ESA Assessment Reviews each, 15 analyses at most.
The hierarchy under test is the A4-pinned three tiers:
**NO CHANGE → ADD ONE SHORT INDEPENDENT CHECK → NO CHEAP CHECK**
(`MODIFY ONE EXISTING ITEM` is out of pilot scope — see `ESA-SHIP-INVENTORY-2026-09-13.md`.)

> **On numbers.** n ≈ 5 teachers and ≤ 15 reviews. Nothing below is a significance test and none
> of it should be reported as one. These are **decision rules** — thresholds chosen in advance so
> that a result changes what happens next rather than being absorbed into a story. A threshold
> crossed at n = 5 is a reason to stop and look, not a measurement.

---

## The success signal

**Voluntary submission of assessment #2, read against what the first result said.**

Not satisfaction. Not "this is great." Not a reply. A teacher who returns has decided the first
result was worth the next assessment's worth of trouble, which is the only judgment that costs
them something.

**Praise is not data.** A warm reply with no second submission is recorded as a non-return.
It is the most likely failure mode of a well-liked pilot and it must not be allowed to read as
success in any summary of this pilot, including my own.

Return must always be read **against the first result's outcome**, never on its own:

| First result | Returned | Did not return |
|---|---|---|
| NO CHANGE | the strongest single signal in the pilot — no-change was found valuable | **condition 3** — the result screen, not the engine |
| ADD ONE CHECK | check was worth the class time | **condition 1** — check cost more than it was worth |
| NO CHEAP CHECK | honesty was worth the trouble | ambiguous; ask before concluding |

---

## Falsification conditions

Each names what would be observed, what it would mean, and what happens next. Two of the three
falsify something about the **product**; one falsifies a decision I made **today**.

### 1 · The proposed check is not worth class time → the cost gates are miscalibrated

**Observed as:** a teacher says, in their own words, that the suggested 5–10 minute check costs
more than the information is worth. Any of: "I don't have five minutes for this", "that's a whole
warm-up", "I'd rather not give up the time", or an ADD-ONE-CHECK result followed by no return.

**Fires if:** ≥ 2 of the teachers who receive an ADD-ONE-CHECK result say a version of this, or
≥ half of ADD-ONE-CHECK results produce no return.

**Means:** gate 3 — "is the fix worth its cost against classroom and scoring burden" — is set
against my estimate of a teacher's minute, not theirs. The engine's reasoning may be sound and the
price still wrong.

**Then:** do not widen the hierarchy. Re-derive gate 3's cost model from what these teachers
actually said a minute is worth, and re-run the 13-case harness before any further invitations.

### 2 · "Fine, but I'd just fix the item instead" → H1's tier is needed

**Observed as:** unprompted, a teacher proposes modifying an item already on the assessment rather
than adding anything — and does so *in a case where ESA proposed an added check*.

**Fires if:** ≥ 2 teachers do this unprompted, on assessments where ESA reached ADD ONE CHECK.

**Means:** the tier removed today is one teachers actually want. That is a real finding and it is
the single most likely way today's decision turns out to be wrong.

**Then — and this is the part that matters:** reopening `MODIFY ONE EXISTING ITEM` requires
**evidence, not preference**, because H1 already failed on measurement, not on taste. Restraint
0.968 → 0.871, stability failed, and the mechanism was that a cheap remedy made finding an absence
cheap. Teacher demand does not repeal that. The route back is H2 as proposed on 2026-09-10 — make
gate 1's component granularity independent of the remedy's cost, by requiring every component to
be traceable to **words in the teacher-confirmed claim** — held to restraint ≥ 0.95 and stability
5/5 on the same 18 jobs. Teacher demand is permission to *run* H2. It is not permission to ship
the tier.

### 3 · A no-change result, then no return → the result screen is the problem

**Observed as:** a teacher whose first review returns NO CHANGE does not submit a second.

**Fires if:** ≥ half of teachers whose first result is NO CHANGE do not return.

**Means:** the engine did the right thing and the screen failed to make it feel like anything. This
is the pre-identified blindspot: a pilot whose best outcome is "no change" can read as a pilot that
did nothing, and the return metric would record the product working as the product failing.

**Then:** the fix is in the result screen, not the engine. Do **not** loosen restraint to make ESA
find more things. Make NO CHANGE specific — name what *is* working, per item — and re-test.
Loosening restraint in response to this condition would be the exact failure H1 already
demonstrated, arrived at from the other direction.

---

## What would make me stop the pilot early

- Any teacher is shown an item modification (`MODIFY_OUT_OF_PILOT_SCOPE` or
  `TIER_OUT_OF_PILOT_SCOPE` fires in production). Stop, because the pinned hierarchy is not holding.
- Any student work, student name, or other student PII reaches the system. Stop immediately.
- A review completes with a numeric score, percentage, grade or confidence value in it.
- The compound-claim ambiguity rule interrupts a teacher on a claim whose components all land the
  same way — it should fire on disagreement only.

## What I will report

The number who **replied** to the invitation, and separately the number who **submitted #1**,
**#2**, and **#3** — never a single "engagement" figure. Each return read against the outcome of
the result that preceded it, per the table above. Every condition above reported as fired or not
fired, including the ones that did not fire.

If a condition fires, it is reported before any repair is attempted.
