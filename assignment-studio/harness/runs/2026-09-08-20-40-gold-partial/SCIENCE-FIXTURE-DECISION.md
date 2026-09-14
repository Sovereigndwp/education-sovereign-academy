# Why the Science preservation verdict flipped, and what changed

**The question asked:** is the condition this fixture tests something that can and should be derived
deterministically from the confirmed Learning Contract / Transformation Contract, rather than left to model
judgment?

**Answer: yes — the classification, not the reading.** The smallest deterministic fix has been made.

## What the flip actually was

The two v7 runs did not disagree about a judgment call. They differed in whether the model *noticed* the
fixture's planted device at all:

| run | preservation | the finding |
|---|---|---|
| 1 | BLOCK | `must_not · "claim to be AI-proof" · exceeded · block`, citing the header "Complete individually, in your own words", the repeated "in your own words", and the signed honesty statement |
| 2 | PASS | `findings: []` — no non-held finding of any kind; the honesty statement went unremarked |

Re-running the pre-fix build seven more times during this session reproduced the instability: **2 BLOCK, 5
REVIEW** on identical input at temperature 0.2. So the fixture was not testing a boundary the system held; it
was testing whether one sampling of the model happened to look at the last four lines of the page.

## Why this is derivable rather than a judgment

The fixture's device is an *honesty pledge with a signature line*. Two things about it are already fixed by the
contract, not by the auditor:

1. **Whether the text is there.** `MODES.visible.must_not` already names `claim to be AI-proof`,
   `depend on AI detection` and `confuse inconvenience with assessment validity`. Whether a version contains a
   pledge, an AI-proof claim, or a signature line is a property of the version's characters. There is nothing
   to weigh.
2. **What such a device is worth.** The Adversarial audit prompt already states, as a fixed rule, that honesty
   pledges and signatures *do not count as surviving learning signal*. The contract had therefore already
   decided the question; only the Preservation audit was re-deciding it per run.

## The fix (`audits.ts`, ~30 lines, no new audit / score / loop / architecture)

A pattern scan runs inside `normPreservation`, before the verdict is derived, and only in Visible mode:

- **Only text the transformation ADDED counts.** The scan diffs the version against the original. A teacher
  whose own assignment already carries an honour-code line is preserving it, not introducing it — Assignment
  Studio does not police the teacher's document. (Verified: with the pledge moved into the original, the same
  version returns PASS.)
- **Two tiers, because they are not the same failure.**
  - *Claim* — the version asserts the work is AI-proof or will be detected → `block`. It is telling students
    something untrue about the assignment.
  - *Pledge* — a promise of honesty stands in for a way to see the thinking → `review`. No learning is removed;
    every item of required evidence is still demanded. v0.1's own rule is not to confuse inconvenience with
    assessment validity, and the thing genuinely wrong with such a version — that the thinking is still
    bypassable at trivial cost — is the Adversarial audit's finding, which returned UNDERMINED on every run
    before and after the fix.
- **The rule is normative, not a backstop.** A model finding filed under `claim to be AI-proof` is floored to
  `review` when the version contains no such claim, because that rule names a claim the version would have to
  *make*. Without this, the verdict would still flip: BLOCK in the run where the model reaches for the AI-proof
  label, REVIEW in the run where the code supplies the finding.

## Result

Five consecutive live runs on the fixed build (`audit-2026-09-08-v5`, edge function v15), same fixture, same
confirmed contract:

| run | preservation | usefulness | adversarial |
|---|---|---|---|
| 1–5 | REVIEW (×5) | USEFUL (×5) | UNDERMINED (×5) |

Gold expectation for this fixture is `preservation: [REVIEW, BLOCK]` · `usefulness: [USEFUL,
USEFUL_WITH_EDITS]` · `adversarial: UNDERMINED`. All three now land inside expectation on every run.

**No gold expectation was changed.** The fixture's stated purpose — "apparent AI resistance, bypassable" — is
now carried by the audit that owns it: Adversarial says UNDERMINED at trivial cost with no independent check,
and Preservation says, at review level, that a signed statement is not a way to see thinking.

## What the fix deliberately does not do

- It does not fire in Support or Advanced mode. Those modes' MUST-NOT lists do not contain the AI rules, and a
  take-home Support sheet is expected to be shortcut-able.
- It does not treat "in your own words" as a violation. That phrase is ordinary assignment language and appears
  in legitimate versions; the trigger is the pledge/signature/claim device, not the phrasing.
- It does not touch the model's prompts. The three audit prompts are byte-identical to v4; only the code-level
  derivation changed. `AUDIT_PROMPT_VERSION` was bumped to `audit-2026-09-08-v5` so persisted rows stay
  distinguishable for the launch-metric comparison.

## Regression checks run locally before deploy

| case | expected | got |
|---|---|---|
| Science fixture, model reports nothing (run-2 behaviour) | REVIEW | REVIEW |
| Science fixture, model blocks on "AI-proof" (run-1 behaviour) | REVIEW | REVIEW |
| Science fixture, model reports the pledge itself at review | REVIEW | REVIEW |
| Same version plus a real "This version is AI-proof" banner, model silent | BLOCK | BLOCK |
| Pledge already present in the teacher's original | PASS | PASS |
| G5 burden fixture (visible) — must gain no new finding | REVIEW | REVIEW |
| ELA support fixture — block must stand untouched | BLOCK | BLOCK |
| No context passed (older call sites) — behaviour unchanged | PASS | PASS |
