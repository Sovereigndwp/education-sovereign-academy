# Assignment Studio — pilot decision, 2026-09-08

Build under test: `as-studio` **v24** · contract `v0.1` · transform prompts `as-2026-09-05-v1` · audits
`audit-2026-09-08-v5`. All five source files verified byte-identical between repo and deployed bundle.

---

## Decision

# SHIP TO 5 TEACHERS — Support and Make Thinking More Visible only. Hold Advanced.

Nothing in the twelve cases broke the Transformation Contract. Preservation returned **zero BLOCKs**, every
one of the 12 landed inside its gold-declared status range, and the receipt no longer contradicts its own
audit anywhere. Ten of twelve versions are ones a teacher could use in the period they were written for. The
two that are not are both Advanced, and the product says so out loud to the teacher rather than hiding it.

Advanced is held back because it fails half the time on the assignments that matter most — the ones already
full — and one more iteration is cheaper than a pilot teacher's first impression.

---

## 1. Final 12-case results

Twelve of twelve produced a version. **Zero transform failures.**

| case | mode | statuses in range | audits P / U / A | clarity/feas |
|---|---|---|---|---|
| g10 Gilded Age | support | yes | PASS · USEFUL · UNDERMINED | 3/3 |
| g10 Gilded Age | advanced | yes | PASS · **NOT_USEFUL** · UNDERMINED | 2/1 |
| g10 Gilded Age | visible | yes | REVIEW · USEFUL · WEAKENED | 2/2 |
| g5 fractions | support | yes | PASS · USEFUL · UNDERMINED | 2/2 |
| g5 fractions | advanced | yes | REVIEW · **NOT_USEFUL** · UNDERMINED | 2/1 |
| g5 fractions | visible | yes | REVIEW · USEFUL · WEAKENED | 2/2 |
| g8 ELA evidence | support | yes | PASS · USEFUL · UNDERMINED | 3/3 |
| g8 ELA evidence | advanced | yes | PASS · USEFUL · UNDERMINED | 2/2 |
| g8 ELA evidence | visible | yes | REVIEW · USEFUL · WEAKENED (repaired once) | 2/2 |
| g8 Science ramp | support | yes | PASS · USEFUL · UNDERMINED | 3/3 |
| g8 Science ramp | advanced | yes | REVIEW · USEFUL · UNDERMINED | 2/2 |
| g8 Science ramp | visible | yes | PASS · USEFUL · WEAKENED | 2/2 |

**Totals** — preservation: 7 PASS, 5 REVIEW, **0 BLOCK**. Usefulness: **10 USEFUL**, 2 NOT_USEFUL.
Adversarial: 8 UNDERMINED (all Support and Advanced), 4 WEAKENED (all four Visible), 0 SURVIVES.
Statuses in range **12/12**. Receipt contradictions **0**. One bounded repair fired and resolved.

Only two cells fall outside the gold-declared expectation, both the same thing: Advanced usefulness.

### The four deployed changes, working together on the live system

| change | evidence it works |
|---|---|
| **JSON repair** | 12/12 transforms succeeded. On the pre-repair build the same suite lost 5 of 12; on the intermediate build 1 of 12. |
| **Constraint budgeting** | Usefulness went from 2 USEFUL of 7 to **10 of 12**. Feasibility 3 on four cases, 1 on only two. |
| **Receipt consistency** | 0 contradictions across 12, replayed against every audit record. Where a version does overrun, `teacher_constraints` now reads REVIEW_REQUIRED (g10 visible, g5 advanced, g5 visible, Science advanced) instead of PRESERVED. |
| **Science v5 integrity rule** | Planted fixture run 3× on v24: REVIEW / USEFUL / UNDERMINED with byte-identical findings all three times. With the 5 runs on v15, **8 for 8 stable**. The pre-fix build gave 2 BLOCK / 5 REVIEW on the same input. |

---

## 2. What changed after the run, and why

The 12/12 on the untouched v20 build left one real defect, so I fixed it and re-ran everything.

**One case in twelve died in the parser.** `g8-ela-evidence / visible` failed with
`Unexpected non-whitespace character after JSON`, and re-running it showed 2 failures in 4 attempts — a hard
error after the teacher has waited ninety seconds. Cause: `sliceObject` took the span from the first `{` to
the **last** `}`, so when the model appended a sentence after the object and that sentence contained a brace,
the object parsed and the trailing text was left over. Fix: `balancedSpan` walks from the first `{` to the
brace that closes it, counting depth outside strings, and `extractJson` now tries the balanced span and the
last-`}` span, strict then repaired — four bounded attempts, no extra model calls. Twelve regression cases
pass, including that exact shape.

**A second, rarer failure appeared on the next run**: `Model returned no JSON object` on g10 visible, about
one attempt in four on that case. Different cause — the model occasionally answers in prose or is cut off
mid-object. No parser can recover from output that is not there. Fix: **one bounded retry** of the transform
call (never more), plus an error that now distinguishes "answered in prose" from "reply was cut off" so the
next occurrence diagnoses itself. After this, twelve of twelve, plus six extra attempts across the two
previously failing cases, all succeeded.

I did **not** touch the transform prompt again. The budget rule moved Advanced from three failures in three to
two in four, and I said last round that if Advanced still failed I would say so rather than tune it a second
time. That is what §5 does.

---

## 3. Strongest and weakest

**Strongest — g8 Science ramp, Make Thinking More Visible.** PASS / USEFUL / WEAKENED, no repair, and the
only Visible case to hold every status at PRESERVED-or-permitted while still making reasoning observable. It
converts existing steps rather than appending: Q4 gains the ratio calculation the contract already demanded
evidence for, Q5's single reasoning prompt becomes three scaffolded sub-prompts covering the same GPE→KE
ground, Q6 asks for the prediction the misconception item was already testing. Adversarial moved off
UNDERMINED to WEAKENED because the prediction is committed before the data work. This is the substitute-don't-
add behaviour the budget rule was written to produce, and it is the case whose contract is hardest.

**Weakest — g10 Gilded Age, Advanced.** Preservation PASS, feasibility **1**. Every original item kept, and a
requirement added to each: Q2 goes from two sentences to four, Q3 doubles, Q4 adds two more sentences, Part B
gains two further requirements. The blind usefulness audit's arithmetic — "3–4 minutes … another 3–4 minutes …
another 3–4 minutes" against a 45-minute period that was already full. The additions are genuinely deeper, so
the contract is not violated; the version is simply one no teacher would hand out.

Runner-up on each side: g10 and ELA **Support** both scored 3/3 with `editing_required: none` — hand-out
ready. g5 **Advanced** is the other feasibility-1 failure, same pattern.

---

## 4. Silent preservation failures

**None found.** Preservation returned no BLOCK on any of the twelve; statuses were in range 12/12; and the
class of silent failure you named — a field reported PRESERVED while the product's own trace called it
doubtful — is now structurally impossible and measured at zero across all twelve.

I checked one further route specifically, because the fix could have moved the problem rather than solved it:
on the two NOT_USEFUL Advanced cases the receipt says `teacher_constraints: PRESERVED` while the blind
usefulness audit says the version does not fit the period. That is **not** hidden — `studio/index.html` renders
the usefulness verdict and its first two notes to the teacher under *"Our own checks on this version →
Usable in class?"*. The teacher sees "NOT_USEFUL" with the timing arithmetic. Two different claims, both
true, both visible: the learning is preserved, and the sheet is too long.

Residual risks worth naming rather than claiming clean:

- **Adversarial UNDERMINED on all eight Support and Advanced versions.** Expected and recorded by design — a
  take-home worksheet is shortcut-able and the contract says not to repair for it outside Visible mode. But
  it means the AI-resistance claim rests entirely on Visible, where four of four came back WEAKENED and none
  SURVIVES.
- **Item-count column reads 5→0 / 7→0 on three Support versions.** That is the harness regex, not the
  version: those versions convert numbered items into tables and labelled blocks. Verified by reading them.

---

## 5. Mode-by-mode readiness

**Support — READY.** 4/4 USEFUL, 4/4 preservation PASS, 4/4 statuses in range, zero REVIEW_REQUIRED, two of
the four at clarity 3 / feasibility 3 with no editing needed. It restructures the page and adds no task —
the g5 page-length problem from the earlier run is gone. This is the mode to lead the pilot with.

**Make Thinking More Visible — READY.** 4/4 USEFUL, 4/4 in range, 3 PASS and 1 REVIEW, all four WEAKENED on
adversarial (never UNDERMINED after the bounded repair, which is the gold's stated bar for this mode). One
case used its single repair and came out correct. Where a version does press on the period, it now says so:
two of the four carry `teacher_constraints: REVIEW_REQUIRED` with the reason in *Check this*. The planted
resistance fixture is stable 8-for-8.

**Advanced — NOT READY.** 2/4 NOT_USEFUL, both at feasibility 1, and the failures are not random: they land
on **g10 (a full 45-minute DBQ) and g5 (nine items in 25 minutes)** — the two originals that were already at
capacity. The two that passed, ELA and Science, had slack. Advanced's implementation of "depth" is still "one
more requirement per existing item", which is exactly the volume trap the mode's MUST-NOT names, and the
budget rule's *substitute* and *trade* moves are being ignored in favour of *add*. The honesty half works —
both failures report `teacher_constraints` correctly and the teacher is told it is not usable — so nothing
ships a lie. It simply ships something a teacher will reject, and a pilot measuring Use Rate should not spend
its first impression on it.

---

## 6. End-to-end teacher journey (live backend)

Walked once against v24 with a fresh assignment that is not a gold case — a Grade 8 slope exit task, with the
teacher's own note "they need to see that slope is a rate of change, not just a formula".

| step | result |
|---|---|
| Upload | 9.4 s. Contract inferred; it picked up rate-of-change from the teacher's note and identified item 3 (the misconception) as the pivot. |
| **Correct** the contract | Two fields edited — a stricter `required_evidence` and constraints changed to "20 minutes; one page; no calculators". `contract_corrected: true`, both fields recorded in `contract_corrections`. |
| Transform (Support) | **PASS / USEFUL / UNDERMINED**, no repair. clarity 3, feasibility 3, `editing_required: none`, grading "same". No preservation findings at all. |
| Receipt | Five concrete `changed` entries, three `check_this` lines — including *"Verify item 4 setup equation is correct: 3 = (k − 2)/(5 − 1) simplifies to k = 14"*, which is arithmetically right. |
| Classroom Set — 2nd version | Visible generated from the **same confirmed contract, no re-upload**. Took its one bounded repair (adversarial UNDERMINED → WEAKENED) and reported `teacher_constraints: REVIEW_REQUIRED` against the one-page limit. Both versions listed ready. |
| Teacher signals | "Would you use this version?" recorded for both (`yes_as_is`, `yes_with_changes` + comment) and the preservation question ("No") recorded. |
| Download | Ran the shipping `buildDocx` / `buildSetDocx` against both real versions: valid OOXML zips, well-formed `word/document.xml`, 17 and 33 paragraphs, **exactly one page break** between the two labelled versions in the Classroom Set. |

**One gap, and it is not code.** The studio front-end is **not deployed** — `https://thesovereign.academy/assignment-studio/studio/`
returns 404, because `assignment-studio/` has never been committed or pushed. The journey above exercised
every backend step and the real download builder, but nobody has yet clicked through the actual page against
live model output. That is the last thing to do before a teacher sees it, and it needs the deploy in §7.

---

## 7. Exact git / deployment state

**Deployed:** `as-studio` **v24** on project `rdqwoqdvqpedlsbaghtr` — ACTIVE, `verify_jwt: false`, all five
files byte-identical to the repo (verified after deploy, not just reported). Versions 8–23 were intermediate;
v10 was the frozen session's overwrite, merged rather than discarded.

**Repo:** `~/projects/sovereign-academy-hub`, branch `fix/tsa-parent-brand-homepage`, 1 commit ahead of
`origin/master`. `assignment-studio/` is still **entirely untracked** — `?? assignment-studio/`. Nothing has
been committed or pushed. I synced your working copy to match v24 exactly and wrote in the 26-file canonical
run packet.

I cannot commit or push from here. These are yours, and they are reversible:

```bash
cd ~/projects/sovereign-academy-hub
git status --porcelain assignment-studio         # expect: ?? assignment-studio/

git checkout -b feat/assignment-studio
git add assignment-studio vercel.json
git commit -m "feat(assignment-studio): MVP — contract v0.1 as code, three audits, gold harness

Edge function as-studio v24. Deterministic integrity-device rule (audit v5),
constraint budgeting in the transform prompt, receipt/audit consistency in
foldIntoTrace, balanced-span JSON extraction with one bounded transform retry.
Canonical gold run 12/12 — 0 failures, 12/12 statuses in range, 0 receipt
contradictions, 10/12 usable. Packet: harness/runs/2026-09-08-final-v24/."

git push -u origin feat/assignment-studio
```

Undo before pushing: `git reset HEAD~1` (files kept). Abandon:
`git checkout fix/tsa-parent-brand-homepage && git branch -D feat/assignment-studio`.

Merging to `master` is what makes `/assignment-studio/studio/` live on Vercel — that is a publish, so it is
your call, not mine. The pilot link is then
`https://thesovereign.academy/assignment-studio/studio/?pilot=<code>`.

---

## 8. What I would do in the first week

1. **Deploy the front-end**, then walk the page yourself once end to end. Everything behind it is proven; the
   page itself has only ever been tested against a mocked backend.
2. **Send Support first.** It is the mode with four clean passes and the one whose promise — access without
   making the task easier — the evidence most clearly supports.
3. **Offer Visible second**, to the same teachers, once they trust the first output.
4. **Leave Advanced off the pilot menu** for now, or label it explicitly as experimental. Its failure mode is
   predictable and worth one more pass: it needs to learn that cutting an item to deepen another is the move,
   not adding a requirement to all of them.
5. **Watch two numbers only** — Preservation Error Rate (teachers answering "Yes" to the preservation
   question) and Use Rate. The audits are instrumentation; the teachers are ground truth.
