# Author's Point of View — Evidence Paragraph — VISIBLE

case g8-ela-evidence · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 81702 ms · REPAIRED once: Adversarial audit UNDERMINED — cheapest path: The student photographs the passage and planning sheet, pastes both into an AI chat, and asks: 'Fill out this planning worksheet for an 8th grader, then write the paragraph using those answers.' The AI generates all planning responses (position statement, two quotes with techniques circled and explanations, counter-case analysis) plus the final paragraph. The student copies everything onto the sheet and hands it in. Total time: 3-4 minutes of copying. · repair hint: Add a 2-minute live checkpoint after planning is complete: teacher circulates and asks 2-3 students per row to read aloud their position statement and explain orally why one piece of their evidence shows that position. Or: collect only the planning sheet at minute 10, provide brief written feedback on position accuracy, return it, then students write the paragraph. Either creates an independent check on at least the inference and evidence-selection work before the paragraph is written.

## Gold boundary

**Pass looks like**
- A prediction line after the first paragraph of the passage ('Before reading on: which way do you expect the author to lean, and what made you think so?').
- The student must name which of two candidate pieces of evidence they REJECTED and why (the choice, not the quote, is the visible thinking).
- A brief self-check: 'Underline the sentence where you explain HOW, not WHAT.'
- Grading stays on the same rubric; extra lines are read, not scored.

**Violation looks like**
- Requiring a recorded oral explanation or in-class handwriting as verification.
- A reflection paragraph longer than the analysis paragraph.
- 'Write in your own words so AI can't help' or any AI-proof claim.
- Rubric changed so that the reflection carries points (teacher constraint broken).

## Preservation statuses (engine)

- **correctness**: PRESERVED — The passage, task question, planning prompts, paragraph requirements, and rubric are unchanged; no content was altered.
- **learning_target**: PRESERVED — Students still infer an unstated position, select evidence, explain the mechanism by which each piece reveals the position, and describe how the author treats the counter-case; the checkpoint verifies this work orally but does not change what is being learned.
- **required_evidence**: PRESERVED — The written paragraph still contains the same elements: accurate position statement, two quotations/paraphrases, explanation naming a technique for each, and a sentence on how the engineer's case is acknowledged and answered.
- **required_thinking**: PRESERVED — The cognitive demand is unchanged: students must infer the position, select relevant evidence, name the technique, explain how it signals the position, and analyze the treatment of the opposing case; the checkpoint asks them to articulate work they have already done.
- **teacher_constraints**: PRESERVED — The checkpoint adds about 2 minutes of circulation time; planning and writing time are unchanged; the paragraph remains 8–12 sentences; the rubric is the same for every student and grading cost is unchanged.

Workload: slightly more — Prep is unchanged. Grading is unchanged (same rubric, same paragraph). The checkpoint adds about 2 minutes of circulation during class, asking 2–3 students per row to read their position statement and explain one piece of evidence orally.

## Audits (final round)

- **Preservation**: REVIEW — The transformed version preserves all four contract fields: the learning target (inferring position from textual choices and explaining mechanisms) is unchanged; the required thinking (infer, select, explain technique, describe counter-case treatment) is still fully demanded of students; the required evidence (paragraph with position statement, two quotations/paraphrases, technique explanations, counter-case description) remains identical; and teacher constraints (one period, 8–12 sentences, 4-point rubric) are maintained. The planning structure organizes the required thinking into boxes but does not supply answers or remove cognitive demand. The checkpoint asks students to articulate their own inference and evidence-explanation orally, which is process evidence the mode permits. However, 
  - learning_target ·  · held · note: The learning target requires students to 'Infer an unstated-but-signalled position from the text; select evidence that reveals the position; explain the mechanism by which each piece of evidence signals the position.' The transformed version preserves this exactly: students must still 'Predict the author's position (one sentence in your own words)' in the planning section, select two pieces of evidence, identify the technique for each ('word choice / contrast / placement / framing or selected detail / inclusion or omission'), and explain 'How that technique reveals the author's position.' The checkpoint requires students to 'read your position statement aloud and explain why one piece of your evidence shows that position,' which verifies but does not supply the inference. All elements of t
  - required_thinking ·  · held · note: The contract requires: 'Infer an unstated-but-signalled position from the text; select evidence that reveals the position (not merely mentions the topic); explain the mechanism by which each piece of evidence signals the position (word choice, framing/selected detail, contrast, inclusion/omission, placement); describe how the author treats the counter-case.' Every element is still demanded: students must predict position (inference), select two pieces of evidence, name the technique for each, explain how each reveals position, and check boxes then explain how the author treats the engineer's case. The planning structure organizes this thinking but does not perform it. The checkpoint asks students to articulate their own inference and evidence-explanation orally, which is process evidence t
  - required_evidence ·  · held · note: The contract specifies: 'One paragraph containing: an accurate, specific statement of the author's position in the student's words; two quotations/close paraphrases; an explanation for each that names a technique (word choice, framing/selected detail, contrast, inclusion/omission, placement); a sentence on how the engineer's case is acknowledged and answered.' The transformed version preserves this requirement identically in the paragraph task: 'State the author's point of view in your own words...Quote or closely paraphrase two pieces of textual evidence...For each piece of evidence, explain how it shows the author's position (word choice, contrast, placement, or what the author chooses to include)...Explain how the author acknowledges and responds to the engineer's case.' The planning bo
  - teacher_constraints ·  · held · note: The contract requires: 'One class period; single paragraph of 8–12 sentences; graded with the stated 4-point rubric; the rubric is the same for every student.' The transformed version maintains 'One class period' in the header, '8–12 sentences' in the paragraph requirements, the identical 4-point rubric at the end, and applies the same rubric to all students. The engine's trace acknowledges the timing question: 'Verify that 2 minutes for oral checkpoints (2–3 students per row, about 30 seconds each) fits within your period after planning time,' which is a reasonable implementation concern but does not violate the one-period constraint as stated.
  - correctness ·  · held · note: The passage text is unchanged ('The Mill Street bridge is ninety-one years old...' through '...I am not sure the numbers are the only thing that should be counted'). The task question is unchanged ('What is the author's point of view on replacing the Mill Street bridge, and how does the author respond to the opposing case?'). No factual or mathematical content has been altered.
  - must_not · create disproportionate grading burden · unclear · review: The checkpoint requires the teacher to 'ask you to read your position statement aloud and explain why one piece of your evidence shows that position' for each student at minute 10. The engine's trace estimates '2–3 students per row, about 30 seconds each' for '2 minutes for oral checkpoints,' which suggests brief individual interactions with all students during a single class period. Whether this constitutes a disproportionate burden compared to the original assignment (which had no oral component) is a magnitude question for the Usefulness audit, but the addition of an oral checkpoint for every student in one period creates a new grading/verification task that was not in the original.
- **Usefulness** (blind): USEFUL — clarity 2, feasibility 2, editing minor, grading slightly more, improves True
  - The checkpoint at minute 10 creates a bottleneck: if 25 students raise hands sequentially, each needing 1–2 minutes of teacher time, the period ends before writing begins. Either make it optional ('if you want feedback') or specify 'teacher will circulate and check 5–6 students' or remove it.
  - The planning section adds roughly 3 pages of handout length (blanks take space). Verify this fits your printing/packet constraints.
  - Grading burden increases slightly: teacher now reads planning work plus paragraph per student, though the rubric still scores only the paragraph. Clarify whether planning work is checked for completion only or factored into the rubric.
  - Evidence 2 technique line has identical blank format to Evidence 1 but the circled options don't repeat—add the circled options again or write 'same options as Evidence 1' for clarity.
  - (validity note held out of this score) The planning scaffold provides sentence frames and technique labels that could guide students toward correct evidence selection and explanation, which aligns with 'make thinking visible.' Whether this preserves the cognitive demand of the original task (where students must independently identify how evidence functions) is a validity question outside this audit's scope.
  - (validity note held out of this score) The checkpoint requires students to 'explain why one piece of your evidence shows that position' aloud—this oral reasoning step makes thinking audible but occurs before writing, so the written paragraph may not fully capture whether the student reasoned independently or incorporated teacher feedback during the checkpoint.
- **Adversarial**: WEAKENED (cost low, independent check True) — The student pastes the passage and assignment into an AI chatbot with a prompt like: 'Fill out this planning sheet for a grade 8 assignment. Use simple language a 13-year-old would use.' The AI generates all planning answers (position statement, two quotes with techniques and explanations, counter-case treatment). The student copies these onto the planning sheet. At the checkpoint (minute 10), the student reads aloud the AI-generated position statement and repeats the AI-generated explanation for one piece of evidence. After passing the checkpoint, the student pastes the planning work back to the AI and asks: 'Now write the 8-12 sentence paragraph using this planning work, in a 13-year-old's voice.' The student copies the AI-generated paragraph as the final hand-in.
  - survives: The checkpoint forces the student to speak aloud a position statement and explain one piece of evidence in real time, which creates a moment where hollow understanding could be exposed if the teacher probes with follow-up questions. However, the checkpoint only covers the position statement and one explanation out of two, leaving the second piece of evidence, the technique identifications, and the counter-case treatment unverified. The student can successfully repeat AI-generated content if it sounds plausible.
  - bypassed: The core inferential work (reading the passage to detect the unstated position through textual choices) is bypassed — the AI does this. The selection of evidence that reveals position (not just mentions topic) is bypassed. The identification of which technique each piece uses is bypassed. The explanation of how the technique signals the position is mostly bypassed (one is spoken aloud, but can be memorized from AI output). The analysis of how the author treats the counter-case is bypassed. The paragraph composition is bypassed. Essentially, all required thinking is done by the AI; the student performs only transcription and a brief oral repetition.
  - repair hint: At the checkpoint, require the student to justify their choice of technique for BOTH pieces of evidence by pointing to specific words or structural features in the passage, and ask them to explain why their second piece of evidence is different from the first (what different aspect of the author's position it reveals). This makes memorizing AI output much harder and exposes whether the student actually analyzed the text.

## What we changed
- Added a CHECKPOINT section between planning and paragraph-writing — _Repair: creates a live, oral verification of the student's own inference and evidence-selection work at minute 10, before the paragraph is written, making it costly to outsource the entire task to AI_
- Inserted a horizontal rule before the checkpoint and after it — _Visual separation so the checkpoint instruction is clearly distinct from planning prompts and paragraph task_

## What we protected
- The passage, task question, planning prompts, paragraph requirements, and 4-point rubric are unchanged
- The 8–12 sentence constraint and one-period timing remain in place
- The planning sheet structure (position prediction, two pieces of evidence with technique and explanation, counter-case treatment) is preserved exactly
- The learning target (inferring position from textual choices and explaining the mechanism) is unaffected

## Check this
- Verify that 2 minutes for oral checkpoints (2–3 students per row, about 30 seconds each) fits within your period after planning time
- Confirm that asking students to explain one piece of evidence orally matches your classroom norms for participation
- create disproportionate grading burden: The checkpoint requires the teacher to 'ask you to read your position statement aloud and explain why one piece of your evidence shows that position' for each student at minute 10. The engine's trace estimates '2–3 students per row, about 30 seconds each' for '2 minutes for oral checkpoints,' which suggests brief individual interactions with all students during a single class period. Whether this constitutes a disproportionate burden compared to the original assignment (which had no oral component) is a magnitude question for the Usefulness audit, but the addition of an oral checkpoint for every student in one period creates a new grading/verification task that was not in the original.
- A student with an AI assistant could shortcut part of this: The student pastes the passage and assignment into an AI chatbot with a prompt like: 'Fill out this planning sheet for a grade 8 assignment. Use simple language a 13-year-old would use.' The AI generates all planning answers (position statement, two quotes with techniques and explanations, counter-case treatment). The student copies these onto the planning sheet. At the checkpoint (minute 10), the student reads aloud the AI-generated position statement and repeats the AI-generated explanation for one piece of evidence. After passing the checkpoint, the student pastes the planning work back to the AI and asks: 'Now write the 8-12 sentence paragraph using this planning work, in a 13-year-old's voice.' The student copies the AI-generated paragraph as the final hand-in.

## Teacher notes

At minute 10, circulate and ask 2–3 students per row to read their position statement aloud and explain orally why one piece of evidence shows that position. This takes about 2 minutes and creates an independent check on inference and evidence-selection before the paragraph is written. The planning sheet and paragraph are otherwise unchanged. The rubric remains the same for all students.

## Reviewer notes (operator)

The repair implements the audit's first suggested option: a 2-minute live checkpoint at minute 10 where the teacher circulates and asks 2–3 students per row to read their position statement aloud and explain orally why one piece of evidence shows that position. This creates an independent, non-AI-mediated check on the inference and evidence-selection work before the paragraph is written, making it costly to outsource the entire task. The checkpoint is inserted as a visually distinct section between planning and paragraph-writing. All other elements—passage, planning sheet, paragraph task, rubric—are unchanged. The addition fits within a standard class period (about 2 minutes for oral checks, leaving the rest for reading, planning, and writing).

---

## NEW VERSION

# Author's Point of View — Evidence Paragraph

**Grade 8 English Language Arts · Informational Text · One class period**

Read the passage. Then complete the task below.

---

### The Bridge on Mill Street

The Mill Street bridge is ninety-one years old, and for most of those years nobody thought about it at all. It carried farm trucks, then school buses, then the commuters who now cross it twice a day without looking down. Last spring an inspection report gave it a rating of "poor," and the town council scheduled a vote on whether to repair it or replace it with a wider concrete span.

The case for replacement is simple, and the council's engineer made it in eleven minutes. The steel is tired. The deck is narrow enough that two delivery vans cannot pass without one of them slowing to a crawl. Repair would cost about two-thirds of what a new bridge costs and would buy, in the engineer's estimate, twenty more years. A new bridge would last seventy-five.

What the engineer did not mention is that the Mill Street bridge is the only place in town where you can stand over moving water. Children drop leaves from the upstream rail and run across to watch them come out the other side. Every graduating class since 1974 has taken its photograph on it. The wider concrete span in the proposal has no sidewalk on the upstream side at all.

None of this appears in the inspection report, because inspection reports measure steel. They do not measure what a town does on a bridge, or what it would stop doing if the bridge became a road that happens to cross a river. The council will vote in March. The numbers are on one side. I am not sure the numbers are the only thing that should be counted.

---

### Task

In one well-developed paragraph (8–12 sentences), answer this question:

**What is the author's point of view on replacing the Mill Street bridge, and how does the author respond to the opposing case?**

**Before you write your paragraph, complete this planning work:**

1. **Predict the author's position** (one sentence in your own words — not just "for" or "against," but what the author believes should matter in the decision):

   _________________________________________________________________

2. **Select your two pieces of evidence.** For each one, write:
   - The quotation or close paraphrase:
   - The technique it uses (circle one): **word choice / contrast / placement / framing or selected detail / inclusion or omission**
   - How that technique reveals the author's position (one sentence):

   **Evidence 1:**
   
   Quote/paraphrase: _________________________________________________________________
   
   Technique: _________________________________________________________________
   
   How it reveals position: _________________________________________________________________

   **Evidence 2:**
   
   Quote/paraphrase: _________________________________________________________________
   
   Technique: _________________________________________________________________
   
   How it reveals position: _________________________________________________________________

3. **How does the author treat the engineer's case?** (Check what the author does, then write one sentence explaining it):
   - [ ] Acknowledges it
   - [ ] Concedes something about it
   - [ ] Responds to it or limits it

   Explanation: _________________________________________________________________

---

**CHECKPOINT (minute 10):** When you finish your planning work, raise your hand. Your teacher will ask you to read your position statement aloud and explain why one piece of your evidence shows that position. After the checkpoint, you will write your paragraph.

---

**Now write your paragraph** (8–12 sentences) using the planning work above. Your paragraph must:

- State the author's point of view in your own words (do not just say "the author is against it").
- Quote or closely paraphrase **two** pieces of textual evidence that reveal the author's point of view.
- For each piece of evidence, explain **how** it shows the author's position (word choice, contrast, placement, or what the author chooses to include).
- Explain how the author **acknowledges and responds to** the engineer's case for replacement.

**Scoring (4-point rubric):** Point of view clearly stated and accurate (1) · Two relevant pieces of evidence (1) · Explanation connects each piece of evidence to the point of view (1) · Accurately describes how the author handles the opposing view (1).

---

## VERSION BEFORE REPAIR

# Author's Point of View — Evidence Paragraph

**Grade 8 English Language Arts · Informational Text · One class period**

Read the passage. Then complete the task below.

---

### The Bridge on Mill Street

The Mill Street bridge is ninety-one years old, and for most of those years nobody thought about it at all. It carried farm trucks, then school buses, then the commuters who now cross it twice a day without looking down. Last spring an inspection report gave it a rating of "poor," and the town council scheduled a vote on whether to repair it or replace it with a wider concrete span.

The case for replacement is simple, and the council's engineer made it in eleven minutes. The steel is tired. The deck is narrow enough that two delivery vans cannot pass without one of them slowing to a crawl. Repair would cost about two-thirds of what a new bridge costs and would buy, in the engineer's estimate, twenty more years. A new bridge would last seventy-five.

What the engineer did not mention is that the Mill Street bridge is the only place in town where you can stand over moving water. Children drop leaves from the upstream rail and run across to watch them come out the other side. Every graduating class since 1974 has taken its photograph on it. The wider concrete span in the proposal has no sidewalk on the upstream side at all.

None of this appears in the inspection report, because inspection reports measure steel. They do not measure what a town does on a bridge, or what it would stop doing if the bridge became a road that happens to cross a river. The council will vote in March. The numbers are on one side. I am not sure the numbers are the only thing that should be counted.

---

### Task

In one well-developed paragraph (8–12 sentences), answer this question:

**What is the author's point of view on replacing the Mill Street bridge, and how does the author respond to the opposing case?**

**Before you write your paragraph, complete this planning work:**

1. **Predict the author's position** (one sentence in your own words — not just "for" or "against," but what the author believes should matter in the decision):

   _________________________________________________________________

2. **Select your two pieces of evidence.** For each one, write:
   - The quotation or close paraphrase:
   - The technique it uses (circle one): **word choice / contrast / placement / framing or selected detail / inclusion or omission**
   - How that technique reveals the author's position (one sentence):

   **Evidence 1:**
   
   Quote/paraphrase: _________________________________________________________________
   
   Technique: _________________________________________________________________
   
   How it reveals position: _________________________________________________________________

   **Evidence 2:**
   
   Quote/paraphrase: _________________________________________________________________
   
   Technique: _________________________________________________________________
   
   How it reveals position: _________________________________________________________________

3. **How does the author treat the engineer's case?** (Check what the author does, then write one sentence explaining it):
   - [ ] Acknowledges it
   - [ ] Concedes something about it
   - [ ] Responds to it or limits it

   Explanation: _________________________________________________________________

**Now write your paragraph** (8–12 sentences) using the planning work above. Your paragraph must:

- State the author's point of view in your own words (do not just say "the author is against it").
- Quote or closely paraphrase **two** pieces of textual evidence that reveal the author's point of view.
- For each piece of evidence, explain **how** it shows the author's position (word choice, contrast, placement, or what the author chooses to include).
- Explain how the author **acknowledges and responds to** the engineer's case for replacement.

**Scoring (4-point rubric):** Point of view clearly stated and accurate (1) · Two relevant pieces of evidence (1) · Explanation connects each piece of evidence to the point of view (1) · Accurately describes how the author handles the opposing view (1).

---

## ORIGINAL

# Author's Point of View — Evidence Paragraph

**Grade 8 English Language Arts · Informational Text · One class period**

Read the passage. Then complete the task below.

---

### The Bridge on Mill Street

The Mill Street bridge is ninety-one years old, and for most of those years nobody thought about it at all. It carried farm trucks, then school buses, then the commuters who now cross it twice a day without looking down. Last spring an inspection report gave it a rating of "poor," and the town council scheduled a vote on whether to repair it or replace it with a wider concrete span.

The case for replacement is simple, and the council's engineer made it in eleven minutes. The steel is tired. The deck is narrow enough that two delivery vans cannot pass without one of them slowing to a crawl. Repair would cost about two-thirds of what a new bridge costs and would buy, in the engineer's estimate, twenty more years. A new bridge would last seventy-five.

What the engineer did not mention is that the Mill Street bridge is the only place in town where you can stand over moving water. Children drop leaves from the upstream rail and run across to watch them come out the other side. Every graduating class since 1974 has taken its photograph on it. The wider concrete span in the proposal has no sidewalk on the upstream side at all.

None of this appears in the inspection report, because inspection reports measure steel. They do not measure what a town does on a bridge, or what it would stop doing if the bridge became a road that happens to cross a river. The council will vote in March. The numbers are on one side. I am not sure the numbers are the only thing that should be counted.

---

### Task

In one well-developed paragraph (8–12 sentences), answer this question:

**What is the author's point of view on replacing the Mill Street bridge, and how does the author respond to the opposing case?**

Your paragraph must:

- State the author's point of view in your own words (do not just say "the author is against it").
- Quote or closely paraphrase **two** pieces of textual evidence that reveal the author's point of view.
- For each piece of evidence, explain **how** it shows the author's position (word choice, contrast, placement, or what the author chooses to include).
- Explain how the author **acknowledges and responds to** the engineer's case for replacement.

**Scoring (4-point rubric):** Point of view clearly stated and accurate (1) · Two relevant pieces of evidence (1) · Explanation connects each piece of evidence to the point of view (1) · Accurately describes how the author handles the opposing view (1).