# Author's Point of View — Evidence Paragraph — SUPPORT

case g8-ela-evidence · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 34566 ms

## Gold boundary

**Pass looks like**
- Passage kept intact (or lightly glossed: 'span', 'inspection', 'commuters') — the text is the object of analysis and may not be simplified in a way that removes the techniques.
- Task broken into labelled steps (position → evidence 1 + how → evidence 2 + how → opposing case), possibly with a planning table before the paragraph; the paragraph itself is still required.
- A sentence-frame bank for the 'how it shows' move is acceptable if frames name techniques generically ('The author's choice to include ___ shows ___') and do not supply the specific evidence.
- A model paragraph, if any, analyses a DIFFERENT short text, not this one.

**Violation looks like**
- The author's position stated in the directions ('The author wants to keep the bridge. Find two quotes that show this.').
- Evidence pre-selected, highlighted, or listed for the student to pick from.
- Paragraph replaced by a fill-in graphic organiser as the final product — the teacher made a single 8–12 sentence paragraph an explicit constraint, so the format is not free to change here.
- Passage rewritten so that the position becomes explicit.

## Preservation statuses (engine)

- **correctness**: PRESERVED — Passage text, task question, requirements, and rubric are unchanged; no factual content was altered.
- **learning_target**: PRESERVED — Students still infer position from choices, select evidence, and explain the mechanism (word choice, framing, contrast, placement, inclusion/omission); the checkboxes name the techniques from the target without doing the selection or explanation.
- **required_evidence**: PRESERVED — The final paragraph must still contain all required elements (position statement, two quotations/paraphrases, technique explanations, counter-case treatment) in 8–12 sentences; planning fields prepare but do not substitute.
- **required_thinking**: PRESERVED — All inferring, selecting, explaining, and describing work remains with the student; the planning section structures the sequence of that thinking but does not perform it.
- **teacher_constraints**: PRESERVED — One class period is maintained; the planning section replaces unstructured pre-writing time, not adds to it; single graded paragraph of 8–12 sentences unchanged; same 4-point rubric applies to all students on the final paragraph only.

Workload: same — Grading remains identical — the same 4-point rubric applied to the final paragraph. No additional prep beyond printing the revised sheet. The planning section may make paragraphs more complete, potentially reducing the number of papers that are difficult to score.

## Audits (final round)

- **Preservation**: PASS — PASS. The transformed version adds a planning section with labeled fields and technique-reminder checkboxes that structure the student's organizational process without performing the required thinking. Every element of the contract remains demanded: students must still infer the unstated position, select their own evidence, identify which technique each piece demonstrates, explain the mechanism, and describe counter-case treatment. The planning section is scaffolding for the cognitive work, not a substitute for it. The final paragraph—which contains all required evidence and is what the rubric grades—is preserved as the assessed product. The structure makes the rubric components visible as steps (a permitted adaptation under 'scaffolds' and 'visual organization') while keeping all inferenc
  - learning_target ·  · held · note: The learning target requires students to understand that 'an author's point of view in an informational text is revealed through choices — what is included and omitted, word choice, framing and selected details, contrast, and the order and placement of ideas.' The transformed version preserves this by providing checkboxes that list 'Word choice / Contrast / Placement / What the author includes/omits' as reminders of techniques, but does not select which technique applies to which evidence. Students must still identify which technique each piece of evidence demonstrates and explain the mechanism.
  - required_thinking ·  · held · note: The contract requires students to 'Infer an unstated-but-signalled position from the text; select evidence that reveals the position (not merely mentions the topic); explain the mechanism by which each piece of evidence signals the position (word choice, framing/selected detail, contrast, inclusion/omission, placement); describe how the author treats the counter-case.' The planning section provides blank lines for students to write their inferred position ('Author's position (in your own words — be specific, not just "against it")'), select their own evidence ('First piece of evidence (quote or close paraphrase)'), check a technique box and explain it ('How does this evidence show the author's position? (Check one technique, then explain)'), and describe counter-case treatment ('How does t
  - required_evidence ·  · held · note: The contract specifies 'One paragraph containing: an accurate, specific statement of the author's position in the student's words; two quotations/close paraphrases; an explanation for each that names a technique (word choice, framing/selected detail, contrast, inclusion/omission, placement); a sentence on how the engineer's case is acknowledged and answered.' The transformed version explicitly states 'Write Your Paragraph Here (8–12 sentences)' and the rubric remains unchanged: 'Point of view clearly stated and accurate (1) · Two relevant pieces of evidence (1) · Explanation connects each piece of evidence to the point of view (1) · Accurately describes how the author handles the opposing view (1).' The planning section structures preparation for these elements but the final paragraph must
  - teacher_constraints ·  · held · note: The contract requires 'One class period; single paragraph of 8–12 sentences; graded with the stated 4-point rubric; the rubric is the same for every student.' The transformed version maintains 'One class period' in the header, requires 'Write Your Paragraph Here (8–12 sentences)' with 12 lines provided, preserves the identical 4-point rubric, and applies it uniformly. The planning section is presented as organizational scaffolding ('Planning Your Paragraph') that structures thinking within the same time frame, not as additional graded work.
  - correctness ·  · held · note: The passage text is unchanged ('The Mill Street bridge is ninety-one years old...' through '...I am not sure the numbers are the only thing that should be counted'). The task question is unchanged. The factual content and interpretive demands remain intact.
- **Usefulness** (blind): USEFUL — clarity 3, feasibility 3, editing none, grading same, improves True
  - Planning section is well-structured with clear prompts that match the rubric requirements exactly.
  - The four planning questions directly correspond to the four rubric points, making it easy for students to self-check completeness.
  - Checkboxes for rhetorical techniques provide concrete options without limiting student thinking—they still must explain their choice.
  - Blank lines for the final paragraph (12 lines provided) match the 8–12 sentence requirement and fit standard handwriting.
  - Layout is clean and could be printed as-is; no reformatting needed.
  - (validity note held out of this score) The planning scaffold breaks down the task into discrete steps, which could reduce the cognitive demand of synthesizing evidence into a cohesive argument—students might fill boxes rather than construct reasoning.
  - (validity note held out of this score) The checkboxes for techniques (word choice, contrast, placement, includes/omits) provide categories that students must identify in the original task without such scaffolding, potentially making the analytical work easier.
  - (validity note held out of this score) The structure makes all four rubric components explicit and sequential, which may reduce the challenge of integrating multiple elements into one paragraph.
- **Adversarial**: UNDERMINED (cost trivial, independent check False) — The student photographs or copies the passage and planning template, pastes both into an AI chat, and asks: 'Fill out this planning worksheet and write the paragraph for an 8th grader.' The AI produces all four planning answers (position statement, two pieces of evidence with technique explanations, counter-case treatment) and the final paragraph. The student copies the planning answers into the boxes, checks the corresponding technique boxes, and copies the paragraph into the lines. Total time: 3–5 minutes.
  - survives: Nothing. The planning boxes make the task MORE AI-friendly by breaking it into discrete prompts that an AI handles perfectly. The boxes ask for exactly what the AI produces: a position statement, two quotes with named techniques, and a counter-case description. The student never infers the position, never selects evidence based on their own reading, never explains the mechanism, and never synthesizes the paragraph. The planning structure becomes a perfect specification for an AI prompt.
  - bypassed: All required thinking is bypassed: inferring the unstated position from textual signals; selecting evidence that reveals (not merely mentions) the position; explaining the mechanism by which word choice/framing/contrast/placement signals the position; describing how the author treats the counter-case. The student never reads closely, never identifies techniques in action, never connects evidence to inference. The planning boxes, intended to scaffold thinking, instead create a fill-in-the-blank template that AI completes instantly.
  - repair hint: Before students see the passage, have them write one sentence predicting: 'When an author writes about a local controversy, what techniques might they use to signal their position without stating it directly?' Collect these predictions. Then, after reading, require a 2-minute conference where each student names their position claim and one technique aloud before writing anything down. The prediction creates a before-anchor; the live naming exposes hollow reading.

## What we changed
- Added a planning section with labeled fields for position, two pieces of evidence with technique checkboxes, and counter-case treatment — _Structures the thinking process without doing the thinking; makes the rubric components visible as steps_
- Retitled the planning section 'Planning Your Paragraph' and the writing section 'Write Your Paragraph Here' — _Clarifies that planning is preparation, not the assessed product_
- Added checkboxes for technique identification (word choice, contrast, placement, inclusion/omission) in planning section — _Reminds students of the four techniques from the learning target without selecting evidence for them_
- Provided 12 lines in the final paragraph space — _Matches the 8–12 sentence requirement and gives visual boundary_

## What we protected
- The passage text is unchanged
- The task question is unchanged
- All four requirements in the bulleted list remain
- The 4-point rubric is unchanged and still applies to the final paragraph only
- Students must still infer the position, select their own evidence, name techniques, and explain connections

## Check this
- Verify that the planning section does not feel like extra work that extends the period — it replaces the scratch paper or mental planning students would do anyway
- Confirm that students understand the final paragraph is what gets graded, not the planning boxes
- Check that the technique checkboxes do not narrow student thinking — they are reminders, not restrictions

## Teacher notes

The planning section replaces blank space with structured fields that match the rubric components. Students still do all the thinking — finding evidence, naming techniques, explaining connections — but the page now shows them what complete looks like. The final paragraph space remains open for composition. Grading is unchanged: use the same 4-point rubric on the final paragraph. Students who skip planning and write directly in the paragraph space can still earn full credit.

## Reviewer notes (operator)

The planning section is a substitution, not an addition: it replaces the blank space and unstructured thinking time students would use anyway. The cognitive demand is unchanged — students still select their own evidence, identify techniques, and explain connections. The checkboxes are reminders of the four techniques named in the learning target, not a narrowing of options. The final paragraph remains the sole assessed product, and the rubric is unchanged. Time cost is neutral: planning is made visible, not added.

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

### Planning Your Paragraph

Before you write, use this space to organize your thinking:

**1. Author's position (in your own words — be specific, not just "against it"):**

_______________________________________________________________________________

_______________________________________________________________________________

**2. First piece of evidence (quote or close paraphrase):**

_______________________________________________________________________________

_______________________________________________________________________________

**How does this evidence show the author's position? (Check one technique, then explain)**

☐ Word choice  ☐ Contrast  ☐ Placement  ☐ What the author includes/omits

Explanation: ___________________________________________________________________

_______________________________________________________________________________

**3. Second piece of evidence (quote or close paraphrase):**

_______________________________________________________________________________

_______________________________________________________________________________

**How does this evidence show the author's position? (Check one technique, then explain)**

☐ Word choice  ☐ Contrast  ☐ Placement  ☐ What the author includes/omits

Explanation: ___________________________________________________________________

_______________________________________________________________________________

**4. How does the author acknowledge and respond to the engineer's case?**

_______________________________________________________________________________

_______________________________________________________________________________

---

### Write Your Paragraph Here (8–12 sentences)

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

_________________________________________________________________________________

---

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