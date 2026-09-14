# F1 — remedy form: does a richer representation earn its cost?

**Status: design only. Nothing was run, nothing was implemented, no engine file was touched.**
Live pilot engine unchanged: `esa.ts 2111305b8e3e`, `esa-prompts.ts 645294a4e6e7`,
prompt SHAs `diagnosis 76fd839e5a86fdcb · coverage 36927f528018c0cb · conditions 3228ce64dc87552e`.

This document is not committed. It belongs on `exp/esa-two-stage` with the other experimental
records, not on `feat/esa-pilot`, which is the deployment branch.

---

## 0. Two findings before the design

### 0.1 Your motivating example fails your own constraint 5

The Grade 5 claim, as the teacher confirmed it in the release check, was:

> *States why adding denominators produces a wrong-sized part, and gives the correct sum.*

Two components: **"States why adding denominators produces a wrong-sized part"** (verb: *States*)
and **"gives the correct sum"** (verb: *gives*).

The proposed bar-model item — colour 2/3 then 1/6 on one bar, 3/4 on another, predict which has
more colour, then check with numbers — is a **magnitude comparison** task. It never asks why adding
denominators produces a wrong-sized part. It elicits fraction magnitude and visual–symbolic
connection, which are real and valuable and **are not what this teacher said she was trying to
find out**.

The list of things you wrote that the richer item "may reveal" is, read strictly, a list of
*adjacent claims*:

- whether the student understands fraction magnitude — not in the claim
- whether they connect visual and symbolic representations — not in the claim
- whether their prediction agrees with their calculation — not in the claim
- whether they can explain the relationship rather than only execute a procedure — **this one is
  in the claim**, and it is the only one

For *this* claim the correct low-burden intervention is textual and cheaper than the bar model:

> *Amir wrote 2/3 + 1/6 = 3/9 and says the answer is smaller than 2/3. Explain what went wrong in
> his thinking, then give the correct sum.*

One item. No materials. Same student minutes. It hits both components head-on.

This is not a small correction. It is the same failure that produced the invented "Independent
production" pseudo-component in the release check, **moved downstream from diagnosis to remedy**:
a richer form reveals more, "more" is nearly always adjacent-claim territory, and adjacent-claim
evidence looks like better evidence right up until you ask which claim it supports. Stage A is now
span-anchored against exactly this. Stage B is not anchored against anything.

That the example fails is, oddly, the best argument for the principle: it means the principle has
teeth, and it means the licence has to be component-anchored rather than gradient-anchored.

### 0.2 "Stronger evidence" is always satisfiable — which is how H1 failed

H1's postmortem: cost was doing load-bearing work; a free remedy made gate 3 non-binding and moved
pressure upstream to gate 1. The criterion "would a richer representation give stronger evidence?"
has the same shape. The answer is *always yes* — every assessment ever written could yield stronger
evidence from a richer task. A criterion that is always satisfied is not a criterion.

The architecture protects you better than H1 did, because the KEEP decision now lives in Stage A and
Stage B only runs when a material limitation already exists. So restraint cannot collapse the same
way. But the *form* decision inside Stage B has no cost discipline at all unless one is built, and
"richer form at the same tier" is precisely a way to spend more burden without the tier showing it.

### 0.3 Timing — the honest objection

Five teachers are about to look at real Stage B output. Your own comparison dimension is *"whether
the suggestion would plausibly make a teacher say: that is a better way to see whether they really
understand."* That is a question about teachers. Right now the instrument for answering it is my
judgement; in two weeks the instrument is five teachers who have no reason to be polite about it.

Zero teachers have completed a review. The current Stage B has never been seen by its audience.

Recommendation: **design now, run after the pilot.** The design is cheap and pays off immediately —
it tells you what to listen for while the pilot runs (§5.2). Running it now spends a day scoring
plausibility against a question real data will answer better.

---

## 1. The proposed Stage B principle

### Your version

> Once Stage A has independently established a genuine evidence gap, Stage B should seek the
> smallest useful intervention that produces stronger evidence, not necessarily the smallest
> textual modification.

The first half is right and is a real improvement: *smallest textual edit* is the wrong target.
The second half — *produces stronger evidence* — is the unbounded criterion.

### Tightened version

> Stage A identifies which **component** of the teacher's confirmed claim has no evidence. Stage B
> selects the **lowest-burden item form that elicits that component**.
>
> Form is chosen by what the component requires, never by how much the item reveals. The ordinary
> textual form is the default and wins by default. A different form is licensed only when a **named,
> closed-vocabulary confound** makes the textual form unable to elicit that component — never
> because a different form would show more.

Three structural consequences:

**(a) Form is a choice *within* a tier, never a new tier.** The hierarchy is untouched:
KEEP → modify one item → add one short check → larger observation → no cheap check. A richer form
never licenses skipping a tier, and never moves anything off KEEP — that decision stays in Stage A.

**(b) The licence is binary, not a gradient.** "Component X is unevidenced and form F is the
cheapest form that elicits it" is checkable. "Stronger evidence" is not.

**(c) Burden stays the ordering axis.** Stage B reports the form's cost in the same units the tier
already uses (student minutes, teacher prep minutes, materials required). Self-reported cost is not
cost — it is scored, not trusted.

### The closed confound vocabulary

Five entries. If none fires, the textual form wins and no richer form is available.

| Confound | Fires when | Licensed form family |
|---|---|---|
| `guessable` | the answer space is small enough that a correct response doesn't demonstrate the component (selected response, binary comparison with no justification) | require justification; construct rather than select |
| `procedure_suffices` | a taught procedure produces the correct answer *without* the component — fires when the component is about **how** the student reasons | foreclose the procedure ("without finding a common denominator"); a representation the procedure doesn't operate on; compare two methods |
| `answer_only` | the response format has nowhere for the component to appear (numeric box, no explain line) | add a response slot: explain an error, show/justify, short oral defence |
| `single_instance` | the component is about generality or discrimination — "and when it is not", "in a new case" | construct an example or counterexample; sort/classify |
| `order_confounded` | the component is **anticipatory** (predicts, estimates, sees before computing) and the format lets the computed result precede it | predict before calculation; estimate then solve |

Your eleven candidate forms map into these five, and two of them get demoted, which is the point:

- **transfer the idea to a new context** — licensed only if the teacher's claim *itself* contains
  transfer language. Otherwise it fails the fidelity gate: transfer is a strictly larger claim than
  the one confirmed. Most of the time this form should be unavailable.
- **short oral defence** — licensed under `answer_only`, but it is also the canonical *conditions*
  remedy, and those are different prompts (§4.3). Collision flagged.
- **visual or spatial representation** — licensed under `procedure_suffices` only. It is not a
  general-purpose upgrade.

### The form-justification record

When `form != "textual"`, Stage B must emit:

```
form_justification: {
  component_span:  <verbatim substring of the teacher's confirmed claim — the unevidenced component>
  confound:        <one of the five; closed set>
  why_textual_fails: <one sentence, specific to the original item>
  burden: { student_minutes: n, teacher_prep_minutes: n, materials: <none | listed> }
}
```

Checkable in code, in the same spirit as `validateSpans()`: `component_span` must appear verbatim in
the confirmed claim, `confound` must be in the closed set, and an empty `why_textual_fails` forces
the form back to textual. Structural, not instructional — which is the lesson from both prior rounds.

### A design note worth more than the principle

The cheapest form upgrade is almost always a **constraint on the response**, not a new medium.
"Without finding a common denominator, say which is larger and how you know" costs one sentence,
zero materials, two minutes — and forecloses the procedure just as effectively as a bar model, which
costs printing, colouring, and drawing accuracy as a new confound. The instinct behind "richer
representation" is right; the instinct that richer means *visual or manipulative* is expensive and
usually wrong.

---

## 2. Experiment design

### 2.1 Arms

| Arm | Stage B prompt | Purpose |
|---|---|---|
| **A0** control | shipped, unchanged (`coverage 36927f528018c0cb`) | baseline |
| **A1** treatment | A0 + form clause + closed confound vocabulary + `form_justification` | the proposal |
| **A2** ablation | A1 with **free-text** justification, no closed vocabulary | is the mechanism doing the work, or just the permission? |

A2 is the cheap ablation that matters. If A2 ≈ A1, the closed vocabulary is complexity for nothing
and you ship the simpler thing. If A2 drifts into decoration while A1 holds, the vocabulary is
load-bearing and you know why.

### 2.2 Stage A is byte-identical and runs once

Run Stage A **once per case**, freeze it, hash it, and feed the *same frozen diagnosis record* to
all three arms. Same `diagnosis_hash` across arms. Any output difference is attributable to the
Stage B prompt alone.

This is now free — the architecture already freezes and hashes the diagnosis — and it removes the
largest confound H1 had. It is also non-negotiable: constraint 1 is "do not change Stage A", and
sharing one frozen record enforces it mechanically rather than by intention.

### 2.3 Cases

Eight cases, six subject/level combinations. Cases 1 and 2 are **the same assessment with different
confirmed claims** — that pairing is the core of the design, because it isolates the variable. If
the licence is component-anchored, the correct answer flips between them. If A1 proposes a bar model
for both, it is decorating.

| # | Subject / level | Confirmed claim (abbrev.) | Stage A gap | Expected correct form |
|---|---|---|---|---|
| 1 | G5 fractions | *states why adding denominators gives a wrong-sized part; gives the correct sum* | coverage — compute-only items | **textual** (explain an error) |
| 2 | G5 fractions — *same assessment* | *compares unlike denominators by reasoning about size, not by converting* | coverage — every item answerable by converting | **richer** (`procedure_suffices` → foreclose the procedure) |
| 3 | G8 science, circuits lab | *predicts brightness before testing, and revises when the result differs* | coverage — sheet records results, no pre-observation slot | **richer** (`order_confounded` → predict first) |
| 4 | G10 history DBQ | *weighs two sources against each other and says which better supports the conclusion* | coverage — MC on attribution only | **richer** (`guessable` + `answer_only`), still tier 1 |
| 5 | G7 writing | *uses evidence from the text to support a stated position* | **none** — constructed response, rubric line already present | **KEEP**, Stage B must not run |
| 6 | G11 essay, take-home | claim requiring individual attribution | **conditions**, unsupervised, AI permitted-not-enforced | conditions path, **no form vocabulary present** |
| 7 | G6 geometry | *finds area of a compound figure by decomposing it* | coverage — figures arrive pre-decomposed | **textual/diagram** (manipulatives fail burden) |
| 8 | G9 algebra | *recognises when a situation is proportional **and when it is not*** | coverage — all items proportional, no non-examples | **richer** (`single_instance` → construct a counterexample) |

Case 5 is also a **stress probe**: run A1's Stage B off-protocol on a no-gap claim. If it proposes
anything at all, that is H1 recurring and the design stops there.

Case 7 is the burden test: manipulatives are tempting, cost materials plus fifteen minutes, and
reveal nothing extra about *decomposing*.

### 2.4 Scoring

**Fidelity is a blocking gate, not a score.** If the proposed item elicits a claim the teacher did
not confirm, it fails outright however good it is. Scoring fidelity on a scale invites trading it
for richness, which is the exact trade §0.1 shows is easy to make by accident.

Gates (binary, blocking):
- **G-FID** — everything the item elicits is within the confirmed claim
- **G-LIC** — the named confound actually applies to the original item, checked by hand against the item
- **G-TIER** — the tier is no higher than A0's for the same case

Scores (1–5, blinded):
1. evidence strength for **the identified component** (not in general)
2. teacher burden (prep minutes, materials)
3. student time
4. does it reveal something genuinely different, or restate the same evidence in a new costume
5. risk of unnecessary redesign
6. would a teacher plausibly say *"that is a better way to see whether they really understand"*

Reported across all cases: **KEEP preservation rate** — how often a no-gap claim is left alone. This
is the H1 metric and it is reported whether or not anyone asks for it.

Blinding: arm labels stripped, outputs shuffled, scorer sees the teacher's claim and the frozen
Stage A record but not which arm produced what.

### 2.5 Size

8 cases × 3 arms × 3 replicates = **72 Stage B calls**; Stage A runs 8 times total. Replicates are
needed because remedy selection is the noisy part — H1's restraint numbers moved between runs.

### 2.6 Decision rule, fixed before running

**A1 PASSES** only if all of:
- KEEP preserved 100% (no invented gaps, Case 5 probe included)
- G-FID 100%, G-LIC 100%, zero tier inflation
- richer form chosen in **2, 3, 4, 8** and **not** in **1, 6, 7**

**Hard stops:**
- a richer form proposed in **Case 1** → the licence is gradient-driven, not component-driven →
  FAIL, redesign the licence before rerunning
- anything at all proposed in **Case 5** → H1 recurrence → STOP, do not implement
- form vocabulary appearing in the **conditions** output → §4.3 hazard is real → STOP

**Simplification rule:** if A2 matches A1 on every gate, drop the closed vocabulary and ship the
simpler prompt.

---

## 3. Sample outputs

Predicted, hand-written in the product's register. These are what the experiment would be scored
against, not results.

### Case 1 — G5 fractions, procedural claim → textual wins

**A0 (current):**
> Add one short check: *"Which is greater, 2/3 + 1/6 or 3/4? Explain."*
> Tier: add one short targeted check.

**A1 (correct):**
> Change item 7 to: *"Amir wrote 2/3 + 1/6 = 3/9 and says the answer is smaller than 2/3. Explain
> what went wrong in his thinking, then give the correct sum."*
> Tier: modify one existing item. Form: textual.
> No form upgrade: no component of this claim is anticipatory, about magnitude, or about generality.
> The claim's first component *is* an explanation, and text elicits an explanation directly.

Note A1 is also a **lower** tier than A0 — the form discipline made the intervention smaller, not
larger. Worth watching for; if it replicates, that is an argument for the change on its own.

**A1 failure mode to watch for:** the bar model. Fails G-FID.

### Case 2 — G5 fractions, magnitude claim → richer wins

**A0 (predicted weakness):**
> Add: *"Which is greater, 2/3 or 5/8? Explain."*
> A student answers this by converting to 24ths. The gap is not closed. A0 has no way to see this,
> because a textual comparison item *looks* like it targets comparison.

**A1:**
> Change item 4 to: *"**Without finding a common denominator** — is 5/8 closer to 1/2 or to 1? Is
> 2/3? Which is larger, and how do you know?"*
> Tier: modify one existing item. Form: foreclose the procedure.
> `component_span`: "reasoning about relative size, not by converting to a common denominator"
> `confound`: `procedure_suffices` — the taught conversion produces the right answer without the
> component, so no textual rewording of a comparison item can distinguish the two.
> `burden`: student 2 min, teacher prep 0, materials none.

The richer form here is still **plain text**. That is the §1 design note in action.

### Case 5 — KEEP stays KEEP

Both arms must return the strong finding and **no remedy at all**:

> This assessment supports what you are trying to find out. Students state a position and the rubric
> requires textual evidence for it, so a response that scores well cannot have skipped the part you
> care about.
>
> *What I would do:* nothing. This one is doing its job.

A1 proposing a "richer" item here is an automatic stop.

### Case 6 — conditions, no cheap check is the honest answer

> Because this goes home and you need to attribute the work to each student individually, the
> assessment can show you what a student produced but not that they produced it.
>
> *What I would do:* there is no cheap check here. A five-minute in-class follow-up would settle
> attribution, but you have said you cannot supervise this group, and anything short of that would
> give you a number you could not rely on.

Critically: this output contains **no item forms, no tiers, no `modify_item`** — the conditions
prompt does not know those exist and must not learn.

---

## 4. Risks

**4.1 H1 recurrence through a side door.** Cost is load-bearing. "Richer form at the same tier" is
a way to spend more burden without the tier showing it. *Mitigation:* burden reported per remedy and
independently scored; form is within-tier only; G-TIER blocks inflation.

**4.2 Claim drift through the remedy.** The span discipline constrains Stage A's components. Nothing
constrains what the *remedy* elicits. Richer forms reveal more; "more" is adjacent-claim territory.
This is the pseudo-component disease moved downstream, and §0.1 shows it is easy to walk into.
*Mitigation:* G-FID as a blocking gate now; a remedy-side span check in code if this ever ships.

**4.3 Contaminating the conditions prompt — the architectural hazard.** The form list is very
tempting on the conditions path: *short oral defence* is literally an attribution remedy. If the
form vocabulary goes into both Stage B prompts, the conditions prompt acquires a menu of item forms
and `modify_item`-shaped thinking returns through the back door — undoing the structural separation
you authorised. **The form clause goes in the coverage prompt only. The conditions prompt is
untouched and its hash stays `3228ce64dc87552e`.**

**4.4 Self-reported burden is not burden.** Stage B's own minute estimates are claims. A scorer can
sanity-check them; only teachers can falsify them.

**4.5 The whole experiment measures plausibility, not evidence.** No student ever answers these
items. We would be scoring *whether an item looks like it would produce better evidence*, which is
not the same thing and cannot be made the same thing without classrooms. A PASS here is weak
evidence and should be labelled as such in whatever it licenses.

**4.6 Scope creep toward a task bank.** The eleven forms are a pedagogy catalogue. Once it is in the
prompt, ESA drifts from *"here is what your assessment can and cannot support"* toward *"here are
better activities"* — and the first is the thing that makes it credible to a sceptical teacher who
has been sold lesson ideas before. Constraints 4 and 8 guard against this, but the gravity is real
and it erodes across versions rather than in one step.

**4.7 Opportunity cost.** §0.3.

---

## 5. Verdict

### 5.1 Recommendation

**The principle deserves a post-pilot implementation slot, conditional on the pilot showing that
teachers engage with remedies at all. It is out of scope until then.**

The core insight is right and worth keeping: *smallest textual edit* is the wrong optimisation
target, and *smallest intervention that closes the identified gap* is the right one. That is a real
improvement to a real weakness, and Case 2 shows the current Stage B has a blind spot it cannot see
from the inside — a textual comparison item that *looks* like it targets comparison while a taught
procedure walks straight through it.

What should change before it is built:
1. The licence is **component-anchored**, not evidence-gradient-anchored (§1).
2. The confound vocabulary is **closed** and checked in code, not described in prose (§1).
3. **Coverage prompt only.** The conditions prompt stays frozen (§4.3).
4. **Fidelity is a gate, not a score** (§2.4).
5. Retire the bar-model example as the motivating case; it fails constraint 5 (§0.1).

### 5.2 What to listen for during the pilot — free, starting now

This is the payoff for designing before running. Three teacher reactions, each of which settles a
question this experiment would otherwise spend a day on:

- *"The suggestion is fine, but it wouldn't tell me anything I don't already know."*
  → Case-2 shaped. The principle is validated and F1 should run.
- *"That's more work than it's worth."*
  → The form upgrade is dead on arrival; the burden axis is the binding constraint, not richness,
  and F1 should not run at all.
- *"I'd never have thought to ask it that way."*
  → The richer form earns its cost with real teachers, and F1 becomes a priority rather than a
  backlog item.

If no teacher returns with a second assessment, remedy richness was never the problem and this
document stays closed.
