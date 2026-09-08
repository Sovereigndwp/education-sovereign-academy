// Assignment Studio — three narrow internal quality loops. Not generic AI review.
//
//   1. Instructional Preservation Audit  — transformed version vs teacher-confirmed Learning Contract + mode permissions.
//                                          PASS | REVIEW | BLOCK, with the specific invariant/permission as evidence.
//   2. Teacher-Usefulness Audit          — practical usefulness only (clarity, feasibility, editing, grading burden, improvement).
//                                          Deliberately separate from validity.
//   3. Adversarial Student Audit         — try to satisfy the version with AI while avoiding the learning; name the cheapest path.
//                                          SURVIVES | WEAKENED | UNDERMINED. UNDERMINED (or BLOCK) triggers ONE bounded repair cycle.
//
// Every output is structured and persisted on as_versions.audits so it can later be compared with what the teacher actually did.
import { CONTRACT_FIELDS, MODES, type LearningContract, type Mode, extractJson } from "./contract.ts";

// Identifies audit BEHAVIOUR in persisted rows, not just the prompt text: v5 = v4 prompts + the deterministic
// integrity-device rule in normPreservation.
export const AUDIT_PROMPT_VERSION = "audit-2026-09-08-v5";

export type PreservationVerdict = "PASS" | "REVIEW" | "BLOCK";
export type UsefulnessVerdict = "USEFUL" | "USEFUL_WITH_EDITS" | "NOT_USEFUL";
export type AdversarialVerdict = "SURVIVES" | "WEAKENED" | "UNDERMINED";

export interface PreservationAudit {
  verdict: PreservationVerdict;
  findings: { invariant: string; rule?: string; permission: "preserve" | "may_adapt" | "may_extend" | "must_not"; kind: "held" | "exceeded" | "unclear"; evidence: string; severity: "block" | "review" | "note"; still_required?: boolean; weakened_or_given_away?: boolean }[];
  summary: string;
}
export interface UsefulnessAudit {
  verdict: UsefulnessVerdict;
  clarity: 1 | 2 | 3;              // 3 = a teacher could hand it out unread
  feasibility: 1 | 2 | 3;          // 3 = fits the stated time/format/materials
  editing_required: "none" | "minor" | "substantial";
  grading_burden: "less" | "same" | "slightly more" | "much more";
  improves_original: boolean;
  notes: string[];
  ignored_validity_notes: string[];   // sink: validity observations kept OUT of the usefulness score (persisted for calibration)
}
export interface AdversarialAudit {
  verdict: AdversarialVerdict;
  cheapest_path: string;           // one paragraph: what a student would actually do
  steps: string[];
  cost_to_student: "trivial" | "low" | "moderate" | "high";
  what_survives: string;           // the learning signal that still shows up even on that path
  what_is_bypassed: string;
  repair_hint: string;             // the smallest change that would make the path fail; "" if none needed
  independent_check: boolean;      // does the version contain an in-person / in-class / prior-commitment element that would expose a hollow hand-in on part of the evidence?
  independent_check_what: string;
}
export interface AuditRound { round: number; preservation: PreservationAudit; usefulness: UsefulnessAudit; adversarial: AdversarialAudit; at: string; model: string; prompt_version: string }
export interface AuditRecord { rounds: AuditRound[]; repair_reason: string | null }

const COMMON = `You are an internal audit inside Assignment Studio (The Sovereign Academy). You audit ONE transformed version of a teacher's assignment. You are not a reviewer of the teacher, not a grader, and not a general critic. Answer only the question this audit asks. Quote the version when you make a claim. Output ONLY one JSON object.`;

function contractBlock(c: LearningContract) {
  return CONTRACT_FIELDS.map((f) => `- ${f}: ${c[f] || "(none stated)"}`).join("\n");
}

// ── 1 · Instructional Preservation Audit ─────────────────────────────────────
export function preservationSystem(mode: Mode): string {
  const m = MODES[mode];
  return `${COMMON}

AUDIT: Instructional Preservation. Mode under audit: ${m.label.toUpperCase()}.

The teacher CONFIRMED a Learning Contract. The mode grants these permissions:
MUST PRESERVE: ${m.must_preserve.join("; ")}
MAY ${m.may_verb.toUpperCase()}: ${m.may.join("; ")}
MUST NOT: ${m.must_not.join("; ")}

For each of the four contract fields and for factual/mathematical correctness, decide whether the transformed version HELD it, EXCEEDED the permission (changed something it may not change, or failed to extend where the mode requires extension), or is UNCLEAR. Look especially for the counterfeits: scaffolds that walk the path instead of structuring it; the assessed position/answer stated in directions; numbers or data altered so the difficult part disappears; "more items" presented as depth; recall substituted for analysis; a required product (paragraph, graph, mixed number, rubric point) quietly dropped.

What "exceeded" means for a PRESERVE field: the version no longer requires or produces it, weakens it, substitutes something easier, or supplies the assessed reasoning. Test it this way: is every element of the contract's required evidence / required thinking STILL demanded of the student? If yes, the field is "held" — even when the version wraps that evidence in a mandated format (boxes, complete sentences, a required second method, a reflection) or asks for more on top. Mandating a format around evidence that is still required is not exceeding; removing a valid route the contract explicitly allows (e.g. forbidding the benchmark method) is. Record additions as "held" with a note, or "unclear" if an addition could change what is measured. Whether the extra work is reasonable is the Usefulness audit's question, not this one.

Severity (be strict about this; the verdict is derived from it):
- "block" is reserved for instructional failures: learning_target / required_thinking / required_evidence removed, weakened, substituted, or given away; correctness broken; the documents or data altered so the difficult part disappears; or one of these MUST-NOT rules clearly violated: give away reasoning being assessed · remove essential thinking · substitute recall for analysis/application · solve the difficult part for the student · merely add more questions · introduce unrelated content and call it enrichment · claim to be AI-proof · depend on AI detection · use surveillance as verification.
- "review" for: teacher_constraints not met (time, format, rubric); workload and burden rules (create disproportionate grading burden · increase workload without increasing depth · turn everything into oral defense · confuse inconvenience with assessment validity) — name them, quote the evidence, but their magnitude is judged by the Usefulness audit; and anything unclear. Treating burden as an instructional-validity failure is itself the "confuse inconvenience with assessment validity" error.
- "note" for held elements.
For every must_not finding, put the exact rule text in "rule".
For every contract-field finding (learning_target, required_thinking, required_evidence), answer two booleans and let them decide: still_required — is EVERY element the contract names still demanded of the student in this version? weakened_or_given_away — is any of it supplied, answered, pre-selected, replaced with recall, or made optional? "exceeded" is true only when still_required is false or weakened_or_given_away is true; extra work on top never makes still_required false.

Verdict rule:
- BLOCK: at least one "block"-severity finding with kind "exceeded" and quoted evidence.
- REVIEW: no block, but at least one "review" finding or an unclear element.
- PASS: every element held or changed within permission, with evidence.
Do not manufacture findings. A clean PASS with two lines of evidence is a valid result.

JSON: { "verdict": "PASS"|"REVIEW"|"BLOCK",
  "findings": [ { "invariant": "learning_target"|"required_thinking"|"required_evidence"|"teacher_constraints"|"correctness"|"must_not",
                  "rule": string,   // exact must_not rule text when invariant is "must_not"; "" otherwise
                  "permission": "preserve"|"may_adapt"|"may_extend"|"must_not", "kind": "held"|"exceeded"|"unclear",
                  "still_required": boolean, "weakened_or_given_away": boolean,   // contract fields only
                  "evidence": string, "severity": "block"|"review"|"note" } ],
  "summary": string }`;
}

// ── 2 · Teacher-Usefulness Audit ─────────────────────────────────────────────
export function usefulnessSystem(mode: Mode): string {
  return `${COMMON}

AUDIT: Teacher Usefulness. Mode: ${MODES[mode].label}. Judge the transformed version ONLY as something a real teacher must use in class tomorrow. ASSUME it is instructionally valid — a separate audit decides whether it preserved the Learning Contract, and it will catch giveaways, weakened thinking, or wrong evidence. If you notice such problems, do NOT let them into any score or note here; a version can be instructionally wrong and still perfectly usable, and vice versa. Assess practicality only:
- clarity: could a teacher hand this out without rewriting directions? (3 = yes; 2 = a few edits; 1 = needs rework)
- feasibility: does it fit the stated time, format, materials, and class setting? (3 = fits; 2 = tight; 1 = does not fit)
- editing_required: none | minor | substantial — edits needed to USE it as it stands (layout, missing key, a broken direction, length), never edits to fix its instructional validity.
- grading_burden relative to the original: less | same | slightly more | much more — what must be read or checked PER STUDENT. One-time preparation is not grading burden: ten personalised answers for one item = a ten-row table prepared once and one lookup per student = "slightly more", never "much more". "much more" means each paper takes roughly double the reading or checking.
- ignored_validity_notes: if you noticed anything about whether the version preserves the learning (position given away, evidence pre-selected, thinking removed, tone of distrust, "does not make thinking visible"), put it HERE and nowhere else. It must not influence any score, editing_required, improves_original, or the notes.
- improves_original: as a classroom artifact, is this version practically better than the original for the mode's purpose — clearer to hand out, better organised, easier to work on (Support); richer tasks presented cleanly (Advanced); reasoning prompts that are workable in the period (Visible)? true/false. This is about the artifact, not about whether the learning is preserved.
Verdict: USEFUL (clarity ≥2, feasibility ≥2, editing ≤ minor, grading ≤ slightly more, improves_original true) · USEFUL_WITH_EDITS (one of those misses, fixable) · NOT_USEFUL (two or more miss, or grading "much more" without the teacher having asked for it, or it does not improve the original).
notes: 2–5 concrete lines a teacher would want ("Directions for Part B run 9 lines; cut to 4", "Item 7 needs an answer in the key").

JSON: { "verdict": "USEFUL"|"USEFUL_WITH_EDITS"|"NOT_USEFUL", "clarity": 1|2|3, "feasibility": 1|2|3, "editing_required": "none"|"minor"|"substantial",
  "grading_burden": "less"|"same"|"slightly more"|"much more", "improves_original": boolean, "notes": [string], "ignored_validity_notes": [string] }`;
}

// ── 3 · Adversarial Student Audit ────────────────────────────────────────────
export function adversarialSystem(): string {
  return `${COMMON}

AUDIT: Adversarial Student. Role-play a capable student who has an AI assistant and wants to satisfy this assignment while doing as little of the intended thinking as possible. Find the CHEAPEST path that would earn credit: what exactly would the student paste, ask, and hand in? Include photographing the sheet, pasting personalised numbers, and asking for "in a 13-year-old's voice". Be concrete and honest — do not pretend a task is safe because it says "explain in your own words" or "no AI allowed".

Then judge the LEARNING SIGNAL, not the cheating: on that cheapest path, what evidence of the Learning Contract still appears in the hand-in (what_survives), and what is bypassed?

What does NOT count as surviving signal: "in your own words" instructions; honesty pledges or signatures; personalised numbers that the student can simply hand to the AI; "the teacher might notice AI-sounding language"; "harder to copy from a classmate"; any form of detection. Only structure that forces the thinking or exposes its absence counts.
Before deciding, scan the version for any of these words or their equivalents: conference · meet with the teacher · in class · live · aloud · before you begin / before calculating · checkpoint. If one is present and applies to at least part of the required evidence, independent_check MUST be true and quoted.
independent_check: true only if the version contains an element done in person, in class, or committed BEFORE the rest of the work (a prediction made before the data; a conference or two-line live verification on named items; a choice the student must justify from their own earlier answer) that would expose a hollow hand-in on at least part of the required evidence. Describe it in independent_check_what, or "" if none.

Rules (the verdict is derived from your evidence, so be accurate about cost and independent_check):
- SURVIVES: the cheapest path still forces the student to do the required thinking, or the independent check covers the core of it.
- WEAKENED: an independent check exposes part of the evidence, or the cheapest path costs the student moderate/high effort.
- UNDERMINED: the whole required evidence can be produced without the required thinking at trivial or low cost, and there is no independent check.
repair_hint: the SMALLEST change that would make the cheapest path fail or become visible (not a new assignment; not surveillance; not oral defence for everyone; not "ban AI"). Empty string if SURVIVES.
Never claim anything is AI-proof.

JSON: { "verdict": "SURVIVES"|"WEAKENED"|"UNDERMINED", "cheapest_path": string, "steps": [string], "cost_to_student": "trivial"|"low"|"moderate"|"high",
  "what_survives": string, "what_is_bypassed": string, "repair_hint": string, "independent_check": boolean, "independent_check_what": string }`;
}

export function auditUser(args: { subject: string; grade: string; contract: LearningContract; original: string; version: string; mode: Mode; trace?: unknown; blind?: boolean }): string {
  // blind = the Usefulness audit: it is handed the teacher's practical constraints only, never the learning target /
  // required thinking / required evidence, so it has no basis on which to judge instructional validity.
  return [
    `Subject: ${args.subject} · Grade/course: ${args.grade} · Mode: ${MODES[args.mode].label}`,
    ``, args.blind ? `TEACHER'S PRACTICAL CONSTRAINTS (time, format, grading):\n- ${args.contract.teacher_constraints || "(none stated)"}` : `TEACHER-CONFIRMED LEARNING CONTRACT:\n${contractBlock(args.contract)}`,
    ``, `ORIGINAL ASSIGNMENT:\n"""\n${args.original}\n"""`,
    ``, `TRANSFORMED VERSION UNDER AUDIT:\n"""\n${args.version}\n"""`,
    args.trace ? `\nThe engine's own trace (claims to check, not to trust):\n${JSON.stringify(args.trace).slice(0, 3000)}` : "",
    ``, `Return the JSON object now.`,
  ].join("\n");
}

// ── normalisation ────────────────────────────────────────────────────────────
const s = (v: unknown) => (v == null ? "" : String(v).trim());
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(s(v) as T) ? (s(v) as T) : fallback);
const n3 = (v: unknown): 1 | 2 | 3 => (Number(v) >= 3 ? 3 : Number(v) <= 1 ? 1 : 2);

// MUST-NOT rules whose violation is an instructional failure (block-level). Workload/burden rules are review-level:
// their magnitude belongs to the Usefulness audit (v0.1: "confuse inconvenience with assessment validity").
const BLOCK_RULES = /give away reasoning|remove essential thinking|substitute recall|solve the difficult part|merely add more questions|unrelated content|ai-proof|ai detection|surveillance/i;
const REVIEW_ONLY_INVARIANTS = new Set(["teacher_constraints"]);

// ── Integrity devices: decided in code, not by the model ─────────────────────
// MAKE THINKING MORE VISIBLE promises that verification comes from the STRUCTURE of the work. An integrity
// device — an honour pledge, a "no AI was used" signature, an AI-proof or AI-detection claim — verifies nothing,
// and MODES.visible.must_not already names it ("claim to be AI-proof" · "depend on AI detection" ·
// "confuse inconvenience with assessment validity"). Whether such text is present is a property of the version,
// not a judgement, so it is settled here: the model saw it in one run and missed it in the next.
// Two tiers, because they are not the same failure:
//   claim  → the version asserts something untrue about itself (AI-proof / will be detected) → block
//   pledge → a promise of honesty stands in for a way to see the thinking → review; no learning is removed, and
//            v0.1's own rule is not to confuse inconvenience with assessment validity. What is actually wrong
//            with such a version is that the thinking is still bypassable — the Adversarial audit owns that.
// Only what the TRANSFORMATION introduced counts. A pledge the teacher's own assignment already carries is
// preserved, not introduced; Assignment Studio does not police the teacher's document.
const AI_CLAIM = /\bAI[-\s]?(proof|resistant|resistance)\b|cannot be (done|completed|finished|written) (with|by|using) (an? )?(AI|chatbot)|\bAI[-\s]?detect(or|ors|ion)\b|\bplagiarism (checker|detector|software)\b|\bturnitin\b|will be (checked|scanned|screened|run) (for|through) (an? )?(AI|plagiarism)/i;
const PLEDGE = /\bhonesty statement\b|\bhonou?r (code|pledge)\b|\bacademic integrity\b|\bI pledge\b|without (using|the use of|any) (an? )?(AI|artificial intelligence|chatbot|generative)|\bI (did not|didn'?t|have not|haven'?t) use[d]? (an? )?(AI|chatbot)|\bno AI (was |were )?(used|allowed|permitted)\b|signature\s*:?\s*_{3,}/i;
const AI_RULE_LABEL = /ai-proof|ai detection|surveillance|inconvenience/i;

type Finding = PreservationAudit["findings"][number];

/** Lines in the version that are not in the original — a conservative stand-in for "what the transform added". */
function addedLines(original: string, version: string): string {
  const had = new Set((original || "").split("\n").map((l) => l.trim().toLowerCase()).filter(Boolean));
  return (version || "").split("\n").map((l) => l.trim()).filter((l) => l && !had.has(l.toLowerCase())).join("\n");
}
/** The most substantive matching line, so the teacher sees the pledge itself and not the heading above it. */
function firstMatch(text: string, re: RegExp): string {
  const hits = text.split("\n").filter((l) => re.test(l)).map((l) => l.replace(/^#+\s*/, "").replace(/_{3,}/g, "____").trim());
  return (hits.sort((a, b) => b.length - a.length)[0] || "").slice(0, 180);
}

/** The finding for a visible-mode version that ADDED an integrity device; null when there is none. */
export function integrityDevice(original: string, version: string, mode: Mode): { finding: Finding; tier: "claim" | "pledge" } | null {
  if (mode !== "visible") return null;
  const added = addedLines(original, version);
  if (AI_CLAIM.test(added) && !AI_CLAIM.test(original || "")) {
    return { tier: "claim", finding: {
      invariant: "must_not", rule: "claim to be AI-proof", permission: "must_not", kind: "exceeded", severity: "block",
      evidence: `This version tells students the work is AI-proof or will be detected — "${firstMatch(added, AI_CLAIM)}" — and nothing in it makes that true. This mode must not depend on detection.`,
    } };
  }
  if (PLEDGE.test(added) && !PLEDGE.test(original || "")) {
    return { tier: "pledge", finding: {
      invariant: "must_not", rule: "confuse inconvenience with assessment validity", permission: "must_not", kind: "exceeded", severity: "review",
      evidence: `A promise of honest work was added — "${firstMatch(added, PLEDGE)}" — where this mode calls for a way to see the thinking. A student who used AI signs it too, so it verifies nothing.`,
    } };
  }
  return null;
}

/** ctx enables the deterministic integrity-device check; without it behaviour is exactly as before. */
export function normPreservation(text: string, ctx?: { original: string; version: string; mode: Mode }): PreservationAudit {
  const r = extractJson(text);
  const findings = (Array.isArray(r.findings) ? r.findings : []).map((f) => {
    const o = (f ?? {}) as Record<string, unknown>;
    const permission = pick(o.permission, ["preserve", "may_adapt", "may_extend", "must_not"] as const, "preserve");
    let invariant = s(o.invariant).slice(0, 120);
    const rule = s(o.rule).slice(0, 200);
    let severity = pick(o.severity, ["block", "review", "note"] as const, "note");
    // Code-level caps, so a lenient or over-strict model cannot move the verdict on its own:
    if (REVIEW_ONLY_INVARIANTS.has(invariant) && severity === "block") severity = "review";
    if (permission === "must_not" || invariant === "must_not" || (!["learning_target", "required_thinking", "required_evidence", "teacher_constraints", "correctness"].includes(invariant))) {
      const ruleText = rule || invariant;
      if (severity === "block" && !BLOCK_RULES.test(ruleText + " " + s(o.evidence).slice(0, 200))) severity = "review";
      if (invariant !== "must_not" && !["learning_target", "required_thinking", "required_evidence", "teacher_constraints", "correctness"].includes(invariant)) invariant = "must_not";
    }
    let kind = pick(o.kind, ["held", "exceeded", "unclear"] as const, "unclear");
    const still_required = typeof o.still_required === "boolean" ? o.still_required : undefined;
    const weakened = typeof o.weakened_or_given_away === "boolean" ? o.weakened_or_given_away : undefined;
    // For the three learning fields, "exceeded" is derived from the two booleans, not from the model's label:
    // more work on top of evidence that is still required is never a preservation failure.
    if (["learning_target", "required_thinking", "required_evidence"].includes(invariant) && still_required !== undefined && weakened !== undefined) {
      if (still_required && !weakened) { if (kind === "exceeded") kind = "unclear"; if (severity === "block") severity = "review"; }
      else { kind = "exceeded"; }
    }
    return {
      invariant, rule, permission, kind,
      evidence: s(o.evidence).slice(0, 800),
      severity, still_required, weakened_or_given_away: weakened,
    };
  }).filter((f) => f.invariant);

  // The integrity-device rule, applied before the verdict is derived. It is normative, not a backstop: left to
  // the model's own severity the same version BLOCKs in the run where it calls the pledge "AI-proof" and PASSes
  // in the run where it does not mention the pledge at all.
  if (ctx) {
    const added = addedLines(ctx.original, ctx.version);
    const claimed = AI_CLAIM.test(added) || AI_CLAIM.test(ctx.original || "");
    // "claim to be AI-proof" and "depend on AI detection" name a claim the version would have to MAKE. With no
    // such text in it, a finding under those rules reads tone, not a claim — a real observation, review-level.
    if (!claimed) for (const f of findings) if (AI_RULE_LABEL.test(f.rule || "") && f.severity === "block") f.severity = "review";
    const covers = (f: Finding) => (f.invariant === "must_not" || f.permission === "must_not") &&
      (AI_RULE_LABEL.test(f.rule || "") || PLEDGE.test(f.evidence) || AI_CLAIM.test(f.evidence));
    const dev = integrityDevice(ctx.original, ctx.version, ctx.mode);
    if (dev && !findings.some(covers)) findings.push({ ...dev.finding, rule: dev.finding.rule ?? "", still_required: undefined, weakened_or_given_away: undefined });
  }

  // Verdict is derived from the findings, not trusted from the model: a "block" finding is a BLOCK.
  let verdict = pick(r.verdict, ["PASS", "REVIEW", "BLOCK"] as const, "REVIEW");
  if (findings.some((f) => f.severity === "block" && f.kind === "exceeded")) verdict = "BLOCK";
  else if (verdict === "BLOCK") verdict = "REVIEW"; // BLOCK without block-level evidence is downgraded
  else if (findings.some((f) => f.severity === "review" || f.kind === "unclear")) verdict = verdict === "PASS" ? "REVIEW" : verdict;
  return { verdict, findings: findings.slice(0, 12), summary: s(r.summary).slice(0, 800) };
}

export function normUsefulness(text: string): UsefulnessAudit {
  const r = extractJson(text);
  const u: UsefulnessAudit = {
    verdict: pick(r.verdict, ["USEFUL", "USEFUL_WITH_EDITS", "NOT_USEFUL"] as const, "USEFUL_WITH_EDITS"),
    clarity: n3(r.clarity), feasibility: n3(r.feasibility),
    editing_required: pick(r.editing_required, ["none", "minor", "substantial"] as const, "minor"),
    grading_burden: pick(r.grading_burden, ["less", "same", "slightly more", "much more"] as const, "same"),
    improves_original: Boolean(r.improves_original),
    notes: (Array.isArray(r.notes) ? r.notes : []).map(s).filter(Boolean).slice(0, 6),
    ignored_validity_notes: (Array.isArray(r.ignored_validity_notes) ? r.ignored_validity_notes : []).map(s).filter(Boolean).slice(0, 6),
  };
  // Derive the verdict from the rubric so it cannot drift from the evidence.
  const misses = [u.clarity < 2, u.feasibility < 2, u.editing_required === "substantial", u.grading_burden === "much more", !u.improves_original].filter(Boolean).length;
  u.verdict = misses === 0 ? "USEFUL" : misses === 1 && u.grading_burden !== "much more" && u.improves_original ? "USEFUL_WITH_EDITS" : "NOT_USEFUL";
  return u;
}

export function normAdversarial(text: string): AdversarialAudit {
  const r = extractJson(text);
  const a: AdversarialAudit = {
    verdict: pick(r.verdict, ["SURVIVES", "WEAKENED", "UNDERMINED"] as const, "WEAKENED"),
    cheapest_path: s(r.cheapest_path).slice(0, 1500),
    steps: (Array.isArray(r.steps) ? r.steps : []).map(s).filter(Boolean).slice(0, 8),
    cost_to_student: pick(r.cost_to_student, ["trivial", "low", "moderate", "high"] as const, "low"),
    what_survives: s(r.what_survives).slice(0, 800),
    what_is_bypassed: s(r.what_is_bypassed).slice(0, 800),
    repair_hint: s(r.repair_hint).slice(0, 800),
    independent_check: Boolean(r.independent_check) && Boolean(s(r.independent_check_what)),
    independent_check_what: s(r.independent_check_what).slice(0, 400),
  };
  // Derive the verdict from cost + independent check; the model's own verdict only decides SURVIVES vs WEAKENED
  // when an independent check exists or the path is expensive. Detection-based "survival" cannot raise the verdict.
  const cheap = a.cost_to_student === "trivial" || a.cost_to_student === "low";
  if (cheap && !a.independent_check) a.verdict = "UNDERMINED";
  else if (a.verdict === "SURVIVES" && !(a.independent_check || a.cost_to_student === "high")) a.verdict = "WEAKENED";
  else if (a.verdict === "UNDERMINED") a.verdict = "WEAKENED";
  return a;
}

/** The one place that decides whether a bounded repair cycle runs. */
export function needsRepair(p: PreservationAudit, a: AdversarialAudit, mode: Mode): string | null {
  if (p.verdict === "BLOCK") {
    const f = p.findings.find((x) => x.severity === "block");
    return `Preservation audit BLOCK — ${f?.invariant}${f?.rule ? " (" + f.rule + ")" : ""}: ${f?.evidence}`;
  }
  // Adversarial UNDERMINED triggers repair only in the mode whose objective is observable reasoning.
  // Support and Advanced record the verdict (a take-home task is expected to be shortcut-able) but are not repaired for it.
  if (a.verdict === "UNDERMINED" && mode === "visible") return `Adversarial audit UNDERMINED — cheapest path: ${a.cheapest_path}${a.repair_hint ? ` · repair hint: ${a.repair_hint}` : ""}`;
  return null;
}
