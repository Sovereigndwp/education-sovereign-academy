# Fractions with Unlike Denominators — Practice and Problems — ADVANCED

case g5-math-fractions · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 47179 ms

## Gold boundary

**Pass looks like**
- Fewer or equal items that demand generalization: e.g. 'Find two different common denominators for 5/6 and 8/9 and explain which is more efficient and why'; 'When is the product of the denominators NOT the least common denominator? Give a rule and a counterexample'.
- Error analysis extended to a diagnosis of the wrong model (why 2/6 looks right to a student) and a rule that prevents it.
- Word problem extended with an interacting condition (e.g. a third day, or 'how much farther on Tuesday than Monday, and is that more or less than half a mile?').
- Still grounded in adding/subtracting/comparing unlike denominators — no drift into multiplication of fractions.

**Violation looks like**
- Nine items become fourteen items of the same kind.
- Harder arithmetic only (bigger denominators) with no new reasoning.
- Introduces decimals, percent, or fraction multiplication as 'enrichment'.

## Preservation statuses (engine)

- **correctness**: PRESERVED — All original fractions, numbers, and mathematical relationships are unchanged (3/4 vs 5/8, 1/2 + 1/3, Maya's 3/4 and 5/6, Jonah's 2/3 and 1/4, the 1/2 + 1/4 error); extensions use these same values in dependent calculations that I verified (e.g., 3/4 + 5/6 = 19/12, so 2 − 19/12 = 5/12; 1/4 + 1/3 = 7/12, which is less than 2/3 = 8/12)
- **learning_target**: INTENTIONALLY_EXTENDED — Original target (parts must be same size; valid strategies must respect denominator meaning) is preserved and deepened by requiring students to demonstrate that multiple valid strategies converge and to justify their equivalence choices explicitly, still grounded in the same prerequisite knowledge of what denominators represent
- **required_evidence**: INTENTIONALLY_EXTENDED — Original evidence (visible reasoning, equivalent fractions written, simplified answers, stated error reason) is extended to include justifications of strategy choice, multi-step dependent work, and visual models, making reasoning more explicit without changing what is fundamentally being measured
- **required_thinking**: INTENTIONALLY_EXTENDED — Original thinking (choose and execute a strategy; construct common denominators; diagnose errors) is extended to include reconciling multiple strategies, justifying choices, and using results in dependent reasoning, all within the same conceptual domain
- **teacher_constraints**: ADAPTED_AS_PERMITTED — 25-minute time frame is maintained but will be tighter; paper format, show-all-work, simplest-form, and nine-item structure are preserved; grading time will increase 2–3 minutes per paper due to justifications and extended reasoning

Workload: more — Grading will take 2–3 additional minutes per paper due to evaluating justifications (why both strategies agree in Part A, why that common denominator in Part B), checking dependent calculations in word problems, and assessing visual models in 9c. Answer key preparation requires working out the extended steps (the second questions in 7 and 8, the visual model for 9c). The depth increase is intentional and tied to deeper evidence of the same learning target, but it is genuinely more work.

## Audits (final round)

- **Preservation**: REVIEW — The transformation preserves all core instructional elements—learning target concepts, required thinking processes, and evidence types—while extending cognitive demand through multiple strategies, justification requirements, and dependent reasoning. However, two concerns warrant review: (1) the 25-minute time constraint is uncertain given the substantial additions acknowledged by the engine itself, and (2) whether the workload increases constitute legitimate depth extensions or cross into disproportionate burden is unclear and requires Usefulness audit evaluation. No instructional validity failures detected; the extensions are conceptually coherent and mathematically sound.
  - learning_target ·  · held · note: The learning target's core concepts remain intact: Part A still requires valid comparison strategies respecting denominator meaning (now requiring two strategies deepens this understanding); Parts B and C still require common denominators for operations; Part D still addresses the misconception about adding denominators. The requirement that 'any valid strategy must respect that [the denominator names the size of the parts]' is reinforced by asking students to show why two different strategies agree.
  - required_thinking ·  · held · note: Items 1–3: Students must still 'choose a valid comparison strategy...execute it, and show the reasoning'—now extended to two strategies and explaining their consistency. Items 4–8: Still must 'construct equivalent fractions with a common denominator, then combine or compare' (extended with justification of denominator choice and additional dependent calculations). Item 9: Still must 'diagnose why adding denominators produces a wrong-sized part and state the reason' (extended to visual justification). The contract's 'word problems require deciding whether the situation is join or compare before operating' is preserved in items 7–8, with additional questions building on those operations.
  - required_evidence ·  · held · note: Items 1–3: Still require 'the correct symbol plus visible reasoning in any valid form'—now mandating two forms and an explanation. Items 4–8: Still require 'the equivalent fractions written out, the operation performed on like-sized parts, and a simplified answer' (items 6 and 7 still require mixed numbers)—plus justification sentences and additional calculations. Item 9: Still requires 'a stated reason for the error and the correct sum'—extended to include visual model. All original evidence requirements remain; additional evidence is layered on top.
  - teacher_constraints ·  · unclear · review: The 25-minute constraint is stated as preserved, but the transformation adds: (1) a second strategy plus explanation for three comparison items, (2) justification sentences for three operation items, (3) two-part extensions to two word problems, and (4) a three-part structure with visual model requirement for the error analysis. The engine's own trace acknowledges timing concerns: 'students may need 1–2 extra minutes per comparison' and 'Confirm that the extended word problems...still fit the 25-minute window.' The paper format and nine-item structure are maintained, but whether the substantially increased cognitive and production demands fit within 25 minutes is uncertain without empirical testing.
  - correctness ·  · held · note: All original fractions, operations, and contexts preserved exactly: 3/4 vs 5/8, 2/3 vs 7/12, 5/6 vs 8/9, 1/2 + 1/3, 5/6 − 1/4, 2 1/3 + 1 3/4, Maya's 3/4 and 5/6 miles, Jonah's 2/3 cup need and 1/4 cup available, the 1/2 + 1/4 = 2/6 error. New calculations (Maya's remaining distance to 2 miles, Jonah's 1/4 + 1/3 sufficiency check) are mathematically sound extensions of the original problems.
  - must_not · increase workload without increasing depth · unclear · review: The transformation adds substantial workload: Part A requires two strategies per item instead of one, plus explanations of consistency (approximately doubling work per item); Part B adds justification sentences; Part C adds dependent second questions to both word problems; Part D splits into three sub-parts with a visual model requirement. The question is whether this workload increase constitutes depth increase or mere quantity increase. The two-strategy requirement and consistency explanation in Part A arguably deepen understanding of why valid strategies must agree. The common-denominator justifications in Part B make implicit reasoning explicit. The dependent questions in Part C require using prior results in new reasoning. The visual model in Part D adds representational reasoning. Ho
- **Usefulness**: NOT_USEFUL — clarity 2, feasibility 1, editing substantial, grading much more, improves False
  - Part A now requires TWO strategies per item plus an explanation of why both match — triples the work for 3 items in a 25-minute assignment that already has 9 items total.
  - Part B adds a sentence justification per problem (3 items) explaining denominator choice — reasonable addition but adds grading time.
  - Part C item 7 now has a two-part question (original distance + additional calculation for 2-mile goal); item 8 becomes two-part (original need + whether 1/3 more is enough). This changes 2 word problems into 4 sub-problems.
  - Part D item 9 expands from 2 tasks (explain mistake, show correct answer) to 3 tasks (explain mistake AND why method fails, show correct answer, create visual model).
  - Grading burden: Part A requires reading/checking 6 strategies + 3 explanations instead of 3 strategies; Part C requires 4 full solutions instead of 2; Part D requires checking a visual model. Per student, this is roughly double the reading and checking.
  - Feasibility: Original had 9 items across 4 parts for 25 minutes (≈2.8 min/item). Transformed version has effectively 3 items requiring 2 strategies each (6 strategy demonstrations) + 3 explanations in Part A, 3 items + 3 justifications in Part B, 4 sub-problems in Part C, 3 tasks in Part D = far more than 25 minutes allows.
- **Adversarial**: UNDERMINED (cost low) — The student photographs the worksheet, pastes it to an AI assistant, and asks: 'Solve this Grade 5 fractions worksheet. For Part A, show two different strategies for each comparison. For Part B, explain why you chose each common denominator. For Part C, solve both questions in each problem. For Part D, explain the error, give the correct answer, and describe a visual model.' The AI generates all work including the two strategies per comparison, the justification sentences, the extended calculations, the error explanation, and the visual model description. The student copies everything onto the paper.
  - survives: The requirement for two different strategies in Part A creates moderate friction—the student must copy two complete solution paths per item rather than one, and the AI must generate both, which takes slightly more effort to transcribe. The extended word problems (7 and 8) require copying additional calculations. The three-part structure of item 9 requires copying more text. However, all of this is still copying work the AI fully generates.
  - bypassed: All required thinking: choosing comparison strategies, executing them, deciding on common denominators, justifying those choices, determining operation types in word problems, performing calculations, diagnosing the error, and creating conceptual explanations. The AI generates complete reasoning for both strategies, writes the justification sentences, solves the extended problems, and describes the visual model. The student transcribes without thinking.
  - repair hint: Before students begin Part A, have each student write down (on the worksheet or a separate commitment slip collected immediately) which two strategies they will use for item 1. In class or in a brief conference, ask 2-3 students to state aloud their chosen strategies and why they picked those two. This commits students to a choice before calculation and creates a checkpoint that would expose a student who hasn't yet thought about strategy selection.

## What we changed
- Part A items 1–3 — _Required two different comparison strategies and an explanation of why both agree, deepening understanding that valid strategies must be consistent and that the denominator's role is invariant across methods_
- Part B items 4–6 — _Added requirement to justify the choice of common denominator in one sentence, making the equivalence reasoning explicit rather than mechanical_
- Item 7 (Maya problem) — _Added a second question dependent on the first answer (how much more to reach 2 miles), requiring students to use their sum in further fraction reasoning and subtraction_
- Item 8 (Jonah problem) — _Added a second question (does 1/4 + 1/3 meet the 2/3 requirement), requiring comparison of a computed sum to a target and justification of sufficiency_
- Item 9 (error analysis) — _Split into three parts: (a) explain the error and why the method fails, (b) correct answer, (c) visual model showing why 1/2 + 1/4 ≠ 2/6, deepening from procedural correction to conceptual justification with multiple representations_

## What we protected
- All nine original items retained; no items removed or replaced with unrelated content
- All original numbers, fractions, and contexts (Maya running, Jonah's flour, the 1/2 + 1/4 error) preserved exactly
- 25-minute time frame and paper-based format maintained; extensions are deeper reasoning on same content, not additional separate problems
- Requirement to show all work and simplify answers unchanged
- Four-part structure (A/B/C/D) and item numbering (1–9) preserved

## Check this
- Verify that requiring two strategies in Part A is feasible in the time frame—students may need 1–2 extra minutes per comparison
- Confirm that the extended word problems (7 and 8) still fit the 25-minute window; the second questions are short but require additional computation
- Check that the visual model requirement in 9c is appropriate for your students' drawing speed and prior experience with fraction models
- Review whether the justification sentences in Part B (why that common denominator) align with what you've taught about LCM vs. product of denominators
- teacher constraints: The 25-minute constraint is stated as preserved, but the transformation adds: (1) a second strategy plus explanation for three comparison items, (2) justification sentences for three operation items, (3) two-part extensions to two word problems, and (4) a three-part structure with visual model requirement for the error analysis. The engine's own trace acknowledges timing concerns: 'students may need 1–2 extra minutes per comparison' and 'Confirm that the extended word problems...still fit the 25-minute window.' The paper format and nine-item structure are maintained, but whether the substantially increased cognitive and production demands fit within 25 minutes is uncertain without empirical testing.
- increase workload without increasing depth: The transformation adds substantial workload: Part A requires two strategies per item instead of one, plus explanations of consistency (approximately doubling work per item); Part B adds justification sentences; Part C adds dependent second questions to both word problems; Part D splits into three sub-parts with a visual model requirement. The question is whether this workload increase constitutes depth increase or mere quantity increase. The two-strategy requirement and consistency explanation in Part A arguably deepen understanding of why valid strategies must agree. The common-denominator justifications in Part B make implicit reasoning explicit. The dependent questions in Part C require using prior results in new reasoning. The visual model in Part D adds representational reasoning. Ho

## Teacher notes

This version deepens reasoning rather than adding volume. Part A now requires students to verify their comparison using two strategies and reconcile them—this surfaces whether they understand that different valid strategies must agree. Part B asks students to justify their choice of common denominator (e.g., "I used 6 because it's the LCM" vs. "I used 12 because I multiplied the denominators"), making the equivalence reasoning explicit. Parts C problems add a second step that depends on the first answer, requiring students to use their result in further reasoning. Part D adds a visual model requirement to the error analysis, pushing beyond procedural correction to conceptual explanation. Grading: Expect 2–3 more minutes per paper for the justifications and extended problems; answer key will need the additional steps worked out.

## Reviewer notes (operator)

All extensions are traceable to the original learning target: multiple strategies and their reconciliation test whether students understand that the denominator's meaning is invariant; justifying common denominator choice surfaces the equivalence reasoning; dependent questions in word problems require using fraction operations in multi-step reasoning within the same domain; visual model in error analysis connects procedural and conceptual understanding. No new content introduced. Time frame is maintained but will be tight for some students—teacher should monitor. All original numbers verified in extended calculations.

---

## NEW VERSION

# Fractions with Unlike Denominators — Practice and Problems

**Grade 5 Mathematics · Unit 4 · 25 minutes · Show all work**

Name: ______________________  Date: ______________

### Part A — Compare and justify

For each pair, write `<`, `>`, or `=`. Then show how you know using **two different strategies** (choose from: common denominator, picture, or benchmark like ½). Explain why both strategies give you the same answer.

1. 3/4 ___ 5/8

2. 2/3 ___ 7/12

3. 5/6 ___ 8/9

### Part B — Add and subtract with reasoning

Show every step. Answers in simplest form. For each problem, explain in one sentence why you chose that particular common denominator.

4. 1/2 + 1/3 = ______

5. 5/6 − 1/4 = ______

6. 2 1/3 + 1 3/4 = ______

### Part C — Word problems with analysis

7. Maya ran 3/4 of a mile on Monday and 5/6 of a mile on Tuesday. How far did she run in all? Show your work and write your answer as a mixed number. Then: If Maya wants to run exactly 2 miles total by the end of the week, how much more does she need to run? Show your reasoning.

8. A recipe needs 2/3 cup of flour. Jonah has 1/4 cup. How much more flour does Jonah need? Show your work. Then: Jonah finds another 1/3 cup in a second container. Does he now have enough flour for the recipe? Justify your answer with calculations.

### Part D — Find and explain the mistake

9. A student added 1/2 + 1/4 and got 2/6. 
   
   a) Explain what the student did wrong and why that method doesn't work for fractions.
   
   b) Show the correct answer.
   
   c) Create a visual model (picture) that shows why 1/2 + 1/4 cannot equal 2/6.

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