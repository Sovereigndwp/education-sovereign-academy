# Ramp Height and Cart Speed — Data Analysis (CER) — SUPPORT

case g8-sci-ramp-data · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 44586 ms

## Gold boundary

**Pass looks like**
- Averages partially pre-filled (e.g. 10 cm and 30 cm) so students still practise the computation but spend time on the CER; graph axes pre-drawn and scaled.
- CER sentence frames that structure ('When the height went from ___ to ___, the speed went from ___ to ___, which is ___ times as fast') without supplying the ×1.4 conclusion.
- Vocabulary glossed: potential energy, kinetic energy, photogate, proportional.
- Item 6 kept as an evaluation of the student's claim; item 7 kept as an extrapolation with a stated method.

**Violation looks like**
- Data altered to a linear pattern, or the table extended to include 50 cm or 80 cm (answers to 6/7 placed in the data).
- Directions that state the relationship ('Speed increases by about 1.4 times each time height doubles').
- Item 6 reduced to yes/no with no explanation, or item 5 reduced to 'name two kinds of energy'.
- Any average recomputed incorrectly.

## Preservation statuses (engine)

- **correctness**: PRESERVED — All data, calculations, and scientific claims (GPE→KE, speed-squared, the non-proportional pattern) are unchanged and correct.
- **learning_target**: PRESERVED — Students still compute averages, identify the non-linear (square-root-like) pattern from the doubling comparisons, and explain it with GPE→KE transfer and the speed-squared relationship.
- **required_evidence**: PRESERVED — All required evidence is still produced: correct averages in the table, labeled graph, claim sentence, the two doubling comparisons quoted, energy reasoning naming GPE→KE and speed-squared, explicit disagreement with 'twice as fast' backed by the ×1.4 pattern, and a ~2.9 m/s prediction for 50 cm with method.
- **required_thinking**: PRESERVED — All required thinking remains: compute averages, graph, compare ratios (the two doublings), construct a claim, explain with energy transfer, evaluate the misconception, extrapolate a prediction with a stated method.
- **teacher_constraints**: PRESERVED — Still 30 minutes, paper, hand-sketched graph, CER format; the version adds structure (sub-prompts, write-on lines) but does not add tasks—students write shorter prose in Q4–7 because the structure does some of the sentence-building work.

Workload: same — Prep: none beyond printing. Grading: same number of responses to check; the sub-prompts in Q4, Q6, Q7 may make partial credit decisions slightly faster because the steps are visible, but total grading time is unchanged.

## Audits (final round)

- **Preservation**: PASS — PASS. All contract elements held. The transformation applies permitted adaptations (chunking Q1 calculation steps, sequencing Q2 graphing steps, adding sentence starters in Q4, providing vocabulary glosses in Q5, splitting multi-part questions into labeled sub-parts) without removing, weakening, or supplying any required thinking or evidence. The inline definitions in Q5 support vocabulary without constructing the energy-transfer explanation students must build. The Q4c prompt 'does the speed also double?' makes the non-proportional pattern explicit but students must still compute the averages and recognize the ~×1.4 relationship from their data. No must-not rules violated.
  - learning_target ·  · held · note: The learning target (energy transfer GPE→KE, speed grows with square root of height, non-proportional relationship) remains intact. Q5 still requires students to 'Explain *why* the relationship looks the way it does' using GPE and KE. The inline definitions ('energy the cart has because of its height' and 'energy of motion; depends on speed squared') provide vocabulary support without constructing the explanation or stating the transfer mechanism for students.
  - required_thinking ·  · held · note: All required thinking preserved: Q1 still requires computing averages (procedure chunked but calculation unchanged); Q2 still requires graphing; Q4a-c still requires identifying the non-linear pattern through the two doublings ('does the speed also double?' makes the comparison explicit but students must compute and compare the ratios); Q3 still requires constructing a claim; Q5 still requires explaining with energy-transfer model; Q6 still requires evaluating the misconception using the pattern; Q7 still requires extrapolation with stated method.
  - required_evidence ·  · held · note: All evidence elements still required: Q1 produces correct averages in the table; Q2 produces labeled graph; Q3 produces claim sentence (write-on line is format, not content); Q4a-b require the two quoted doubling comparisons (sentence starters 'changes from ___ to ___' structure the quote without providing it); Q4c makes the ×1.4 pattern explicit but students must recognize it from their computed values; Q5 requires energy reasoning naming GPE→KE and speed-squared; Q6 requires explicit disagreement backed by pattern; Q7 requires ~2.9 m/s prediction with method.
  - teacher_constraints ·  · held · note: 30-minute timing preserved (no content added, only sequencing); paper format preserved; hand-sketched graph explicitly maintained in Q2 ('Sketch a graph'); CER format preserved with Q3-5 maintaining Claim-Evidence-Reasoning structure and labels.
  - correctness ·  · held · note: Data table unchanged; mathematical relationships unchanged; the inline definitions in Q5 are factually correct (GPE depends on height, KE depends on speed squared); no computational errors introduced.
- **Usefulness** (blind): USEFUL — clarity 3, feasibility 3, editing none, grading same, improves True
  - Part 1 directions are now explicit step-by-step (add, divide, round, write), making it immediately hand-out ready without teacher clarification.
  - Graph instructions specify axis placement and connection of points, removing ambiguity for students who struggle with graphing conventions.
  - Part 2 Evidence section (4a-c) provides structured blanks that guide students to extract the exact comparisons needed, reducing off-target responses.
  - Vocabulary scaffolding in question 5 (GPE and KE with brief definitions) supports students without giving away the reasoning.
  - Grading burden remains the same: teacher still reads one claim, checks two numerical comparisons, reads one explanation, and two application responses per student—same items, just better organized on the page.
  - (validity note held out of this score) Question 4c ('does the speed also double?') could lead students to the key insight too directly, potentially reducing the thinking required for the claim in question 3, though students still must articulate the relationship themselves.
  - (validity note held out of this score) The hint about 'speed squared' in question 5 vocabulary may guide students toward the correct energy relationship more than the original, though they still must construct the explanation.
- **Adversarial**: UNDERMINED (cost trivial, independent check False) — The student photographs the assignment sheet, pastes it into an AI chat, and asks: 'Fill in all the blanks and answer all questions. For the graph, describe what to draw.' The AI computes the four averages (1.30, 1.84, 2.25, 2.60), fills in all sentence starters and blanks in questions 4a–4c, writes the claim sentence, writes the three-line energy explanation using the provided terms, answers 6a (no) and writes 6b using the ×1.4 pattern, predicts ~2.9 m/s for question 7a and explains the extrapolation method in 7b. The student copies all text answers onto the sheet, sketches the graph following the AI's description (four labeled points on axes), and hands it in. Total time: under 10 minutes.
  - survives: The hand-sketched graph requires the student to physically draw axes, plot four points, and label units — this takes a few minutes of manual work but does not require understanding the non-linear pattern or the energy model. No other learning signal survives.
  - bypassed: Computing and interpreting the averages (AI does the arithmetic); identifying the non-linear pattern from numbers (AI recognizes that speed does not double when height doubles); constructing the claim (AI writes it); explaining the energy-transfer model (AI generates the GPE→KE explanation using the provided terms); evaluating the misconception (AI applies the pattern); making and justifying the prediction (AI extrapolates). The sentence starters and fill-in-the-blank structure in questions 4, 6, and 7 make the AI's output directly pasteable — the student does not need to identify what comparisons to make, what pattern to name, or what method to state.
  - repair hint: Before students begin the written work, have them commit in class to a prediction: 'If we double the height from 20 cm to 40 cm, will the speed double, more than double, or less than double?' Collect this on a slip with their name. Then in question 4c, ask them to compare their prediction to what the data actually show. This forces them to interpret the numbers themselves before the AI can do it for them.

## What we changed
- Q1: Added three-step procedure (add, divide, round) in place of the single direction — _Chunks the calculation without changing the math or the evidence produced_
- Q2: Broke graphing into four labeled steps (x-axis, y-axis, labels, plot) — _Sequences the task; same graph, clearer path_
- Q3: Added a write-on line for the claim sentence — _Marks the response space; does not change the claim itself_
- Q4: Converted to three sub-prompts (4a, 4b, 4c) with sentence starters and a yes/no check — _Structures the two required comparisons and makes the non-proportional pattern explicit; same data, same reasoning_
- Q5: Added inline definitions of GPE and KE, and three write-on lines — _Glosses the terms without removing the requirement to use them in an energy-transfer explanation; same reasoning demand_
- Q6: Split into 6a (yes/no) and 6b (explain using the pattern) — _Separates the judgment from the justification; both are still required_
- Q7: Split into 7a (predicted value) and 7b (method explanation) — _Makes the two-part requirement explicit; same prediction and reasoning_

## What we protected
- All four averages must still be computed and entered in the table (Q1).
- Graph must still be hand-sketched with labeled axes and all four points (Q2).
- Claim sentence, two doubling comparisons, energy-transfer reasoning, disagreement with the 'twice as fast' misconception, and a 50 cm prediction with method are all still required and in the same order.
- No worked examples, no answer-giving; scaffolds structure the response, they do not provide the content.
- CER format and all item numbers preserved.

## Check this
- Verify that the inline definitions of GPE and KE in Q5 are appropriate for your class and do not give away the reasoning you expect students to construct.
- Check that the three write-on lines in Q5 provide enough space for the energy explanation your students typically write.
- Confirm that splitting Q4 into a–c and Q6–7 into a–b does not make the assignment feel longer to your students, even though the thinking is unchanged.

## Teacher notes

The structure now guides students through the CER steps with labeled spaces and sub-prompts. Q4 breaks the doubling comparisons into fill-in-the-blank format so students focus on the pattern rather than sentence construction. Q5 defines the energy terms inline. Q6 and Q7 add yes/no or numeric prompts before the explanation to reduce the cold-start problem. All original thinking and evidence requirements remain. Time estimate: still 30 minutes; students write less prose but do the same reasoning.

## Reviewer notes (operator)

Arithmetic check: Q1 averages are (1.28+1.33+1.30)/3=1.30, (1.84+1.87+1.82)/3=1.84, (2.24+2.28+2.23)/3=2.25, (2.58+2.62+2.61)/3=2.60 — all correct to hundredths. The doubling pattern (10→20 gives ×1.42, 20→40 gives ×1.41) supports the required reasoning. Token count well within budget. All scaffolds are structural (chunking, sequencing, labeling spaces); none provide content or remove reasoning. The version fits the 30-minute window because the sub-prompts replace open-ended prose with shorter, guided responses—students do the same thinking in less writing time.

---

## NEW VERSION

# Ramp Height and Cart Speed — Data Analysis (CER)

**Grade 8 Physical Science · Energy Unit · 30 minutes**

A class released a cart from rest at four different heights on the same ramp and measured its speed at the bottom with a photogate. Each height was tested three times.

| Release height (cm) | Trial 1 speed (m/s) | Trial 2 speed (m/s) | Trial 3 speed (m/s) | Average speed (m/s) |
|---|---|---|---|---|
| 10 | 1.28 | 1.33 | 1.30 | |
| 20 | 1.84 | 1.87 | 1.82 | |
| 30 | 2.24 | 2.28 | 2.23 | |
| 40 | 2.58 | 2.62 | 2.61 | |

---

## Part 1 — Organize the data

**1. Calculate the average speed for each height.**

   - Add the three trial speeds for each row.
   - Divide by 3.
   - Round to the nearest hundredth (two decimal places).
   - Write each average in the last column of the table.

**2. Sketch a graph.**

   - Put release height (cm) on the x-axis (horizontal).
   - Put average speed (m/s) on the y-axis (vertical).
   - Label both axes with their units.
   - Plot the four points and connect them.

---

## Part 2 — Claim, Evidence, Reasoning

**3. Claim** — Write one sentence stating how the cart's speed at the bottom is related to its release height.

   Your claim:

   ___________________________________________________________________________

**4. Evidence** — Support your claim with specific numbers from the table.

   a. When the height doubles from 10 cm to 20 cm, the speed changes from _______ m/s to _______ m/s.

   b. When the height doubles from 20 cm to 40 cm, the speed changes from _______ m/s to _______ m/s.

   c. In both cases, does the speed also double? _______ (yes/no)

**5. Reasoning** — Explain *why* the relationship looks the way it does.

   Use these terms in your explanation:
   - **gravitational potential energy** (GPE) — energy the cart has because of its height
   - **kinetic energy** (KE) — energy of motion; depends on speed squared (speed × speed)

   Your explanation:

   ___________________________________________________________________________

   ___________________________________________________________________________

   ___________________________________________________________________________

---

## Part 3 — Apply

**6. Evaluate a claim.**

   A student says: *"If we release the cart from 80 cm, it will go twice as fast as from 40 cm."*

   a. Do you agree? _______ (yes/no)

   b. Use the pattern you found in question 4 to explain your answer:

   ___________________________________________________________________________

   ___________________________________________________________________________

**7. Predict the speed for 50 cm.**

   a. Predicted average speed for 50 cm: _______ m/s

   b. Explain how you made your prediction:

   ___________________________________________________________________________

   ___________________________________________________________________________

---

## ORIGINAL

# Ramp Height and Cart Speed — Data Analysis (CER)

**Grade 8 Physical Science · Energy Unit · 30 minutes**

A class released a cart from rest at four different heights on the same ramp and measured its speed at the bottom with a photogate. Each height was tested three times.

| Release height (cm) | Trial 1 speed (m/s) | Trial 2 speed (m/s) | Trial 3 speed (m/s) | Average speed (m/s) |
|---|---|---|---|---|
| 10 | 1.28 | 1.33 | 1.30 | |
| 20 | 1.84 | 1.87 | 1.82 | |
| 30 | 2.24 | 2.28 | 2.23 | |
| 40 | 2.58 | 2.62 | 2.61 | |

### Part 1 — Organize the data

1. Calculate the average speed for each height and fill in the last column. Round to the nearest hundredth.

2. Sketch a graph of average speed (y-axis) versus release height (x-axis). Label both axes with units.

### Part 2 — Claim, Evidence, Reasoning

3. **Claim.** Write one sentence stating how the cart's speed at the bottom is related to its release height.

4. **Evidence.** Support your claim with at least two specific numbers from the table. Say what happens to speed when the height doubles from 10 cm to 20 cm, and from 20 cm to 40 cm.

5. **Reasoning.** Explain *why* the relationship looks the way it does. Use the ideas of gravitational potential energy and kinetic energy in your explanation.

### Part 3 — Apply

6. A student says, "If we release the cart from 80 cm, it will go twice as fast as from 40 cm." Do you agree? Use the pattern in the data to explain.

7. Predict the average speed for a release height of 50 cm. Explain how you made your prediction.