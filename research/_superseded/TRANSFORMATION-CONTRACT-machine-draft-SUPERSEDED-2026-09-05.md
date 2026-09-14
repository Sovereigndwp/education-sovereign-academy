# Assignment Studio — Transformation Contract v0.1

**2026-09-05 · for owner review before any implementation · status: DRAFT**
**Supersedes:** the uniform seven-invariant pass/adjusted/violated scheme in the migration plan.

The contract answers one question for every transformation: *what must remain invariant, what may legitimately change, and what are we deliberately extending?* A generated version is judged only against the permissions its version type was granted. A change the contract permits is never a preservation failure; a change it does not permit blocks release even if a reviewer likes the result.

Everything below is data, not prose: the schema is what the engine receives, what it must emit, and what the benchmark and the pilot store. The prose sections explain the rules the schema encodes.

---

## 0 · Principles the contract enforces

1. **Transformation, not generation.** Every output is derived from one teacher-supplied artifact and one teacher-confirmed intent map. The engine never invents a learning target.
2. **Teacher as instructional authority.** The intent map is a hypothesis until the teacher confirms or corrects it. No transformation runs on an unconfirmed intent map.
3. **Instructional requests, never learner characteristics.** The engine accepts *transformation requests* (chunked directions, reduced language load, alternate response format, enrichment…), *approved accommodations the teacher already holds* (verbatim, preserved), and *classroom constraints*. It has no field for a disability, diagnosis, label, or student identity, and no rule anywhere maps a characteristic to a transformation. If a request arrives phrased as a characteristic ("for my dyslexic students"), the engine asks for the instructional request instead of inferring one.
4. **Permissions are per version type.** The same invariant is `preserve` for a Support version and `intentionally_extend` for an Advanced version. The contract, not the reviewer, decides which.
5. **Evidence over readability.** Reading-level and length deltas are recorded as telemetry. Preservation of cognitive demand and required evidence is judged against the intent map and, in the benchmark, against gold — never against a formula.
6. **Everything is versioned.** No generated artifact exists without the tuple that produced it (§7).

---

## 1 · Vocabulary

### 1.1 The seven invariants (`invariant_id`)

| id | Meaning | Where it comes from |
|---|---|---|
| `objective` | The knowledge/reasoning the teacher intends the assignment to develop or measure | intent map, teacher-confirmed |
| `cognitive_demand` | The kind and level of thinking required (recorded as a named band, see 2.2) | intent map, teacher-confirmed |
| `required_evidence` | The observable student products/moves that constitute evidence of the objective | intent map, teacher-confirmed |
| `standards_alignment` | Named standard(s), only when supplied | teacher input (string), optional |
| `teacher_constraints` | Time, grading capacity, materials, format limits the teacher states | teacher input |
| `accommodation_boundaries` | Approved accommodations the teacher supplies and requires preserved | teacher input, verbatim |
| `comparability` | Whether results on this version can be read alongside results on the core version (same objective, same evidence, same demand band) | derived: true only if objective, cognitive_demand and required_evidence are all `preserve` and held |

### 1.2 Permission levels (`permission`)

| value | Meaning |
|---|---|
| `preserve` | Must hold unchanged. Any drift is out of permission. |
| `may_adapt` | May change within a named scope (the `scope` list on the permission), provided every `preserve` invariant still holds. |
| `intentionally_extend` | The version *should* change this, in a stated direction. Failing to extend is as much a defect as over-extending. |
| `not_applicable` | Not evaluated for this version type. |

### 1.3 Change dimensions (`dimension`)

Every recorded change is tagged with exactly one: `wording · scaffolding · sequencing · format · modality · context · supports · challenge · verification · quantity · language_load · packaging`.

`quantity` (number of items/length) is named separately because "more of the same" is the most common counterfeit of `challenge`.

### 1.4 Outcomes the trace records per invariant (`outcome`)

| value | Meaning |
|---|---|
| `held` | Invariant unchanged (for `preserve`) |
| `adapted_within_permission` | Changed, and the change is inside the stated `scope` (for `may_adapt`) |
| `extended_as_intended` | Changed in the required direction (for `intentionally_extend`) |
| `out_of_permission` | Changed where `preserve` applied, or outside `scope`, or not extended where `intentionally_extend` applied |
| `not_applicable` | — |

**Release rule:** any `out_of_permission` blocks machine release. Dalia may override, and the override is recorded as a human disposition with reason (§7). Nothing else blocks.

---

## 2 · Inputs

### 2.1 Intent map (teacher-confirmed)

```json
{
  "intent_map_version": "0.1",
  "objective": "Solve a system of two linear equations and justify the choice of method.",
  "cognitive_demand": { "band": "DOK3", "descriptor": "strategic thinking: choose and justify a method", "confidence": "teacher_confirmed" },
  "required_evidence": [
    { "id": "E1", "evidence": "a correct solution to each system", "form": "written work" },
    { "id": "E2", "evidence": "a stated method choice", "form": "written statement" },
    { "id": "E3", "evidence": "a justification connecting the method to the structure of the system", "form": "1–3 sentences" }
  ],
  "construct_notes": {
    "language_is_construct": false,
    "format_is_construct": false,
    "fluency_is_construct": false,
    "notes": "Algebraic reasoning is the target; reading load is incidental."
  },
  "standards": ["HSA-REI.C.6"],
  "draft_vs_confirmed": { "objective_changed": false, "band_changed": true, "evidence_added": ["E3"], "evidence_removed": [] }
}
```

Notes. `band` uses Webb's DOK 1–4 as a shared label the teacher can confirm; it is a label, not a measurement, and the `descriptor` is what the engine actually reasons with. `construct_notes` are the switches that change permissions in §3 (see 3.3 and 3.4). `draft_vs_confirmed` is the intent-correction record and is kept forever.

### 2.2 Transformation request (teacher-supplied)

```json
{
  "versions_requested": ["substitution_check", "core", "support", "advanced", "teacher_pack"],
  "supports_requested": ["chunked_directions", "vocabulary_support", "structured_work_space"],
  "prescribed_accommodations": ["Extended time (1.5x) on all written tasks", "Directions read aloud"],
  "constraints": { "class_minutes": 42, "grading_capacity": "no additional grading", "materials": "paper only", "notes": "" },
  "language_support": { "requested": false, "home_language": null },
  "advanced": { "requested": true, "direction_hint": "compare methods" }
}
```

Allowed `supports_requested` values (closed list, all phrased as instructional moves): `chunked_directions · reduced_language_complexity · vocabulary_support · visual_supports · reduced_visual_clutter · alternate_response_format · executive_function_checkpoints · language_scaffolds · extended_processing_structure · sentence_starters · reduced_transcription · tts_compatible_structure · worked_example · structured_work_space`. And for Advanced: `enrichment · greater_abstraction · transfer_challenge · open_extension · method_comparison · error_analysis`.

There is no field for learner characteristics. `prescribed_accommodations` is free text the teacher already holds; the engine preserves and operationalises it and never generates entries for it.

---

## 3 · Version types and their permission tables

Format: **invariant → permission (scope)**. Scope lists name the change dimensions allowed under `may_adapt`.

### 3.1 Substitution Check — *diagnostic; observes the original, transforms nothing*

| invariant | permission |
|---|---|
| all seven | `not_applicable` |

Rules. Output is an analysis of the *original* only: for each item, what evidence a correct answer actually provides; the six finding types from the Stress Test (`construct_mismatch`, `shortcut_available`, `right_answer_wrong_model`, `distractors_uninformative`, `reasoning_invisible`, `ai_substitutable` with its three bands); the explicit "no strong evidence of a problem" outcome; strength as a named judgment, never a number. It *may propose* a stronger item for any finding, but the proposal is advisory input to Core, not a version. It never edits the artifact.

### 3.2 Core Redesign — *same assignment, evidence made harder to counterfeit*

| invariant | permission |
|---|---|
| `objective` | `preserve` |
| `cognitive_demand` | `preserve` |
| `required_evidence` | `preserve` — every `E*` must still be elicited; the engine may add a verification move only if it elicits an existing `E*`, not a new one |
| `standards_alignment` | `preserve` |
| `teacher_constraints` | `preserve` — a Core that needs more grading than the constraint allows is out of permission |
| `accommodation_boundaries` | `preserve` |
| `comparability` | `preserve` (must remain comparable to the original) |
| may change | `wording · sequencing · context · verification · format` — with `format` limited to changes that make an existing `E*` observable |

Rules. Item count and numerical/textual difficulty stay in band; `quantity` changes are out of permission. Substitution findings are addressed by making evidence visible, not by adding items. If the Substitution Check found no strong evidence of a problem, Core may be a null transformation ("no change recommended") and that is a valid, releasable output.

### 3.3 Support Version — *same target, different access route*

| invariant | permission |
|---|---|
| `objective` | `preserve` |
| `cognitive_demand` | `preserve` |
| `required_evidence` | `preserve` — the *evidence* is preserved; its *form* may adapt only where `format_is_construct` is false and the teacher requested `alternate_response_format` |
| `standards_alignment` | `preserve` |
| `teacher_constraints` | `preserve` |
| `accommodation_boundaries` | `preserve` and operationalise (each prescribed accommodation must appear in the version or the teacher pack as a concrete provision) |
| `comparability` | `preserve` |
| may adapt | `scaffolding · sequencing · format · modality · supports · wording · language_load(incidental only) · packaging` — each only if the corresponding support was requested |

Rules. Scaffolds may structure the path to the evidence; they may not supply it (a sentence starter that contains the justification is out of permission on `required_evidence`). Worked examples must use a *different* system/text/data from the assessed items. Vocabulary support defines terms that are incidental; it does not define the term whose meaning is being assessed. Chunking never removes a step that carries evidence. If a requested support would require lowering the band (e.g. "reduce to one-step problems"), the engine refuses that support, says so in the trace, and offers the nearest in-permission alternative.

### 3.4 Language-Support Version — *reduce language load that is incidental to the construct*

| invariant | permission |
|---|---|
| `objective` | `preserve` |
| `cognitive_demand` | `preserve` |
| `required_evidence` | `preserve`; `form` may adapt (e.g. permit a diagram + labels where prose was incidental) **unless** `language_is_construct` |
| `standards_alignment` | `preserve` |
| `teacher_constraints` | `preserve` |
| `accommodation_boundaries` | `preserve` |
| `comparability` | `preserve` |
| may adapt | `language_load · wording · supports (glossary, bilingual labels, sentence frames) · modality · packaging · sequencing` |

**Construct switch.** If `language_is_construct` is true (an ELA evidence paragraph where sentence-level academic writing *is* E2, a world-language task), then `language_load` on the assessed component becomes `preserve`; supports may apply only to directions, context, and non-assessed components, and the trace must name which components were treated as assessed. Home-language glossaries and bilingual directions are always in permission; translating the assessed prompt itself is in permission only when the teacher requested it and language is not the construct. Spanish output is reviewed by a bilingual human before release (pilot rule, not contract rule).

### 3.5 Advanced Version — *same target, deliberately deeper*

| invariant | permission |
|---|---|
| `objective` | `preserve` (the *target* is the same; the reach is greater) |
| `cognitive_demand` | `intentionally_extend` — direction: up one band, or within band toward transfer/abstraction/justification; never sideways into unrelated content |
| `required_evidence` | `intentionally_extend` — all original `E*` remain elicited **and** at least one new `E*` is added that requires the extension (comparison, generalisation, transfer, evaluation) |
| `standards_alignment` | `preserve` (same standard; may note a natural successor standard) |
| `teacher_constraints` | `preserve` — an Advanced version the teacher cannot grade within the constraint is out of permission |
| `accommodation_boundaries` | `preserve` (advanced learners may also hold accommodations) |
| `comparability` | `not_applicable` — results are not read alongside Core |
| may change | `challenge · context · verification · format · sequencing · wording`; `quantity` is out of permission unless the added items *are* the extension |

Rules. "More problems" is out of permission on `challenge`. The extension must be nameable in one sentence in the trace ("students must determine when substitution is preferable to elimination and defend the criterion"). The engine must be able to state what a student who completes Advanced has shown that a Core student has not.

### 3.6 Teacher Pack — *supports measurement and implementation; not a student task*

| invariant | permission |
|---|---|
| `objective`, `cognitive_demand` | `not_applicable` as transformation targets; `preserve` as **referents** — every rubric criterion must map to an `E*` or to the Advanced extension evidence |
| `required_evidence` | `preserve` as referent: the key/rubric must score each `E*` and nothing that is not an `E*` (a rubric line for "neatness" is out of permission unless the teacher added it) |
| `standards_alignment` | `preserve` as referent |
| `teacher_constraints` | `preserve` — the verification mechanism and grading guide must fit the stated grading capacity; the pack states its own review-time estimate |
| `accommodation_boundaries` | `preserve` — each prescribed accommodation appears as an implementation note |
| `comparability` | `not_applicable` |
| contents | answer key (math/facts recomputed), rubric or checking guide keyed to `E*`, one verification mechanism (exactly one, chosen to fit constraints: prediction checkpoint, selected-evidence step, worked-reasoning artifact, or 2–3 defence questions), exemplar where useful, implementation map (which version to which group, in the teacher's words from the request), time estimate original vs new |

Rules. The pack is evaluated for correctness, alignment to `E*`, and fit to constraints — not as a student artifact. Factual/mathematical errors are release-blocking regardless of permissions.

### 3.7 Student Pack — *packaging only*

`packaging` is the only dimension; every other invariant is `preserve` relative to the version it packages. No content generation; if the packager needs to reflow a table, that is `format` and must be noted.

### 3.8 Permission matrix (summary)

| invariant \ version | Sub. Check | Core | Support | Lang-Support | Advanced | Teacher Pack |
|---|---|---|---|---|---|---|
| objective | n/a | preserve | preserve | preserve | preserve | referent |
| cognitive_demand | n/a | preserve | preserve | preserve | **extend** | referent |
| required_evidence | n/a | preserve | preserve (form may adapt*) | preserve (form may adapt†) | **extend** | referent |
| standards | n/a | preserve | preserve | preserve | preserve | referent |
| teacher_constraints | n/a | preserve | preserve | preserve | preserve | preserve |
| accommodations | n/a | preserve | preserve + operationalise | preserve | preserve | preserve + notes |
| comparability | n/a | preserve | preserve | preserve | n/a | n/a |

\* only if `format_is_construct` = false and the teacher requested `alternate_response_format` · † only if `language_is_construct` = false

---

## 4 · The preservation trace (what every version must emit)

```json
{
  "trace_version": "0.1",
  "version_type": "support",
  "contract_version": "0.1",
  "permissions_applied": {
    "objective": { "permission": "preserve" },
    "cognitive_demand": { "permission": "preserve" },
    "required_evidence": { "permission": "preserve", "form_may_adapt": true, "reason": "format_is_construct=false; alternate_response_format requested" },
    "standards_alignment": { "permission": "preserve" },
    "teacher_constraints": { "permission": "preserve" },
    "accommodation_boundaries": { "permission": "preserve" },
    "comparability": { "permission": "preserve" },
    "adapt_scope": ["scaffolding", "sequencing", "format", "supports", "wording"]
  },
  "invariant_outcomes": {
    "objective": { "outcome": "held", "evidence": "Both systems and the justification prompt are unchanged in substance." },
    "cognitive_demand": { "outcome": "held", "evidence": "Method still chosen by the student; no method is named or hinted in the scaffold." },
    "required_evidence": { "outcome": "adapted_within_permission", "evidence": "E3 may be answered in a two-row table (method / because) instead of free prose.", "per_evidence": { "E1": "held", "E2": "held", "E3": "form_adapted" } },
    "standards_alignment": { "outcome": "held" },
    "teacher_constraints": { "outcome": "held", "evidence": "No additional items; grading guide unchanged." },
    "accommodation_boundaries": { "outcome": "held", "evidence": "Extended time and read-aloud noted in implementation map." },
    "comparability": { "outcome": "held" }
  },
  "changes": [
    { "dimension": "scaffolding", "what": "Directions split into three numbered steps.", "touches": ["cognitive_demand"], "permitted": true, "why": "Sequencing the task does not sequence the reasoning; the method choice remains open." },
    { "dimension": "supports", "what": "Glossary: coefficient, eliminate, substitute.", "touches": ["required_evidence"], "permitted": true, "why": "Terms are incidental; none is the object of assessment." },
    { "dimension": "format", "what": "Justification collected in a two-row table.", "touches": ["required_evidence"], "permitted": true, "why": "E3 still requires a stated method and a structural reason." }
  ],
  "preserved": [
    { "invariant": "required_evidence", "what": "Students must still solve both systems, state a method, and justify it by the system's structure." },
    { "invariant": "cognitive_demand", "what": "Equation complexity unchanged; method not supplied." }
  ],
  "extensions": [],
  "refused_requests": [
    { "request": "reduce to one-step problems", "reason": "Would lower cognitive_demand, which is preserve for this version.", "alternative_offered": "worked example on a different system + structured work space" }
  ],
  "telemetry": { "reading_level_delta": -1.8, "word_count_delta": 0.12, "item_count_delta": 0 },
  "time_estimate": { "prep_minutes_original": 0, "prep_minutes_new": 3, "review_minutes_original": 25, "review_minutes_new": 25, "basis": "same items, same rubric; table speeds reading of E3" },
  "release": { "machine_releasable": true, "blocking": [] }
}
```

For Advanced, `extensions` is required and non-empty: `[{ "invariant": "cognitive_demand", "from": "DOK3", "to": "DOK3→4", "what": "…" }, { "invariant": "required_evidence", "added": { "id": "E4", "evidence": "a criterion for when each method is preferable, defended with an example" } }]`.

For the Substitution Check the trace is replaced by the finding list (existing schema) plus `no_strong_evidence` and the per-item evidence map.

**Rendering.** The teacher sees three columns — *What changed · What did not · Why* — generated from `changes`, `preserved`, and the `why` fields. `refused_requests` renders as a fourth, quieter block: *What we didn't do, and why*. This is the honesty the product is selling.

---

## 5 · Evaluation against the contract (harness rules)

The 12-item gold harness scores each generated version on four questions, in this order of authority:

1. **Permission compliance (automatic, from the trace):** any `out_of_permission`? Any change tagged `permitted:false`? Any `preserve` invariant whose outcome is not `held`? For Advanced, is `extensions` non-empty and does it name a new `E*`?
2. **Gold agreement (model-graded against human gold, then human-sampled):** does the version still elicit each gold `E*`? Is the demand band as gold expects for this version type (equal for Core/Support/Lang; higher or deeper for Advanced)? Did the Substitution Check find the planted issue and stay silent on the sound items?
3. **Correctness (automatic + human):** recomputed keys, factual checks, rubric–evidence mapping, accommodation operationalisation present.
4. **Telemetry (recorded, never decisive):** reading level, length, item count deltas.

A prompt/contract change ships only if 1–3 do not regress on the 12. Readability movement is reported beside the results, not inside the verdict.

Gold items are authored so that each cell contains at least one deliberate trap for each version type: a Support trap (a step that carries evidence and is tempting to chunk away), a Lang-Support trap (a term that *is* the construct), an Advanced trap (an obvious "add more problems" route), and a Substitution trap (a shortcut or a right-answer-wrong-model path) — plus three of the twelve that are sound, to measure false positives.

---

## 6 · Pilot privacy contract, and where the current build conflicts

**The contract.** Individual assignment content, uploads, comments, corrections, accommodation text and constraints are private to the teacher and to the reviewer (Dalia). The school receives only these predefined aggregates, disclosed to teachers before the pilot: number of assignments transformed; versions requested by type; supports requested by type; acceptance / edit / rejection rate by version type; exported and used-with-students counts; reported minutes saved (median); preservation-correction rate by invariant; second/third-assignment rate. No slice is reported for fewer than five teachers; per-teacher, per-department-under-five, per-subject-under-five and free-text fields never appear in any school report. Teachers may withdraw an assignment at any time and it leaves the aggregates.

**Conflicts in the current build to fix before any pilot data is collected.**

| Current | Conflict | Fix |
|---|---|---|
| Submit-page consent: "not shared with my school without my written permission" | Correct but incomplete; no mention that aggregate metrics go to a sponsoring school | Add a pilot-specific consent line listing the aggregates verbatim; show it only when `pilot_id` is present |
| `worry_text`, `feedback.comment`, `purchase_note`, `least_confident` are free text in `ast_submissions`; `ast_teacher_words` view joins them with subject/grade | Fine for Dalia; would re-identify teachers if any school-facing query touched them | Mark these columns `reviewer_only` in the schema doc; build the school view (`ast_school_report`) from an allow-list of numeric columns only, never from `*` |
| `channel` / `cohort` are the only grouping fields; `cohort` default `cohort-1` | No school key; no way to enforce small-cell suppression | Add `school_id`, `pilot_id`, `teacher_key`; suppression enforced in the view (`having count(distinct teacher_key) >= 5`) |
| Review page lists teacher emails and names | Reviewer-only today; acceptable. Must never gain a school-visible mode | State it in the README; no "school login" is planned |
| Result link is bearer-token; anyone with the link sees the teacher's content | Acceptable (teacher controls the link) but must be said | One line on the result page: "Anyone with this link can see this page. It is yours to share or not." |
| `purchase_for: department` copy | Implies departmental purchase; irrelevant in pilots | Hidden under `pilot_mode` |
| No expiry on uploaded files | Not a conflict, but the pilot agreement should state retention | Pilot term + 90 days, then deletion unless the teacher opts to keep |

---

## 7 · Versioning the standard (provenance record)

Every generated artifact — benchmark run or pilot — stores this record; nothing is stored without it.

```json
{
  "provenance_version": "0.1",
  "model": { "id": "claude-sonnet-4-5", "api_version": "2023-06-01", "temperature": 0.2 },
  "contract_version": "0.1",
  "prompt_version": { "intent_mapper": "0.1.0", "substitution_check": "0.3.0", "core": "0.1.0", "support": "0.1.0", "language_support": "0.1.0", "advanced": "0.1.0", "teacher_pack": "0.1.0" },
  "schema_version": { "intent_map": "0.1", "request": "0.1", "trace": "0.1" },
  "input": { "kind": "benchmark", "item_id": "g8-math-01", "input_version": "1.0", "sha256": "…" },
  "generated_at": "2026-09-12T14:03:22Z",
  "human": {
    "disposition": "edit",
    "disposition_at": "2026-09-12T15:10:04Z",
    "edit_summary": "Tightened E3 prompt; glossary term 'eliminate' removed as construct-adjacent.",
    "preservation_correction": { "occurred": true, "invariant": "required_evidence", "note": "Glossary defined the move the item assesses." },
    "override_of_block": null
  },
  "teacher": { "accepted_at": null, "edited": false, "used_with_students_at": null, "preservation_correction": null }
}
```

The moat is the join across these records: **teacher intent → permissions → generated change (tagged by dimension and invariant) → trace outcome → human disposition and correction → classroom use.** After a few hundred rows the questions in the memo become queries: which permitted changes teachers still reject; which invariants the engine breaks most, by version type and archetype; which supports are requested and kept; which verification mechanisms survive grading constraints.

---

## 8 · Open decisions for your review

1. **Cognitive-demand band label.** I've used Webb DOK as the confirmable label. Alternatives: Bloom levels, or your own three-band scheme. The engine reasons with the descriptor either way; the label matters for teacher confirmation and school reporting.
2. **Advanced and `teacher_constraints`.** I've made "cannot be graded within the stated capacity" out of permission for Advanced too. The alternative is to let Advanced exceed constraints with a warning. I recommend the strict version: an unusable Advanced is the memo's own failure mode.
3. **Core null transformation.** I've made "no change recommended" a valid Core output. Confirm you want the product able to say that; it is the same honesty as the Stress Test's clean result.
4. **Language-support translation.** I've allowed translating the assessed prompt only on request and only when language is not the construct. Say if you want it stricter (never) or looser (default for a stated home language).
5. **Small-cell threshold.** Five teachers per reported slice. In a 10-teacher pilot that means whole-cohort only; in 20, at most a two-way split. Confirm.

---

## 9 · Sequence, as approved

1. Revert `da9440d` (`chart.umd.js` deletion) on your Mac: `cd ~/projects/sovereign-academy-hub && rm -f .git/index.lock && git revert --no-edit da9440d && git push`. I cannot take the index lock from the mounted clone.
2. Keep `/stress-test/` unpublished; the code is reused under `/assignment-studio/`.
3. This contract → your edits → v0.2 frozen → encoded as `contract.ts` (permission tables as data, one prompt per version type built from them).
4. Twelve gold items, one per cell, each with a gold intent map, gold expectations per version type, and the four traps.
5. Intent mapper + Core + Support + Advanced run against the 12; publish the first harness table.
6. Schema/UI generalised around versions and traces.
7. One complete workflow, reviewed end to end.
8. Expand toward 36 while administrator conversations begin — the 12 and the harness table are enough to open those conversations.
