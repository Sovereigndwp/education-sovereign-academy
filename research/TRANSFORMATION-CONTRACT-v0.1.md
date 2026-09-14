# Assignment Studio — Transformation Contract v0.1

**Issued by the owner (Dalia) · 2026-09-05 · status: GOVERNING**
Supersedes the machine-drafted contract of the same date (now `references/TRANSFORMATION-CONTRACT-machine-draft-SUPERSEDED-2026-09-05.md`) and the uniform seven-invariant scheme in `ASSIGNMENT-STUDIO-MIGRATION-PLAN.md`.
Implementation: `~/projects/sovereign-academy-hub/assignment-studio/` (contract-as-code in `functions/_shared/contract.ts`).

Posture: avoid unnecessary governance, research and infrastructure work before there is something credible to demonstrate and sell. Challenge this contract only on a concrete implementation or instructional-validity problem.

---

## Product promise

Bring an assignment you already trust. Assignment Studio adapts it for the students in front of you while protecting what you intended them to learn.

## Transformation modes (first sellable product — exactly three)

1. **Support** — improve access without making the intellectual task easier.
2. **Advanced** — deepen the same learning rather than merely adding more work.
3. **Make Thinking More Visible** (AI-era redesign) — make the student's reasoning more observable while preserving the learning target and avoiding unreasonable additional teacher workload.

Language Support is **not** a separate mode yet. Some language-related supports may exist inside Support where appropriate.

## Core Learning Contract

Before transformation, infer and show the teacher:

- **Learning target** — what students must understand.
- **Required thinking** — what students must actually do cognitively.
- **Required evidence** — what must appear in the work for the teacher to know the learning occurred.
- **Teacher constraints** — time, format, grading burden, curriculum requirements or other constraints supplied by the teacher.

The teacher must **Confirm or Correct** this before transformation. Teacher confirmation governs the transformation.

Do not build a more complicated ontology unless actual implementation demonstrates that these four fields are insufficient.

## Transformation permissions

### SUPPORT

Must preserve: core learning target · essential cognitive demand · required evidence of learning · factual/mathematical correctness.

May adapt: directions · chunking · sequencing · vocabulary support · visual organization · scaffolds · irrelevant language burden · response format when the format is not itself being assessed · examples · checkpoints.

Must not: give away reasoning being assessed · remove essential thinking · substitute recall for analysis/application · solve the difficult part for the student.

### ADVANCED

Must preserve: relationship to the original learning target · prerequisite knowledge · factual/mathematical correctness.

May intentionally extend: cognitive demand · abstraction · transfer · ambiguity · justification · comparison · generalization · interacting variables.

Must not: merely add more questions · increase workload without increasing depth · introduce unrelated content and call it enrichment.

### MAKE THINKING MORE VISIBLE

Must preserve: learning target · intended cognitive demand · required evidence · reasonable teacher workload.

May adapt: question structure · sequence · context · intermediate reasoning requirements · prediction · error analysis · reflection · brief verification · personalization of inputs · process evidence.

Must not: claim to be AI-proof · depend on AI detection · use surveillance as verification · turn everything into oral defense · create disproportionate grading burden · confuse inconvenience with assessment validity.

## Preservation status

For important elements of the Learning Contract, use only:

- `PRESERVED`
- `ADAPTED_AS_PERMITTED`
- `INTENTIONALLY_EXTENDED`
- `REVIEW_REQUIRED`

Do not manufacture certainty. `REVIEW_REQUIRED` is an acceptable and important result.

## Teacher-facing preservation trace

Every transformation shows: **What we changed · What we protected · Why · Check this.**

"Check this" contains anything the system is uncertain it preserved or any transformation that could plausibly alter the construct. Keep it concise — product transparency, not an audit report.

## Signature feedback

After a teacher reviews a transformation, ask:

> Did this version change something students need to know, think through, or demonstrate that you wanted preserved? **No / Yes.**

If Yes, capture the teacher's correction.

Preserve the chain:
original assignment → inferred Learning Contract → teacher-confirmed Learning Contract → requested transformation → machine output → preservation trace → teacher edit/correction → acceptance/use.

This is strategically important product data.

## MVP workflow (build toward exactly this)

Upload assignment → infer Learning Contract → teacher Confirm/Correct → choose Support / Advanced / Make Thinking More Visible → optionally provide classroom constraints/support requests → Transform → Original vs New Version → What changed / What we protected / Check this → Edit / Download Word / Print-PDF → preservation feedback → Transform another assignment.

Do not add features unless they are necessary to make this workflow credible.

## Gold harness

Do not wait for a 36-assignment corpus. Start with four gold assignments — Grade 5 Math · Grade 8 ELA · Grade 8 Science · Grade 10 Social Studies — and run all three modes against them = 12 initial transformation cases.

The gold record defines the Learning Contract and transformation boundaries. Human review remains the ground truth. If those expose a fundamental contract problem, fix it before continuing. Otherwise build the working workflow and expand the harness toward 12 assignments in parallel with administrator outreach.

## Monetization target

No longer optimizing for a $49 teacher report. Design so the owner can credibly offer a **Founding School Pilot**: initially ~$2,500 for ~four weeks / one department / up to ~15 teachers. Price and limits are hypotheses.

The product must make it possible to measure: assignment uploads · Learning Contract confirmation/correction · requested transformation · transformation acceptance · teacher edits · preservation corrections · exports · reported/confirmed classroom use · repeat assignments.

Question being answered: do teachers repeatedly use the transformation workflow, and will a school pay to continue it?

## Explicitly NOT built yet

marketplace · student accounts · student-facing AI · LMS integration · SSO · rostering · standards database · district dashboard · grading engine · IEP/504 management · disability diagnosis/inference · persistent Class Profile · automated release · elaborate agent architecture · 36-item benchmark before outreach · individual $49 checkout funnel improvements.

Reuse the Stress Test infrastructure wherever it accelerates this workflow. Do not preserve its old architecture merely for reuse if it makes this simpler product harder to build.

## Decision rules for the builder

Cheap-to-reverse decisions: use judgment and proceed. Stop for the owner only when a decision: materially changes the product promise · creates a privacy/student-data issue · changes production/canonical content · requires spending money or publishing externally · or the four gold cases reveal that the transformation contract itself is unsound.

The goal is a credible product to demonstrate and sell to a school, not a more complete planning system.
