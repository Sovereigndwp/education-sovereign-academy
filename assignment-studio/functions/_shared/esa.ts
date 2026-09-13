// ESA — the evidence-review engine. Two stages, with the separation enforced in code.
//
// Stage A diagnoses: what can this assessment legitimately tell the teacher? It cannot see a remedy —
// not because it is told not to, but because the remedy prompts are different strings and every
// assembled Stage A prompt is scanned before it is sent.
// Stage B selects a remedy, and only for a limitation Stage A already recorded. It receives the frozen
// diagnosis as text, its reply is filtered to a whitelist, and the diagnosis is re-hashed after merge.
//
// This is the architecture that passed the structural check on 2026-09-10
// (experiments/evidence-a/STRUCTURAL-CHECK-2026-09-10.md). The prompts are generated from that run's
// own module — see esa-prompts.ts.
import { db, nowIso } from "./lib.ts";
import { callModel } from "./engine.ts";
import {
  DIAGNOSIS_SYSTEM, REMEDY_SYSTEM_COVERAGE, REMEDY_SYSTEM_CONDITIONS, REMEDY_TOKENS,
  ESA_ARCH_VERSION, PROMPT_SHA,
} from "./esa-prompts.ts";

export { ESA_ARCH_VERSION, PROMPT_SHA };

export interface Claim { id: string; statement: string; claim_type: string; quoted_verb?: string; items?: string[] }
export interface Conditions {
  supervision: string; collaboration: string; ai_policy: string; resources: string[];
  purpose: string; time_minutes?: number | null; when_in_sequence?: string; novelty_note?: string;
  needs_individual_attribution: boolean;
}

/* ── the leak check ───────────────────────────────────────────────────────────
   Mechanical. A Stage A prompt carrying remedy vocabulary is never sent. `payloads` are strings the
   TEACHER wrote — her assessment and her claims — and are removed before scanning: she may write
   "repair the error" in an item and that is her assessment, not our instructions leaking. */
export function assertNoRemedyLeak(label: string, text: string, payloads: string[] = []): void {
  let scaffold = String(text);
  for (const p of payloads) if (p) scaffold = scaffold.split(String(p)).join("  TEACHER  ");
  const hay = scaffold.toLowerCase();
  const hits = REMEDY_TOKENS.filter((t) => hay.includes(t.toLowerCase()));
  if (hits.length) throw new Error(`REMEDY LEAK into ${label}: ${hits.join(", ")}`);
}

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export function canonical(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(",")}}`;
}
export function deepFreeze<T>(o: T): T {
  if (o && typeof o === "object") { Object.values(o as Record<string, unknown>).forEach(deepFreeze); Object.freeze(o); }
  return o;
}

export function extractJson(text: string): Record<string, unknown> {
  const t = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("no JSON object in model output");
  return JSON.parse(t.slice(a, b + 1));
}

/* ── the span check ───────────────────────────────────────────────────────────
   A component must be anchored to a verbatim, non-overlapping span of the teacher's own claim, and must
   name the student verb inside that span. A phrase describing HOW a move is done has no verb of its own,
   so a manner qualifier fails here rather than being argued with in a prompt. This is the correction
   that fixed the over-decomposition failure; it is checked against the claim string, not asserted. */
const normSpan = (s: unknown) =>
  String(s ?? "").toLowerCase().replace(/[—–]/g, "-").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

export interface Component {
  claim_span?: string; verb?: string; component?: string; items?: string[];
  status?: string; evidence?: string;
}
export interface SpanViolation { code: string; detail: string; claim_id?: string }

export function validateSpans(components: Component[], claimStatement: string): SpanViolation[] {
  const v: SpanViolation[] = [];
  const hay = normSpan(claimStatement);
  const used: Array<[number, number, string]> = [];
  for (const c of components ?? []) {
    const span = normSpan(c.claim_span);
    if (!span) { v.push({ code: "NO_CLAIM_SPAN", detail: `Component "${String(c.component).slice(0, 90)}" cites no span of the claim.` }); continue; }
    const at = hay.indexOf(span);
    if (at < 0) { v.push({ code: "SPAN_NOT_IN_CLAIM", detail: `Component "${String(c.component).slice(0, 70)}" cites "${String(c.claim_span).slice(0, 70)}", which is not in the teacher's claim.` }); continue; }
    const verb = normSpan(c.verb);
    if (!verb) v.push({ code: "NO_VERB", detail: `Component "${String(c.component).slice(0, 70)}" names no student verb.` });
    else if (!span.includes(verb.replace(/e?s$/, "").slice(0, Math.max(3, verb.length - 2)))) {
      v.push({ code: "VERB_NOT_IN_SPAN", detail: `Component "${String(c.component).slice(0, 60)}" claims verb "${c.verb}", not inside its own span.` });
    }
    for (const [s, e, other] of used) {
      if (at < e && at + span.length > s) { v.push({ code: "SPAN_OVERLAP", detail: `Component "${String(c.component).slice(0, 55)}" overlaps "${String(other).slice(0, 55)}".` }); break; }
    }
    used.push([at, at + span.length, String(c.claim_span)]);
  }
  return v;
}
/** The review page renders only components that carry a verb — a rejected manner qualifier is working. */
export const isRealComponent = (c: Component) => !!normSpan(c.verb);

/* ── limitation routing ─────────────────────────────────────────────────────── */
// deno-lint-ignore no-explicit-any
type Rec = Record<string, any>;
export const hasCoverageGap = (r: Rec) => r?.coverage?.coverage_status === "limited" && r?.materiality?.coverage_material === true;
export const hasConditionsGap = (r: Rec) => r?.conditions_support?.status === "limited" && r?.materiality?.conditions_material === true;
export function limitationOf(r: Rec): "coverage" | "conditions" | "none" {
  return hasCoverageGap(r) ? "coverage" : hasConditionsGap(r) ? "conditions" : "none";
}
/** The finding a teacher is shown. Never the derived verdict word — see the review page. */
export function findingOf(r: Rec): "strong" | "coverage_limited" | "conditions_limited" {
  const l = limitationOf(r);
  if (l === "coverage") return "coverage_limited";
  if (l === "conditions") return "conditions_limited";
  return "strong";
}

/* ── claim inference (screen 2) ──────────────────────────────────────────────
   The teacher edits these directly, so one honest reading beats a forced choice: what she corrects is
   the signal, and a claim she rewrites is hers. Every claim quotes the assessment's own verb, because a
   claim the assessment's words do not support is one ESA invented. */
export function claimInferenceSystem(): string {
  return `You work inside The Sovereign Academy's evidence review, used by a teacher on an assessment she already gives. You are reading her assessment to propose what she is trying to find out, so that she can correct it. She has the last word and will edit these.

Produce 2 to 5 CLAIMS. A claim names a DOABLE THING the student must do, with the condition that makes it observable — "constructs a common denominator and combines like-sized parts, with the equivalent fractions written out", never "understands fractions". Write each in the teacher's register: plain, specific, no jargon, no rubric language.

Rules:
- Every claim quotes the assessment's OWN verb or phrasing in "quoted_verb" as evidence that this is what the task asks. If you cannot quote it, the assessment does not ask for it and it is not a claim.
- List the item numbers that carry each claim.
- Do NOT invent claims for things a richer assessment would have asked. Read what is on the page.
- Do NOT split one move into a move plus the manner of doing it. "Infers the position from the text's choices rather than from a stated sentence" is ONE claim, not two.
- If something the assessment touches looks like it is assessed elsewhere or is a prerequisite rather than the target, leave it out of the claims and say so in "left_out_question", phrased as a question for her.
- Never output a score, a percentage, a grade, a rating, a confidence number, or the word "sufficient".
- Output ONLY one JSON object. No prose before or after it.

JSON:
{ "title": string,
  "item_count": number,
  "claims": [ { "id": "C1", "statement": string, "claim_type": "procedural"|"conceptual"|"representational"|"diagnostic"|"application", "quoted_verb": string, "items": [string] } ],
  "left_out_question": string }`;
}

export function claimInferenceUser(a: { subject: string; grade: string; title?: string; teacher_notes?: string; assessment_text: string }): string {
  const lines = [`Subject: ${a.subject} · Grade/course: ${a.grade}`];
  if (a.title) lines.push(`Title the teacher gave it: ${a.title}`);
  if (a.teacher_notes) lines.push(`What she says it is for, in her words:\n${a.teacher_notes}`);
  lines.push(`\nTHE ASSESSMENT:\n"""\n${a.assessment_text}\n"""`, `\nReturn the JSON object now.`);
  return lines.join("\n");
}

/* ── Stage A user prompt ─────────────────────────────────────────────────── */
function conditionsBlock(c: Conditions): string[] {
  return [
    `DECLARED ADMINISTRATION CONDITIONS (the teacher declared these; they govern every judgment below):`,
    `- Supervision: ${c.supervision}`,
    `- Individual or collaborative: ${c.collaboration}`,
    `- AI policy: ${c.ai_policy}`,
    `- Resources permitted: ${(c.resources || []).join(", ") || "none stated"}`,
    `- Purpose: ${c.purpose}`,
    `- Time: ${c.time_minutes ? c.time_minutes + " minutes" : "not stated"}`,
    `- Where in the sequence: ${c.when_in_sequence || "not stated"}`,
    `- What students had already seen, in the teacher's words: ${c.novelty_note || "not stated"}`,
  ];
}

export function diagnosisUser(a: { subject: string; grade: string; assessment_text: string; conditions: Conditions; claims: Claim[] }): string {
  const c = a.conditions;
  return [
    `Subject: ${a.subject} · Grade/course: ${a.grade}`,
    ``,
    ...conditionsBlock(c),
    ``,
    `THE INFERENCE THE TEACHER WANTS TO MAKE (she has confirmed this; take it as given):`,
    c.needs_individual_attribution
      ? `- She needs to conclude that EACH STUDENT INDIVIDUALLY can do what the claims name. Individual, independent attribution is required.`
      : `- She wants to know what students can produce using the resources available to them. Individual, independent attribution is NOT required.`,
    `  (answered by the teacher on the conditions screen)`,
    ``,
    `THE TEACHER-CONFIRMED LEARNING CLAIMS (these govern; do not rewrite them, do not read them more strictly than they are written):`,
    ...a.claims.map((x) => `- ${x.id}: ${x.statement}  [type: ${x.claim_type}]`),
    ``,
    `THE ASSESSMENT, exactly as the teacher uses it:`,
    `"""`,
    a.assessment_text,
    `"""`,
    ``,
    `Return the JSON object now.`,
  ].join("\n");
}

/* ── Stage B user prompt ─────────────────────────────────────────────────── */
export function remedyUser(a: {
  subject: string; grade: string; assessment_text: string; conditions: Conditions;
  claim: Claim; diagnosis: Rec; diagnosis_hash: string; limitationType: "coverage" | "conditions";
}): string {
  const c = a.conditions, d = a.diagnosis;
  const cov = d.coverage ?? {}, cs = d.conditions_support ?? {};
  const comps = (cov.components ?? []).map((x: Component) =>
    `  · ${x.component}\n      status: ${x.status}   items: ${(x.items || []).join(", ") || "none"}\n      ${x.evidence || ""}`).join("\n");
  const lines = [
    `Subject: ${a.subject} · Grade/course: ${a.grade}`,
    ``,
    ...conditionsBlock(c),
    ``,
    `WHAT THE TEACHER WANTS TO CONCLUDE (confirmed; take as given):`,
    c.needs_individual_attribution
      ? `- That EACH STUDENT INDIVIDUALLY can do what the claim names. Independent attribution is required.`
      : `- What students can produce using the resources available to them. Independent attribution is NOT required.`,
    ``,
    `THE TEACHER-CONFIRMED CLAIM (${a.claim.id}) — this governs; do not rewrite or narrow it:`,
    a.claim.statement,
    ``,
    `THE FROZEN DIAGNOSIS (record ${a.diagnosis_hash.slice(0, 16)}, closed — not yours to revise):`,
    `  LIMITATION TYPE: ${a.limitationType}`,
    `  what this assessment DOES support: ${d.supports}`,
    `  what it does NOT reach:`,
    ...((d.does_not_support ?? []) as string[]).map((x) => `    - ${x}`),
    ``,
    `  COVERAGE: ${cov.coverage_status}`,
    `  component map:`,
    comps,
  ];
  if (a.limitationType === "coverage") {
    lines.push(
      `  the component not exercised: ${cov.coverage_missing_component}`,
      `  why: ${cov.why}`,
      ``,
      `THE MISSING EVIDENCE you are to obtain:`,
      d.coverage_missing_evidence || cov.coverage_missing_component,
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
      d.conditions_missing_evidence || cs.conditions_reason,
    );
  }
  lines.push(``, `THE ASSESSMENT, exactly as the teacher uses it — it is not to be rewritten:`, `"""`, a.assessment_text, `"""`, ``, `Return the JSON object now.`);
  return lines.join("\n");
}

/* ── the merge — the only place Stage B may touch a Stage A record ────────── */
export const STAGE_B_ALLOWED_KEYS = [
  "limitation_type", "assessment_change", "tier", "modify", "add",
  "inference_boundary", "verification", "why_this_verification",
  "no_short_check_reason", "student_minutes", "scoring_seconds", "disagreement",
];

export async function mergeRemedy(a: {
  claimRecord: Rec; diagnosis_hash: string; remedyRaw: Rec; limitationType: "coverage" | "conditions";
}): Promise<{ merged: Rec; violations: SpanViolation[] }> {
  const violations: SpanViolation[] = [];
  const extra = Object.keys(a.remedyRaw ?? {}).filter((k) => !STAGE_B_ALLOWED_KEYS.includes(k));
  if (extra.length) violations.push({ code: "STAGE_B_OVERREACH", detail: `Fields outside the whitelist, dropped: ${extra.join(", ")}.` });
  const clean: Rec = {};
  for (const k of STAGE_B_ALLOWED_KEYS) if (a.remedyRaw && k in a.remedyRaw) clean[k] = a.remedyRaw[k];
  const dis = String(clean.disagreement ?? "").trim().replace(/^["']|["'.]$/g, "").toLowerCase();
  if (dis && dis !== "none" && dis !== "n/a") violations.push({ code: "STAGE_B_DISAGREED", detail: String(clean.disagreement).slice(0, 200) });
  if (clean.assessment_change !== undefined && clean.assessment_change !== "none") {
    violations.push({ code: "ASSESSMENT_REWRITTEN", detail: `assessment_change="${clean.assessment_change}". The assessment is never rewritten in this pilot.` });
    clean.assessment_change = "none";
  }
  // MODIFY ONE EXISTING ITEM is out of pilot scope (H1 failed its gate, 2026-09-10). The prompt no
  // longer offers the tier; this is defence in depth for a model that proposes one anyway. Dropping
  // it here is what keeps the cost of finding an absence high — see ESA-SHIP-INVENTORY-2026-09-13.
  if (clean.modify) {
    violations.push({ code: "MODIFY_OUT_OF_PILOT_SCOPE", detail: "An item modification was returned and was dropped: the modify-one-item tier is out of pilot scope." });
    clean.modify = null;
  }
  if (clean.tier === "modify_item" || clean.tier === "longer_observation") {
    violations.push({ code: "TIER_OUT_OF_PILOT_SCOPE", detail: `tier="${clean.tier}" is not one of the two remedy tiers this pilot ships.` });
  }
  const merged: Rec = { ...JSON.parse(JSON.stringify(a.claimRecord)), stage_b: clean };
  const back: Rec = { ...merged }; delete back.stage_b;
  if ((await sha256(canonical(back))) !== a.diagnosis_hash) {
    violations.push({ code: "DIAGNOSIS_MUTATED", detail: "The Stage A record changed during merge." });
  }
  return { merged, violations };
}

/* ── the run ──────────────────────────────────────────────────────────────────
   Stage A once for the whole assessment; Stage B once per material limitation. Stage progress is
   written as it goes so an abandoned background run can reach a terminal state on the read side —
   the same lesson as as_versions.stage_at. */
export const ESA_STALE_MS = 6 * 60 * 1000;

async function stage(id: string, st: string) {
  await db(`esa_reviews?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: { stage: st, stage_at: nowIso() } });
}

export function isStale(r: Rec, now = Date.now()): boolean {
  if (r?.status !== "running") return false;
  const t = Date.parse(String(r.stage_at ?? r.created_at ?? ""));
  return Number.isFinite(t) && now - t > ESA_STALE_MS;
}

export async function reapIfStale(r: Rec): Promise<Rec> {
  if (!isStale(r)) return r;
  const body = { status: "failed", error: `The review stopped while ${r.stage ?? "running"} and did not finish. Nothing was saved. Please try it again.`, stage_at: nowIso() };
  await db(`esa_reviews?id=eq.${r.id}&status=eq.running`, { method: "PATCH", prefer: "return=minimal", body });
  return { ...r, ...body };
}

export async function runReview(id: string): Promise<void> {
  const rows = await db<Rec[]>(`esa_reviews?id=eq.${id}&select=*`);
  const r = rows?.[0];
  if (!r) throw new Error("review not found");
  const claims: Claim[] = (r.claims_confirmed ?? []) as Claim[];
  const conditions: Conditions = r.conditions as Conditions;
  const base = { subject: r.subject as string, grade: r.grade as string, assessment_text: r.assessment_text as string, conditions };

  try {
    await stage(id, "diagnosing");
    const userA = diagnosisUser({ ...base, claims });
    // Never sent without this passing. The teacher's own words are scanned out; ours are not.
    assertNoRemedyLeak("stageA.system", DIAGNOSIS_SYSTEM);
    assertNoRemedyLeak("stageA.user", userA, [base.assessment_text, ...claims.map((c) => c.statement)]);

    const a = await callModel(DIAGNOSIS_SYSTEM, [{ type: "text", text: userA }], 12000);
    const parsedA = extractJson(a.text);
    const diagnosed: Array<{ record: Rec; hash: string; claim?: Claim; span_violations: SpanViolation[] }> = [];
    for (const raw of (parsedA.claims ?? []) as Rec[]) {
      const claim = claims.find((c) => c.id === raw.claim_id);
      const frozen = deepFreeze(JSON.parse(JSON.stringify(raw))) as Rec;
      diagnosed.push({
        record: frozen,
        hash: await sha256(canonical(frozen)),
        claim,
        span_violations: validateSpans((frozen.coverage?.components ?? []) as Component[], claim?.statement ?? ""),
      });
    }
    await db(`esa_reviews?id=eq.${id}`, {
      method: "PATCH", prefer: "return=minimal",
      body: { diagnosis: diagnosed.map((d) => d.record), diagnosis_hash: diagnosed.map((d) => d.hash), model: a.model, stage: "choosing", stage_at: nowIso() },
    });

    // Stage B — only for a material limitation, and only for that one claim.
    const remedies: Rec[] = [];
    const archViolations: SpanViolation[] = [];
    for (const d of diagnosed) {
      const limitationType = limitationOf(d.record);
      if (limitationType === "none" || !d.claim) { remedies.push({ claim_id: d.record.claim_id, limitation_type: "none", stage_b: null }); continue; }
      const system = limitationType === "coverage" ? REMEDY_SYSTEM_COVERAGE : REMEDY_SYSTEM_CONDITIONS;
      const userB = remedyUser({ ...base, claim: d.claim, diagnosis: d.record, diagnosis_hash: d.hash, limitationType });
      const b = await callModel(system, [{ type: "text", text: userB }], 6000);
      const m = await mergeRemedy({ claimRecord: d.record, diagnosis_hash: d.hash, remedyRaw: extractJson(b.text), limitationType });
      for (const v of m.violations) archViolations.push({ ...v, claim_id: String(d.record.claim_id) });
      remedies.push({ claim_id: d.record.claim_id, limitation_type: limitationType, stage_b: m.merged.stage_b });
    }

    await db(`esa_reviews?id=eq.${id}`, {
      method: "PATCH", prefer: "return=minimal",
      body: {
        remedies, status: "ready", stage: "done", error: null, stage_at: nowIso(),
        arch_version: ESA_ARCH_VERSION, prompt_sha: PROMPT_SHA,
        span_violations: diagnosed.flatMap((d) => d.span_violations.map((v) => ({ ...v, claim_id: String(d.record.claim_id) }))),
        arch_violations: archViolations,
      },
    });
  } catch (e) {
    await db(`esa_reviews?id=eq.${id}`, {
      method: "PATCH", prefer: "return=minimal",
      body: { status: "failed", error: String((e as Error).message ?? e).slice(0, 900), stage_at: nowIso() },
    });
    throw e;
  }
}
