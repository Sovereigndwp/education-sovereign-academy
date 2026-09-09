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

// Words that would smuggle a measurement back in. Checked against every free-text field the teacher
// would see; a hit is recorded as a violation rather than scrubbed.
const BANNED = /\b(sufficient|sufficiency|score[ds]?|scoring out of|rating|rated|percentile|confidence (?:score|level|of \d)|\d{1,3}\s?%|\b\d{1,3}\s?\/\s?100\b|grade of [A-F]\b|[A-F][+-]\s+(?:for|on|overall)|AI[- ]?(?:proof|resistant|resistance)|cheat[- ]?proof)/i;
// A proposed observation that leaves the room is not an observation (ontology §1.3 feed-forward rule).
const GOES_HOME = /\bat home\b|\btake[- ]home\b|\bhomework\b|\bovernight\b|\bbefore (?:the )?next class\b|\bsubmit online\b|\bupload\b|\boutside class\b/i;
const SUPERVISED = /\bin class\b|\bin the room\b|\bproctored\b|\bsupervised\b|\bat the start of\b|\bexit ticket\b|\bwarm[- ]up\b|\bobserved\b|\baloud\b|\bat the board\b|\bmini[- ]whiteboard/i;

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
    const where = s(add.conditions) + " " + s(add.item_text);
    if (GOES_HOME.test(where)) {
      v.push({ code: "FEED_FORWARD", detail: `Proposed an observation that leaves the room: "${s(add.conditions).slice(0, 120)}". An artifact produced out of the room is a prompt, not a proof.` });
    } else if (!SUPERVISED.test(where)) {
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
  const banned = prose.match(BANNED);
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

/** Score one derived case against pre-registered, claim-level ground truth. */
export function scoreCase(derived, truth) {
  const rows = [];
  for (const exp of truth.claims) {
    const got = derived.claims.find((c) => c.claim_id === exp.claim_id);
    const allowed = Array.isArray(exp.verdict) ? exp.verdict : [exp.verdict];
    rows.push({
      claim_id: exp.claim_id,
      expected: allowed.join(" or "),
      actual: got ? got.verdict : "MISSING",
      match: got ? allowed.includes(got.verdict) : false,
      expects_intervention: exp.intervention === true,
      got_intervention: got ? !!got.proposed : false,
      intervention_match: got ? (exp.intervention === true) === !!got.proposed : false,
      note: exp.why || "",
    });
  }
  const extra = derived.claims.filter((c) => !truth.claims.some((e) => e.claim_id === c.claim_id)).map((c) => c.claim_id);
  return {
    rows,
    claims_matched: rows.filter((r) => r.match).length,
    claims_total: rows.length,
    intervention_matched: rows.filter((r) => r.intervention_match).length,
    unexpected_claims: extra,
    // F1's unit: an intervention proposed on a claim whose ground truth says none was warranted.
    manufactured: rows.filter((r) => !r.expects_intervention && r.got_intervention).map((r) => r.claim_id),
    missed: rows.filter((r) => r.expects_intervention && !r.got_intervention).map((r) => r.claim_id),
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
