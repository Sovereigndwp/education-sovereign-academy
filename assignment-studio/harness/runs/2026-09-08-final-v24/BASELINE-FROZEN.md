# Pre-pilot baseline — FROZEN 2026-09-09

This directory is the frozen pre-pilot baseline for Assignment Studio. Nothing in it is to be regenerated,
re-run, or overwritten. Later experiments compare **against** it; they do not replace it.

## What is frozen

| | |
|---|---|
| Edge function | `as-studio` **v24** on project `rdqwoqdvqpedlsbaghtr` (ACTIVE, `verify_jwt: false`) |
| Contract | `v0.1` — `TRANSFORMATION-CONTRACT-v0.1.md`, owner-issued 2026-09-05 |
| Transform prompts | `as-2026-09-05-v1` |
| Audits | `audit-2026-09-08-v5` |
| Source hashes (sha256, first 16) | `index.ts` d52381b68d7aaa3a · `lib.ts` 4159df3419423d7b · `contract.ts` 99b40f6df890c81d · `audits.ts` fc9aab4d91c9fad2 · `engine.ts` 898207423e3750ed |
| Gold cases | the four in `gold/`, as corrected 2026-09-08 |
| Run packet | the 26 files beside this one, plus `journey-classroom-set.docx` |

All five deployed files were verified byte-identical to the repo after deploy, not merely reported so.

## What the 12/12 result is, and what it is not

**It is:** an internal, automated evaluation. Twelve transformations (four gold assignments × three modes)
run through the live product path, scored by the product's own three audits and checked against
gold-declared status ranges written in advance.

**It is not:** teacher validation. No teacher has seen any of these versions.

The specific numbers, stated precisely:

- 12 of 12 transformations completed without error.
- 12 of 12 had all preservation statuses inside the gold-declared range for their mode.
- 0 receipt contradictions (no field reported PRESERVED while the product's own trace called it doubtful).
- Preservation audit: 7 PASS, 5 REVIEW, 0 BLOCK.
- **Usefulness audit: 10 of 12 USEFUL.** This is the product's own blind usefulness audit — a model
  judgement about clarity, feasibility, editing and grading burden. It is **not** ten teachers, ten
  classroom uses, or ten of anything a human said.
- Adversarial audit: 8 UNDERMINED (all Support and Advanced, expected and not repaired outside Visible),
  4 WEAKENED (all Visible), 0 SURVIVES.
- The planted Science integrity fixture returned identical findings on 8 consecutive runs.

**Correct phrasing for any later use:** "10 of 12 internal usefulness checks passed" · "the engine's own
audits rated 10 of 12 versions usable" · "12/12 on our internal gold harness".
**Incorrect:** "10/12 teachers found the outputs useful" · "validated with teachers" · "12/12 classroom
success". Zero teachers have been involved to date.

## Known limitations carried into the pilot

1. **Advanced is held.** 2 of its 4 cases scored feasibility 1 — both on originals already at capacity
   (a full 45-minute DBQ; nine items in 25 minutes). It is not being fixed or tuned for now, by decision.
2. **Adversarial UNDERMINED on all eight Support and Advanced versions.** Expected by contract — a take-home
   worksheet is shortcut-able — but it means any AI-resistance claim rests on Visible alone, where all four
   came back WEAKENED and none SURVIVES.
3. **No human has judged instructional quality.** The gold boundaries were written by the owner; the
   verdicts against them were produced by the same family of model that produced the versions.
4. **One repair fired in twelve.** The bounded repair cycle has been exercised once at this scale.
5. **The teacher journey was walked by Claude, not by a teacher** — full backend path plus the real `.docx`
   builder, on a non-gold Grade 8 slope task. The page itself had not been walked by a human at freeze time.

## Change control from this point

No changes to the transformation prompts, the Learning Contract, the audits, the modes, or the interface
without the owner seeing the proposed change first. Deployment routing needed to make the page reachable is
not a product change, but it is recorded below.

Recorded at freeze: `vercel.json` gained four `/assignment-studio` rewrites so the page resolves. No other
file outside `assignment-studio/` was touched.
