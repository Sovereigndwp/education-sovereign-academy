# Submission form — copy

**Status:** draft for Dalia's approval · 2026-09-04. This is the text of the form, field by field, plus the three automated emails that follow it (confirmation, student-work refusal, deletion confirmation). It is built to be pasted into a Google Form or Tally with no software of our own. Field IDs map to the tracking sheet (06).

Design constraints carried from the plan: no student work, no student PII (§9); copyright bucket declared at submission (§9); consent for the audit is separate from consent for corpus use, and there is *no* model-training consent in this form at all (§9: never bundled — and there is nothing to train yet); withdrawal at any time (§9); the audit belongs to the teacher (§9).

---

## Form title

**Assessment Stress Test — send one assignment**

## Intro text (above the first field)

> Send us one assignment, task, or assessment you give students. Within 48–72 hours you get back a two-page read of it: what it's trying to measure, where a current AI model can now produce that evidence without the student doing the thinking, what reasoning has to stay visible, one redesigned version that keeps your objective and your point total, one way to verify it, and a short note on why — with an honest estimate of what the redesign costs you in class time and grading time.
>
> It's free. It's reviewed by a person (Dalia — secondary math teacher, The Sovereign Academy). We're doing the first 100 by hand to learn what teachers actually need, so there's a cap and we'll tell you if we've hit it.
>
> Three things before you start:
> - **Send the assignment, never student work.** No student responses, names, IDs, grades, or roster fragments. If any arrive we delete the whole submission without reading it and tell you.
> - **The audit is yours.** We don't share it with your department, school, or district without your written permission. You can have everything deleted at any time, no reason needed.
> - **This is a professional judgment, not a score.** There's no number, no "AI-proof" rating. There's a reason attached to every finding, and you'll be asked to tell us where we got it wrong.

---

## Section A — About you

| # | Field (as shown) | Type | Required | Sheet column |
|---|---|---|---|---|
| A1 | First name | short text | yes | `teacher_name` (kept out of the analysis sheet; see 06) |
| A2 | Email (for returning the audit — nothing else) | email | yes | `teacher_email` (same) |
| A3 | Your role | single choice: Classroom teacher · Department chair · Instructional coach · Administrator · Other | yes | `role` |
| A4 | Subject of this assignment | single choice: Algebra 1 · Geometry · Algebra 2 · Precalculus · Statistics · Other math · English / ELA · History / Social studies · Other | yes | `subject` |
| A5 | Grade band | single choice: 6–8 · 9–10 · 11–12 · Mixed | yes | `grade_band` |
| A6 | School type | single choice: Public · Charter · Independent / private · International · Other | yes | `school_type` |
| A7 | State or country (optional — for the aggregate report only) | short text | no | `region` |
| A8 | How did you hear about this? | single choice: A teacher I know · Email from Dalia · Reddit · Facebook group · Conference / workshop · Other | yes | `channel` |
| A9 | If a teacher referred you, who? (first name is enough — so we can thank them) | short text | no | `referred_by` |

---

## Section B — The assignment

| # | Field (as shown) | Type | Required | Sheet column |
|---|---|---|---|---|
| B1 | Upload the assignment (PDF, Word, Google Doc link, or a photo) — **or** paste it in the box below | file upload / long text | one of the two | `format` |
| B2 | Give it a title (what you call it) | short text | yes | `assignment_title` |
| B3 | What kind of task is it? | single choice: Take-home task · Homework set · Project · In-class test or quiz · Essay · Document-based question (DBQ) · Lab or investigation · Presentation · Other | yes | `assignment_type` |
| B4 | Roughly how long? (points, pages, or words — whatever you use) | short text | yes | `length` |
| B5 | Unit or topic, in a few words | short text | yes | `topic` |

### B6 — Who wrote it? (required)

Shown text:

> We handle assignments differently depending on who owns them. Pick the closest:
>
> ○ **I wrote it** (or my co-teachers and I did). We can audit it and — if you agree below — learn from it in aggregate.
> ○ **My district or department mandates it** (a common assessment, a curriculum-provided task). We audit it for you; we keep only abstract descriptions (task type, verbs, demand level) — never the text.
> ○ **It comes from a textbook or publisher** (including College Board / state-released items). We audit it for you as fair-use analysis and keep nothing from it.
> ○ **Mixed** — e.g. my prompt and rubric, publisher documents. Tell us which parts are yours below.

| # | Field | Type | Required | Sheet column |
|---|---|---|---|---|
| B6 | (the choice above) | single choice | yes | `authorship_bucket` |
| B6a | If mixed: which parts did you write? | short text | if B6 = Mixed | `mixed_bucket_notes` |
| B7 | ☐ I have the right to share this assignment for review. | checkbox | yes | `rights_confirmed` |

### B8 — No student work (required)

Shown text:

> ☐ **This contains no student work and no student information** — no responses, names, initials, ID numbers, grades, or class lists. (If you're unsure, take a second look before ticking. If something slips through we'll delete the whole submission unread and email you.)

Sheet column: `student_work_declared_absent`.

---

## Section C — In your words (optional)

Shown text:

> **Optional.** Is there anything about this assignment that's been on your mind? A sentence or two, in your own words. Leave it blank if nothing comes to mind — a blank here is useful to us too.

| # | Field | Type | Required | Sheet column |
|---|---|---|---|---|
| C1 | (the box) | long text | no | `worry_verbatim`; set `worry_prompted` = `form-field` if filled here |

> **Note to Dalia — this field is a design conflict.** §8 sets a pass threshold of "≥ 50% volunteer a written worry *unprompted*." A form field is a prompt. Two options, pick one before launch:
> **(i)** Keep the field (more data, cleaner sheet) and re-label the §8 metric as "volunteered a worry in the optional field or in email." Honest but weaker.
> **(ii)** Drop the field; count only worries that arrive in the email or upload note unasked. Purer signal, fewer words, and you'll be tempted to ask in the reply — which then has to be logged as `asked-in-followup`.
> I lean (ii) for Phases 0–1 and (i) from Phase 2 if the email channel produces nothing. Either way the sheet records *how* the worry arrived (`worry_prompted`) so the metric can be computed both ways.

---

## Section D — Consent (required)

Shown text, three separate checkboxes; none pre-ticked; the first is required to submit, the second and third are genuinely optional and the form must work without them:

> ☐ **Required.** I understand that: the audit I receive is mine and will not be shared with my department, school, or district without my written permission; I can ask for the assignment and the audit to be deleted at any time, for any reason or none, by emailing [address]; the audit is a professional judgment, not a measurement, and is not an evaluation of me or my teaching.
>
> ☐ **Optional.** If I said I wrote this assignment, you may include it in your corpus and use it — de-identified — to find patterns across assignments and publish aggregate reports. Aggregate reports never contain my name, school, or a recognisable version of my assignment, and are only published for a subject/grade group once at least 20 teachers are in it. (If you chose "district-mandated," only abstract descriptions are kept; if "publisher," nothing is kept; this box changes nothing in those cases.)
>
> ☐ **Optional.** You may email me when the aggregate report for my subject and grade is ready, and once more if a paid department option becomes available. Nothing else.

| # | Sheet column |
|---|---|
| D1 | `consent_audit` (must be true) |
| D2 | `consent_corpus` |
| D3 | `consent_contact_followup` |

**Not on this form, deliberately:** any consent to use submissions to train a model. §9 says that consent must be separate and explicit if it is ever sought. Nothing is being trained; asking now would be a bundled ask by another name. If that changes, it is a new email, a new checkbox, and a new decision by Dalia.

---

## Submit button and thank-you screen

Button: **Send the assignment**

Thank-you screen:

> Got it. You'll hear from Dalia within 48–72 hours (weekends may stretch that; we'll say so). If we hit the 100-assignment cap before we get to yours, you'll get an email saying so within a day, not silence.
>
> If you realise you attached something with student work in it, reply to the confirmation email and say so — we'll delete it before anyone opens it.

---

## Email 1 — Confirmation (sent automatically on submission)

Subject: **Received: "[assignment_title]" — back to you in 48–72 h**

> Hi [first name],
>
> Your assignment "[assignment_title]" arrived. I'll read it myself and send the two-page audit within 48–72 hours.
>
> Reminders of the rules I'm holding myself to:
> - The audit is yours. It doesn't go to your department or school unless you say so in writing.
> - You can have it and the assignment deleted at any time — just reply "delete."
> - If anything in the file turns out to contain student work or student information, I'll delete the whole submission without reading further and let you know, so you can resend a clean version.
>
> When the audit comes, the single most useful thing you can do is tell me where I got the objective wrong. That correction is the point.
>
> Dalia
> The Sovereign Academy

---

## Email 2 — If student work arrives (sent by Dalia, same day)

Subject: **Deleted unread: "[assignment_title]" contained student work**

> Hi [first name],
>
> The file you sent for "[assignment_title]" contained [student responses / names / a grade list — say which, without quoting it]. I've deleted the whole submission — file and form entry — and haven't audited any of it. This email is your written confirmation of that deletion, dated [date].
>
> If you'd like the audit, please resend just the assignment as you hand it to students — the blank task, the rubric, the document packet if there is one. Nothing a student wrote.
>
> No harm done; this is the most common slip and it's why the rule is repeated everywhere.
>
> Dalia

Tracking: set `student_work_present` = true, `deleted_date`, `deletion_confirmed_date`; status → `refused-student-work`; the submission stays in the count as a refusal, not a submission.

---

## Email 3 — Deletion on request (sent by Dalia within 24 h of the request)

Subject: **Deleted: your assignment and audit**

> Hi [first name],
>
> Done. "[assignment_title]", the audit, and your form entry are deleted as of [date/time]. [If corpus consent had been given: "It has also been removed from the corpus; it will not appear in any aggregate work from here on. If an aggregate report was already published with it in the count, that report isn't changed — but nothing in it identifies you or the assignment."]
>
> No reason needed, and none asked. Thanks for trying it.
>
> Dalia

Tracking: `withdrawal_requested_date`, `deletion_completed_date`; status → `withdrawn`. The row's *metadata* (channel, dates, bucket, band) is retained without the text or name unless the teacher asks for the row itself to go — say so in the email if they ask.

---

## What this form does not do — and why

- **No login, no account.** A form and an email. Software is Phase 2+ at the earliest (locked decision 5).
- **No open-tracking pixel.** The plan lists "opened" as a behavioral signal; email opens are unreliable and pixel tracking sits badly with "the audit is yours." Record `reply_received` instead and mark `opened` as unknown. Flagged in 06.
- **No file-scanning for PII.** Dalia reads every file before auditing; the check is human. If volume ever justifies automation, that's a separate decision.
- **No school name field.** Not needed for the audit, and it is the easiest route to re-identifying a teacher in an aggregate report. `school_type` + `region` + `grade_band` are enough for the corpus and are why the N ≥ 20 rule exists.
