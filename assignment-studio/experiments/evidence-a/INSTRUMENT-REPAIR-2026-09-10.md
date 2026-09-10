# Instrument repair — A1 re-scored, engine untouched

**Branch:** `exp/evidence-a-instrument`, cut from `42d436d`.
**Scope:** the measuring instrument only — `lib/derive.mjs` (checker) and `run.mjs` (scorer/thresholds).
**No prompt changed.** Verified mechanically: re-emitting all 22 prompts after the repair produced files
byte-identical to the frozen A1 prompts (`diff -rq` clean). The raw A1 replies were not touched, re-run or
re-generated. `git show 42d436d` still holds the original scoring for comparison.

## The five repairs asked for

| | defect | repair |
|---|---|---|
| R1 | `\bproctored\b` could not match `proctored_in_class` — `_` is a word character, so the boundary never lands. The declared-conditions vocabulary is underscore-joined by design and the model echoes it verbatim. 8 false `CONDITIONS_UNSTATED`. | Normalise `_` to a space before any structural pattern runs. |
| R2 | The feed-forward matcher fired on *"…before any discussion of the take-home quiz"* — which names the assessment **being verified**, not where the new observation happens. 1 false `FEED_FORWARD`. | Strip noun phrases referring to the assessment under audit, then test what survives. |
| R3 | `score[ds]?` caught the ordinary verb: *"the evidentiary value depends on the reasoning actually being scored"* — the ontology's own phrasing. 5 false `BANNED_LANGUAGE`. | Ban false **precision**, not the verb: a scoring word attached to a number, a named validity/confidence score, a letter grade, a percentile — plus `sufficient`/`sufficiency` and the AI-resistance family outright. |
| R4 | `scoreCase` collapsed `intervention: null` to `false`, so `X3/K4` — pre-registered as *deliberately not scored* — counted as a miss. | `null` routes to a `not_scored` cell and is excluded from every intervention count. |
| R5 | F1's threshold cited "10 sound claim-sets" against 5 built cases; F3's cited "4 planted gaps" against 3. | Every denominator is now derived from the ground truth actually loaded. **The rates are unchanged** — 8/10 is 0.80, 3/4 is 0.75 — so this is bookkeeping, not a moved goalpost. |

### R3b — one further false positive, found by the re-score itself

The first repair pass left exactly one violation standing: `BANNED_LANGUAGE` on **"2/5"**. That is a
*fraction*, in a fractions assessment. The lesson generalises: a bare number is never evidence of false
precision in this domain, and *"the selection alone has a 50% guess rate"* is language the ontology
**requires** on selected-response items. Every numeric branch of the pattern now carries a scoring word
with it. A 12-case self-test covering both directions runs in the commit message's verification block.

Recording this because it is the same class of error as the defects being repaired, and it was found by
running the repaired instrument rather than by reading it.

## Addition, not a repair

`scoreCase` now assigns every scored claim to exactly one confusion cell —
`justified_proposed` · `justified_missed` · `unnecessary_proposed` · `restraint_correct` · `not_scored` —
and `run.mjs` reports `detection_recall` and `restraint_rate` **as two separate rates that are never
combined**. A run that improves restraint by going blind to real gaps must be visible on its face.

## Corrected A1 results

| | before repair | after repair |
|---|---|---|
| structural violations | 14 | **0** |
| `CONDITIONS_UNSTATED` / `FEED_FORWARD` / `BANNED_LANGUAGE` | 8 / 1 / 5 | 0 / 0 / 0 |
| intervention misses | 6 | **5** (X3/K4 correctly excluded as not scored) |
| verdict match | 39/45 | 39/45 (unchanged) |

Confusion: **justified proposed 12 · justified missed 0 · unnecessary proposed 5 · restraint correct 26 ·
not scored 2.** Detection recall **1.000**. Restraint rate **0.839**.

Falsification: F1 **FAIL** (clean rate 0.60 against a 0.80 line) · F2 **PASS** · F3 **PASS**
(found rate 1.00, 0 false positives on the control) · F4 **FAIL** (one intervention on the over-verified
case) · F5 not measurable · F6 **FAIL**.

## Does any substantive A1 conclusion change?

**No. Two things get sharper, and one claim I made must be withdrawn.**

1. **Withdrawn:** "the engine committed zero real violations, and my checker's precision is 0 for 14" was
   stated as a suspicion. It is now measured: **zero violations survive a correct checker.** Every
   proposal the engine made stated supervised conditions, none sent an observation out of the room, and
   none used false precision. Its structural discipline is not a weak point at all.
2. **Sharper:** detection recall is exactly **1.000**. Across 12 warranted interventions it missed none.
   The A1 finding — that every error runs one direction — is now a measurement rather than an
   observation about six rows.
3. **Sharper:** the failure is quantified rather than described. Restraint holds on 26 of 31 claims where
   ground truth says intervene on none. The five failures are S3/S3c, S5/K3, and G5C2 three times.

The headline is unchanged: **context reasoning and gap detection pass; restraint fails.** F1, F4 and F6
still fail, on the same claims, for the same reason. Nothing about the recommendation moves.
