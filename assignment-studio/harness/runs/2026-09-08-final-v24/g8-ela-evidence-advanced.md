# Author's Point of View — Evidence Paragraph — ADVANCED

case g8-ela-evidence · model claude-sonnet-4-5 · prompt as-2026-09-05-v1 · 38374 ms

## Gold boundary

**Pass looks like**
- Same passage; deeper demand: e.g. evaluate whether the author's handling of the engineer's case is fair or a rhetorical move (the 'eleven minutes' detail); explain what the final hedged sentence does that a direct claim would not.
- Transfer: predict how the passage would change if written by the engineer, and what evidence would disappear.
- Comparison of two techniques: which does more work for the author's position, inclusion/omission or word choice, with justification.
- Still one paragraph (or two if the teacher constraint is relaxed explicitly); rubric mapping stated.

**Violation looks like**
- Two more paragraphs of the same task.
- A new, unrelated passage added as 'extension'.
- Turned into a persuasive essay about bridges (drift from analysis of author's craft).

## Preservation statuses (engine)

- **correctness**: PRESERVED — Passage unchanged; no factual claims altered; rubric criteria remain aligned with task requirements.
- **learning_target**: INTENTIONALLY_EXTENDED — Original target included 'explain the mechanism by which evidence signals position'; extension now requires naming the technique and explaining its persuasive effect, deepening the same inferential work rather than adding new content.
- **required_evidence**: INTENTIONALLY_EXTENDED — Paragraph still contains one point-of-view statement, two pieces of evidence with explanations, and treatment of counter-case; explanations now require technique + effect, and counter-case treatment now requires concession + response.
- **required_thinking**: INTENTIONALLY_EXTENDED — Students must now articulate both what the author concedes and what the author argues is incomplete in the opposing case, requiring them to see acknowledgment as a two-part rhetorical move rather than a single gesture.
- **teacher_constraints**: PRESERVED — Still 8–12 sentences, one class period, same 4-point rubric structure; the added depth substitutes more precise explanation for vaguer explanation within the same sentence count and rubric, not additional sentences or points.

Workload: same — Grading still uses the 4-point rubric with one point per element; the rubric language is more specific (technique + effect, concede + respond) but does not add scoring categories or require longer feedback. Prep cost is the same unless you choose to model the two-part moves in class.

## Audits (final round)

- **Preservation**: PASS — PASS. All contract elements held. The transformed version extends cognitive demand within permitted boundaries: it requires students to explain the effect of techniques (not just name them), to articulate what is valued/at stake (not just state opposition), and to identify both concession and rebuttal in the author's treatment of the opposing case (not just describe acknowledgment generically). These are legitimate extensions of justification, analysis depth, and interacting variables—all explicitly permitted in ADVANCED mode. Every element the contract requires remains required; nothing is supplied, weakened, or made optional. The additions wrap required thinking in more explicit analytical structure rather than replacing it. The 8–12 sentence constraint and one-period timeframe may creat
  - learning_target ·  · held · note: The learning target requires understanding that 'point of view is revealed through choices' and 'a skilled author acknowledges the opposing case.' The transformed version preserves this entirely: students must still 'Name the technique the author uses (word choice, contrast, placement, framing/selected detail, inclusion/omission) and explain what effect that technique has' and 'Explain how the author acknowledges and responds to the engineer's case.' The addition of 'what effect that technique has' and the split of acknowledgment into 'concede' and 'argue is missing' are extensions of depth, not substitutions.
  - required_thinking ·  · held · note: The contract requires: 'Infer an unstated-but-signalled position; select evidence that reveals the position; explain the mechanism by which each piece of evidence signals the position; describe how the author treats the counter-case.' All four elements remain required. The transformed version adds depth to the mechanism explanation ('Name the technique AND explain what effect that technique has') and to counter-case treatment ('What does the author concede about the engineer's argument, and what does the author argue the engineer's case leaves out?'). These are extensions within the 'may_extend' permissions for cognitive demand, justification, and interacting variables. The position must still be inferred (not stated in the text), evidence must still be selected, mechanisms must still be n
  - required_evidence ·  · held · note: The contract specifies: 'One paragraph containing: an accurate, specific statement of the author's position in the student's words; two quotations/close paraphrases; an explanation for each that names a technique; a sentence on how the engineer's case is acknowledged and answered.' The transformed version requires all of these elements: 'State the author's point of view in your own words. Be specific about what the author values and what the author fears would be lost' (position statement, now with specificity requirement); 'Quote or closely paraphrase two pieces of textual evidence' (unchanged); 'Name the technique... and explain what effect that technique has' (technique naming preserved, effect explanation added); 'Explain how the author acknowledges and responds to the engineer's case.
  - teacher_constraints ·  · held · note: All constraints preserved: 'One class period' appears in both versions; 'single paragraph of 8–12 sentences' is stated as 'one well-developed paragraph (8–12 sentences)' in both; '4-point rubric' structure maintained with four one-point elements; 'the rubric is the same for every student' is implicit in the single rubric provided. The rubric criteria have been elaborated to match the deepened requirements, but the structure and point distribution remain identical.
  - correctness ·  · held · note: The passage text is unchanged ('The passage itself is unchanged — all evidence remains available' per engine trace). The list of techniques is preserved and accurate ('word choice, contrast, placement, framing/selected detail, inclusion/omission'). The task accurately reflects what the passage contains: the author does present the engineer's case, does include details about community use that the engineer omitted, and does signal a position through the techniques listed. No factual errors introduced.
- **Usefulness** (blind): USEFUL — clarity 2, feasibility 2, editing minor, grading slightly more, improves True
  - The directions now run 4 bullets totaling ~90 words vs. original's ~60 words. For an 8th-grade one-period task, trim the third bullet: 'Name the technique... and explain what effect that technique has' could be 'Name the technique the author uses and explain its effect.'
  - The rubric's third criterion ('names the technique AND explains its effect') is clear but adds a two-part check per piece of evidence. Grading 30 papers means verifying technique-name + effect-explanation 60 times instead of just checking whether explanation connects evidence to position. Manageable but slightly more work per student.
  - The fourth bullet asks students to identify both what is conceded AND what is missing—two moves instead of one. Consider whether 8–12 sentences can hold: position statement + 2 pieces of evidence with technique + effect + concession + omission + transitions. That's 7–8 required elements. Tight but feasible if students are practiced.
  - Rubric point 4 now requires checking for two things ('concedes' and 'argues is missing'). Make sure the rubric awards the point if both are present, or clarify partial credit, so grading remains consistent across 30 students.
- **Adversarial**: UNDERMINED (cost trivial, independent check False) — The student pastes the passage and the complete assignment prompt into an AI chatbot (ChatGPT, Claude, etc.) and asks: 'Write this paragraph for me in a 13-year-old's voice, 8-12 sentences.' The AI generates a complete paragraph that states the author's position with specificity about values and stakes, quotes two pieces of evidence, names techniques (contrast, word choice, framing, etc.) and explains their effects, and describes what the author concedes and what is argued as missing. The student copies and submits it.
  - survives: Nothing. The transformed version adds more specific requirements ('Be specific about what the author values and what the author fears would be lost'; 'Name the technique AND explain what effect that technique has'; 'What does the author concede about the engineer's argument, and what does the author argue the engineer's case leaves out?'), but these are all analytical moves that current AI can perform fluently. The AI can identify that the author values community connection and tradition, fears loss of social space, can name 'contrast' when discussing the engineer's eleven minutes versus the detailed description of community use, can explain the effect of the phrase 'inspection reports measure steel' as framing that limits the engineer's perspective, and can articulate that the author conc
  - bypassed: The entire inferential and analytical process: reading the passage to detect the unstated position; recognizing which details function as evidence versus mere description; identifying the persuasive mechanism in each piece of evidence; understanding how acknowledgment of opposing views works rhetorically (concession + limitation). The student never practices distinguishing between 'the author mentions the bridge' and 'the author reveals a position through how the bridge is described.' The student never grapples with why 'eleven minutes' matters or what work the phrase 'I am not sure' does. The two-part structure of the opposing-case requirement (concede + respond) is meant to deepen understanding of rhetorical acknowledgment, but the AI handles this analytical split effortlessly.
  - repair hint: Before writing, each student meets briefly with the teacher (or completes a required pre-writing checkpoint) to state aloud their claim about the author's position and name the two pieces of evidence they will use, receiving a checkmark only when both are specific. This commits the student to their interpretive choices before drafting and makes a hollow hand-in visible.

## What we changed
- Point-of-view statement requirement — _Added 'Be specific about what the author values and what the author fears would be lost' to push students past generic opposition statements toward articulating the stakes_
- Evidence explanation requirement — _Changed from 'explain how it shows' to 'Name the technique AND explain what effect that technique has' — requires students to identify the mechanism and then trace its persuasive work_
- Opposing-case requirement — _Split into two parts: 'What does the author concede' and 'what does the author argue is missing' — requires recognition that acknowledgment includes both granting and limiting the opposing case_
- Rubric point 1 — _Added 'and specific about what is valued or at stake' to align with the deepened point-of-view requirement_
- Rubric point 3 — _Changed to 'names the technique AND explains its effect' to match the two-part evidence explanation requirement_
- Rubric point 4 — _Changed to 'describes both what the author concedes and what the author argues is missing' to reflect the split opposing-case requirement_

## What we protected
- The passage itself is unchanged — all evidence remains available
- 8–12 sentence paragraph constraint remains in place
- Two pieces of evidence requirement unchanged
- One class period and 4-point rubric structure preserved
- The list of techniques (word choice, contrast, placement, framing/selected detail, inclusion/omission) carried forward

## Check this
- Verify that the two-part evidence explanation (name + effect) fits within 8–12 sentences alongside the other requirements — it adds explanatory demand to each piece of evidence without adding a third piece
- Confirm that the split opposing-case requirement (concede + respond) can be handled in one sentence or two, as the original was, rather than requiring a separate mini-paragraph
- Check whether 'specific about what is valued or at stake' in the point-of-view statement is clear enough for eighth graders or needs an example in class

## Teacher notes

The task now requires students to name the technique (word choice, contrast, etc.) AND explain its effect, not just identify evidence. The point-of-view statement must now specify what is valued or at stake, pushing past "the author is against it." The treatment of the opposing case now asks for both concession and response, requiring students to see that the author grants the engineer's facts while arguing they are incomplete. The rubric language has been tightened to match these demands. Grading cost is the same; student thinking cost is higher.

## Reviewer notes (operator)

The extension operates by splitting existing requirements into their component parts (evidence explanation becomes technique + effect; opposing-case treatment becomes concession + response) rather than adding new requirements. This increases cognitive demand without increasing output volume. The 8–12 sentence constraint can accommodate the change because students were already writing explanations and describing the opposing case — they are now writing more precise versions of the same moves. The passage supports the deeper reading: the author explicitly concedes the engineer's facts ('The case for replacement is simple') and explicitly argues they are incomplete ('inspection reports measure steel… do not measure what a town does'). If the two-part opposing-case requirement proves too much for the sentence budget in practice, the teacher can collapse it back to a single sentence without losing the depth elsewhere.

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

Your paragraph must:

- State the author's point of view in your own words. Be specific about what the author values and what the author fears would be lost.
- Quote or closely paraphrase **two** pieces of textual evidence that reveal the author's point of view.
- For each piece of evidence, explain **how** it shows the author's position. Name the technique the author uses (word choice, contrast, placement, framing/selected detail, inclusion/omission) **and** explain what effect that technique has on how the reader understands the issue.
- Explain how the author **acknowledges and responds to** the engineer's case for replacement. What does the author concede about the engineer's argument, and what does the author argue the engineer's case leaves out?

**Scoring (4-point rubric):** Point of view clearly stated, accurate, and specific about what is valued or at stake (1) · Two relevant pieces of evidence (1) · Explanation names the technique AND explains its effect in revealing the position (1) · Accurately describes both what the author concedes and what the author argues is missing from the opposing view (1).

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