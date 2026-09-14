# 09 — Provenance and hypothesis log (Part 7)

**Purpose:** preserve how the direction changed, so Tracks 1 and 2 are read as evidence of prior hypotheses rather than rewritten as if Track 3 was always the plan. Nothing in Tracks 1–2 has been edited.

| Date | Hypothesis | Where it lives | Status |
|---|---|---|---|
| ≤ 2026-09-02 | **Teacher Time Back** — teacher-efficiency workflows (work-package agent). | `TEACHER-TIME-BACK-ARCHITECTURE.html`, `TEACHER-WORK-MAP*.html` | Superseded when Brisk shipped Curriculum Intelligence, the claimed differentiator (CONTEXT.md). |
| 2026-09-03 | **H1 — Assessment Stress Test.** Audit a teacher's *assignment* (never student work) and redesign it so student thinking is visible again; one verification mechanism per redesign (prediction checkpoint, selected-evidence step, worked-reasoning artifact, defence questions). Six locked decisions. | `ASSESSMENT-STRESS-TEST-PLAN.html`, `CONTEXT.md` | **Falsified in part** (below). The locked decisions survive: no score; assignments only; audit belongs to the teacher; service first; free deliverable is real value. |
| 2026-09-04 | **Track 1** — competitive teardown. Turnitin Clarity writing-only; MagicSchool/CK-12 ship free "AI-resistant assignment" generators; moat is human-reviewed judgment + preservation claim + run-cost, sold through the PD line; reopen decision 4 to 40/60. | `Track-1-Competitive-Teardown/` | Stands. Track 3 inherits the moat definition and the cost finding. |
| 2026-09-04 | **Track 2** — the stress-test kit: template, two worked audits, form, outreach, tracking, sprint offer, 31-item approval checklist. Pushbacks recorded there. | `Track-2-Stress-Test-Kit/` | Stands as a kit. Its worked math example is what exposed the falsification. |
| 2026-09-04 | **Falsification of H1's mechanism.** Any verification mechanism that exists only as *information* — a prediction checkpoint, evidence card, reasoning artifact, draft, outline, revision log — can itself be photographed or uploaded and used as context for AI to produce subsequent work consistent with it. Process artifacts expose process; they do not secure it. | This file; kickoff for Track 3; `01-ONTOLOGY-v0.1.md` §1.3 (feed-forward rule) | **Established as a design constraint.** Independently consistent with Corbin, Dawson & Liu (2025): only structural change carries assurance. |
| 2026-09-04 | **H2 — Composable Evidence Architecture.** Stop trying to make assignments "AI-resistant." Separate the functions conventional assignments bundle — Practice, Production, Evidence — and add short, independent, fresh, claim-targeted checks where the desired inference is otherwise weak. Build a small ontology that generates a free sample product. | `Track-3-Evidence-Architecture/` | **Current.** Ontology v0.1; sample pack v0.1; stress tests 04/07/08. |

## Current uncertainty, stated so the product cannot outrun it

1. **Sufficiency is not established.** We can say when an observation is *independent evidence* for a claim (three conditions: independent, fresh, aimed — 01 §2). We cannot say how many such observations, at what consistency, justify "mastery" of a claim, a unit, or a course. Therefore every check states what it *cannot* support; the product uses "Independent Evidence of Learning," never "minimum sufficient evidence"; no reliability or weight field exists in the schema (04 §5); and p. 3 tells the teacher to aggregate across the unit, not within an item.
2. **All costs are modelled.** No teacher has run a check. `cost_status` is `modeled` on every item.
3. **Delegability is a judgment.** Three values with reasons, never checked against a model run in this track (the Track-2 "Checked by" question, item 3 on its approval list, is still open).
4. **Demand is not tested.** The plan's behavioural gates (§6–§8) have not run. Track 1's reading — math is the competitive whitespace and possibly a demand desert — is unchanged by anything here; the kickoff's structural argument for math (variants and transfer items are cheap to generate, administer simultaneously, score quickly) is *confirmed on the build side* (12 items, 36 keys, ~2 hours of review) and *untested on the demand side*.
5. **LC-8-type claims** (judgment over data; extended problem solving) have no cheap independent check. The architecture says so. How a department gets evidence for them — supervised extended tasks, short conversations — is a design problem not addressed here.

## What was inherited without re-research

Per the research rule: Title II figures, teacher-hour figures, the 40%/14% Learning First figures, Turnitin/Brisk/MagicSchool positioning and pricing, the $6–15k sprint anchor, teacher-language findings — all from CONTEXT.md and Tracks 1–2, none re-verified. External research in Track 3 was limited to: verifying the assessment-science terms used (ECD; NRC assessment triangle; the two-lane approach; Corbin et al. 2025; Barnett & Ceci 2002; AIAS; erroneous examples; learner-generated examples; hinge questions) and confirming that exit-ticket generators are a free commodity.

## What must not be read into this track

- That Tracks 1–2 were wrong. The audit-the-assignment offer is intact; what changed is the *mechanism* recommended inside it. The Evidence Architecture is what a Track-2 audit should now recommend in Section 5 instead of a single information-based mechanism.
- That the sample proves anything about demand. It proves the architecture can generate a usable artifact for one topic in one course.
- That "Practice / Production / Evidence" is a contribution. It is a teaching vocabulary over an established structure (ECD; secured vs open assessment). The contribution, if it survives contact with teachers, is operability at exit-ticket grain with cost and scope stated.
