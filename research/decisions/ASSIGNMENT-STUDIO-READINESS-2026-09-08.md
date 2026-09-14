# Assignment Studio — readiness assessment, 2026-09-08

Deployed build: edge function `as-studio` **v20** · contract `v0.1` · transform prompts `as-2026-09-05-v1`
· audits `audit-2026-09-08-v5`. All five source files verified byte-identical between the repo and the
deployed bundle.

---

## 1. Final 12-case results

**7 of 12. Not 12 of 12.** The run is blocked on one thing, and it is not a code problem:

> `Anthropic API 400 — Your credit balance is too low to access the Anthropic API.`

Probed three times over the course of this session, including a minimal one-item assignment. Every model
call the product makes — contract inference, transform, all three audits — returns this. Nothing can run
until the key the edge function holds is on an organisation with credit. **This is yours to resolve; see §6.**

| case | mode | statuses in range | audits P / U / A | usable in the period? |
|---|---|---|---|---|
| g10-ss-gilded-age | support | yes | PASS · USEFUL · UNDERMINED | **yes** |
| g10-ss-gilded-age | advanced | yes | REVIEW · NOT_USEFUL · UNDERMINED | no |
| g10-ss-gilded-age | visible | — | — | **not run** |
| g5-math-fractions | support | yes | PASS · NOT_USEFUL · UNDERMINED | no |
| g5-math-fractions | advanced | yes | REVIEW · NOT_USEFUL · UNDERMINED | no |
| g5-math-fractions | visible | yes | REVIEW · NOT_USEFUL · WEAKENED | no |
| g8-ela-evidence | support | — | — | **not run** |
| g8-ela-evidence | advanced | yes | REVIEW · NOT_USEFUL · UNDERMINED | no |
| g8-ela-evidence | visible | yes | REVIEW · USEFUL · WEAKENED | **yes** |
| g8-sci-ramp-data | support | — | — | **not run** |
| g8-sci-ramp-data | advanced | — | — | **not run** |
| g8-sci-ramp-data | visible | — | — | **not run** |

Preservation never came back BLOCK. Statuses were inside the gold-declared range on all seven. **Two of
seven are versions a teacher could hand out tomorrow.**

### The JSON-repair fix — not yet confirmed live

Five of the twelve first attempts died in `JSON.parse` before the credit ran out. The fix is in and deployed,
and passes thirteen unit cases including both observed failure shapes, fenced ```json replies, and a
deliberately unrepairable input (which still fails loudly rather than returning a half-document). **But it has
not yet been confirmed against a live model call.** That confirmation is the first thing the re-run buys.

### Science on audit v5 — confirmed stable

Five consecutive live runs of the planted Science fixture against the deployed build, before credit ran out:
preservation **REVIEW** ×5, usefulness **USEFUL** ×5, adversarial **UNDERMINED** ×5. Inside the gold
expectation on every axis, every run. The pre-fix build, re-run seven times for comparison, gave 2 BLOCK and
5 REVIEW on identical input. `audits.ts` has not changed since; the fixture is stable.

---

## 2. What changed and why

### (a) The transform now budgets against the teacher's constraints — `contract.ts`

The completed run confirmed the pattern from the partial run, and confirmed it is not audit strictness. The
Usefulness audit is blind — it never sees the learning target, required thinking, or required evidence — so
it cannot be leaking validity concerns into a usability score. Five of seven scored `feasibility: 1`, and the
reasons were arithmetical, not aesthetic:

- *g5 visible*: turns nine items into roughly thirty-five response fields in a 25-minute Grade 5 period.
- *ela advanced*: "1 + 6–8 + 3–4 = 10–13 sentences minimum. The assignment ceiling is 12."
- *g10 advanced*: "The original was already a full 45-minute task… adding ~8 more sentences to Part A."
- *g5 support*: 63 lines against the original's 33, for the same nine items in the same 25 minutes.

The engine was treating `teacher_constraints` as a heading to reproduce rather than a budget to spend
against. Every mode added on top; none of them ever traded anything away.

The correction is one block in the shared part of `transformSystemPrompt`, so it applies to all three modes
identically, plus one clause added to each mode's paragraph. It tells the engine to do the arithmetic before
finalising, and gives it three moves in order — **substitute** (turn a step the student already does into the
deeper / scaffolded / observable one, instead of adding a step beside it), **trade** (remove or compress
something to pay for what was added, and name it in `trace.changed`), **spend less** (make a smaller change).
Only if all three fail may the version exceed a stated limit, and then `teacher_constraints` must be
ADAPTED_AS_PERMITTED or REVIEW_REQUIRED, never PRESERVED, with the realistic time stated against the stated
one. No new fields, no new audit, no architecture.

### (b) The receipt can no longer contradict its own audit — `engine.ts`

You asked me to resolve this and it was real and structural. `foldIntoTrace` forced a field to
REVIEW_REQUIRED only on a **block**-severity finding. But `teacher_constraints` can never be block — that was
deliberate, its magnitude belongs to the Usefulness audit — so a constraint finding could *never* move the
status. The result was guaranteed: the receipt said

> **teacher_constraints: PRESERVED** — "45 minutes, paper, two-paragraph response… all maintained"

while three lines below, its own *Check this* said

> "The constraint '45 minutes' is preserved in the header, but the engine's own trace acknowledges 'original
> likely allocated ~15 min to Part A; this may need 18–20'."

Now any finding the teacher is shown in *Check this* — block or review, exceeded or unclear — forces that
field to REVIEW_REQUIRED. Replayed against the seven real audit records: **five gain exactly one
REVIEW_REQUIRED, on the field the audit was already complaining about; two stay clean.** Nothing else moves.

### (c) JSON extraction merged with the parallel fix — `contract.ts`

The frozen session had independently found the same parse bug and written a better repair than mine: it also
strips ```json fences, escapes all control characters below 0x20, and fails loudly with a named error rather
than returning a partial document. I took theirs wholesale and dropped mine, keeping the budget rule on top.
Their `apiKey()` hardening (no database fallback for the provider key) is also merged and deployed.

---

## 3. Strongest and weakest

**Strongest — g10 Gilded Age, Support.** This is the product working. It restructures the page and adds not a
single task: headings, bolded labels, the four sourcing questions broken into their component parts, Part B's
criteria as a checklist. The two primary-source excerpts are untouched to the character, which the gold
declares a hard constraint. Same five items, same six-point rubric, same 45 minutes. Preservation PASS,
Usefulness USEFUL with `feasibility: 3` and `editing_required: none` — a teacher could photocopy it unread.
This is what "improve access without making the intellectual task easier" looks like.

**Weakest — g5 fractions, Make Thinking More Visible.** Same engine, same contract, opposite outcome. Every
one of the nine original items survives and the additions are pedagogically sensible in isolation — predict
before you compare, name your common denominator and why, classify the word problem as join or compare. But
they are all *additions*. Part A goes from three answers to nine. Part B's three problems become fifteen
labelled fields. Item 9 grows a third part. Roughly thirty-five response fields for ten-year-olds in
twenty-five minutes. No teacher would use it, and the receipt said `teacher_constraints: PRESERVED` because
the header still read "25 minutes".

The pair is the whole diagnosis in two documents: **restructuring is free, appending is not, and the engine
did not know the difference.**

---

## 4. Silent preservation failures

**In the seven completed cases: none remaining.** Preservation never returned BLOCK, statuses were in range
throughout, and the one genuinely silent failure — a version overrunning the period while reporting the
constraint PRESERVED — was the receipt contradiction, now fixed in code and replayed against real data.

Two honest caveats:

1. **The highest-risk case has no evidence at all.** All three g8-sci-ramp-data modes are unrun. That contract
   is the most demanding of the four — extrapolation stated as method, the ×1.4 pattern, GPE→KE named, a
   prediction near 2.9 m/s. If a silent preservation failure exists anywhere in this system, that is where I
   would expect to find it, and I have not been able to look.
2. **Adversarial came back UNDERMINED on five of seven**, including both Support versions. That is expected
   and recorded rather than repaired for Support and Advanced — a take-home worksheet is shortcut-able and
   the contract says so. But it means the Visible mode is the only one making a claim about observable
   reasoning, and only two Visible cases ran, both WEAKENED rather than SURVIVES.

---

## 5. Mode-by-mode readiness

**Support — closest to ready.** One clean pass (g10, `feasibility: 3`, editing none) and one failure that is
purely physical: g5's version is 63 lines where the original was 33, so the labelled boxes no longer fit the
page. The new rule addresses exactly that — labelled spaces *replace* open space, they do not add tasks. Two
of three Support cases unrun. This is the mode I would ship first.

**Advanced — consistently over-stuffs.** Three for three NOT_USEFUL, every one with `feasibility: 1`, every
one because it kept all the original items and added a requirement to each. The mode already said "depth, not
volume"; that was not enough, because nothing told it that adding a requirement to every item *is* volume.
The new clause makes cutting an item to deepen another an explicitly good trade. Unvalidated. This mode needs
the re-run most.

**Make Thinking More Visible — weakest, and structurally so.** One usable (ela), one badly over-stuffed (g5),
one unrun. Its failure mode is the most predictable of the three: a prediction prompt or a justification line
per item is the natural implementation and it is exactly what blows the period. The "prefer converting a step
the student already performs" clause targets this directly, but it is the least proven of the three fixes.
Also the only mode whose contract lists `reasonable teacher workload` as a MUST-PRESERVE, so the budget rule
matters here twice over.

---

## 6. Repo / commit / push / deployment state

**Deployed:** `as-studio` **v20**, project `rdqwoqdvqpedlsbaghtr`, status ACTIVE, `verify_jwt: false`. All
five files verified byte-identical to the repo. Versions 8–19 were intermediate; 10 was the frozen session's
overwrite, merged rather than discarded.

**Repo — nothing is committed.** `~/projects/sovereign-academy-hub` is on branch
`fix/tsa-parent-brand-homepage`, one commit ahead of `origin/master`, and `assignment-studio/` is **entirely
untracked** (`?? assignment-studio/`). Not one line of Assignment Studio is in git. Project memory said branch
`feat/assessment-stress-test`; that is stale.

Your Mac's working copy now matches the deployed build exactly — I wrote back `contract.ts`, `audits.ts`,
`engine.ts` and the 18 run artifacts. `index.ts` and `lib.ts` were already correct.

I cannot commit from here. These are yours to run, and they are reversible:

```bash
cd ~/projects/sovereign-academy-hub
git status --porcelain assignment-studio        # expect: ?? assignment-studio/

git checkout -b feat/assignment-studio          # keep it off the brand-homepage branch
git add assignment-studio
git commit -m "feat(assignment-studio): MVP — contract v0.1 as code, three audits, gold harness

Edge function as-studio v20. Deterministic integrity-device rule (audit v5),
constraint budgeting in the transform prompt, receipt/audit consistency in
foldIntoTrace, and tolerant JSON extraction. Gold run 7/12 — five cases blocked
on API credit, artifacts under harness/runs/2026-09-08-20-40-gold-partial/."

git push -u origin feat/assignment-studio
```

To undo before pushing: `git reset HEAD~1` (keeps the files). To abandon the branch:
`git checkout fix/tsa-parent-brand-homepage && git branch -D feat/assignment-studio`.

**The one thing blocking everything:** the `ANTHROPIC_API_KEY` edge-function secret belongs to an
organisation with no credit. If you have already topped up, the likely causes in order are — credit added to
a different organisation than the key belongs to; the key sitting in a workspace with its own spend limit at
zero; or a key from a different account entirely. Check which organisation owns the key at
console.anthropic.com, confirm the balance there, and if it is the wrong org, set the secret to a key from
the funded one (Supabase → Edge Functions → `as-studio` → Secrets). Tell me when it is live and I will run
12/12 and come back with the full results.

---

## 7. Recommendation

# FIX A SMALL NAMED SET THEN SHIP

Not "do not ship" — the architecture is sound, preservation never failed, the audits are doing exactly the
job they were designed for, and one version out of seven is genuinely excellent. Not "ship to 5 teachers"
either, and I would push back hard on doing it this week. Five of seven versions could not be used in the
period they were written for, and the receipt told the teacher the constraint was preserved while its own
notes said otherwise. Put that in front of five teachers and the Use Rate metric records a product that
breaks its own promise — "adapts it for the students in front of you" has to mean it still fits the period
they have.

The named set, in order:

1. **Restore API credit and run 12/12.** Nothing else can be judged until this happens.
2. **Confirm the JSON fix eliminates the transform failures.** Expect twelve versions where five previously
   died. If any still fail, the parser degrades loudly now and will name what it could not repair.
3. **Confirm the budget rule moves feasibility.** The test is simple and specific: g5 visible should come
   back with far fewer than thirty-five response fields, and any version that still overruns must report
   `teacher_constraints` as ADAPTED_AS_PERMITTED or REVIEW_REQUIRED with the real time stated. If Advanced
   still comes back NOT_USEFUL three for three, the prompt is not the right lever and I would say so rather
   than tune it again.
4. **Read the three g8-sci packets when they exist.** That is the untested contract and the likeliest place
   for a silent preservation failure.
5. **Walk the teacher journey once against real model output** — upload, confirm, transform, receipt,
   Classroom Set, download. It has only ever been verified against a mocked backend.

If 1–4 come back clean, ship Support and Make Thinking More Visible to five teachers and hold Advanced back
one iteration — it is the mode with three failures out of three and the least evidence that the fix landed.
