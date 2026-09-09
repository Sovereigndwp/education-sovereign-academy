# Experiment A — results

Run `2026-09-09-20-39` · experiment `evidence-a-2026-09-09-v1` · 22 prompts, 13 cases, 45 claim-level
expectations. Pre-registration and ground truth were committed at `fe53542`, before any model call.
**Nothing was repaired after seeing a result.** No prompt was edited, no case re-run, no threshold moved.

## Headline

| criterion | result |
|---|---|
| F1 · manufactures problems in strong assessments | **2 manufactured interventions in 19 sound claims** (threshold as written is not evaluable — see defects) |
| F2 · declared context changes the judgment | **PASS, cleanly.** 11 of 11 claims changed across three pairs; 0 in the wrong direction |
| F3 · discrimination | **PASS.** 3 of 3 planted gaps found; false-positive control returned 0 unexpected claims |
| F4 · minimality | **FAIL — pre-registered straight kill.** One intervention proposed on the over-verified case |
| F5 · claim reconstruction | **Not measurable**, exactly as pre-registered |
| F6 · stability | **FAIL.** 2 of 5 repeats of the same sound case differ, both toward intervening |

Verdict match against ground truth: **39 / 45**. Intervention match: **39 / 45**.

## The one finding that matters

**Every single miss runs in the same direction: proposing a change that was not warranted.** Not one of
the six intervention misses is the engine failing to act. It never once turned a real gap into a KEEP.

The bias concentrates almost entirely on one claim — `G5C2`, "constructs equivalent fractions, combines
like-sized parts, and simplifies or regroups to a mixed number", carried by five worked items under
supervision. It came back `LIMITED` **with a proposed extra item** in P1, P2, V1, and in 2 of the 5
stability repeats of S1 — while the same claim, same text, same conditions, returned `KEEP` in the other 3.
So the engine decides that five supervised worked items do not fully carry a procedural claim roughly 40%
of the time, and when it does, it adds work.

That is the behaviour in the classroom finding, reproduced under controlled conditions and localised.

### F4 in detail — the sharpest result in the run

On `V1`, the owner's own over-verified fixture — prediction box, solution box, explanation box on every
item, plus a one-page reflection and a five-minute per-student conference — the engine:

- correctly judged G5C1 and G5C3 `KEEP` with no intervention;
- **wrote an accurate, specific diagnosis of the over-verification**: *"The mandatory 'Prediction' box adds
  no evidence beyond the 'Solution' box on a two-fraction comparison item, because predicting which
  fraction is larger IS the task… The prediction column costs writing time on three items without buying
  additional evidence"*, and again for items 4, 5 and 8;
- and then **proposed an additional Perturb item for G5C2 anyway.**

It saw the disproportion, described it better than the pre-registration expected, and added to it. This is
not a perception failure. It is a disposition failure.

## What worked, and worked well

- **Context does real work.** Every claim in all three paired cases changed verdict when the identical
  text moved from supervised to unsupervised-with-AI, and nothing moved the wrong way. The same Honors
  Calculus quiz is `KEEP` on all four claims proctored and `NOT_SUPPORTED` on all four sent home.
- **`NO_CHEAP_CHECK` was used exactly once**, on the take-home Gilded Age argument claim — the LC-8 class
  from the ontology stress test, where sustained argument with point-of-view weighting has no short
  supervised substitute. It did not invent a thin item to avoid saying so.
- **The false-positive control passed.** Told that sourcing and point of view are assessed on the unit
  test, the engine returned only the claim it was asked about and manufactured no gaps for the rest.
- **Negative scope never went thin.** Minimum 4 entries in `does_not_support` across all 45 claims.
- **Restraint sometimes worked exactly as designed.** On `S4/H2` it disagreed with the ground truth, named
  the narrowing, and declined to intervene — the LIMITED-without-intervention behaviour the refinement
  asked for, produced unprompted.

## Defects in the instrument, found by running it

Reported, not fixed.

1. **All 14 recorded "violations" are false positives from my own checkers.**
   - `CONDITIONS_UNSTATED` ×8 — `\bproctored\b` does not match `proctored_in_class`, because `_` is a word
     character. The model stated supervised conditions correctly in all eight.
   - `FEED_FORWARD` ×1 — matched "take-home" inside *"at the start of class before any discussion of the
     take-home quiz"*, which describes what is being verified, not where the new observation happens.
   - `BANNED_LANGUAGE` ×5 — `score[ds]?` catches the legitimate verb, e.g. *"the evidentiary value depends
     on the reasoning actually being scored"*, which is the ontology's own phrasing.
   **The engine committed zero real violations of the three structural rules.** The checker's precision is
   0/14. Its recall is untested and now unknown.
2. **`scoreCase` treats `intervention: null` as `false`,** so `X3/K4` — pre-registered as *not scored* —
   counts as an intervention miss. One of the six misses is therefore an artifact of the scorer.
3. **F1's threshold references "10 sound claim-sets"; only 5 sound cases were built.** Carried over from
   the decision package without re-deriving it for the case set that was actually constructed. The raw
   numbers are reported instead: 2 manufactured interventions across 19 sound claims, in 2 of 5 cases.
4. **F3's threshold says "3 of 4 planted gaps"; 3 were built** — the fourth cell is the false-positive
   control, not a planted gap.

## The unfilled cell

The owner's own Honors Precalculus and Calculus assessments are in no folder connected to this session.
The machine-authored `g11-calc-integration.md` covered grade contrast and the paired-context test, but it
cannot test *"does it leave a strong expert-authored assessment alone"*, because the same family of model
wrote it and judged it. That cell is still open.

## Execution path

No Anthropic API key was reachable from this session, so the 22 emitted prompts were executed through this
session's own model calls. Prompts, parsing, derivation and scoring are byte-identical to `--live`.
Transport and sampling are not: `--live` pins `temperature: 0.2` on `claude-sonnet-4-5` to match
`engine.ts`, and this run pinned neither. Stability was therefore tested under looser conditions than the
product path would face — which makes the F6 failure weaker evidence than it looks, and makes a `--live`
re-run the first thing worth doing with a key.
