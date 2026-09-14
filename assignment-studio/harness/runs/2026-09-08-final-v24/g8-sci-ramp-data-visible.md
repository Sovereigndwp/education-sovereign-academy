# Ramp Height and Cart Speed — Data Analysis (CER) — VISIBLE

case g8-sci-ramp-data · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 53062 ms

## Gold boundary

**Pass looks like**
- Prediction before computing: 'Before you average anything, predict: if height doubles, does speed double? Circle yes/no.' Then item 6 asks the student to compare with their prediction.
- Item 7 requires showing the method (ratio, curve extension, or √ rule) — the method is what is graded, the number is checked; the student should note that 50 cm is outside the measured range.
- A two-line verification: 'Check your 50 cm prediction against the 40 cm and 30 cm values — does it sit where the curve says it should?'
- Personalised input acceptable: each student is assigned one 'mystery height' (45, 55, 60 cm) from a list with a teacher key.

**Violation looks like**
- A lab-notebook style log of every step.
- 'Do this in class with no devices' as the verification mechanism.
- Any AI-proof claim.
- Grading burden doubled (e.g. a full explanation for every one of 12 averages).

## Preservation statuses (engine)

- **correctness**: PRESERVED — No numbers, data, or claims changed; all trial speeds, heights, and required comparisons (10→20, 20→40) identical to original; factor calculations (≈1.4) are derivable from the given data
- **learning_target**: PRESERVED — Students still compute averages, graph, identify the non-linear pattern (now quantified as ×1.4), construct a claim, explain with GPE→KE and speed-squared, evaluate the proportional misconception, and extrapolate to 50 cm
- **required_evidence**: ADAPTED_AS_PERMITTED — Same evidence collected (correct averages, labelled graph, claim, two doublings with ×1.4 pattern, GPE→KE reasoning, disagreement with 'twice as fast', 50 cm prediction with method) but now includes the calculated multiplier and stated method, making the reasoning more verifiable
- **required_thinking**: PRESERVED — All original cognitive moves remain; the additions (predict proportionality, calculate the factor, name the energy types, state prediction before justifying, disclose method) make those moves observable without replacing them
- **teacher_constraints**: PRESERVED — Five additions total roughly 5–7 minutes (one prediction sentence, two short division calculations, one sentence completion, one circle-and-show); fits within 30 minutes for grade 8 students who can compute averages and sketch graphs in the original timeframe

Workload: slightly more — Prep unchanged (same handout). Grading adds about 2 minutes per student: checking two division calculations in Q4 (1.84÷1.30, 2.60÷1.84) and verifying that the stated method in Q7 matches the prediction. The sentence completion in Q5 is quick to scan. Total grading time per student increases from roughly 8 minutes to roughly 10 minutes for a 30-student class (from ~4 hours to ~5 hours).

## Audits (final round)

- **Preservation**: PASS — PASS. All contract elements held. The transformation adds five scaffolds that make intermediate reasoning visible (proportional prediction, explicit factor calculation, energy-transfer sentence completion, prediction-then-explain structure, method disclosure) without removing or supplying any required thinking or evidence. The factor calculation in Q4 operationalizes the 'compare ratios' requirement already in the contract. The sentence completion in Q5 scaffolds vocabulary for the GPE→KE explanation but the reasoning paragraph explaining the non-linear relationship is still required. Time addition (5–7 min per engine estimate) is reasonable. No must-not rules violated: scaffolds structure the path, they do not walk it; no assessed reasoning given away; no recall substituted for analysis.
  - learning_target ·  · held · note: The target requires students to identify the non-linear pattern (speed grows with square root of height, not proportionally) and explain it with energy transfer. The transformed version still requires this: Q4 still asks for the two doublings comparison, Q5 still requires the GPE→KE explanation paragraph, and the added factor calculations (÷ operations) make the ×1.4 pattern more visible without supplying it. The sentence completion 'When the cart is higher up, it has more ___ energy, which gets transferred to ___ energy' scaffolds vocabulary but the student must still construct the full reasoning paragraph explaining why the relationship is non-linear.
  - required_thinking ·  · held · note: All required thinking remains: compute averages (Q1), graph (Q2), identify non-linear pattern by comparing ratios (Q4 with added factor calculation), construct claim (Q3), explain with energy model (Q5), evaluate the proportional misconception (Q6), extrapolate prediction with stated method (Q7 with added method disclosure). The additions (proportional prediction before graphing, explicit factor calculation, sentence completion, prediction-then-explain structure, method circle-and-show) make intermediate reasoning visible but do not remove any required cognitive work. The factor calculation in Q4 is the ratio comparison the contract requires, now made explicit rather than implicit in 'say what happens'.
  - required_evidence ·  · held · note: All required evidence is still demanded: correct averages (Q1), labelled graph (Q2), claim sentence (Q3), two quoted data comparisons including the two doublings (Q4 explicitly names '10 cm to 20 cm, and from 20 cm to 40 cm'), GPE→KE reasoning naming the speed-squared relationship (Q5 paragraph still required after sentence completion), explicit disagreement with 'twice as fast' backed by the ×1.4 pattern (Q6), prediction near 2.9 m/s for 50 cm with stated method (Q7). The added scaffolds (factor calculation boxes, sentence completion, method disclosure) structure how evidence is presented but do not remove any element from the evidence list.
  - teacher_constraints ·  · held · note: 30-minute constraint: the engine estimates 5–7 minutes added for one prediction sentence, two division calculations, one sentence completion, one circle-and-show. This is within reasonable adaptation. Paper format unchanged. Graph remains hand-sketched (Q2 unchanged). CER format in Part 2 preserved: Q3 Claim, Q4 Evidence, Q5 Reasoning structure intact; the sentence completion in Q5 precedes the reasoning paragraph but does not replace it ('Complete this sentence first, then use the idea in your reasoning paragraph').
  - correctness ·  · held · note: Data table unchanged. Averages: 10cm→1.30, 20cm→1.84, 30cm→2.25, 40cm→2.60 (original values preserved). Factor calculations: 1.84÷1.30≈1.42, 2.60÷1.84≈1.41, consistent with the ×1.4 pattern the contract requires. The proportional prediction prompt before Q2 asks what speed at 20cm would be if proportional (2×1.30=2.60), which is incorrect and intentionally so—it reveals the misconception before the graph corrects it. This is pedagogically sound, not a correctness error. Prediction for 50cm should be near 2.9 m/s per contract; no answer supplied in transformed version.
- **Usefulness** (blind): USEFUL — clarity 2, feasibility 2, editing minor, grading slightly more, improves True
  - Question 1 'Before you graph' prompt asks students to predict speed at 20 cm, but they already have that data in the table (trials given). This needs rewording to ask about a height NOT in the table, or clarify it's about proportional thinking before looking at actual data.
  - Question 5 sentence completion is clear and useful, but the blank lines after 'My explanation using the pattern:' and 'How I got it:' in questions 6-7 need to specify approximate space (e.g., '3-4 lines') so students know how much to write.
  - The added scaffolds (calculations in #4, sentence starter in #5, prediction structure in #6-7) are cleanly formatted and fit the 30-minute window, though grading will require checking the intermediate steps in addition to final answers.
  - All directions are workable as written except the #1 prediction issue; a teacher could hand this out with one quick edit to that prompt.
  - (validity note held out of this score) The 'Before you graph' prediction in #1 might give away that the relationship is NOT proportional before students discover it themselves, potentially reducing the cognitive demand of recognizing the pattern.
  - (validity note held out of this score) The sentence completion in #5 directly provides the energy transformation language (gravitational potential → kinetic) that students should be constructing themselves in a reasoning paragraph.
  - (validity note held out of this score) Question 6's 'First, predict what you think will happen' structure may be asking students to predict twice (once as agree/disagree, then explain), which could be redundant rather than making thinking visible.
- **Adversarial**: WEAKENED (cost low, independent check True) — The student photographs the table, pastes it into an AI chat with the prompt: 'I'm a 13-year-old doing a science assignment. Calculate the averages, tell me what to write for the proportional prediction, do the factor calculations, complete the energy sentence, write the claim/evidence/reasoning in simple language, answer the agree/disagree question, and predict the 50 cm speed. Here's the data: [paste].' The AI returns all numerical answers and all written responses. The student copies everything onto the paper, sketches a quick graph by plotting the AI-provided averages, and hands it in. Total time: 10 minutes.
  - survives: The proportional-prediction prompt in Q1 ('Before you graph') creates a small obstacle: the student must calculate the 10 cm average (1.30) before asking what a proportional 20 cm would be, or must ask the AI to do both steps. The factor calculations in Q4 require the student to transcribe four numbers into division blanks, which takes a few seconds but does not require understanding the pattern. The method-disclosure in Q7 (circle one approach) makes the student claim a strategy, but the AI can tell them which to circle. The sentence completion in Q5 is trivially answered by the AI ('gravitational potential' and 'kinetic'). None of these additions force the student to identify the non-linear pattern themselves, construct the energy explanation themselves, or reason about the misconception
  - bypassed: All core thinking is bypassed: recognizing that the relationship is non-proportional (the AI identifies it); computing and interpreting the ×1.4 factor (the AI computes it and explains what it means); constructing the GPE→KE explanation (the AI writes it); evaluating the proportional misconception using the pattern (the AI writes the disagreement and justification); extrapolating the 50 cm prediction (the AI does it and names the method). The student never has to look at the numbers and think 'this isn't doubling,' never has to connect energy transfer to the square-root relationship, never has to apply the pattern to a new case. The additions make the student write down MORE, but they do not make the student THINK more—the AI can fill every new blank as easily as the old ones.
  - repair hint: Add a 2-minute live check at the start of Part 2: the teacher circulates and asks each student to point to their two factor calculations and say in one sentence what the pattern is (e.g., 'about 1.4 times each doubling' or 'not proportional'). This would expose hollow answers on the core non-linear pattern before the rest of the CER is written. Alternatively, require the proportional prediction and the two factor calculations to be shown to the teacher or a partner before proceeding to Q3–7.

## What we changed
- Added a proportional-prediction prompt before Q2 (graph) — _Makes the student's initial mental model visible before they see the non-linear pattern in the graph; reveals whether they expect proportionality_
- Added explicit factor calculation to Q4 (Evidence) — _Converts 'say what happens' into a calculation that shows whether the student can compute the ×1.4 multiplier; makes the non-proportional pattern quantitatively visible_
- Added energy-transfer sentence completion to Q5 (Reasoning) — _Scaffolds the GPE→KE explanation by making the student name both energy types before writing the paragraph; shows whether they can identify the transfer direction_
- Added prediction-then-explain structure to Q6 — _Makes the student commit to agree/disagree before justifying, revealing their reasoning path; separates the claim from the evidence_
- Added method-disclosure prompt to Q7 (prediction) — _Makes the extrapolation strategy visible (graph-based, numerical pattern, other); shows how they approached the prediction, not just the answer_

## What we protected
- All seven original questions remain in sequence with original numbering
- CER structure in Part 2 unchanged; sentence completion in Q5 supports the paragraph, does not replace it
- Required data comparisons (10→20, 20→40) still explicitly requested in Q4
- Graph remains hand-sketched; no technology added
- 30-minute constraint: five small additions (one prediction sentence, two division calculations, one sentence completion, one circle-and-show) add roughly 5–7 minutes total across the assignment

## Check this
- Verify that the factor calculations in Q4 (1.84÷1.30 ≈ 1.42; 2.60÷1.84 ≈ 1.41) align with your answer key and that 'about 1.4' is the pattern you want students to see
- Confirm that the sentence completion in Q5 does not over-scaffold the reasoning paragraph for your class; if students can write the transfer explanation cold, you may remove it
- Check that the added calculation and method-disclosure steps fit your grading workflow; they add specificity but require checking arithmetic
- A student with an AI assistant could shortcut part of this: The student photographs the table, pastes it into an AI chat with the prompt: 'I'm a 13-year-old doing a science assignment. Calculate the averages, tell me what to write for the proportional prediction, do the factor calculations, complete the energy sentence, write the claim/evidence/reasoning in simple language, answer the agree/disagree question, and predict the 50 cm speed. Here's the data: [paste].' The AI returns all numerical answers and all written responses. The student copies everything onto the paper, sketches a quick graph by plotting the AI-provided averages, and hands it in. Total time: 10 minutes.

## Teacher notes

Students now make a proportional prediction before graphing (Q1), calculate the ×1.4 multiplier explicitly (Q4), complete an energy-transfer sentence stem (Q5), and state their prediction before explaining it (Q6). These additions make their reasoning visible at key moments without changing what you're measuring. The calculation in Q4 produces the same evidence you were looking for ('at least two quoted data comparisons including the two doublings') but now you can see whether they know how to compute the factor. Total additions: one prediction, two short calculations, one sentence completion, one circle-and-show. Grading cost is slightly higher (about 2 minutes per student) because of the calculation check in Q4.

## Reviewer notes (operator)

Arithmetic check: averages are (1.28+1.33+1.30)/3=1.30, (1.84+1.87+1.82)/3=1.84, (2.24+2.28+2.23)/3=2.25, (2.58+2.62+2.61)/3=2.60 (all rounded to nearest hundredth). Factor calculations: 1.84÷1.30≈1.415, 2.60÷1.84≈1.413, both round to ×1.4. The proportional prediction before graphing (Q1 addition) should yield 2.60 m/s if students double 1.30; the actual average is 1.84, making the non-proportionality visible. The method-disclosure in Q7 (graph / numbers / other) captures whether students extrapolate visually or numerically without prescribing one. All additions are substitutions or augmentations of steps students already perform (they already compare the doublings in Q4; now they calculate the factor; they already explain in Q5; now they complete a sentence first; they already predict in Q7; now they name their method). Token count well within budget. No new content generated; all changes are structural scaffolds for existing reasoning.

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

### Part 1 — Organize the data

1. Calculate the average speed for each height and fill in the last column. Round to the nearest hundredth.

   **Before you graph:** Look at the average speeds you calculated. If the relationship were perfectly proportional (height doubles → speed doubles), what would you expect the speed at 20 cm to be? Write your prediction here: _______

2. Sketch a graph of average speed (y-axis) versus release height (x-axis). Label both axes with units.

### Part 2 — Claim, Evidence, Reasoning

3. **Claim.** Write one sentence stating how the cart's speed at the bottom is related to its release height.

4. **Evidence.** Support your claim with at least two specific numbers from the table. Say what happens to speed when the height doubles from 10 cm to 20 cm, and from 20 cm to 40 cm.

   **Then calculate:** By what factor does the speed actually increase in each doubling? (Divide the larger speed by the smaller speed.) Show your division:
   
   - 10 cm → 20 cm: _______ ÷ _______ = _______
   - 20 cm → 40 cm: _______ ÷ _______ = _______

5. **Reasoning.** Explain *why* the relationship looks the way it does. Use the ideas of gravitational potential energy and kinetic energy in your explanation.

   **To help you explain:** Complete this sentence first, then use the idea in your reasoning paragraph:
   
   "When the cart is higher up, it has more _____________ energy, which gets transferred to _____________ energy as it rolls down."

### Part 3 — Apply

6. A student says, "If we release the cart from 80 cm, it will go twice as fast as from 40 cm." Do you agree? Use the pattern in the data to explain.

   **First, predict what you think will happen, then explain:**
   
   My prediction (agree / disagree): _______
   
   My explanation using the pattern:

7. Predict the average speed for a release height of 50 cm. Explain how you made your prediction.

   **Show your method:**
   
   - I used this approach: (circle one)   **pattern from the graph**   /   **pattern in the numbers**   /   **other**
   
   - My prediction: _______
   
   - How I got it:

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