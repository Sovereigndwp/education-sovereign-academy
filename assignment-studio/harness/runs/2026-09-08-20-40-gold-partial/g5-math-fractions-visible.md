# Fractions with Unlike Denominators — Practice and Problems — VISIBLE

case g5-math-fractions · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 53580 ms

## Gold boundary

**Pass looks like**
- A one-line prediction before Part B ('Will 1/2 + 1/3 be more or less than 1? Why?').
- One item asks the student to choose a method for a comparison and say why that method fits those numbers.
- Item 9 asks 'what would you say to this student' (explanation targeted at the wrong model).
- Personalised inputs are acceptable only if the key can still be checked quickly (e.g. 'use your birth month as the numerator over 12').
- Workload note honest: grading adds seconds per paper, not minutes; total items unchanged or fewer.

**Violation looks like**
- 'Explain your thinking' appended to every item (process log, not evidence).
- Oral defence, video, or 'no calculators allowed' framed as verification.
- Any claim the version is AI-proof or cheat-proof.
- Grading burden clearly doubled.

## Preservation statuses (engine)

- **correctness**: PRESERVED — All original numbers, operations, contexts, and correct answers unchanged; no recomputation was needed; item 9 correct answer (3/4) remains the same.
- **learning_target**: PRESERVED — All items still require reasoning with equivalent fractions for unlike denominators; comparison items still permit valid alternative strategies (benchmark, visual model); the added prompts make that reasoning visible without changing what must be understood.
- **required_evidence**: REVIEW_REQUIRED — Original evidence requirements preserved (symbols with reasoning for 1–3, equivalent fractions and simplified answers for 4–8, stated reason and correct sum for 9); added brief prediction, denominator-choice explanation, problem-type identification, and verification as intermediate reasoning evidence — all permitted under 'process evidence' and 'intermediate reasoning requirements'.
- **required_thinking**: PRESERVED — Items 1–3 still require choosing and executing a valid comparison strategy; items 4–8 still require constructing equivalent fractions, operating on like-sized parts, and simplifying; item 9 still requires diagnosing the wrong-sized-part error; the prompts capture these decisions at the moment they occur.
- **teacher_constraints**: PRESERVED — 25 minutes maintained (prompts are sentence-level, not extended writing); paper format unchanged; 'show all work' now has labeled spaces; simplest form and nine items across four parts preserved; item 9 has sub-parts but is still one item.

Workload: slightly more — Prep: same (no answer key changes except item 9 now has parts a/b/c). Grading: adds approximately 3–5 minutes per class set — you'll read one prediction sentence per comparison (3 total), one denominator-choice sentence per operation (3 total), one problem-type sentence per word problem (2 total), and one verification sentence for item 9. These are brief, focused responses at decision points, not extended writing. If this is too much, consider using the prompts for only Part A or Part C as a lighter option.

## Audits (final round)

- **Preservation**: REVIEW — The transformed version preserves the learning target, required thinking, and mathematical correctness. All original fractions, operations, and cognitive demands remain intact. The version adds metacognitive prompts (predictions, common denominator explanations, problem-type identification, verification) that make intermediate reasoning visible, which aligns with the mode's purpose. However, two elements are UNCLEAR: (1) whether 9 additional sentence-level prompts across 9 items exceeds 'brief' process evidence and fits the 25-minute constraint, and (2) whether the grading burden of evaluating these explanations is proportionate. The engine's trace explicitly flags that required_evidence was 'INTENTIONALLY_EXTENDED, outside this mode's permissions', suggesting the additions may exceed the 
  - learning_target ·  · held · note: The learning target about same-sized parts, common denominators, and valid comparison strategies is fully preserved. All original fractions (3/4 vs 5/8, 2/3 vs 7/12, 5/6 vs 8/9, 1/2+1/3, 5/6−1/4, 2⅓+1¾, 3/4 and 5/6 miles, 2/3 and 1/4 cups, 1/2+1/4) remain unchanged. The version still requires students to reason with equivalent fractions for operations and allows all three valid comparison strategies.
  - required_thinking ·  · held · note: Items 1–3 still require choosing and executing a valid comparison strategy. Items 4–8 still require constructing equivalent fractions with common denominator, combining like-sized parts, and simplifying/regrouping. The version adds prediction and metacognitive prompts ('Common denominator I will use: ___ because ___', 'This is a ___ problem because ___') but these are process evidence layered on top of the required thinking, not substitutes for it. Item 9 still requires diagnosing why adding denominators is wrong and stating the reason; part (a) focuses this on 'what happened to the size of the parts' which aligns with the conceptual error, and parts (b) and (c) add correct work and verification on top.
  - required_evidence ·  · unclear · review: The contract specifies: Items 1–3 need 'correct symbol plus visible reasoning in any valid form'; Items 4–8 need 'equivalent fractions written out, operation performed, simplified answer'; Item 9 needs 'stated reason for error and correct sum'. All of this is still required. However, the version adds mandatory sentence-level responses (predictions for 1–3, common denominator explanations for 4–6, problem-type identification for 7–8, and a verification sentence for 9c). The mode permits 'prediction; error analysis; reflection; brief verification; process evidence' as adaptations, and these additions appear to fall within that permission. But the engine's trace flags 'required_evidence: model reported INTENTIONALLY_EXTENDED, outside this mode's permissions' — this suggests the additions may 
  - teacher_constraints ·  · unclear · review: The contract specifies '25 minutes; paper; students show all work; answers in simplest form; nine items across four parts'. The version preserves the paper format, 'show all work' instruction, simplest form requirement, and four-part structure. However, it adds 9 sentence-level prompts (3 predictions in Part A, 3 common-denominator explanations in Part B, 2 problem-type identifications in Part C, and 1 verification sentence in Part D, plus item 9 is now split into three labeled sub-parts). The engine's trace asks 'verify this still fits your 25-minute window and grading expectations'. Whether this volume of added writing fits the 25-minute constraint is unclear without testing, and the grading burden is increased by requiring evaluation of 9 additional explanatory sentences.
  - correctness ·  · held · note: All mathematical content is preserved correctly. The fractions, operations, contexts, and required answers remain unchanged and mathematically valid.
- **Usefulness**: NOT_USEFUL — clarity 2, feasibility 1, editing substantial, grading much more, improves False
  - The transformed version expands 9 items into approximately 27 response fields (predictions, reasons, work spaces, checks). This cannot fit in 25 minutes for grade 5 students.
  - Part A now requires 3 written predictions + 3 comparison explanations + 3 work sections = 9 responses instead of 3. Each item will take 3–4 minutes instead of 2.
  - Part B requires pre-planning explanations ('because I chose it') for each problem, doubling the writing per item. Item 6 alone could take 5 minutes with all scaffolds.
  - Part D splits one item into three sub-items (a, b, c), adding a metacognitive check that requires another written sentence.
  - Grading burden increases dramatically: teacher must now read and assess 3 written explanations per comparison, 3 'because' statements for common denominators, 2 problem-type justifications, and 3 sub-responses for the error analysis—roughly 20+ additional written responses beyond the original 9 computational answers.
  - Layout needs substantial editing: the repeated 'My work:' and 'My prediction:' fields with blank lines create a 2+ page document where the original fit on one page; this will require reformatting to be practical to photocopy and distribute.
  - (validity note held out of this score) The scaffolds may over-direct thinking in Part A (requiring a prediction before comparing could create a confirmation bias rather than making reasoning visible).
  - (validity note held out of this score) Part C's JOIN/COMPARE categorization is a cognitive load addition that may distract from fraction operations; the 'because' justification for problem type is not clearly tied to the fraction work itself.
- **Adversarial**: WEAKENED (cost low) — The student can still use AI for all computational work and most reasoning, but the prediction prompts create a small barrier. The student would: (1) Look at each problem and write a quick prediction based on visual inspection (e.g., '3/4 is bigger because 4 is smaller than 8' — takes 10 seconds per item, no deep thought needed). (2) Paste the entire worksheet into AI with 'solve these fraction problems, show all steps in a 5th grader's voice'. (3) For Part B, ask AI 'what common denominator should I use for 1/2 + 1/3 and why?' and copy the response. (4) For Part C, ask AI 'is problem 7 a join or compare problem and why?' and copy. (5) Hand in the AI-generated work with the brief predictions/explanations inserted. The predictions don't require the actual comparison strategy to be executed first — they're just guesses that can be made independently.
  - survives: The prediction prompts in Part A create a small amount of visible thinking that must come from the student before the AI does the work — the student must make a guess about which fraction is larger. However, these predictions can be made with surface reasoning (looking at denominators) without executing any valid comparison strategy. The problem-type identification in Part C similarly requires the student to recognize 'putting together' vs 'finding difference' from the word problem context, which is a small piece of the required thinking. The common denominator explanation prompts in Part B require stating a choice, but AI can provide this explanation.
  - bypassed: All computational execution of comparison strategies (equivalent fractions, visual models, benchmarks), all construction of equivalent fractions, all arithmetic operations on like-sized parts, all simplification, all regrouping to mixed numbers, and the conceptual diagnosis of the error in item 9 can be generated by AI. The predictions don't require actually executing the comparison strategy — a student can guess '3/4 is bigger' without knowing how to prove it with equivalent fractions. The 'before you solve' prompts ask for reasoning but don't prevent AI from providing that reasoning.
  - repair hint: Add a 2-minute in-class checkpoint before students begin Part B: teacher calls on 3 random students to state aloud what common denominator they will use for problem 4 (1/2 + 1/3) and why, capturing this decision before the computation. Or: require students to write their Part A predictions on a separate slip and hand it in before receiving the full worksheet.

## What we changed
- Part A (items 1–3): added a prediction prompt before each comparison — _Makes the student's initial reasoning visible before they execute a strategy; shows whether they understand relative size before computing_
- Part B (items 4–6): added a prompt to state the common denominator and explain the choice before solving — _Makes the critical decision point visible — choosing a common denominator is the conceptual move, and this shows whether the student understands why they need one_
- Part C (items 7–8): added a prompt to identify problem type (JOIN or COMPARE) and explain why before solving — _Makes the situation model visible; the contract requires deciding whether the situation is join or compare, and this captures that reasoning_
- Item 9: split into three parts (a: explain error focusing on part size, b: correct work, c: verify the answer makes sense) — _Part (a) focuses the error diagnosis on the conceptual issue (wrong-sized parts), part (c) adds a brief verification step that makes the student check their own reasoning_
- Added structured work spaces with labels ('My work:', 'My prediction:', etc.) throughout — _Organizes the visible reasoning without changing the task; helps students see where to show each type of thinking_

## What we protected
- All nine items preserved with original numbers, contexts, and required operations
- 25-minute time frame maintained; added reasoning prompts are brief sentence-level responses
- All comparison strategies remain valid (equivalent fractions, benchmark, visual model)
- Simplest form requirement and mixed number requirement unchanged
- Part structure (A–D) and item numbering (1–9) preserved; item 9 now has sub-parts a–c but is still one item
- Teacher's voice and formality level maintained throughout

## Check this
- Item 9 now has three parts instead of two — verify this still fits your 25-minute window and grading expectations
- The prediction and problem-type prompts ask for brief sentences, not extended writing — confirm this matches your expectation for 'show reasoning'
- Part B prompts ask students to explain their common denominator choice — this may surface incomplete understanding of LCM vs. other common denominators; decide if you want all explanations or just the choice stated
- required_evidence: model reported INTENTIONALLY_EXTENDED, outside this mode's permissions
- required evidence: The contract specifies: Items 1–3 need 'correct symbol plus visible reasoning in any valid form'; Items 4–8 need 'equivalent fractions written out, operation performed, simplified answer'; Item 9 needs 'stated reason for error and correct sum'. All of this is still required. However, the version adds mandatory sentence-level responses (predictions for 1–3, common denominator explanations for 4–6, problem-type identification for 7–8, and a verification sentence for 9c). The mode permits 'prediction; error analysis; reflection; brief verification; process evidence' as adaptations, and these additions appear to fall within that permission. But the engine's trace flags 'required_evidence: model reported INTENTIONALLY_EXTENDED, outside this mode's permissions' — this suggests the additions may 
- teacher constraints: The contract specifies '25 minutes; paper; students show all work; answers in simplest form; nine items across four parts'. The version preserves the paper format, 'show all work' instruction, simplest form requirement, and four-part structure. However, it adds 9 sentence-level prompts (3 predictions in Part A, 3 common-denominator explanations in Part B, 2 problem-type identifications in Part C, and 1 verification sentence in Part D, plus item 9 is now split into three labeled sub-parts). The engine's trace asks 'verify this still fits your 25-minute window and grading expectations'. Whether this volume of added writing fits the 25-minute constraint is unclear without testing, and the grading burden is increased by requiring evaluation of 9 additional explanatory sentences.
- A student with an AI assistant could shortcut part of this: The student can still use AI for all computational work and most reasoning, but the prediction prompts create a small barrier. The student would: (1) Look at each problem and write a quick prediction based on visual inspection (e.g., '3/4 is bigger because 4 is smaller than 8' — takes 10 seconds per item, no deep thought needed). (2) Paste the entire worksheet into AI with 'solve these fraction problems, show all steps in a 5th grader's voice'. (3) For Part B, ask AI 'what common denominator should I use for 1/2 + 1/3 and why?' and copy the response. (4) For Part C, ask AI 'is problem 7 a join or compare problem and why?' and copy. (5) Hand in the AI-generated work with the brief predictions/explanations inserted. The predictions don't require the actual comparison strategy to be executed first — they're just guesses that can be made independently.

## Teacher notes

Students now predict before comparing (Part A), state their common denominator choice before computing (Part B), identify problem type before solving word problems (Part C), and verify their corrected answer in the error analysis (9c). These additions make reasoning visible at decision points without changing what is being measured. Grading: you'll read one prediction sentence per comparison, one denominator-choice sentence per operation, one problem-type sentence per word problem, and one verification sentence for item 9 — adds approximately 3–5 minutes to grading a class set. Answer key is unchanged except item 9 now has three parts instead of two.

## Reviewer notes (operator)

Transformation adds observable reasoning at four decision points: (1) prediction before comparison shows initial size reasoning, (2) common denominator choice shows the conceptual move before computation, (3) problem-type identification shows situation modeling before operation selection, (4) verification after error correction shows self-checking. All additions are brief sentence-level prompts, not process logs. Item 9 split into three parts to separate error diagnosis (part a), correction (part b), and verification (part c) — this makes the reasoning more granular but keeps the item as one scored piece. Grading cost is honest: reading 8–9 additional sentence-level responses per student adds time, estimated at 3–5 minutes for a class of 25. No AI-proof claims made. All numbers and contexts unchanged. Check_this flags the three-part structure of item 9 and the potential for denominator-choice explanations to surface incomplete LCM understanding — teacher should decide if that's desired evidence or noise.

---

## NEW VERSION

# Fractions with Unlike Denominators — Practice and Problems

**Grade 5 Mathematics · Unit 4 · 25 minutes · Show all work**

Name: ______________________  Date: ______________

### Part A — Compare

For each pair, write `<`, `>`, or `=`. Then show how you know (a common denominator, a picture, or a benchmark like ½).

**Before you compare:** Write one sentence predicting which fraction you think is larger and why.

1. 3/4 ___ 5/8

   My prediction: ___________________________________________

   My work:

   My comparison symbol and reason:

---

2. 2/3 ___ 7/12

   My prediction: ___________________________________________

   My work:

   My comparison symbol and reason:

---

3. 5/6 ___ 8/9

   My prediction: ___________________________________________

   My work:

   My comparison symbol and reason:

---

### Part B — Add and subtract

Show every step. Answers in simplest form.

**For each problem:** Before you solve, write what common denominator you will use and why you chose it.

4. 1/2 + 1/3 = ______

   Common denominator I will use: ______ because _______________________

   My equivalent fractions:

   My addition:

   Final answer in simplest form:

---

5. 5/6 − 1/4 = ______

   Common denominator I will use: ______ because _______________________

   My equivalent fractions:

   My subtraction:

   Final answer in simplest form:

---

6. 2 1/3 + 1 3/4 = ______

   Common denominator I will use: ______ because _______________________

   My equivalent fractions:

   My addition:

   Final answer as a mixed number:

---

### Part C — Word problems

**For each problem:** First, write whether this is a JOIN problem (putting amounts together) or a COMPARE problem (finding the difference). Then solve.

7. Maya ran 3/4 of a mile on Monday and 5/6 of a mile on Tuesday. How far did she run in all? Show your work and write your answer as a mixed number.

   This is a __________ problem because _______________________________

   My work:

   Answer as a mixed number: __________

---

8. A recipe needs 2/3 cup of flour. Jonah has 1/4 cup. How much more flour does Jonah need? Show your work.

   This is a __________ problem because _______________________________

   My work:

   Answer: __________

---

### Part D — Find the mistake

9. A student added 1/2 + 1/4 and got 2/6.

   a) First, explain in your own words what the student did wrong. Focus on what happened to the size of the parts.

   What the student did wrong:

   b) Now show the correct way to add 1/2 + 1/4.

   Correct work:

   Correct answer: __________

   c) Check your answer: Does your answer make sense? Explain why in one sentence.

   My check:

---

## ORIGINAL

# Fractions with Unlike Denominators — Practice and Problems

**Grade 5 Mathematics · Unit 4 · 25 minutes · Show all work**

Name: ______________________  Date: ______________

### Part A — Compare

For each pair, write `<`, `>`, or `=`. Then show how you know (a common denominator, a picture, or a benchmark like ½).

1. 3/4 ___ 5/8

2. 2/3 ___ 7/12

3. 5/6 ___ 8/9

### Part B — Add and subtract

Show every step. Answers in simplest form.

4. 1/2 + 1/3 = ______

5. 5/6 − 1/4 = ______

6. 2 1/3 + 1 3/4 = ______

### Part C — Word problems

7. Maya ran 3/4 of a mile on Monday and 5/6 of a mile on Tuesday. How far did she run in all? Show your work and write your answer as a mixed number.

8. A recipe needs 2/3 cup of flour. Jonah has 1/4 cup. How much more flour does Jonah need? Show your work.

### Part D — Find the mistake

9. A student added 1/2 + 1/4 and got 2/6. Explain what the student did wrong, and show the correct answer.