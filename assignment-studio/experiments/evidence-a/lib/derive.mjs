// Experiment A — verdict derivation and structural checks.
//
// The verdict is computed here, in code, from the model's structured answers. It is never read from a
// field the model wrote, for the same reason audits.ts derives its three verdicts rather than trusting
// them: a model that is asked for a label will produce a plausible one, and a model that is asked for
// facts and then held to a rule will not.
//
// Nothing here repairs the model's output. Structural violations are RECORDED, not fixed — F4 is
// measured by counting them, so silently truncating a menu of three suggestions to one would delete the
// finding.

export const VERDICTS = ["KEEP", "LIMITED", "NOT_SUPPORTED", "NO_CHEAP_CHECK"];

const s = (v) => (v == null ? "" : String(v).trim());
const arr = (v) => (Array.isArray(v) ? v : []);

// ── Instrument repair 2026-09-10 ────────────────────────────────────────────
// The A1 run recorded 14 structural violations and every one was a false positive. The three causes are
// fixed here and NOWHERE ELSE: this file is the measuring instrument, not the engine. No prompt changed.
//
// R1. `\bproctored\b` cannot match `proctored_in_class`, because `_` is a word character, so the
//     boundary never lands. The declared-conditions vocabulary is underscore-joined by design and the
//     model echoes it back verbatim. Fix: normalise `_` to a space before any of these patterns run.
// R2. The feed-forward matcher fired on "…before any discussion of the take-home quiz", which names the
//     assessment BEING VERIFIED, not where the new observation happens. Fix: strip noun phrases that
//     refer to the assessment under audit before testing, and require the surviving text to place the
//     new observation out of the room.
// R3. `score[ds]?` caught the ordinary verb — "the evidentiary value depends on the reasoning actually
//     being scored" — which is the ontology's own phrasing. Fix: ban only false PRECISION (a number, a
//     letter grade, a named score or rating) and the two forbidden claim words. The verb is allowed.

/** Underscore-joined condition tokens (proctored_in_class, prohibited_and_enforced) read as prose. */
const norm = (t) => String(t || "").replace(/_/g, " ");

/** Remove references to the assessment under audit, so naming it cannot look like a proposal to send
 *  the new observation home. Only noun phrases — "the take-home quiz", "this homework set". */
const stripSourceRefs = (t) => String(t || "")
  .replace(/\b(?:the|this|that|their|a)\s+(?:take[- ]home|home|homework)\s+(?:quiz|assignment|assessment|task|set|sheet|worksheet|paper|packet|problem set|work)\b/gi, " ")
  .replace(/\b(?:the|this|that)\s+(?:take[- ]home|homework)\b/gi, " ");

// False precision only. "sufficient"/"sufficiency" and the AI-resistance family stay banned outright;
// the bare verbs score / scored / scoring / rate do not, because judging what an item is scored FOR is
// exactly the vocabulary this work is built on.
// R3b. A bare number is NOT evidence of false precision in this domain and must never be matched on its
// own. "2/5" is a fraction in a fractions assessment; "a 50% guess rate" is language the ontology
// REQUIRES on any selected-response item. A number only offends when a scoring word is attached to it,
// so every numeric branch below carries that word with it. (Found by the re-score: the one violation
// that survived the first repair pass was the fraction 2/5.)
const BANNED = /\b(?:sufficient|sufficiency)\b|\b(?:validity|confidence|resilience|rigou?r|assessment)\s+(?:score|rating|index|grade)\b|\b(?:scored?|scoring|rat(?:ed|ing)|grade[ds]?)\s*(?:of|at|:)?\s*\d{1,3}\s*(?:%|\/\s?\d{1,3}|\bout of\b)?\b|\b\d{1,3}\s*(?:%|out of \d{1,3})\s+(?:valid|reliable|confident|resilient|sufficient|accurate)\b|\bgrade of [A-F][+-]?\b|\b[A-F][+-]\s+(?:overall|rating|grade)\b|\bpercentile\b|AI[- ]?(?:proof|resistant|resistance)|cheat[- ]?proof/i;

// A proposed observation that leaves the room is not an observation (ontology §1.3 feed-forward rule).
const GOES_HOME = /\bat home\b|\btake[- ]home\b|\bhomework\b|\bovernight\b|\bbefore (?:the )?next class\b|\bsubmit online\b|\bupload\b|\boutside class\b/i;
const SUPERVISED = /\bin[- ]class\b|\bin the room\b|\bproctored\b|\bsupervised\b|\bat the start of\b|\bexit ticket\b|\bwarm[- ]up\b|\bobserved\b|\baloud\b|\bat the board\b|\bmini[- ]whiteboard|\bbefore students leave\b|\bcollected before\b|\bobserved live\b/i;

/** One claim's derived result. Returns the verdict plus every structural violation found, unrepaired. */
export function deriveClaim(raw, declared) {
  const v = [];
  const anyIndep = raw.any_independent_observation === true;
  const covers = raw.covers_whole_claim === true;
  const noCheap = s(raw.no_short_check_reason);
  const add = raw.minimum_additional_observation;

  // ── the verdict rule ──────────────────────────────────────────────────────
  let verdict;
  if (anyIndep && covers) verdict = "KEEP";
  else if (anyIndep && !covers) verdict = "LIMITED";
  else if (!anyIndep && noCheap) verdict = "NO_CHEAP_CHECK";
  else verdict = "NOT_SUPPORTED";

  // ── independence must be consistent with the DECLARED conditions ──────────
  // The model does not get to decide that an unsupervised artifact is independent evidence. This is a
  // property of the conditions the teacher declared, so it is settled here (cf. integrityDevice in
  // audits.ts: whether the text contains a pledge is a property of the version, not a judgement).
  const supervised = declared.supervision === "proctored_in_class" || declared.supervision === "observed_live";
  if (!supervised && anyIndep) {
    v.push({ code: "INDEPENDENCE_UNDER_UNSUPERVISED",
      detail: `Claimed an independent observation while supervision is "${declared.supervision}". Under the three conditions, an unsupervised artifact is never independent evidence.` });
  }
  if (declared.novelty_note && /seen (?:the|these) (?:items|questions)|had the (?:items|questions)|practice(?:d)? the same|identical to (?:the )?(?:homework|practice)/i.test(declared.novelty_note) && anyIndep) {
    v.push({ code: "NOVELTY_IGNORED", detail: "Claimed an independent observation although the teacher's novelty note says the students had the items in advance." });
  }

  // ── minimality and restraint (F4) ─────────────────────────────────────────
  // "Warranted" is deliberately separate from "fully carried": a strong assessment may sample a claim
  // narrowly on purpose, and the correct response to that is a named narrowing and no intervention.
  const warranted = raw.intervention_warranted === true;
  const whyNot = s(raw.why_no_intervention);

  if (verdict === "KEEP" && warranted) {
    v.push({ code: "WARRANTED_ON_KEEP", detail: "Judged the evidence complete for this claim and still called an intervention warranted." });
  }
  if (verdict === "KEEP" && add) {
    v.push({ code: "PROPOSED_ON_KEEP", detail: "Proposed an additional observation for a claim whose evidence it judged complete." });
  }
  if (!warranted && add) {
    v.push({ code: "PROPOSED_UNWARRANTED", detail: "Proposed an additional observation after deciding an intervention was not warranted." });
  }
  if (!warranted && verdict !== "KEEP" && !whyNot && !noCheap) {
    v.push({ code: "UNEXPLAINED_RESTRAINT", detail: "Declined to intervene on an incompletely carried claim without saying why that is the right answer here." });
  }
  if (verdict === "NO_CHEAP_CHECK" && add) {
    v.push({ code: "PROPOSED_ON_NO_CHEAP_CHECK", detail: "Proposed an item after stating that no short check reaches this claim." });
  }
  if (warranted && !add && !noCheap) {
    v.push({ code: "GAP_WITHOUT_REMEDY", detail: "Called an intervention warranted but proposed nothing, and gave no reason why no short check reaches the claim." });
  }
  if (Array.isArray(add)) {
    v.push({ code: "MENU_NOT_MOVE", detail: `Returned ${add.length} observations where the design permits exactly one.` });
  }

  // ── feed-forward (the constraint most likely to be quietly violated) ──────
  if (add && !Array.isArray(add)) {
    const where = norm(s(add.conditions) + " " + s(add.item_text));
    const whereNet = stripSourceRefs(where);          // R2: source references removed before testing
    if (GOES_HOME.test(whereNet)) {
      v.push({ code: "FEED_FORWARD", detail: `Proposed an observation that leaves the room: "${s(add.conditions).slice(0, 120)}". An artifact produced out of the room is a prompt, not a proof.` });
    } else if (!SUPERVISED.test(where)) {          // R1: underscore-joined tokens now read
      v.push({ code: "CONDITIONS_UNSTATED", detail: "Proposed an observation without stating supervised conditions, so it cannot be checked against the independence requirement." });
    }
    if (!s(add.variant_rule)) v.push({ code: "NO_VARIANT_RULE", detail: "Proposed an item with no variant rule, so it cannot be made fresh across periods." });
    if (!s(add.sufficiency_line)) v.push({ code: "NO_LINE_BEFORE", detail: "Proposed an item without stating in advance what a response that counts as evidence contains." });
    if (/explain (?:why|your thinking)|reflect(?:ion)?|in your own words|honesty|pledge|signature/i.test(s(add.item_text)) && s(add.primitive) !== "Diagnose") {
      v.push({ code: "EXPLAIN_AS_MECHANISM", detail: "Leaned on open explanation, reflection or an honesty device, which the primitive set rejects as a standalone mechanism." });
    }
  }

  // ── the anti-overclaim line ───────────────────────────────────────────────
  if (arr(raw.does_not_support).filter(Boolean).length < 2) {
    v.push({ code: "THIN_NEGATIVE_SCOPE", detail: "Fewer than two things named that this evidence does not reach. The negative scope is what stops one right answer being read as mastery." });
  }

  // ── false precision ───────────────────────────────────────────────────────
  const prose = [raw.supports, raw.gap_statement, raw.narrower_inference, raw.over_verified_note, raw.why_no_intervention, ...arr(raw.does_not_support), add && !Array.isArray(add) ? add.sufficiency_line : ""].map(s).join(" \n ");
  const banned = norm(prose).match(BANNED);
  if (banned) v.push({ code: "BANNED_LANGUAGE", detail: `Used measurement or AI-resistance language: "${banned[0]}".` });

  return {
    claim_id: s(raw.claim_id),
    verdict,
    any_independent_observation: anyIndep,
    covers_whole_claim: covers,
    narrower_inference: s(raw.narrower_inference),
    supports: s(raw.supports),
    does_not_support: arr(raw.does_not_support).map(s).filter(Boolean),
    delegation: { answer: s(raw.delegation?.answer), reason: s(raw.delegation?.reason) },
    gap_statement: s(raw.gap_statement),
    intervention_warranted: warranted,
    why_no_intervention: whyNot,
    no_short_check_reason: noCheap,
    over_verified_note: s(raw.over_verified_note),
    proposed: add && !Array.isArray(add) ? {
      primitive: s(add.primitive), item_text: s(add.item_text), variant_rule: s(add.variant_rule),
      conditions: s(add.conditions), sufficiency_line: s(add.sufficiency_line),
      student_minutes: Number(add.student_minutes) || null, scoring_seconds: Number(add.scoring_seconds) || null,
      cost_status: "modeled",
    } : null,
    violations: v,
    items: arr(raw.items).map((i) => ({ item: s(i.item), elicits: s(i.elicits) })),
  };
}

export function deriveCase(rawJson, declared) {
  const claims = arr(rawJson.claims).map((c) => deriveClaim(c, declared));
  return {
    claims,
    interventions: claims.filter((c) => c.proposed).length,
    violations: claims.flatMap((c) => c.violations.map((v) => ({ claim_id: c.claim_id, ...v }))),
    conditions_echo: s(rawJson.conditions_echo),
    reviewer_notes: s(rawJson.reviewer_notes),
  };
}

/** Score one derived case against pre-registered, claim-level ground truth.
 *
 *  R4 (instrument repair 2026-09-10): ground truth may set `intervention: null`, meaning "deliberately
 *  not scored on this axis" — used where two verdicts are both defensible and the intervention that
 *  follows depends on which one the engine gives. The A1 scorer collapsed null to false and counted
 *  X3/K4 as a miss. Null now routes to `not_scored` and is excluded from every intervention count.
 *
 *  Each scored claim lands in exactly one confusion cell, so restraint and detection can never be
 *  traded off inside a single aggregate. */
export const CONFUSION_CELLS = ["justified_proposed", "justified_missed", "unnecessary_proposed", "restraint_correct", "not_scored"];

export function scoreCase(derived, truth) {
  const rows = [];
  for (const exp of truth.claims) {
    const got = derived.claims.find((c) => c.claim_id === exp.claim_id);
    const allowed = Array.isArray(exp.verdict) ? exp.verdict : [exp.verdict];
    const scored = exp.intervention === true || exp.intervention === false;
    const wants = exp.intervention === true;
    const gotFix = got ? !!got.proposed : false;
    let cell;
    if (!scored) cell = "not_scored";
    else if (wants && gotFix) cell = "justified_proposed";
    else if (wants && !gotFix) cell = "justified_missed";
    else if (!wants && gotFix) cell = "unnecessary_proposed";
    else cell = "restraint_correct";
    rows.push({
      claim_id: exp.claim_id,
      expected: allowed.join(" or "),
      actual: got ? got.verdict : "MISSING",
      match: got ? allowed.includes(got.verdict) : false,
      intervention_scored: scored,
      expects_intervention: wants,
      got_intervention: gotFix,
      intervention_match: scored ? (got ? wants === gotFix : false) : null,
      cell,
      note: exp.why || "",
    });
  }
  const extra = derived.claims.filter((c) => !truth.claims.some((e) => e.claim_id === c.claim_id)).map((c) => c.claim_id);
  const confusion = Object.fromEntries(CONFUSION_CELLS.map((k) => [k, rows.filter((r) => r.cell === k).length]));
  return {
    rows,
    confusion,
    claims_matched: rows.filter((r) => r.match).length,
    claims_total: rows.length,
    intervention_scored_total: rows.filter((r) => r.intervention_scored).length,
    intervention_matched: rows.filter((r) => r.intervention_match === true).length,
    unexpected_claims: extra,
    // An intervention proposed on a claim whose ground truth says none was warranted.
    manufactured: rows.filter((r) => r.cell === "unnecessary_proposed").map((r) => r.claim_id),
    missed: rows.filter((r) => r.cell === "justified_missed").map((r) => r.claim_id),
  };
}

export function extractJson(text) {
  const t = String(text).replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const start = t.indexOf("{");
  if (start < 0) throw new Error("no JSON object in reply");
  let depth = 0, inStr = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) { if (c === "\\") { i++; continue; } if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") { depth--; if (depth === 0) return JSON.parse(t.slice(start, i + 1)); }
  }
  throw new Error("unbalanced JSON object");
}
