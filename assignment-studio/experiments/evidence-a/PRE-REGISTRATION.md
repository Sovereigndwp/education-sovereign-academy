# Experiment A — pre-registration

**Written and committed before any model was called.** The git history is the proof: this file and the
ground truth in `groundtruth/expected.json` land in one commit, the results land in a later one. Nothing
in `groundtruth/` is edited after a result is seen. If a case turns out to be badly designed, it is
reported as badly designed; it is not re-scored.

**Branch:** `exp/evidence-judgment-a`, cut from the frozen baseline `fe1903e`.
**Experiment version:** `evidence-a-2026-09-09-v1`.

---

## The one question

Can the machinery already in Assignment Studio evaluate the **original** assessment — rather than a
transformed version of it — well enough to say, claim by claim and under declared conditions, what the
evidence supports, what it does not, and whether anything needs to change?

This is a capability question. It is not a demand question, and nothing here tests whether a teacher wants
this. That gate comes later and separately.

## What this is not

- Not a product, not a schema migration, not a UI, not a v0.2 of anything. `experiments/evidence-a/` is
  additive; deleting the folder returns the branch to `fe1903e`.
- Not deployed. Nothing touches the `as-studio` edge function, the `as_*` tables, or the frozen v24 run
  packet. `--live` calls the Anthropic API directly for exactly this reason.
- Not measuring student learning. It audits an argument: does this assessment, under these conditions,
  license the inference the teacher wants to draw?

## Vocabulary boundary, enforced in code

The words **sufficient**, **sufficiency**, scores, percentages, grades, ratings, confidence numbers, and
**AI-proof / AI-resistant / cheat-proof** are forbidden in every teacher-visible field. `derive.mjs`
matches for them and records a `BANNED_LANGUAGE` violation rather than scrubbing it, so the count is
visible. Where this experiment needs a word for the thing, the word is *supports*.

A **process artifact is not independent evidence merely because it is educationally valuable.** A
checkpoint, outline, draft, plan or reflection that leaves the room is a prompt, not a proof. This is the
2026-09-04 feed-forward falsification, and it is enforced twice: stated in the prompt, and checked in
`derive.mjs` (`FEED_FORWARD`, `CONDITIONS_UNSTATED`).

## The four verdicts

Derived **in code** from the model's structured answers, never read from a label the model wrote — the
same discipline as `normPreservation` / `normAdversarial` in `audits.ts`.

| verdict | rule |
|---|---|
| `KEEP` | at least one independent observation under the declared conditions, and it reaches the whole claim |
| `LIMITED` | an independent observation exists but reaches only part of the claim; the narrower inference is named |
| `NOT_SUPPORTED` | no independent observation under these conditions, and a short check could reach it |
| `NO_CHEAP_CHECK` | no independent observation, and no short check reaches this claim — stated with the reason |

**Restraint is separate from the verdict.** `intervention_warranted` is its own boolean. A strong
assessment may sample a claim narrowly on purpose, and the correct behaviour is to name the narrowing and
propose nothing. Ground truth therefore scores verdict and intervention independently, and 31 of the 45
claim-level expectations expect **no intervention**. This is the refinement the owner added: the target is
restraint, not blindness. `KEEP` is never permitted to carry a proposal; `LIMITED` may legitimately carry
none.

## What was reused rather than invented

| from | what |
|---|---|
| `audits.ts` — Adversarial Student | the whole shape of the judgment: what survives, what is bypassed, the cheapest path, and `repair_hint` as *the smallest change that would make the cheapest path fail* |
| `audits.ts` — `normPreservation` | verdicts derived in code from booleans, so a lenient or over-eager model cannot move the outcome on its own |
| `audits.ts` — `integrityDevice` | the principle that a property of the artifact is settled in code, not by the model. Here: whether conditions permit an independent observation |
| `audits.ts` — blind usefulness audit | judgments kept structurally separate rather than combined |
| `contract.ts` — `STANCE` | the operator stance, the no-student-data rule, "do not manufacture certainty" |
| Track 3 ontology §2 | the three required evidence conditions: independent, novel, claim-targeted |
| Track 3 ontology §1.3 | the feed-forward rule |
| Track 3 ontology §1.7 | the "cannot support" line, non-optional, never empty |
| Track 3 ontology §3–§4 | the eight primitives, the rejection of "Explain", the variant rule |
| Track 3 stress test F3 | `no_short_check_reason` |
| Track 2 v2 | claims quote the assessment's own verb; the sufficiency line is stated *before* the item runs; cost is two modelled numbers |
| `gold/` | four sound assessments, owner-corrected 2026-09-08, and the over-verified fixture |

What is genuinely new here is small and deliberate: the claim as the unit, the declared-conditions block,
and `intervention_warranted`.

## The case set — 13 cases, 45 claim-level expectations

| cell | cases | what it tests |
|---|---|---|
| sound / supervised | S1 g5 Math · S2 g8 ELA · S3 g8 Science · S4 g10 History · S5 Honors Calculus | **F1** — does it manufacture problems in strong work? |
| paired context | X1 g5 · X2 g10 · X3 Calculus, identical text, unsupervised + AI permitted | **F2** — does declared context change the judgment, in the right direction? |
| planted gap | P1 g5 minus item 9 · P2 g5 Part A as bare multiple choice · P3 Science minus item 6 | **F3** — does it find gaps whose answers were fixed in advance? |
| false-positive control | P4 g10, text unchanged, sourcing scoped out by the teacher | **F3** — does it leave alone what is assessed elsewhere? |
| over-verified | V1 the owner's `visible-valid-excessive-burden` fixture | **F4** — can it decline to add to a task already drowning in verification? |
| stability | S1 run five times | **F6** — same input, same verdicts? |

Claim sets are decomposed from the **owner-written** gold contracts (`gold.json`, as she corrected them on
2026-09-08) into the claim-level unit Track 3 used. Calculus is the exception and is machine-authored
throughout — see `cases/synthetic/PROVENANCE.md`.

## Known limits of this run, stated before it runs

1. **The owner's own Honors Precalculus/Calculus assessments are not in it.** They are not in any folder
   connected to this session. The pre-registered cell for them is therefore unfilled, and the
   machine-authored `g11-calc-integration.md` does not substitute for it: the same family of model wrote
   the assessment and judges it, so it cannot test "does it leave a strong *expert-authored* assessment
   alone". **This is the single largest hole in the run and it is the owner's to close** by pointing at the
   files.
2. **Claim reconstruction is not scored automatically, and the run does not pretend otherwise.** Whether a
   reading matches what the teacher meant is a judgment about meaning; a model marking its own
   reconstruction homework would produce a number that measures nothing. The forced-choice readings are
   produced and recorded; the scoring fields are left null for a human. The ≥75% threshold is carried
   forward but **what it would measure right now is agreement with a decomposition of the owner's own gold
   contract, made by me, not with the owner** — which is a weaker thing than it sounds, and is why F5 is
   reported as "not yet measurable" rather than as a pass.
3. **Execution path.** No Anthropic API key is reachable from this session — not on the device, not in the
   container, and the edge-function secret is not readable. The 22 prompts are therefore emitted verbatim
   and executed through this session's own model calls, one prompt per call, replies captured raw. The
   prompts, the parsing and the entire derivation and scoring path are byte-identical to what `--live`
   would run. What differs is transport and sampling: `--live` pins `temperature: 0.2` against
   `claude-sonnet-4-5` to match `engine.ts`; this run cannot pin either. **Stability results are therefore
   a harder test than the product path would face, and any single verdict should be treated as one
   sample.** `node run.mjs --live` reproduces the whole thing properly with a key.
4. Four of the five sound assessments were written for the gold harness, i.e. written to be sound. Real
   teacher assessments are messier.

## Falsification, fixed now

| | criterion | kill / trigger |
|---|---|---|
| **F1** | manufactures problems in strong assessments | fewer than 8 of 10 sound claim-sets clean, or any intervention proposed on a claim whose ground truth says none was warranted |
| **F2** | declared context does not change the judgment | any pair with 0 changed verdicts, or any verdict that moves in the wrong direction (unsupervised judged stronger than supervised) |
| **F3** | cannot discriminate | fewer than 3 of 4 planted gaps found, or more than 2 manufactured gaps across the sound cases, or any unexpected claim returned on P4 |
| **F4** | recommendations are not minimal | any intervention on the over-verified case, more than one observation proposed for a single gap, or any feed-forward violation |
| **F5** | claim reconstruction inaccurate | below 75% — **not measurable in this run**, reported as such rather than as a pass |
| **F6** | unstable | verdicts differ across the five repeats of S1 |

**If the experiment fails, the failure is reported and nothing is repaired.** No prompt is edited, no case
is re-run, no threshold is moved after seeing a result. A second version of this experiment, if there is
one, starts from a new pre-registration.
