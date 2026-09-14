# Ontology v0.1 — Composable Evidence Architecture

**Status:** draft for Dalia's approval · 2026-09-04 · Track 3 · No software. Nothing sent.
**Scope:** secondary mathematics, developed and tested on Algebra I.
**Read with:** `02-COMPOSABLE-SCHEMA.json` (the fields), `03-EXAMPLE-RECORDS.json` (populated records), `04-ONTOLOGY-STRESS-TEST.md` (where it breaks).

Evidence labels used throughout: **[Established]** = published assessment science · **[Observed]** = in our own files or verified sources · **[Inferred]** = our reading of observed material · **[Hypothesized]** = our proposal, untested.

---

## 0. Where this sits in existing assessment science (so we do not claim novelty)

The kickoff asked for the smallest ontology that generates the sample product, and to use established terms where they exist. Three established structures already contain most of what we need. We adopt them and say so.

1. **Evidence-centered design (ECD)** — Mislevy, Steinberg & Almond (2003). An assessment is an argument from *what we observe* (evidence model) through *tasks we set* (task model) to *claims about the student* (student model). Our `Learning Claim → Verification Item → Evidence Statement` chain **is** the ECD claim–evidence–task triad, restricted to short classroom checks. **[Established]**
2. **The assessment triangle** — NRC, *Knowing What Students Know* (2001): cognition, observation, interpretation. Our three working definitions map onto it: the *Learning Claim* is a cognition statement; *Evidence* is an observation; the *Evidence Statement* is the interpretation, with its limits written down. **[Established]**
3. **The "two-lane" approach** — Liu & Bridgeman (University of Sydney, 2023; adopted by TEQSA guidance and multiple universities): Lane 1 = *secured* assessment of learning, where the institution assures what a student can do without AI; Lane 2 = *open* assessment for learning, where AI use is expected. Corbin, Dawson & Liu (2025, *Assessment & Evaluation in Higher Education*, "Talk is cheap") argue that only *structural* changes — not instructions or honour statements — carry assurance in a GenAI world. **[Established]** Our Practice/Production vs Evidence separation is the K-12, single-topic, teacher-scale version of the same idea. The contribution, if there is one, is not the distinction; it is making it *operable per learning claim at exit-ticket grain with the cost stated*.

Also adjacent and acknowledged: the **AI Assessment Scale** (Perkins, Furze, Roe & MacVaugh, 2024) — a five-level scale of *permitted* AI use per task. It is a policy instrument. Our *delegability* judgment is a different axis (could AI produce this artifact without the target understanding?), and the two are compatible. Dawson (2021) distinguishes *assessment security* (can the evidence be trusted?) from *academic integrity* (did the student behave well?); we work only on the first.

**Pushback on the kickoff's hypothesis.** "Practice is for developing learning, Production is what the learner creates, Evidence is what supports an inference" is a workable triad, but assessment science already has a sharper cut, and we should use it: an *observation* becomes *evidence* only relative to a *claim* and under stated *conditions*. So "Evidence" is not a third kind of activity — it is a *role an observation plays in an argument*. Practically this means the ontology needs a **claim** object and an **evidence-condition** object before it needs a third activity category. We kept the three-role vocabulary because teachers can use it in one breath, but the machine-readable structure below is ECD, not the triad. See §7 for the consequences.

---

## 1. Core objects

### 1.1 Learning Claim
A statement about what a student knows or can do, written so an observation can support or fail to support it.

- Must name a **doable thing** with a **condition**: "computes the slope of a line from two points (integer coordinates, no context)" not "understands slope".
- Carries a **claim_type**, because the kind of claim decides which primitives can reach it: `procedural` · `conceptual` · `representational` · `diagnostic` (recognises and repairs errors) · `application` (builds or uses a model in a novel setting). This follows the procedural/conceptual distinction in Rittle-Johnson & Schneider (2015) plus the representational fluency work of Lesh (1987) and Swan (2005). **[Established]**
- May list **prerequisite claims** (used only to say "a failure here may be a failure upstream").
- Is tied to a **standard** (CCSS code) and a **concept** (course-level topic) so records aggregate upward to unit, course, department.

### 1.2 Existing Activity and Activity Role
Anything the teacher already assigns: problem set, Desmos task, notes, project, quiz, test. Each activity carries one or more **roles**:

- **Practice** — intended to develop the knowledge or skill.
- **Production** — an artifact or performance the learner creates.
- **Evidence** — an observation from which the teacher can reasonably infer something about a claim, *under the conditions it was produced*.

Roles combine. A homework set is Practice + Production; a proctored unit test is Production + Evidence; a whiteboard warm-up watched by the teacher is Practice + Evidence with no artifact at all. **[Hypothesized as a working vocabulary; tested in 04]**

### 1.3 Delegability (a professional judgment)
For an activity: *could a capable AI produce the observable artifact without the learner possessing the target understanding?* Three qualitative values, each with a reason attached; never a number. **[Observed: matches locked decision 1 in CONTEXT.md — no score]**

| Value | Meaning | Typical reason |
|---|---|---|
| `full` | The whole artifact is producible from the task text alone | task is closed-form and the context is a textbook archetype |
| `partial` | Producible except **[named step]** that depends on information not in the prompt | e.g., a data set collected in class; a prediction written before the equation existed |
| `low` | Produced under observation, or depends on in-the-moment information | proctored; oral; a live whiteboard |

**The Track-2 falsification, stated as a rule:** delegability describes *production*. It says nothing about whether the artifact, once it exists, can be **fed forward** as context to an AI for later work. A `partial` artifact (a checkpoint, an outline, a prediction sheet) can be photographed and used to generate consistent follow-on work. Therefore *no artifact with delegability `partial` or `full` should be relied on as the sole evidence for a claim* when independent evidence is wanted. This is why Evidence needs its own conditions (§2).

### 1.4 Evidence Gap
The inference the teacher wants that the existing observable work does **not** independently support. Written as a sentence beginning "We cannot tell from [activity] whether the student…". One gap per claim per activity. The gap is what a Verification Item is built to close — partly.

### 1.5 Verification Primitive
A reusable transformation applied to a claim (and usually to something the student has already practised) to produce a short, independent observation. The library is deliberately small (§3).

### 1.6 Verification Item
One concrete instance: a primitive applied to a claim, with a stem, response type, key/scoring rule, **variant rule**, evidence statement and cost. The unit that renders into a student page, a question bank, an LMS item, or a curriculum map.

### 1.7 Evidence Statement
Every item states, in two labelled lines, **Evidence this item can support** and **Evidence this item cannot support**. The second line is not decoration. It is the mechanism that prevents the product from implying that one correct response proves mastery. The "cannot support" line must name at least: the adjacent claims the item does not reach, and the guess-rate caveat for any selected-response part.

### 1.8 Cost
Two numbers only: estimated **student minutes** and estimated **scoring seconds per response**. Class minutes are derived (student minutes + ~1–2 minutes handling) and are not stored. All cost figures are **[Hypothesized]** until a teacher runs the item and reports; the record carries a `cost_status` of `modeled` or `reported`.

---

## 2. Evidence Conditions — required vs contextual

Which conditions must hold for an observation to count as *independent evidence* for a claim? We tested the kickoff's six candidates.

| Candidate | Verdict | Why |
|---|---|---|
| **Independent / supervised** | **Required** | The whole point: the response is produced where external assistance (human or AI) is excluded or visible. "Supervised" is the usual means; "independent" is the property. We store the property as `supervision_condition` (`proctored_in_class` · `observed_live` · `unsupervised`) and only the first two qualify. |
| **Novel to the student** | **Required** | If the exact form has been available to the student beforehand, an AI could have pre-produced the answer and the student could have carried it in. Novelty is *relative to what the student could have prepared*, not "never seen this kind of question". It is operationalised by the **variant rule** (§4). |
| **Targeted to the claim** | **Required** | An observation that cannot be mapped to a named claim is not evidence *of* anything; it is a score. This is ECD's minimum. |
| Short | Contextual (cost) | Brevity buys frequency and simultaneous administration; it does not make an observation more evidentiary. It is a cost property and lives in `Cost`. |
| Observable | Definitional, not a condition | If it isn't observable it isn't an observation. Dropped as a field. |
| Limited external assistance | Folded into *Independent* | The degree allowed (calculator, formula sheet, partner) is recorded on the item as `tools_allowed`; it changes what the item is evidence *of*, not whether it is evidence. |

So: **three required conditions** — independent, novel, claim-targeted — and the rest are properties of the item. **[Inferred from ECD + Corbin et al.; hypothesised as the minimal set]**

A note on what we are *not* claiming: meeting the three conditions makes an observation *independent evidence*; it does not make it *sufficient*. Sufficiency is a measurement claim (how many observations, at what reliability, support "mastery") that we have not established. The product therefore uses **Independent Evidence of Learning** and never "minimum sufficient evidence".

---

## 3. Verification Primitives v0.1

Starting set from the kickoff: Perturb, Transfer, Predict, Diagnose, Represent, Reverse. Tested against the Algebra I claims in 03/04. Result: all six survive; two are added (**Generate**, **Classify**); one candidate is rejected (**Explain** as a standalone primitive — see end of section). Eight total.

Each primitive is described with the same ten fields the kickoff asked for. "Novelty" here means: what must be new for the item to be independent evidence.

### P1 · Perturb
Change one parameter or condition of something the student has already practised, and ask what changes.
- **Reveals:** whether the student understands *which* feature of the situation controls *which* feature of the mathematics (structural mapping), rather than recalling a worked answer.
- **Fits:** conceptual and representational claims; parameter-meaning claims (slope vs intercept; coefficient vs constant).
- **Does not establish:** fluency on the full procedure; performance in an unfamiliar context.
- **Novelty:** the *perturbation* must be new; the base problem may be familiar (that is the point).
- **Supervision:** required — a perturbed item is fully delegable if taken home.
- **Response:** a choice ("slope / intercept / both / neither") plus one number or a one-line reason.
- **Student time:** 1–3 min. **Scoring:** 10–20 s.
- **Failure modes:** perturbation that changes two things at once (then the item is not diagnostic); base problem the student never actually did.
- **Equity/access:** low language load; works well for multilingual learners because the base context is already known. Avoid perturbations that rely on cultural knowledge of the context.

### P2 · Transfer
Apply the same underlying concept in a setting the student has not met, with the information supplied in a different form.
- **Reveals:** whether the concept is available *unprompted* — recognised in a setting with different surface features.
- **Fits:** application claims; conceptual claims; modelling claims (building an equation from a situation).
- **Does not establish:** procedural fluency (a right answer may use a slow method); transfer beyond the distance tested.
- **Novelty:** the setting and the *form in which information is given* must be new. Record `transfer_distance` using Barnett & Ceci (2002): which dimensions changed (knowledge domain, physical context, modality, temporal). Near vs far is a description of what changed, not a difficulty score. **[Established]**
- **Supervision:** required.
- **Response:** an equation or a number with a unit; optionally one sentence naming the rate.
- **Student time:** 3–5 min. **Scoring:** 20–40 s.
- **Failure modes:** context so unfamiliar that reading load dominates (then the item measures reading); "novel" contexts that are actually textbook archetypes with new nouns.
- **Equity/access:** highest language-load primitive. Provide a glossed context line; keep numbers clean; allow a diagram.

### P3 · Predict
Ask for a qualitative claim about a result *before* any calculation, with a one-line reason.
- **Reveals:** structural reasoning (sign, direction, relative size, existence) independent of computation. Rooted in Predict–Observe–Explain (White & Gunstone, 1992). **[Established]**
- **Fits:** conceptual claims about behaviour of functions and parameters.
- **Does not establish:** ability to compute the thing predicted; correctness of the reason if only the prediction is checked.
- **Novelty:** the object predicted about must be new; the *kind* of prediction may be practised.
- **Supervision:** required — a written prediction taken home is fully delegable and, once written, is feed-forward context (the Track-2 falsification).
- **Response:** a circled choice + one sentence. The sentence carries the evidence; the choice alone has a 50% guess rate.
- **Student time:** 1–2 min. **Scoring:** 10–20 s (read the sentence for the named feature).
- **Failure modes:** predictions that can be checked by a two-second computation (then students compute); reasons graded on prose quality instead of on whether they name the controlling feature.
- **Equity/access:** sentence frames ("It will be ___ because the ___ is ___") reduce writing load without reducing evidence.

### P4 · Diagnose
Present an unfamiliar incorrect solution or claim; the student locates the error and repairs it.
- **Reveals:** whether the student can recognise a violated rule or misinterpretation — knowledge that is *active* rather than merely reproducible. Erroneous-examples research (Adams, McLaren et al., 2014; McLaren et al., 2015) supports both the learning and diagnostic value. **[Established]**
- **Fits:** diagnostic claims; conceptual claims (misinterpretation); procedural claims (recognising a procedural slip is weaker evidence than performing the procedure, and the statement must say so).
- **Does not establish:** that the student would avoid the error in their own work; procedural fluency.
- **Novelty:** the specific erroneous solution must be new to the student. The *error type* can be a known misconception — that is what makes it worth diagnosing.
- **Supervision:** required.
- **Response:** circle the wrong line + write the corrected value/statement. Avoid "explain what went wrong" as the only response — it is slow to score and rewards prose.
- **Student time:** 2–3 min. **Scoring:** 15–25 s.
- **Failure modes:** errors that are typos rather than misconceptions; multiple errors in one solution; a "fix" that is itself a full re-solve (then it is a procedural item in disguise).
- **Equity/access:** keep the flawed solution short (≤4 lines). Good for students who freeze on blank-page tasks.

### P5 · Represent
Move between equation, graph, table, diagram and words; or identify which representations describe the same object.
- **Reveals:** representational fluency — whether the student can read the *same* information in different forms (Lesh translation model; Swan's matching activities). **[Established]**
- **Fits:** representational claims; conceptual claims about parameters.
- **Does not establish:** ability to *build* a representation from a real situation (that is Transfer); computational accuracy.
- **Novelty:** the specific object must be new; the representation types are always familiar.
- **Supervision:** required.
- **Response:** matching / selection with a "not sure" option, or a small produced representation (a four-row table, a sketch with two labelled points).
- **Student time:** 2–4 min. **Scoring:** 10–30 s.
- **Failure modes:** matching sets where one option is eliminable by surface cues; graphs too small to read; distractors that do not correspond to a named error.
- **Equity/access:** strongest primitive for multilingual learners (low language load) and for students with dysgraphia if selection is used. Ensure graphs have high contrast and labelled axes.

### P6 · Reverse
Give the outcome; ask for the conditions that produce it (work backward).
- **Reveals:** whether the relation is understood as a relation, not a one-way procedure; inverse thinking. Watson & Mason (1998) list "reversal" as a core question type. **[Established]**
- **Fits:** procedural claims (solving for an input); conceptual claims (parameters from behaviour).
- **Does not establish:** forward fluency; interpretation.
- **Novelty:** the specific numbers must be new; the reversal type may be practised.
- **Supervision:** required.
- **Response:** a single number or a short equation.
- **Student time:** 1–3 min. **Scoring:** 5–15 s.
- **Failure modes:** reversals with many valid answers where only one is keyed; reversals that are just the forward procedure with a substitution.
- **Equity/access:** low language load; clean numbers matter more here than elsewhere.

### P7 · Generate *(added)*
Ask the student to construct an example that meets stated constraints.
- **Reveals:** whether the student can *use* the concept to make something, which recall or recognition cannot show. Learner-generated examples (Watson & Mason, 2005) have a strong literature; the response space is large, which defeats memorised answers. **[Established]**
- **Fits:** conceptual claims; representational claims; classification claims (construct a counter-example).
- **Does not establish:** the student's ability in the *typical* case; procedural accuracy beyond what the constraints force.
- **Novelty:** the constraint set must be new.
- **Supervision:** required.
- **Response:** an equation, a table, a point, a sketch — anything checkable against the constraints.
- **Student time:** 2–4 min. **Scoring:** 15–30 s — the scorer checks constraints, which is fast when there are ≤3.
- **Failure modes:** constraints that admit a trivial example (y = 0); more than three constraints (scoring cost rises quickly); constraints that require the scorer to compute.
- **Equity/access:** open response spaces reduce anxiety for some learners and raise it for others; pair with a sentence frame or a "start from y = ___x + ___" scaffold on the student page.

### P8 · Classify *(added)*
Present several cases; the student decides which belong to a category and states the deciding property.
- **Reveals:** whether the student holds the *defining* property rather than surface cues (e.g., "linear means the y-values go up by the same amount" — only true when x-steps are equal). Sorting/classifying is one of Swan's (2005) five activity types. **[Established]**
- **Fits:** conceptual claims about definitions and structure; distinguishing function families.
- **Does not establish:** the ability to work with the objects once classified.
- **Novelty:** the cases must be new; at least one case must be designed to separate the defining property from the surface cue.
- **Supervision:** required.
- **Response:** tick/cross per case, with a "not sure" option, plus the deciding value (e.g., the constant rate) for each positive case.
- **Student time:** 2–3 min. **Scoring:** 10–20 s.
- **Failure modes:** all cases separable by surface cue; too many cases; cases that are ambiguous (a two-row table is "linear" by any definition).
- **Equity/access:** very low language load; good for whole-class simultaneous use with hand signals or mini-whiteboards.

### Rejected: Explain (as a standalone primitive)
"Explain why" is the most natural teacher move and the worst verification primitive under the constraints: it is fully delegable when unsupervised, slow to score, rewards prose fluency over mathematical content (construct-irrelevant variance, Messick 1989), and is hardest for multilingual learners. Explanation survives *inside* other primitives as a one-sentence reason scored for whether it names the controlling feature — never for its quality as writing.

### Overlaps found and kept
- **Perturb ↔ Predict**: a perturbation is often answered by a prediction. Kept separate because the *novelty target* differs (Perturb: the change; Predict: the object) and because Predict can stand alone with no base problem.
- **Reverse ↔ Generate**: both work backward from constraints. Kept separate because Reverse has a unique keyed answer and Generate does not — which changes the scoring rule and the time.
- **Diagnose ↔ Classify**: classifying an erroneous claim as wrong is a Diagnose item. Rule: if the student must *repair*, it is Diagnose; if they only sort, it is Classify.

---

## 4. The Variant Rule (the field that makes "novel" operational)

Every item carries a **variant rule**: what may change to make a fresh form, what must stay fixed to preserve the claim, and how the key changes. This is a lightweight *item model* in the sense of Bejar (2002) and Gierl & Lai's automatic item generation, written for a human with a pen. **[Established concept; our use is hypothesised]**

It matters for three reasons: (1) it is what lets a teacher give a form no student could have prepared for, across five periods, without writing five quizzes; (2) it makes the item a *template* rather than a question — which is what a question bank or software would consume later; (3) it is the concrete answer to "what stops a student from uploading last period's ticket?"

Rule form: `vary:` … `fix:` … `key:` … `avoid:` … (e.g., avoid slope 1, avoid zero intercept, avoid boundary cases).

---

## 5. Scoring rules

Two-level by default: **counts as evidence** / **does not yet**; a third **flag** value for responses that need a look. Partial-credit rubrics are avoided because they cost scoring seconds and are not needed for an evidence decision. Where a selected response is combined with a written reason, *the reason decides*; the selection alone never counts (guess rate).

Position balancing: across a set of selected-response items, the keyed option must not sit in the same position, and never systematically in positions 2–3 (a defect found in the predecessor misconception instrument — **[Observed]**, TSA misconception-intelligence audit). "Not sure" is always offered on selection items and is never scored as a belief.

---

## 6. Three worked claim-to-item chains (the ontology in one line each)

- **Claim** "interprets slope and intercept in context with units" ← **Activity** problem set (Practice+Production, delegability `full`: the contexts are archetypes) ← **Gap** "cannot tell whether the student attaches the number to the quantity or reproduces the phrasing" ← **Primitive** Diagnose ← **Item** a flawed interpretation to repair ← **Statement** supports: recognises a rate/start confusion; cannot support: fluency computing slope.
- **Claim** "decides whether a table is linear by testing constant rate" ← **Activity** homework classification set (delegability `full`) ← **Gap** "cannot tell whether the student uses constant rate or 'same difference in y'" ← **Primitive** Classify ← **Item** three tables, one with unequal x-steps ← **Statement** supports: holds the rate definition; cannot support: distinguishing linear from exponential in words.
- **Claim** "writes a linear equation from two points" ← **Activity** problem set (delegability `full`) ← **Gap** "cannot tell whether the student can execute the procedure unaided" ← **Primitive** Perturb (fresh numbers) ← **Item** two new points, three parallel forms ← **Statement** supports: executes the procedure on integer inputs; cannot support: interpretation, or the procedure on fractional or contextual inputs.

---

## 7. What the triad gets wrong, and what we did about it

The stress test (04) found four places where Practice / Production / Evidence does not describe what is happening. Short version:

1. *Evidence is a role of an observation relative to a claim, not a kind of activity.* Fixed structurally by making Claim and Evidence Statement first-class and treating "Evidence" on an activity as shorthand for "produces observations that could serve as evidence under its conditions".
2. *Delegability of production ≠ usefulness of the artifact as evidence.* Fixed with the feed-forward rule in §1.3 and the novelty condition in §2.
3. *Some claims have no cheap independent check* (extended modelling with messy data; sustained problem solving). The ontology must be allowed to say "no short item reaches this claim; evidence comes from a supervised extended task", and the product must say it too. Field `no_short_check_reason` added.
4. *Practice that is also evidence has no artifact* (a watched warm-up). The `Existing Activity` object therefore does not require an artifact; it requires an *observation*, which may be transient.

No v0.2 is issued yet: the changes are field-level, not structural. See 04 for the full record and the trigger conditions for v0.2.

---

## References (used, not decorative)

- Adams, D. M., McLaren, B. M., et al. (2014). Using erroneous examples to improve mathematics learning with a web-based tutoring system. *Computers in Human Behavior*, 36. McLaren et al. (2015). Delayed learning effects with erroneous examples. *IJAIED* 25.
- Barnett, S. M., & Ceci, S. J. (2002). When and where do we apply what we learn? A taxonomy for far transfer. *Psychological Bulletin*, 128(4), 612–637.
- Bejar, I. I. (2002). Generative testing: from conception to implementation. In Irvine & Kyllonen (Eds.), *Item generation for test development*.
- Corbin, T., Dawson, P., & Liu, D. (2025). Talk is cheap: why structural assessment changes are needed for a time of GenAI. *Assessment & Evaluation in Higher Education*.
- Dawson, P. (2021). *Defending Assessment Security in a Digital World*. Routledge.
- Lesh, R., Post, T., & Behr, M. (1987). Representations and translations among representations in mathematics learning and problem solving.
- Liu, D., & Bridgeman, A. (2023). What to do about assessments if we can't out-design or out-run AI? *Teaching@Sydney*; FAQ on the two-lane approach (2024).
- Messick, S. (1989). Validity. In Linn (Ed.), *Educational Measurement* (3rd ed.).
- Mislevy, R. J., Steinberg, L. S., & Almond, R. G. (2003). On the structure of educational assessments. *Measurement: Interdisciplinary Research and Perspectives*, 1(1). Also Mislevy & Haertel (2006), Implications of ECD for educational testing.
- National Research Council (2001). *Knowing What Students Know*. National Academies Press.
- Perkins, M., Furze, L., Roe, J., & MacVaugh, J. (2024). The AI Assessment Scale (AIAS). *Journal of University Teaching & Learning Practice*; revised version arXiv:2412.09029.
- Rittle-Johnson, B., & Schneider, M. (2015). Developing conceptual and procedural knowledge of mathematics. In *Oxford Handbook of Numerical Cognition*.
- Swan, M. (2005). *Improving Learning in Mathematics: Challenges and Strategies*. DfES Standards Unit.
- Watson, A., & Mason, J. (1998). *Questions and Prompts for Mathematical Thinking*; (2005) *Mathematics as a Constructive Activity: Learners Generating Examples*.
- White, R., & Gunstone, R. (1992). *Probing Understanding*. Falmer. (Predict–Observe–Explain.)
- Wiliam, D. (2011). *Embedded Formative Assessment*. Solution Tree. (Hinge questions — the closest classroom ancestor of the short targeted check.)
