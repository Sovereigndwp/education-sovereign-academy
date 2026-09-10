// ESA — the structural correction to Stage A.
//
// The two-stage separation from `2cd763e` is unchanged and is not redesigned here. Stage A still cannot
// see a remedy; Stage B still cannot write back. What changes is Stage A's MODEL OF WHY EVIDENCE CAN BE
// LIMITED, and the REPRESENTATION of a claim's components.
//
// TWO FAILURES, TWO CORRECTIONS.
//
// 1. Stage A forced every limitation through a missing claim component. A take-home assessment whose
//    items exercise the claim perfectly has no missing component, so gate 1 failed and the diagnosis was
//    thrown away — nine claims, no finding. H1 had hidden this by inventing an "Independent production"
//    pseudo-component: the independence CONDITION wearing a component's clothes.
//    → Coverage and conditions are now two independent paths. Neither is expressed in the other's terms.
//
// 2. Stage A decomposed past the teacher's own granularity, inventing manner qualifiers and stricter
//    readings as separate components. Instructing it not to did not work — the run that failed already
//    contained an explicit instruction against refinements.
//    → The representation changed. A component must now be ANCHORED to a verbatim, non-overlapping span
//      of the teacher's confirmed claim, and must name the student verb inside that span. This is checked
//      in code against the claim string. A component the teacher's own words do not contain cannot exist.
//
// Checked by hand against the two failures before this was written:
//   G5C3 "States why adding denominators produces a wrong-sized part, and gives the correct sum."
//        "Identifies the error in the worked example"  → NOT IN CLAIM, rejected
//        "States why adding denominators produces a wrong-sized part" → anchored, authorised
//   E1   "Infers the author's unstated position ... from the text's choices rather than from any
//        sentence that states it."
//        all three components produced in the failed run → NOT IN CLAIM, all rejected
import { STANCE, CONDITIONS_RULE, PRIMITIVES } from "./prompts.mjs";
import { sha256, canonical } from "./stages.mjs";

export const ESA_ARCH_VERSION_2 = "esa-two-path-2026-09-10-v2";

/* ══════════════════════════════════════════════════════════════════════════
   STAGE A — two paths. Still no remedy vocabulary anywhere in this block.
   ══════════════════════════════════════════════════════════════════════════ */

const DIAGNOSIS_TASK_2 = `TASK: for EACH claim the teacher has confirmed, decide what the evidence this assessment produces, under the declared conditions, can and cannot support.

This is a diagnosis and nothing else. You are not asked what to do about anything you find, you are not asked how an assessment could be improved, and you must not describe, sketch, hint at or reason toward any change to it. If you find yourself thinking about what would fix something, you have left your task. The assessment stands exactly as it is. Your entire job is to say, accurately, what it does and does not license the teacher to conclude.

Work claim by claim. Claims in the same assessment routinely get different judgments — a strong assessment can carry one claim thoroughly and touch another only in passing, and saying so is the useful part. Do not average across claims.

EVIDENCE CAN BE LIMITED IN TWO DIFFERENT WAYS, AND THEY ARE NOT THE SAME THING.

  COVERAGE — does the assessment actually ASK the student to do what the claim names?
  CONDITIONS — under the declared administration conditions, how strongly can the resulting work be
               ATTRIBUTED to the student and used as evidence for this claim?

These are independent. An assessment can ask for exactly the right thing and still produce work the
teacher cannot attribute. An assessment can be administered under perfect supervision and still not ask
for half of what the claim names. You judge them SEPARATELY and you never express one in the other's
terms.

THE RULE THAT MATTERS MOST HERE: a conditions limitation is NOT a missing component. Never invent a
component such as "independent production", "the student's own work", "unaided execution" or anything
like it in order to record a conditions problem. Those are not things the teacher said she was assessing;
they are the attribution question, and the attribution question has its own place below.

━━ PATH A · COVERAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The teacher-confirmed claim is the unit of authority. You interpret it. You do not upgrade it.

Unpack the claim into its components. A component is a DISTINCT OBSERVABLE MOVE THE STUDENT MAKES that
the teacher's own words already name. Every component must carry:

  · claim_span — a VERBATIM substring of the teacher's claim statement, copied character for character,
    that names this move. Not a paraphrase. Not a tidied version. The exact characters.
  · verb — the student verb inside that span (e.g. "chooses", "executes", "states", "gives").
  · component — the observable move, in your words, for the teacher to read.
  · items — the item numbers that exercise it, or an empty list.
  · status — "present" (at least one item exercises it), "absent" (no item exercises it), or
    "not_called_for" (nothing in this assessment asks for it at all — a scope fact, not a hole).
  · evidence — quote or cite the assessment for whichever you claim.

The spans must NOT overlap. Each part of the claim belongs to at most one component. If you cannot find
a verbatim span for something, IT IS NOT A COMPONENT — the teacher did not say it, and you may not add it.

A component may NOT be created because it is:
  · a stronger version of another component
  · a manner qualifier on another component (a phrase saying HOW a move is done is part of that move,
    not a second move; it has no verb of its own)
  · a quality criterion
  · an implied prerequisite
  · a desirable extension
  · a more rigorous reading you could reasonably prefer

The test, and apply it to every component before you write it down: IF THIS COMPONENT WERE ABSENT, COULD
THE TEACHER REASONABLY SAY "THAT IS NOT ACTUALLY A SEPARATE THING I TOLD YOU I WAS ASSESSING"? If she
could, it is not a component.

Then decide coverage_status:
  · "sufficient" — every component the claim names is exercised somewhere in this assessment.
  · "limited" — at least one component is genuinely not exercised. Name exactly ONE in
    coverage_missing_component, copying its "component" text character for character from your own list.
    If more than one is absent, name the one that narrows support most.

These remain NOT absences: "it could be stronger", "only one item covers it", "a second instance would
give more confidence", "the response format could be richer". A component exercised once is present.

━━ PATH B · CONDITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Judge this SEPARATELY, and judge it even when coverage is sufficient — especially then, because that is
the case the teacher most needs told.

Under the declared conditions, how strongly can this work be attributed to the student?
  · "strong" — the conditions place the work where outside help is excluded or visible, and the form was
    not available in advance. Only supervision "proctored_in_class" or "observed_live" reach this.
  · "limited" — the conditions leave the attribution open: unsupervised, outside help permitted, tools
    that do the claimed move for the student, collaboration where the claim is about the individual.

State conditions_reason in one sentence naming the specific declared condition that decides it and what
it does to the inference. Not a warning, not a judgment of the teacher — a boundary statement.

A CONDITIONS LIMITATION IS NOT A DEFECT IN THE ASSESSMENT. A take-home task can be a good take-home task.
What it changes is what the RESULTS license, not whether the assignment is any good. Say so in exactly
those terms. Do not imply the assessment should be supervised, do not imply the teacher chose wrongly,
and never suggest that work done with resources is worthless — it is evidence of something, just not of
the same thing.

conditions_supports — one sentence: what a teacher may conclude from work produced under THESE
conditions. For an unsupervised task with resources permitted, that is usually a real and useful
conclusion about what the student can produce WITH those resources.

━━ THE INFERENCE THE TEACHER ACTUALLY WANTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A conditions limitation only matters RELATIVE TO THE INFERENCE THE TEACHER WANTS TO MAKE. The teacher has
told you, in the conditions block, whether she needs to conclude that each student can do this
INDEPENDENTLY. Take that as given.

  · If she needs individual, independent attribution ("can each student do this on their own?") then
    limited conditions materially block that inference.
  · If she does not — if what she wants to know is what students can produce using the resources
    available to them — then limited conditions are COMPATIBLE with her inference and there is nothing
    to report beyond the boundary itself.

━━ THE MATERIALITY GATE — APPLIED TO EACH PATH SEPARATELY ━━━━━━━━━━━━━━━━━━━

Do not ask whether the assessment could measure more. Almost every assessment could measure more.
Ask, for each path independently: does THIS limitation prevent the teacher from making the inference she
told you she wants to make — or is it the ordinary narrowness that every assessment has and every
experienced teacher already assumes?

  · coverage_material — is the missing component material to her intended inference?
  · conditions_material — is the attribution limit material to her intended inference?

A teacher told about a limitation she had already accounted for learns nothing and trusts the next report
less. If this assessment is ALREADY collecting more evidence than the claim needs, say so in
over_verified_note and the answer to materiality is no.

Then set limitation_type: "none", "coverage", "conditions", or "both" — where a path counts only if it is
BOTH limited AND material.

For each material limitation, state what is missing as an ABSENCE, not as a way to fill it:
  · coverage_missing_evidence — the observable thing this assessment does not currently produce.
  · conditions_missing_evidence — what the declared conditions leave unestablished.

JSON:
{ "claims": [ {
    "claim_id": string,
    "items": [ { "item": string, "elicits": string } ],
    "coverage": {
      "components": [ { "claim_span": string, "verb": string, "component": string, "items": [string],
                        "status": "present"|"absent"|"not_called_for", "evidence": string } ],
      "coverage_status": "sufficient"|"limited",
      "coverage_missing_component": string,
      "why": string },
    "conditions_support": {
      "status": "strong"|"limited",
      "conditions_reason": string,
      "conditions_supports": string },
    "intended_inference": { "needs_individual_attribution": boolean, "why": string },
    "materiality": { "coverage_material": boolean, "conditions_material": boolean, "why": string },
    "limitation_type": "none"|"coverage"|"conditions"|"both",
    "coverage_missing_evidence": string,
    "conditions_missing_evidence": string,
    "any_independent_observation": boolean,
    "covers_whole_claim": boolean,
    "narrower_inference": string,
    "supports": string,
    "does_not_support": [string],
    "delegation": { "answer": "yes"|"no"|"partly", "reason": string },
    "gap_statement": string,
    "why_no_gap": string,
    "over_verified_note": string
  } ],
  "conditions_echo": string,
  "reviewer_notes": string }

Two of those fields are mechanical and must agree with your own paths, because the verdict is derived
from them in code:
  · any_independent_observation — true exactly when conditions_support.status is "strong".
  · covers_whole_claim — true exactly when coverage.coverage_status is "sufficient".
  · does_not_support is never empty, including for a claim you judge strong.`;

const STANCE_DIAGNOSIS = STANCE.replace(
  "and never propose detection, surveillance, or an honesty pledge. None of those produce evidence.",
  "and never treat detection, surveillance, or an honesty pledge as evidence. None of those produce evidence.",
);

export function diagnosisSystem2() {
  return `${STANCE_DIAGNOSIS}

${CONDITIONS_RULE}

${DIAGNOSIS_TASK_2}`;
}

export function diagnosisUser2({ subject, grade, assessment, conditions, claims, needsIndividualAttribution, attributionSource }) {
  const c = conditions;
  return [
    `Subject: ${subject} · Grade/course: ${grade}`,
    ``,
    `DECLARED ADMINISTRATION CONDITIONS (the teacher declared these; they govern every judgment below):`,
    `- Supervision: ${c.supervision}`,
    `- Individual or collaborative: ${c.collaboration}`,
    `- AI policy: ${c.ai_policy}`,
    `- Resources permitted: ${(c.resources || []).join(", ") || "none stated"}`,
    `- Purpose: ${c.purpose}`,
    `- Time: ${c.time_minutes ? c.time_minutes + " minutes" : "not stated"}`,
    `- Where in the sequence: ${c.when_in_sequence || "not stated"}`,
    `- What students had already seen, in the teacher's words: ${c.novelty_note || "not stated"}`,
    ``,
    `THE INFERENCE THE TEACHER WANTS TO MAKE (she has confirmed this; take it as given):`,
    needsIndividualAttribution
      ? `- She needs to conclude that EACH STUDENT INDIVIDUALLY can do what the claims name. Individual, independent attribution is required.`
      : `- She wants to know what students can produce using the resources available to them. Individual, independent attribution is NOT required.`,
    `  (${attributionSource})`,
    ``,
    `THE TEACHER-CONFIRMED LEARNING CLAIMS (these govern; do not rewrite them, do not read them more strictly than they are written):`,
    ...claims.map((x) => `- ${x.id}: ${x.statement}  [type: ${x.claim_type}]`),
    ``,
    `THE ASSESSMENT, exactly as the teacher uses it:`,
    `"""`,
    assessment,
    `"""`,
    ``,
    `Return the JSON object now.`,
  ].join("\n");
}

/* ══════════════════════════════════════════════════════════════════════════
   THE SPAN CHECK — mechanical. A component the teacher's own words do not
   contain is rejected here, not argued with in a prompt.
   ══════════════════════════════════════════════════════════════════════════ */

const normSpan = (s) => String(s || "").toLowerCase().replace(/[—–]/g, "-").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

/** Validates one claim's component list against the teacher's claim string. Returns violations. */
export function validateSpans(components, claimStatement) {
  const v = [];
  const hay = normSpan(claimStatement);
  const used = [];
  for (const c of components || []) {
    const span = normSpan(c.claim_span);
    if (!span) { v.push({ code: "NO_CLAIM_SPAN", detail: `Component "${String(c.component).slice(0, 90)}" cites no span of the teacher's claim.` }); continue; }
    const at = hay.indexOf(span);
    if (at < 0) {
      v.push({ code: "SPAN_NOT_IN_CLAIM", detail: `Component "${String(c.component).slice(0, 70)}" cites "${String(c.claim_span).slice(0, 70)}", which is not in the teacher's claim. The teacher did not say this.` });
      continue;
    }
    const verb = normSpan(c.verb);
    if (!verb) v.push({ code: "NO_VERB", detail: `Component "${String(c.component).slice(0, 70)}" names no student verb.` });
    else if (!span.includes(verb.replace(/e?s$/, "").slice(0, Math.max(3, verb.length - 2)))) {
      v.push({ code: "VERB_NOT_IN_SPAN", detail: `Component "${String(c.component).slice(0, 60)}" claims verb "${c.verb}", which is not inside its own span "${String(c.claim_span).slice(0, 60)}". A phrase with no verb of its own is a manner qualifier, not a separate move.` });
    }
    for (const [s, e, other] of used) {
      if (at < e && at + span.length > s) {
        v.push({ code: "SPAN_OVERLAP", detail: `Component "${String(c.component).slice(0, 55)}" claims a span overlapping "${String(other).slice(0, 55)}". One part of the claim belongs to at most one component.` });
        break;
      }
    }
    used.push([at, at + span.length, c.claim_span]);
  }
  return v;
}

/** Coverage limitation, materially. */
export const hasCoverageGap = (r) =>
  (r.coverage || {}).coverage_status === "limited" && (r.materiality || {}).coverage_material === true;
/** Conditions limitation, materially. */
export const hasConditionsGap = (r) =>
  (r.conditions_support || {}).status === "limited" && (r.materiality || {}).conditions_material === true;

/* ══════════════════════════════════════════════════════════════════════════
   STAGE B — two prompts, because the two limitation types are different jobs.
   In the CONDITIONS prompt, `modify_item` does not exist. Not forbidden — absent.
   Rewriting a worksheet cannot repair the room, so the option is not offered.
   ══════════════════════════════════════════════════════════════════════════ */

const STAGE_B_RULES = `WHAT YOU MAY NOT DO. These are not style preferences; a response that breaks one is discarded.

The diagnosis you are given was produced by a separate reading that could not see this page and did not
know anything could be done about what it found. That is deliberate. It is closed.

  · You may NOT decide the claim is missing something other than what the diagnosis says is missing.
  · You may NOT find an additional limitation, in this claim or any other. You are not reviewing the assessment.
  · You may NOT read the teacher's claim more strictly than the diagnosis read it.
  · You may NOT re-judge any component. What the diagnosis called present is present.
  · You may NOT argue that the assessment is fine after all. That was decided upstream, in your favour.
  · You may NOT propose more than one change.

If you believe the diagnosis is wrong, you still do not act on it. Put it in "disagreement", leave that
field an empty string if you have none, and answer the question you were asked anyway.`;

export function remedySystemCoverage() {
  return `${STANCE}

${CONDITIONS_RULE}

${PRIMITIVES}

TASK: one claim on one assessment has been diagnosed with a COVERAGE limitation — the assessment does not ask the student to demonstrate one component of what the teacher's claim names. Choose the smallest valid way to obtain that missing evidence.

${STAGE_B_RULES}

THE SMALLEST USEFUL CHANGE — and it is almost always smaller than it first looks.
Work DOWN the tiers and STOP at the first one that closes the stated gap. If you skip one, say why it
could not work.

TIER 1 — MODIFY ONE ITEM THAT IS ALREADY THERE.
Ask this first, every time: can ONE item already on this assessment be changed so that it exercises the
missing component — without adding an item, without adding a minute, and without taking away what any
other item is currently evidencing?
Very often it can, and the change is tiny: different numbers, one added word in the instruction, a value
chosen so that a step the student can currently skip becomes unavoidable.
Give: the item's number, its current text, its replacement text, and one line on what the replacement now
forces the student to do that the original did not. If the replacement gives up anything the original was
contributing — a harder case, a relationship no other item tests — say so in that same line.

TIER 2 — ADD ONE SHORT INDEPENDENT OBSERVATION.
Only once you have established that no existing item can be modified to close the gap. One primitive, one
item, written out as the student would see it, under conditions that satisfy the three requirements. Aim
at five to ten minutes, and often less. Not an exit ticket by default — say why that primitive. Give the
sufficiency line and the variant rule.

TIER 3 — A LONGER OBSERVATION, only where a short one genuinely cannot reach the claim but a longer one
can, and the claim matters enough to spend the time.

TIER 4 — NO CHEAP CHECK. Some claims have no short independent check that reaches them: every short item
either pre-digests the problem or stops being short. Set "tier" to "no_cheap_check", give the reason, and
return null for both "modify" and "add". This is an honest and valuable answer.

JSON — return this object and nothing else:
{ "limitation_type": "coverage",
  "assessment_change": "modify_one_item"|"none",
  "tier": "modify_item"|"add_observation"|"longer_observation"|"no_cheap_check",
  "why_not_tier_1": string,
  "modify": null | { "item_ref": string, "current_text": string, "replacement_text": string, "what_it_now_forces": string },
  "add": null | { "primitive": "Perturb"|"Transfer"|"Predict"|"Diagnose"|"Represent"|"Reverse"|"Generate"|"Classify",
                  "item_text": string, "variant_rule": string, "conditions": string,
                  "sufficiency_line": string, "why_this_primitive": string },
  "no_short_check_reason": string,
  "student_minutes": number,
  "scoring_seconds": number,
  "disagreement": string }`;
}

export function remedySystemConditions() {
  return `${STANCE}

${CONDITIONS_RULE}

${PRIMITIVES}

TASK: one claim on one assessment has been diagnosed with a CONDITIONS limitation. The assessment asks for exactly the right thing. What limits the teacher is that, under the declared administration conditions, she cannot attribute the resulting work to the student strongly enough for the inference she wants to make.

${STAGE_B_RULES}

START HERE, AND MOST OF THE TIME FINISH HERE: THE ASSESSMENT ITSELF DOES NOT CHANGE.
A good take-home assignment is a good take-home assignment. The limitation is in what the RESULTS license,
not in the assignment. You are not being asked to make it supervisable, to shorten it, to reword it, or to
turn it into something it was not meant to be. Rewriting a teacher's assignment to solve an administration
problem is the wrong answer and there is no option here for it. Set "assessment_change" to "none".

Then decide ONE thing: does the teacher's intended inference require independent evidence she does not
currently have?

  · If NO — the boundary itself is the whole answer. Set "verification" to "none" and write
    "inference_boundary": one or two sentences a teacher can read, saying what these results DO support
    and what they do not. This is a complete and useful finding. Do not add anything to it.

  · If YES — and only then — one short supervised observation, alongside the assessment, which stays
    exactly as it is. Set "verification" to "short_supervised_observation".
    One primitive, one item, written out as the student would see it, produced in the room. Five to ten
    minutes, and often less. It exists to attribute the claim, not to re-teach or re-cover it, so it
    should be the smallest thing that establishes the student can do what the take-home already asked.
    Give the sufficiency line and the variant rule. Say in one line why that primitive.
    Still write the "inference_boundary" — the teacher needs it either way.

Some claims have no short independent check that reaches them: sustained multi-step problem solving,
judgment over messy data, extended argument. Every short item either pre-digests the problem or stops
being short. When that is true set "verification" to "no_cheap_check" and give the reason. The boundary
statement is then the entire finding, and that is an honest answer, not a failure.

JSON — return this object and nothing else:
{ "limitation_type": "conditions",
  "assessment_change": "none",
  "inference_boundary": string,
  "verification": "none"|"short_supervised_observation"|"no_cheap_check",
  "why_this_verification": string,
  "add": null | { "primitive": "Perturb"|"Transfer"|"Predict"|"Diagnose"|"Represent"|"Reverse"|"Generate"|"Classify",
                  "item_text": string, "variant_rule": string, "conditions": string,
                  "sufficiency_line": string, "why_this_primitive": string },
  "no_short_check_reason": string,
  "student_minutes": number,
  "scoring_seconds": number,
  "disagreement": string }`;
}

export function remedyUser2({ subject, grade, assessment, conditions, claim, diagnosis, diagnosis_hash, limitationType, needsIndividualAttribution }) {
  const c = conditions;
  const cov = diagnosis.coverage || {};
  const cs = diagnosis.conditions_support || {};
  const comps = (cov.components || []).map((x) =>
    `  · ${x.component}\n      status: ${x.status}   items: ${(x.items || []).join(", ") || "none"}\n      ${x.evidence || ""}`).join("\n");
  const lines = [
    `Subject: ${subject} · Grade/course: ${grade}`,
    ``,
    `DECLARED ADMINISTRATION CONDITIONS (the teacher declared these; they govern everything):`,
    `- Supervision: ${c.supervision}`,
    `- Individual or collaborative: ${c.collaboration}`,
    `- AI policy: ${c.ai_policy}`,
    `- Resources permitted: ${(c.resources || []).join(", ") || "none stated"}`,
    `- Purpose: ${c.purpose}`,
    `- Time: ${c.time_minutes ? c.time_minutes + " minutes" : "not stated"}`,
    `- Where in the sequence: ${c.when_in_sequence || "not stated"}`,
    `- What students had already seen, in the teacher's words: ${c.novelty_note || "not stated"}`,
    ``,
    `WHAT THE TEACHER WANTS TO CONCLUDE (confirmed; take as given):`,
    needsIndividualAttribution
      ? `- That EACH STUDENT INDIVIDUALLY can do what the claim names. Independent attribution is required.`
      : `- What students can produce using the resources available to them. Independent attribution is NOT required.`,
    ``,
    `THE TEACHER-CONFIRMED CLAIM (${claim.id}) — this governs; do not rewrite or narrow it:`,
    claim.statement,
    ``,
    `THE FROZEN DIAGNOSIS (record ${diagnosis_hash.slice(0, 16)}, closed — not yours to revise):`,
    `  LIMITATION TYPE: ${limitationType}`,
    `  what this assessment DOES support: ${diagnosis.supports}`,
    `  what it does NOT reach:`,
    ...(diagnosis.does_not_support || []).map((x) => `    - ${x}`),
    ``,
    `  COVERAGE: ${cov.coverage_status}`,
    `  component map:`,
    comps,
  ];
  if (limitationType === "coverage") {
    lines.push(
      `  the component not exercised: ${cov.coverage_missing_component}`,
      `  why: ${cov.why}`,
      ``,
      `THE MISSING EVIDENCE you are to obtain:`,
      diagnosis.coverage_missing_evidence || cov.coverage_missing_component,
    );
  } else {
    lines.push(
      `  (every component the claim names IS exercised — coverage is not the problem)`,
      ``,
      `  CONDITIONS SUPPORT: ${cs.status}`,
      `  ${cs.conditions_reason}`,
      `  what work produced under these conditions DOES support: ${cs.conditions_supports}`,
      ``,
      `WHAT THE CONDITIONS LEAVE UNESTABLISHED:`,
      diagnosis.conditions_missing_evidence || cs.conditions_reason,
    );
  }
  lines.push(
    ``,
    `THE ASSESSMENT, exactly as the teacher uses it — it is not to be rewritten:`,
    `"""`,
    assessment,
    `"""`,
    ``,
    `Return the JSON object now.`,
  );
  return lines.join("\n");
}

export const STAGE_B2_ALLOWED_KEYS = [
  "limitation_type", "assessment_change", "tier", "why_not_tier_1", "modify", "add",
  "inference_boundary", "verification", "why_this_verification",
  "no_short_check_reason", "student_minutes", "scoring_seconds", "disagreement",
];

export function mergeRemedy2({ claimRecord, diagnosis_hash, remedyRaw, limitationType }) {
  const violations = [];
  const extra = Object.keys(remedyRaw || {}).filter((k) => !STAGE_B2_ALLOWED_KEYS.includes(k));
  if (extra.length) violations.push({ code: "STAGE_B_OVERREACH", detail: `Fields outside the whitelist, dropped: ${extra.join(", ")}.` });
  const clean = {};
  for (const k of STAGE_B2_ALLOWED_KEYS) if (remedyRaw && k in remedyRaw) clean[k] = remedyRaw[k];
  const dis = String(clean.disagreement || "").trim().replace(/^["']|["'.]$/g, "").toLowerCase();
  if (dis && dis !== "none" && dis !== "n/a") {
    violations.push({ code: "STAGE_B_DISAGREED", detail: `Stage B disagreed and was overridden: "${String(clean.disagreement).slice(0, 180)}"` });
  }
  if (limitationType === "conditions" && clean.assessment_change !== "none") {
    violations.push({ code: "ASSESSMENT_REWRITTEN_FOR_CONDITIONS", detail: `Stage B set assessment_change="${clean.assessment_change}" on a conditions limitation. The assessment must not be rewritten to solve an administration problem.` });
  }
  if (limitationType === "conditions" && clean.modify) {
    violations.push({ code: "MODIFY_ON_CONDITIONS_GAP", detail: "Stage B returned an item modification for a conditions limitation." });
  }
  const merged = { ...JSON.parse(JSON.stringify(claimRecord)), stage_b: clean };
  const back = { ...merged }; delete back.stage_b;
  if (sha256(canonical(back)) !== diagnosis_hash) {
    violations.push({ code: "DIAGNOSIS_MUTATED", detail: "The Stage A record changed during merge. Hard architecture failure." });
  }
  return { merged, violations };
}
