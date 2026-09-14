# 07 — "It's just a quiz" teardown (Part 4)

**Status:** 2026-09-04 · Applied to `06-EVIDENCE-PACK.pdf` v0.1 as built. Written to be uncomfortable. Where the objection is right, it says so, and the pack was revised in response (§8).

---

## 1. Is this simply a conventional quiz with new terminology?

**Partly, yes.** Pages 4–6 are, physically, three one-page quizzes. An experienced Algebra I teacher who flipped only to those pages would see twelve items of familiar kinds — find the equation, find b, spot the error, solve for d, match the table, fill the table, linear or not, a word problem. Nothing on the student pages is an item type she has not seen. If the pack were only pp. 4–6, the objection would be correct and the product should not be sent.

**What is not "just terminology":** the student pages are the *least* distinctive part of the pack on purpose. The kickoff said the product must demonstrate the architecture, not merely contain good questions. The architecture lives on pp. 2, 3, 7–9: the map from claim → existing activity → gap → check, the two-line evidence statements, the fresh-form rules, the cost figures, and the row that says no check reaches LC-8.

## 2. What, if anything, is structurally different?

Five things, in decreasing order of how defensible they are.

1. **Claim-referenced, not score-referenced.** A quiz returns a score; each check here returns a yes/no/flag about *one named claim*, and the claim is tied to a standard and a concept so it aggregates upward. This is evidence-centred design at exit-ticket grain — established, not new (Mislevy et al. 2003), but almost never operationalised at the classroom level. Most teacher-made quizzes and every generator we looked at return points.
2. **The negative scope statement.** "Evidence this item cannot support" appears on every check. We found no quiz bank, generator, or PD deliverable that states what an item does *not* show. It is the mechanism that stops the product overclaiming, and it is the line teachers will quote back if they quote anything.
3. **The evidence gap is written against the teacher's *existing* work.** The map's fourth column is not "what to teach" but "what your homework can no longer show on its own." A quiz starts from the content; this starts from the inference the teacher already wants and can no longer make. In the sample this is done for *typical* assignments (a real weakness — §7); in the paid version it is done for the department's own.
4. **Fresh-form rules as a first-class deliverable.** A parallel form is a familiar idea (item models; Bejar 2002). What is unusual is shipping the *rule* to a teacher with a pen — vary/fix/avoid — so freshness is something she produces in two minutes, with the "avoid" line carrying the design knowledge (no slope ±1; paid amounts not divisible by the coefficient; uneven x-step with a visible gap). That is where the item-writing expertise actually sits.
5. **Cost on every item and an honest hole.** Student minutes and scoring seconds per item, all labelled modelled; and one claim with no cheap check. Track 1 found the cost teachers name first is class minutes; nothing in the market states them per item.

## 3. Would an experienced math teacher already do this?

**Most of it, informally, some of the time.** Exit tickets, warm-ups on whiteboards, "spot the mistake" problems, parallel forms by row — all standard practice; Wiliam's hinge questions have been in PD for fifteen years. The 40% of secondary teachers already asking for process evidence (Learning First, per CONTEXT.md) are doing a version of this by hand.

What they mostly do not do, because it takes time nobody has: write the claim before the item; write what the item cannot show; keep a variant rule; state the cost; keep track across a unit of which claims have independent evidence and which rest on take-home work. The teacher does the *item*; the system does the *bookkeeping of inference*. That is a smaller claim than "teachers don't do this," and it is the true one.

## 4. If yes, what value does the system add?

Time and discipline, not insight. Concretely: (a) the twelve items with verified keys and 24 extra forms, ready tomorrow — roughly 2–3 hours of careful writing a teacher would not otherwise spend; (b) the map, which turns "I should do more exit tickets" into "these seven claims, these two are uncovered, this one can't be covered cheaply"; (c) the restraint — a document that will not let her, or her chair, read a ticket as mastery. For a curriculum director, the value is different: the map is a *format* for a department conversation that does not currently have one.

## 5. Where is the value?

| Candidate | Share of the value, honestly | Why |
|---|---|---|
| The items themselves | Small | Good, verified, but reproducible (§6). |
| The claim-to-evidence mapping | **Largest** | The map is the product; the items are its demonstration. Its value multiplies when applied to a department's own assignments, which the sample cannot do. |
| Composability | Medium, latent | Invisible to the teacher; visible to the director when she asks "can you do this for the whole course?" The JSON record is the answer; the sample only hints at it (p. 10). |
| Cost discipline | Medium | The Track-1/Track-2 finding — adoption dies on teacher-minutes — is answered per item. Teachers will read it; whether it changes behaviour is untested. |
| Systematic coverage | Medium | The unit/course/department scaling on p. 10 is the paid product; the sample shows one topic. |
| Human review + verified keys | Medium, invisible | The moat Track 1 identified. It is a line in the footer; it is not *felt* until a generator hands a teacher a wrong key. |
| The negative scope statements | Medium | The one thing nobody else ships. Cheap to copy in form; hard to copy in *restraint* — a generator will happily write "cannot support: nothing." |

## 6. What would MagicSchool, Brisk, or a capable general-purpose model reproduce immediately?

- **Exit tickets, warm-ups, quizzes on linear functions, with keys:** immediately. Exit-ticket generators are a commodity (MagicSchool, Brisk, Slidesgo, QuestionWell, Teachmate, HelpMeTeach, AI for Education prompt library — all free or bundled; verified 2026-09-04).
- **Parallel forms with different numbers:** immediately, and Brisk's quiz generator can do it against district standards (Curriculum Intelligence, per Track 1).
- **The eight primitives as a prompt:** immediately. "Write a Diagnose item for slope with a named misconception" is a good prompt, and a strong model will produce a usable item most of the time.
- **Evidence statements:** on request, in form. A model asked to write "supports / cannot support" lines will write plausible ones.
- **The map's *structure*:** on request. The column headings are not secret.

What a general-purpose model produced *in this very project* is the pack. That should be said plainly: the items were written by a model and checked by a script and a reviewer. The moat is not "a model can't do this." It is what follows.

## 7. What remains difficult to reproduce reliably?

- **Correctness across forms without a verification step.** Generators hand teachers keys; nobody checks them. Every one of our 36 keys was recomputed. The failure mode is quiet — a wrong key on a "fresh" form — and it is the one that costs a teacher trust in front of a class. *Reliably* is the operative word.
- **Distractors that carry a named error, and stems designed so the error is visible.** EC-07's uneven x-step, EC-12's non-divisible paid amounts, EC-09's "first line is wrong and the rest is arithmetically correct" — these took deliberate design and were checked. A generator produces a table that "looks linear"; it does not reliably build the one that separates the definition from the surface rule.
- **Restraint.** The "cannot support" line written honestly; the LC-8 row that says *no item reaches this*; refusing a mastery claim; refusing a number. A generator optimises for a satisfying output; it does not leave the hole. This is a property of the reviewer, not the tool, and it is the property Track 1 identified as the moat (human-reviewed judgment + preservation claim + run-cost).
- **The mapping against a department's own assignments.** Requires the assignments, a reading of what each was written to measure (the Track-2 audit), and a judgment about delegability with its reason. Brisk holds the standards; it does not hold the teacher's intent.
- **A cost model that is eventually *reported* rather than modelled.** The `cost_status` field exists so that after ten classrooms the numbers are observations. A generator never learns what its items cost.

## 8. Verdict and the revisions it forced

**Verdict:** as a set of student pages, the sample *is* distinguishable from a good quiz bank only by small margins. As a ten-page document it is not — provided the reader reaches pp. 2, 3 and 9. The risk is a director who reads pp. 4–6 first and files it under "worksheets."

Revisions made during the build because of this teardown:

1. The **Evidence Map moved to page 2** and the student pages to 4–6, so the architecture is met before the items.
2. A **fresh-form page** (p. 9) was added with all 24 extra forms and the vary/fix/avoid rules — the single most "not a quiz" page, and the most immediately useful one.
3. The **LC-8 row** ("no short check reaches this claim") was kept on the map rather than dropped for tidiness. It is the sentence a generator will not write.
4. **"Reading a class at a glance"** (p. 3) was added: three response patterns and what each most likely means. It converts scores back into claims — the direction a quiz never travels.
5. The page-1 example was rewritten to include the **Track-2 falsification** in one sentence (a prediction sheet can itself be photographed), so the pack never implies process artifacts are the fix.

Not revised, and recorded: the sample still maps *typical* rather than *the teacher's own* assignments. That is the structural limit of a cold-sent artifact and the precise reason a paid version has something to add (08).
