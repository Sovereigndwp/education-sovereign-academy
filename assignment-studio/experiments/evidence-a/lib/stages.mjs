// ESA — the two-stage architecture: diagnosis first, remedy second.
//
// WHY THIS EXISTS. H1 ran diagnosis and remedy selection in ONE reasoning context and regressed on
// restraint (0.968 -> 0.871, four unnecessary interventions, all of them `modify_item`). Nothing was
// bypassed: gates 1-3 all passed legitimately on each one. What moved was gate 1's reading of the claim.
// Gate 1's instruction text did not change by one byte between A3 and H1, yet under H1 it decomposed
// claims more finely and marked the finer pieces absent. The presence of an attractive, zero-cost remedy
// downstream changed the upstream diagnosis.
//
// The fix is not an instruction. Telling a model "do not let the remedy influence the diagnosis" leaves
// the remedy in the context, and the context is the problem. So the remedy information is ABSENT from
// Stage A: it lives in constants Stage A's builder never references, and every assembled Stage A prompt
// is scanned for remedy vocabulary before it may be sent.
//
// Stage A produces a diagnosis. That diagnosis is frozen and hashed. Stage B receives it as rendered
// text, may only return a remedy object, and its output is filtered to a whitelist before merge. The
// verdict, the component map, the gate decisions and KEEP-vs-gap are derived from the Stage A record
// ALONE. A KEEP cannot become an intervention because Stage B found something cheap to change.
import { createHash } from "node:crypto";
import { STANCE, CONDITIONS_RULE, PRIMITIVES } from "./prompts.mjs";

// STANCE, verbatim, with ONE clause rewritten. The shared stance says "never propose detection,
// surveillance, or an honesty pledge" — a correct rule, but it puts the word "propose" in front of a
// reader whose whole task is that it must not propose anything. The rule is kept; the verb is not.
// This is the only difference between the diagnosis stance and the stance every prior run used, and the
// leak check below is what forced it into the open.
const STANCE_DIAGNOSIS = STANCE.replace(
  "and never propose detection, surveillance, or an honesty pledge. None of those produce evidence.",
  "and never treat detection, surveillance, or an honesty pledge as evidence. None of those produce evidence.",
);

export const ESA_ARCH_VERSION = "esa-two-stage-2026-09-10-v1";

/* ══════════════════════════════════════════════════════════════════════════
   STAGE A — EVIDENCE DIAGNOSIS
   Answers one question: what can this assessment legitimately tell the teacher?
   Contains no remedy vocabulary. PRIMITIVES is deliberately NOT included: the eight primitives are the
   mechanism list for building a remedy, and Stage A does not build one.
   ══════════════════════════════════════════════════════════════════════════ */

const DIAGNOSIS_TASK = `TASK: for EACH claim the teacher has confirmed, decide what the evidence this assessment produces, under the declared conditions, can and cannot support.

This is a diagnosis and nothing else. You are not asked what to do about anything you find, you are not asked how an assessment could be improved, and you must not describe, sketch, hint at or reason toward any change to it. If you find yourself thinking about what would fix something, you have left your task. The assessment stands exactly as it is. Your entire job is to say, accurately, what it does and does not license the teacher to conclude.

Work claim by claim. Claims in the same assessment routinely get different judgments — a strong assessment can carry one claim thoroughly and touch another only in passing, and saying so is the useful part. Do not average across claims and do not let a strong claim rescue a weak one or a weak one drag down a strong one.

For each claim, answer these two booleans FIRST and let them decide the outcome. The verdict is derived from them in code, so their accuracy is the whole job:
  · any_independent_observation — does at least ONE item produce an observation meeting all three conditions (independent, novel, claim-targeted) under the DECLARED conditions?
  · covers_whole_claim — do those independent observations reach the WHOLE claim as the teacher stated it, or only a narrower part of it? If only a part, name the narrower claim that IS supported in "narrower_inference".

Then:
  · items — for each item that bears on this claim, what it ACTUALLY ELICITS from the student (the move the student must make), not what it is about.
  · supports — one sentence: what a teacher may conclude from this evidence, under these conditions.
  · does_not_support — 2–4 specific things this evidence does NOT reach. Name the ADJACENT claims it is most likely to be mistaken for, and state the guess-rate caveat for any selected-response item whose reasoning is not also collected. This list is not decoration; it is the thing that stops one right answer from being read as mastery. It is never empty, including for a claim you judge strong.
  · delegation — under the DECLARED conditions, could the submitted evidence for this claim be produced without the student doing the required thinking? Answer "yes", "no" or "partly", with ONE task-specific sentence naming the feature that decides it. Expect "no" under supervision and "yes" for almost anything unsupervised, and say either plainly, without drama.
  · gap_statement — if the claim is not fully carried, one sentence beginning "We cannot tell from ..." naming what the teacher cannot conclude. Empty string when there is no gap.
  · A claim the teacher has told you is assessed ELSEWHERE, or that the assessment only touches in passing and does not set out to carry, is not a gap in this assessment. Say so in why_no_gap rather than reporting a hole.

THREE GATES BEFORE ANYTHING MAY BE CALLED A GAP.
The default is that this assessment is doing its job. A gap is not the natural conclusion of analysis — it
is an exception, and you have to justify it against a specific named absence. Work the gates in order and
STOP at the first one that fails.

GATE 1 — COMPONENT MAP, THEN ACTUAL ABSENCE.
Do not pick one element. A teacher-confirmed claim usually names several observable things at once, and
choosing one of them at random is how the same assessment gets two different answers on two readings.

First DECOMPOSE the claim, internally, into its observable components. Do not rewrite, narrow or split the
teacher's claim — it stands exactly as confirmed, and it is still the claim you judge. This decomposition
is your own working structure. Typically two to five components; if you find yourself past five you are
inventing sub-skills rather than reading the claim, so stop and merge.

Decompose only as far as the teacher's own wording carries you. A component must be something the teacher
would recognise as part of what she said, not a finer-grained sub-skill you can derive from it. If a
component you are about to write is a refinement of one already on your list — a stricter version of it, a
more specific way of doing it, or the same move named more precisely — it is not a separate component and
it does not go on the list. The claim is the teacher's; the granularity is hers too.

For EVERY component, state:
  · component — the observable thing, something you could point at a student doing.
  · items — the item numbers that exercise it, or an empty list if none do.
  · status — "present" (at least one item exercises it), "absent" (no item exercises it), or
    "not_called_for" (nothing in this assessment's items or declared conditions asks for it at all, so its
    absence is a scope fact rather than a hole).
  · evidence — quote or cite the assessment for whichever of those you claim. An empty items list needs a
    reason drawn from the assessment, not from what a richer assessment would have contained.

Then reason ACROSS the whole set. AN UNEXERCISED COMPONENT DOES NOT AUTOMATICALLY WARRANT ANYTHING. For
each component that is not "present", answer three questions before it may go any further:
  · belongs_to_inference — does this component materially belong to the inference the teacher confirmed
    FOR THIS ASSESSMENT, or is it a neighbouring skill the claim's wording merely brushes?
  · assessed_elsewhere_or_out_of_scope — has the teacher said, or does the assessment's own purpose and
    conditions show, that this is carried somewhere else?
  · narrows_support — does its absence materially narrow what this assessment can support, or is the claim
    still carried in substance by the components that ARE present?

Carry forward AT MOST ONE component: the one that is not present, materially belongs, is not assessed
elsewhere, and whose absence genuinely narrows support. Name it in "carried_forward", COPYING ITS
"component" TEXT EXACTLY, character for character, from the entry above. Do not paraphrase it, do not
tidy its grammar, do not shorten it. If more than one qualifies, carry the one that narrows support most
and say so. If none qualifies, set "carried_forward" to "" and explain in "why", and GATE 1 FAILS: there
is no gap, whatever else you noticed. Stop there.

These remain NOT absences, at component level as much as before: "it could be stronger", "only one item
covers it", "a second instance would give more confidence", "the response format could be richer". A
component exercised once is present.

GATE 2 — MATERIALITY.
Only if something is genuinely absent. Does that absence materially limit the inference the teacher
intends to draw from THIS assessment, for its stated purpose?
Do not silently widen the teacher's claim, and do not require one assessment to demonstrate every
adjacent competency. An assessment may legitimately support a narrower claim than the ideal one, and a
dimension the teacher assesses elsewhere is not this assessment's gap. A LIMITED judgment does not imply
a gap worth reporting: narrowness the teacher would accept, or already knows about, is not material.
Material means the teacher would draw a conclusion this evidence does not carry, and would not otherwise
know that.
If it is not material, GATE 2 FAILS. There is no gap. Stop here.

GATE 3 — WORTH PUTTING IN FRONT OF THIS TEACHER.
Only if the absence is material. Is this something she does not already know and would act on — or is it
the ordinary narrowness that every assessment has and every experienced teacher already assumes?
Weigh it as a teacher would. A teacher who is told about a limitation she had already accounted for
learns nothing and trusts the next report less. If this assessment is ALREADY collecting more evidence
than the claim needs, the honest note is that some existing burden looks redundant — record that in
"over_verified_note" — and the answer to this gate is no.
If it is not worth her attention, GATE 3 FAILS. There is no gap. Stop here.

Only when all three gates pass is this recorded as a genuine evidence gap. Report each gate you reached;
for a gate you did not reach because an earlier one failed, say so rather than guessing an answer.

When all three gates pass, state "missing_evidence": one sentence naming the observable thing this
assessment does not currently produce for this claim. Describe the ABSENCE, not a way to fill it. Name
what is missing, not what would supply it.

JSON:
{ "claims": [ {
    "claim_id": string,
    "items": [ { "item": string, "elicits": string } ],
    "any_independent_observation": boolean,
    "covers_whole_claim": boolean,
    "narrower_inference": string,
    "supports": string,
    "does_not_support": [string],
    "delegation": { "answer": "yes"|"no"|"partly", "reason": string },
    "gap_statement": string,
    "gate1_components": {
      "components": [ { "component": string, "items": [string], "status": "present"|"absent"|"not_called_for", "evidence": string,
                        "belongs_to_inference": boolean, "assessed_elsewhere_or_out_of_scope": boolean, "narrows_support": boolean } ],
      "carried_forward": string, "why": string },
    "gate2_materiality": { "reached": boolean, "material": boolean, "why": string },
    "gate3_value": { "reached": boolean, "worth_it": boolean, "why": string },
    "why_no_gap": string,
    "missing_evidence": string,
    "over_verified_note": string
  } ],
  "conditions_echo": string,
  "reviewer_notes": string }`;

export function diagnosisSystem() {
  return `${STANCE_DIAGNOSIS}

${CONDITIONS_RULE}

${DIAGNOSIS_TASK}`;
}

export function diagnosisUser({ subject, grade, assessment, conditions, claims }) {
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
    `THE TEACHER-CONFIRMED LEARNING CLAIMS (these govern; do not rewrite them):`,
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
   THE LEAK CHECK
   Mechanical, not aspirational. Every assembled Stage A prompt is scanned before it may be sent, and a
   match throws. This is what makes "Stage A cannot see the remedy" a property of the code rather than a
   claim about the prompt.

   The list is deliberately about REMEDY vocabulary, not about words that legitimately appear in a
   diagnosis. "diagnostic" is a claim type; "Diagnose" is a primitive. Banning the bare primitive names
   would fire on the Grade 5 diagnostic claim, so what is banned is the block that teaches them and the
   fields that carry a remedy.
   ══════════════════════════════════════════════════════════════════════════ */

export const REMEDY_TOKENS = [
  "modify_item", "add_observation", "smallest_change", "replacement_text", "what_it_now_forces",
  "why_not_tier_1", "variant_rule", "sufficiency_line", "student_minutes", "scoring_seconds",
  "no_short_check_reason", "minimum_additional_observation", "item_ref", "current_text",
  "why_this_primitive", "intervention",
  "tier 1", "tier 2", "tier 3", "tier1", "tier2",
  "VERIFICATION PRIMITIVES", "VARIANT RULE", "exit ticket",
  "costs the teacher nothing", "smallest useful change", "smallest change",
  "additional observation", "additional independent observation", "one short observation",
  "modify one existing item", "modify an existing item", "propose", "remedy", "fix it", "repair",
];

/**
 * Throws if any remedy vocabulary reached a Stage A prompt. Returns the sha256 of what was checked.
 *
 * `payloads` are strings authored by the TEACHER, not by us — the assessment body and the confirmed
 * claim statements. They are removed before scanning. A teacher may write "repair the error" in an item
 * and that is her assessment, not remedy information leaking out of our own instructions. What is being
 * checked is everything WE put in front of the model. Teacher content is data; it is scanned out so it
 * cannot mask a real leak by making the check noisy, and so a real leak cannot hide inside it.
 */
export function assertNoRemedyLeak(label, text, payloads = []) {
  let scaffold = String(text);
  for (const p of payloads) if (p) scaffold = scaffold.split(String(p)).join(" \u0000TEACHER-CONTENT\u0000 ");
  const hay = scaffold.toLowerCase();
  const hits = REMEDY_TOKENS.filter((t) => hay.includes(t.toLowerCase()));
  if (hits.length) {
    throw new Error(`REMEDY LEAK into ${label}: ${hits.join(", ")}. Stage A must not contain remedy information.`);
  }
  return sha256(text);
}

export function sha256(s) { return createHash("sha256").update(String(s), "utf8").digest("hex"); }

/** Canonical JSON — key order fixed — so a hash means "this content" and not "this serialisation". */
export function canonical(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
}

/** Deep-freeze plus a content hash. After this the diagnosis cannot be written to, in this process. */
export function freezeDiagnosis(obj) {
  const walk = (o) => {
    if (o && typeof o === "object") { Object.values(o).forEach(walk); Object.freeze(o); }
    return o;
  };
  const frozen = walk(JSON.parse(JSON.stringify(obj)));
  return { diagnosis: frozen, diagnosis_hash: sha256(canonical(frozen)) };
}

/* ══════════════════════════════════════════════════════════════════════════
   STAGE B — REMEDY SELECTION
   Runs ONLY for a claim Stage A already recorded as a genuine gap, and sees only that one claim.
   It cannot manufacture a gap in a claim it is never given.
   ══════════════════════════════════════════════════════════════════════════ */

const HIERARCHY = `THE SMALLEST USEFUL CHANGE — and it is almost always smaller than it first looks.
The diagnosis above is FINISHED and is not yours to revisit. Work DOWN the tiers and STOP at the first one
that closes the stated gap. You may not skip a tier because a lower one is more interesting to write; if
you skip one, you must say why it could not work.

TIER 1 — MODIFY ONE ITEM THAT IS ALREADY THERE.
Ask this first, every time: can ONE item already on this assessment be changed so that it exercises the
missing component — without adding an item, without adding a minute, and without taking away what any
other item is currently evidencing?
Very often it can, and the change is tiny: different numbers, one added word in the instruction, a value
chosen so that a step the student can currently skip becomes unavoidable. An assessment whose answers all
happen to come out clean can be made to demand the step simply by changing one of them.
This tier costs the teacher nothing — same item count, same page, same minutes, same grading — so it is
the RIGHT answer whenever it is available, and it is available more often than it looks.
Give: the item's number, its current text, its replacement text, and one line on what the replacement now
forces the student to do that the original did not. If the replacement gives up anything the original
item was contributing — a harder case, a relationship no other item tests — say so in that same line.
THE LIMIT OF THIS TIER: a modification can only repair a gap that is about what the ITEMS elicit. It
cannot repair a gap that comes from the CONDITIONS. If the evidence fails because the work is unsupervised,
or because the answer is available to the student while they work, then no rewording of any item fixes it —
the artifact still comes back from a setting you cannot see into. In that case tier 1 is unavailable and
you go to tier 2, and you say so.

TIER 2 — ADD ONE SHORT INDEPENDENT OBSERVATION.
Only once you have established that no existing item can be modified to close the gap.
One primitive, one item, written out as the student would see it, produced under conditions that satisfy
the three requirements. Aim at five to ten minutes, and often less.
Do NOT reach for an exit ticket by default. Choose the primitive that gives this teacher the most useful
evidence for the decision she is actually facing, and say in one line why that primitive rather than
another. State the sufficiency line before it could be run, and give the variant rule.

TIER 3 — A LONGER OBSERVATION, only where a short one genuinely cannot reach the claim but a longer one
can, and the claim matters enough to spend the time. Same fields as tier 2. Say plainly what it costs.

TIER 4 — NO CHEAP CHECK. Some claims — judgment over messy data, sustained multi-step problem solving,
extended argument — have no short independent check that reaches them. Every short item either pre-digests
the problem (removing the judgment) or stops being short. When that is true, set "tier" to "no_cheap_check",
give the reason in "no_short_check_reason", and return null for both "modify" and "add". This is an honest
and valuable answer. Do not invent a thin item to avoid giving it.`;

const STAGE_B_RULES = `WHAT YOU MAY NOT DO. These are not style preferences; a response that breaks one is discarded.

The diagnosis you are given was produced by a separate reading that could not see this page and did not
know a remedy was possible. That is deliberate. It is the record of what this assessment does and does not
support, and it is closed.

  · You may NOT decide the claim is missing something other than what the diagnosis says is missing.
  · You may NOT find an additional gap, in this claim or any other. You are not reviewing the assessment.
  · You may NOT read the teacher's claim more strictly than the diagnosis read it.
  · You may NOT re-judge any component. What the diagnosis called present is present.
  · You may NOT argue that the assessment is fine after all. That decision was made upstream, and it was
    made in your favour: you are here only because a gap was already established.
  · You may NOT propose more than one change.

If you believe the diagnosis is wrong, you still do not act on it. Say so in "disagreement" and answer the
question you were asked anyway. Your "disagreement" text is recorded and changes nothing.

Your entire question is: what is the least disruptive valid way to obtain the missing evidence?`;

export function remedySystem() {
  return `${STANCE}

${CONDITIONS_RULE}

${PRIMITIVES}

TASK: one claim on one assessment has already been diagnosed as missing a specific piece of evidence. Choose the smallest valid way to obtain it.

${STAGE_B_RULES}

${HIERARCHY}

JSON — return this object and nothing else:
{ "tier": "modify_item"|"add_observation"|"longer_observation"|"no_cheap_check",
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

/** Renders the frozen Stage A diagnosis for ONE claim as text. Stage B never receives a mutable object. */
export function remedyUser({ subject, grade, assessment, conditions, claim, diagnosis, diagnosis_hash }) {
  const c = conditions;
  const g1 = diagnosis.gate1_components || {};
  const comps = (g1.components || []).map((x) =>
    `  · ${x.component}\n      status: ${x.status}   items: ${(x.items || []).join(", ") || "none"}\n      ${x.evidence || ""}`).join("\n");
  return [
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
    `THE TEACHER-CONFIRMED CLAIM (${claim.id}) — this governs; do not rewrite or narrow it:`,
    claim.statement,
    ``,
    `THE FROZEN DIAGNOSIS for this claim (record ${diagnosis_hash.slice(0, 16)}, closed — not yours to revise):`,
    `  what this assessment DOES support: ${diagnosis.supports}`,
    `  what it does NOT reach:`,
    ...(diagnosis.does_not_support || []).map((x) => `    - ${x}`),
    `  delegation under these conditions: ${(diagnosis.delegation || {}).answer} — ${(diagnosis.delegation || {}).reason}`,
    `  component map:`,
    comps,
    `  the component carried forward as absent: ${g1.carried_forward}`,
    `  why: ${g1.why}`,
    `  materiality: ${(diagnosis.gate2_materiality || {}).why}`,
    `  worth the teacher's attention: ${(diagnosis.gate3_value || {}).why}`,
    ``,
    `THE MISSING EVIDENCE you are to obtain:`,
    diagnosis.missing_evidence || g1.carried_forward,
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
   THE MERGE — the only place a Stage B result may touch a Stage A record.
   ══════════════════════════════════════════════════════════════════════════ */

export const STAGE_B_ALLOWED_KEYS = [
  "tier", "why_not_tier_1", "modify", "add", "no_short_check_reason",
  "student_minutes", "scoring_seconds", "disagreement",
];

/**
 * Filters a Stage B reply to the whitelist and attaches it as `smallest_change`. Anything Stage B
 * returned outside the whitelist is dropped and recorded — it never reaches the record.
 * The Stage A record is re-hashed afterwards; a mismatch is a hard failure of the architecture.
 */
export function mergeRemedy({ claimRecord, diagnosis_hash, remedyRaw }) {
  const violations = [];
  const extra = Object.keys(remedyRaw || {}).filter((k) => !STAGE_B_ALLOWED_KEYS.includes(k));
  if (extra.length) {
    violations.push({ code: "STAGE_B_OVERREACH", detail: `Stage B returned fields outside its whitelist and they were dropped: ${extra.join(", ")}.` });
  }
  const clean = {};
  for (const k of STAGE_B_ALLOWED_KEYS) if (remedyRaw && k in remedyRaw) clean[k] = remedyRaw[k];
  if (String(clean.disagreement || "").trim()) {
    violations.push({ code: "STAGE_B_DISAGREED", detail: `Stage B disagreed with the frozen diagnosis and was overridden: "${String(clean.disagreement).slice(0, 200)}"` });
  }
  const merged = { ...JSON.parse(JSON.stringify(claimRecord)), smallest_change: clean.tier === "no_cheap_check" ? null : clean, stage_b: clean };
  // The Stage A half of the merged record must be byte-identical to what was frozen.
  const back = { ...merged }; delete back.smallest_change; delete back.stage_b;
  if (sha256(canonical(back)) !== diagnosis_hash) {
    violations.push({ code: "DIAGNOSIS_MUTATED", detail: "The Stage A record changed during merge. This is a hard architecture failure." });
  }
  return { merged, violations };
}

/** True when Stage A recorded a genuine gap — the ONLY condition under which Stage B may run. */
export function isGap(claimRecord) {
  const g1 = claimRecord.gate1_components || {};
  const carried = String(g1.carried_forward || "").trim();
  if (!carried) return false;
  const g2 = claimRecord.gate2_materiality || {};
  const g3 = claimRecord.gate3_value || {};
  return g2.material === true && g3.worth_it === true;
}
