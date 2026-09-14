# Gold run 2026-09-08 — what happened, what it found, what is still owed

Endpoint: `as-studio` **v15** · contract `v0.1` · prompts `as-2026-09-05-v1` · audits `audit-2026-09-08-v5`.

## Status

7 of 12 cases produced a version. 5 did not, for two different reasons in sequence. Neither is a contract
problem; both are named below.

| | |
|---|---|
| Completed | g10 support · g10 advanced · g5 support · g5 advanced · g5 visible · ela advanced · ela visible |
| Not run | g10 visible · ela support · g8-sci support · g8-sci advanced · g8-sci visible |

## Two defects found by running it for real

### 1. A JSON-parse defect was discarding good versions — fixed

Five of the twelve first attempts failed with `Expected ',' or '}' after property value` or
`Unexpected non-whitespace character after JSON`. Cause: the transform returns a whole assignment inside a JSON
string, and real assignments contain quotation marks — the ELA passage has `a rating of "poor,"`, the Science
sheet has `"If we release the cart from 80 cm…"`. The model escapes them almost always, but not always, and
`extractJson` was a single strict `JSON.parse`. A good version was thrown away on roughly **2 attempts in 5**
with a quote-heavy passage.

Fix (`contract.ts`): strict parse first, unchanged, so well-formed output is never touched. Only when that
throws does a character walk escape the two things models actually get wrong inside a string — a content quote
(one not followed by a character that could continue the JSON grammar) and a raw control character. Eight
regression cases pass, including both observed failure shapes and the "already well-formed" and "already
escaped" cases.

This was worth catching before a pilot: at that rate roughly two teachers in five would have seen a version
fail to generate.

### 2. The Anthropic API credit balance is exhausted — needs you

The retry of those five hit:

> `Anthropic API 400 — Your credit balance is too low to access the Anthropic API.`

That is a spend decision, so it stops here. Once credits are restored the five re-run with no code change; the
JSON fix is already deployed and the five failures above were all parse failures, not model failures.

## The finding worth your attention

**Five of the seven completed versions came back NOT_USEFUL, and the reasons are substantive.** The Usefulness
audit is blind — it never sees the learning target, required thinking, or required evidence — so it cannot be
leaking validity concerns into a usability score. Every one of the five scored `feasibility: 1`, and the notes
are concrete and arithmetical:

- *g5 visible*: "expands 9 items into approximately 27 response fields… cannot fit in 25 minutes"
- *g5 advanced*: "Part A now requires TWO strategies per item plus an explanation of why both match — triples
  the work for 3 items in a 25-minute assignment"
- *ela advanced*: "1 + 6–8 + 3–4 = 10–13 sentences minimum. The assignment ceiling is 12."
- *g10 advanced*: "The original was already a full 45-minute task… adding ~8 more sentences to Part A"
- *g5 support*: "63 lines vs the original's 33 — nearly double the length for the same nine items in the same
  25 minutes"

Preservation was PASS or REVIEW on all of them, and statuses were in range everywhere. So the pattern is not
that the engine breaks the learning. It is that **the engine over-stuffs the period**: it adds depth or
scaffolding without subtracting anything, and the teacher's stated time constraint loses.

Two things follow, and both are yours to decide rather than mine to quietly tune:

1. This is a transform-calibration question, not an audit-calibration one. The audit is doing its job; the
   versions really are too long for the stated time. Tuning the Usefulness audit to stop saying so would be
   exactly the failure mode the blind design was built to prevent.
2. It bears directly on the product promise. "Adapts it for the students in front of you" implies the version
   still fits the period they have. A Use Rate metric will read this as teachers rejecting versions.

The obvious lever is in `contract.ts`: the mode prompts already say depth-not-volume for Advanced, but nothing
holds any mode to the teacher's stated minutes. That is a one-place change when you want it — flagged, not made.

## Smaller notes for the reviewer

- `g10 support`: item count reads 5→0 because the support version reformats numbered items into a sourcing
  table; the items are present. The auto column is wrong here, not the version.
- `g5 visible` carries 1 REVIEW_REQUIRED status; the packet shows which field and why.
- No version required the bounded repair cycle in this run.
- `lib.ts` as deployed differs from the repo copy by three `─` characters in one comment divider. Cosmetic;
  worth reconciling on the next deploy.

## Deploy collision

Another session deployed **v10** over this session's v9, reverting `audits.ts` to the pre-fix build. v10 also
carried a change this session did not make — `apiKey()` no longer falls back to
`getSetting("anthropic_api_key")`. That is a sensible hardening, so it was merged rather than overwritten and
both changes went out together as v11 (then v15 with the JSON fix). Until the other session stops deploying
`as-studio`, whoever deploys last silently deletes the other's work.
