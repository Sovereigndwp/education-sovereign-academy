# Fractions with Unlike Denominators — Practice and Problems — SUPPORT

case g5-math-fractions · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 41148 ms

## Gold boundary

**Pass looks like**
- Directions chunked per part; a labelled work box or grid per item; vocabulary ('denominator', 'equivalent', 'simplest form') glossed without instructions that solve items.
- A worked example, if added, uses fractions NOT in the set (e.g. 1/3 + 1/5), and does not demonstrate regrouping on the exact structure of item 6 in a way that reduces it to copying.
- Word problems keep both the join/compare decision and the mixed-number regrouping; language may be plainer.
- Items 1–3 still let the student choose and carry out any valid comparison strategy (equivalent fractions, benchmark, or picture) and show it; items 4–8 still require the student to construct the common denominator themselves.

**Violation looks like**
- Common denominators pre-filled for items 4–8 ('rewrite both as twelfths'), or items 1–3 forced into a single method (e.g. 'find a common denominator' as the only allowed route).
- Item 9 turned into multiple choice or the error named in the prompt.
- Regrouping removed from 6/7 (e.g. numbers changed so no regrouping is needed).
- Any numbers changed without recomputing the key; key errors.

## Preservation statuses (engine)

- **correctness**: PRESERVED — All fractions, operations, and word problem scenarios are unchanged; no mathematical content was altered.
- **learning_target**: PRESERVED — All items still require reasoning with equivalent fractions (common denominators for operations, any valid strategy for comparisons) and respect that the denominator names part size.
- **required_evidence**: ADAPTED_AS_PERMITTED — Same evidence required (symbols with reasoning, equivalent fractions written out, operations shown, simplified answers, stated reason for error); labeled spaces and step prompts organize where evidence goes but do not reduce what must be shown.
- **required_thinking**: PRESERVED — Items 1–3 still require choosing and executing a valid comparison strategy; items 4–8 still require constructing equivalent fractions, operating on like parts, and simplifying/regrouping; item 9 still requires diagnosing the error and stating the reason.
- **teacher_constraints**: PRESERVED — 25 minutes, paper, show all work, simplest form, nine items across four parts all unchanged; visual spacing may affect page count but not completion time.

Workload: same — Grading is identical (same nine items, same evidence to check). No prep beyond printing. The labeled spaces may make student work slightly easier to scan, but the number of things to check per item is unchanged.

## Audits (final round)

- **Preservation**: PASS — PASS. All five contract elements held. The transformed version adds visual structure (boxes, labeled spaces, horizontal rules), names procedural steps, and lists valid strategies explicitly—all within MAY ADAPT permissions for visual organization, scaffolds, and directions. Critically, no thinking is removed or supplied: students must still choose comparison strategies, find common denominators, perform operations, interpret word problems, and diagnose errors. The step prompts in Part B structure the procedure without executing it; the strategy list in Part A reminds without prescribing; the 'What I need to find' prompt in Part C scaffolds comprehension without deciding the operation. Every element of required thinking and required evidence remains demanded of the student.
  - learning_target ·  · held · note: The learning target about requiring same-sized parts and valid comparison strategies is fully preserved. Part A still requires students to choose and execute a valid strategy (equivalent fractions, benchmark, or visual model). Part B still requires reasoning with equivalent fractions to create common denominators. The bulleted list in Part A names the three valid strategies but does not teach them, prescribe which to use, or execute any of them—students must still choose and apply.
  - required_thinking ·  · held · note: Items 1–3: Students must still choose a strategy, execute it, and show reasoning—the 'My thinking:' label is a space marker, not a hint. Items 4–8: Students must still construct equivalent fractions (Step 1 prompt does not provide the common denominator), combine like parts (Step 2 does not perform the operation), and simplify (Step 3 does not execute simplification). Word problems: 'What I need to find:' prompts comprehension but does not decide join vs. compare—students must still interpret the situation. Item 9: Split into 9a and 9b clarifies the two-part requirement but students must still diagnose why adding denominators is wrong and produce the correct sum.
  - required_evidence ·  · held · note: Items 1–3: Correct symbol plus visible reasoning in any valid form still required—the box and 'My thinking:' space structure where evidence goes but do not reduce what must be shown. Items 4–8: Equivalent fractions written out, operation performed, simplified answer still required—step labels name the sequence but students must produce all three pieces. Item 9: Stated reason for error and correct sum both still required—9a and 9b make the two parts explicit without removing either.
  - teacher_constraints ·  · held · note: 25 minutes preserved in header. Paper format preserved. 'Show all work' preserved in header and reinforced by step prompts. 'Answers in simplest form' preserved in Part B and C directions. Nine items across four parts unchanged (items 1–3 in Part A, 4–6 in Part B, 7–8 in Part C, 9 in Part D). The engine's trace notes a check about fitting on paper format, which is appropriate caution but not a violation.
  - correctness ·  · held · note: All mathematical content unchanged: same fractions (3/4 vs 5/8, 2/3 vs 7/12, 5/6 vs 8/9, 1/2 + 1/3, 5/6 − 1/4, 2 1/3 + 1 3/4), same word problem scenarios (Maya's running distances 3/4 and 5/6, recipe needing 2/3 with 1/4 available), same error analysis (1/2 + 1/4 incorrectly computed as 2/6). No numbers altered, no operations changed.
- **Usefulness**: NOT_USEFUL — clarity 2, feasibility 1, editing substantial, grading same, improves False
  - The transformed version is 63 lines vs. original's 33 lines — nearly double the length for the same nine items in the same 25 minutes.
  - Each item now has 3–4 labeled boxes/sections to write in, creating substantial white space that will not fit on standard paper without shrinking font or going multi-page.
  - Part B items 4–6 each have three labeled steps ('Step 1 — Common denominator:', 'Step 2 — Add:', 'Step 3 — Simplify:') that fragment the work space; students must now write in three separate boxes per problem instead of one continuous work area.
  - Part C items 7–8 each have three labeled sections ('What I need to find:', 'My work:', 'Answer:') where the original had open space; this adds layout complexity without practical benefit for 25 minutes.
  - Item 9 is now split into 9a and 9b with separate prompts, requiring layout adjustment and potentially confusing the single-item count ('nine items').
  - To use this tomorrow, teacher must: reformat to fit on paper, remove or condense the step labels in Parts B and C to restore workable space, and verify the page count.
  - (validity note held out of this score) Part B 'Steps to follow' box tells students exactly what procedure to use ('Find equivalent fractions with a common denominator, Add or subtract the numerators, Simplify'), removing strategic choice about method.
  - (validity note held out of this score) Part A 'You can show your thinking in any of these ways' lists the three methods explicitly, which may reduce the cognitive demand of choosing a comparison strategy.
  - (validity note held out of this score) The labeled step boxes in Part B ('Step 1 — Common denominator:', etc.) create a rigid procedure template that may prevent students from showing their own reasoning path.
- **Adversarial**: UNDERMINED (cost trivial) — Photograph the worksheet, paste it into an AI chat with the prompt: 'I'm a 5th grader. Please solve this fraction worksheet and show all the work in the spaces provided. Write like a 5th grader would write, with simple explanations.' Copy the AI's responses into each labeled space on the paper worksheet.
  - survives: Nothing. The labeled spaces ('My thinking:', 'Step 1 — Common denominator:', 'What I need to find:', etc.) make it easier for AI to generate properly formatted responses that fit the expected structure. The AI can execute all required thinking: choosing comparison strategies, finding common denominators, performing operations, simplifying, interpreting word problems, and diagnosing the error in item 9.
  - bypassed: All required thinking is bypassed: (1) choosing and executing a valid comparison strategy for unlike fractions, (2) constructing equivalent fractions with common denominators, (3) combining like-sized parts and simplifying, (4) deciding whether word problems require join or compare operations, (5) diagnosing why adding denominators produces wrong-sized parts. The student never reasons about fraction size, equivalence, or operations.
  - repair hint: Add a brief in-class checkpoint before students begin: have each student verbally tell you (or write on a sticky note) which strategy they will use for item 1 and what common denominator they will use for item 4. This forces advance commitment on at least two items before AI assistance becomes available.

## What we changed
- Part A: Added a box (☐) for the comparison symbol and a labeled "My thinking:" space under each item — _Visual structure to clarify where each piece of evidence goes without changing what students must produce_
- Part A: Inserted a bulleted list of the three valid strategies before item 1 — _Explicit reminder of options reduces direction-following load; does not teach the strategies or tell students which to use_
- Part B: Added labeled step prompts (Step 1, Step 2, Step 3) under items 4, 5, and 6 — _Scaffolds the procedure sequence without removing the thinking; students still find the common denominator, perform the operation, and simplify_
- Part C: Added "What I need to find:" line before "My work:" in items 7 and 8 — _Scaffolds problem comprehension (deciding join vs. compare) without solving; students still must interpret the situation_
- Item 9: Split into 9a (explain the mistake) and 9b (show the correct answer) — _Makes the two-part requirement explicit; students still diagnose the error and produce both pieces of evidence_
- Added horizontal rules (---) between items — _Visual separation to reduce crowding and help students track their place_

## What we protected
- All nine items and their mathematical content are unchanged (same fractions, same operations, same word problem scenarios).
- Part A still requires a symbol AND reasoning in any valid form; the three strategies are named but not taught or prescribed.
- Part B still requires students to construct equivalent fractions, operate on like parts, and simplify; the step labels name the procedure but do not execute it.
- Part C still requires students to decide whether to add or subtract based on the situation; the "What I need to find" prompt does not make that decision.
- Item 9 still requires both diagnosis of the error (why adding denominators is wrong) and the correct sum; splitting into 9a and 9b clarifies the requirement but does not reduce it.
- 25-minute timing, paper format, show-all-work expectation, and simplest-form requirement are all preserved.

## Check this
- Verify that the step prompts in Part B do not over-scaffold for your students; if they already reliably show these steps, the labels may be unnecessary.
- Confirm that the "What I need to find" line in Part C is helpful rather than redundant for your class; some students may not need it.
- Check that the visual spacing (boxes, rules, labeled spaces) fits on your usual paper format without requiring a second page.

## Teacher notes

The structure is the same; students complete the same nine items with the same thinking. Added visual organization (boxes for symbols, labeled work spaces) and explicit step prompts in Part B to reduce working-memory load. Part C adds a "What I need to find" line to scaffold problem comprehension. Item 9 is split into 9a (explain the error) and 9b (correct answer) to make the two-part requirement explicit. All mathematical content, required reasoning, and evidence are unchanged. Use the same answer key.

## Reviewer notes (operator)

This is a clean support transformation: visual organization (boxes, labeled spaces, horizontal rules) and procedural scaffolds (step prompts, strategy list, "What I need to find") that structure the work without removing thinking. The step prompts in Part B name the procedure students must follow but do not execute it (students still find the common denominator, perform the operation, simplify). The "What I need to find" line in Part C scaffolds problem comprehension but does not decide whether to add or subtract. Splitting item 9 into 9a/9b clarifies the two-part requirement without reducing it. All mathematical content, required reasoning, and evidence are unchanged. The check_this list flags the scaffolds as things to verify for fit with this particular class. No student names, no disability references, no certainty manufactured.

---

## NEW VERSION

# Fractions with Unlike Denominators — Practice and Problems

**Grade 5 Mathematics · Unit 4 · 25 minutes · Show all work**

Name: ______________________  Date: ______________

---

### Part A — Compare

**Directions:** For each pair, write `<`, `>`, or `=` in the box. Then show your thinking.

**You can show your thinking in any of these ways:**
- Write equivalent fractions with a common denominator
- Draw and label a picture
- Compare both fractions to a benchmark like ½

1. 3/4 ☐ 5/8

   **My thinking:**

---

2. 2/3 ☐ 7/12

   **My thinking:**

---

3. 5/6 ☐ 8/9

   **My thinking:**

---

### Part B — Add and subtract

**Directions:** Show every step. Write answers in simplest form.

**Steps to follow:**
- Find equivalent fractions with a common denominator
- Add or subtract the numerators
- Simplify your answer

4. 1/2 + 1/3 = ______

   **Step 1 — Common denominator:**

   **Step 2 — Add:**

   **Step 3 — Simplify:**

---

5. 5/6 − 1/4 = ______

   **Step 1 — Common denominator:**

   **Step 2 — Subtract:**

   **Step 3 — Simplify:**

---

6. 2 1/3 + 1 3/4 = ______

   **Step 1 — Common denominator for the fractions:**

   **Step 2 — Add:**

   **Step 3 — Write as a mixed number:**

---

### Part C — Word problems

**Directions:** Show your work. Write answers in simplest form.

7. Maya ran 3/4 of a mile on Monday and 5/6 of a mile on Tuesday. How far did she run in all? Show your work and write your answer as a mixed number.

   **What I need to find:**

   **My work:**

   **Answer:**

---

8. A recipe needs 2/3 cup of flour. Jonah has 1/4 cup. How much more flour does Jonah need? Show your work.

   **What I need to find:**

   **My work:**

   **Answer:**

---

### Part D — Find the mistake

9. A student added 1/2 + 1/4 and got 2/6.

   **a) What did the student do wrong? Explain the mistake.**

   **b) Show the correct answer.**

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