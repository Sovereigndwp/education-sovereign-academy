// Assignment Studio — Transformation Contract v0.1 as code.
//
// Source of truth (prose): ~/Documents/Claude/Projects/TSA/projects/teach-back-flywheel/TRANSFORMATION-CONTRACT-v0.1.md
// Everything the engine is allowed to do comes from this file. Prompts are BUILT from these
// tables, not written beside them, so a change to the contract is a change here and nowhere else.

export const CONTRACT_VERSION = "v0.1";
export const PROMPT_VERSION = "as-2026-09-05-v1";

// ── Learning Contract (four fields, teacher-confirmed) ───────────────────────
export interface LearningContract {
  learning_target: string;      // what students must understand
  required_thinking: string;    // what students must actually do cognitively
  required_evidence: string;    // what must appear in the work for the teacher to know learning occurred
  teacher_constraints: string;  // time, format, grading burden, curriculum requirements (teacher-supplied; may be empty)
}
export const CONTRACT_FIELDS = ["learning_target", "required_thinking", "required_evidence", "teacher_constraints"] as const;
export type ContractField = (typeof CONTRACT_FIELDS)[number];

export const FIELD_LABEL: Record<ContractField, string> = {
  learning_target: "Learning target",
  required_thinking: "Required thinking",
  required_evidence: "Required evidence",
  teacher_constraints: "Teacher constraints",
};

// ── Modes ────────────────────────────────────────────────────────────────────
export type Mode = "support" | "advanced" | "visible";

export interface ModeSpec {
  label: string;
  promise: string;
  must_preserve: string[];
  may: string[];
  may_verb: "adapt" | "intentionally extend";
  must_not: string[];
  /** Which contract fields are expected to be PRESERVED (vs may be ADAPTED / INTENTIONALLY_EXTENDED). */
  field_expectation: Record<ContractField, PreservationStatus[]>;
}

export type PreservationStatus = "PRESERVED" | "ADAPTED_AS_PERMITTED" | "INTENTIONALLY_EXTENDED" | "REVIEW_REQUIRED";
export const STATUSES: PreservationStatus[] = ["PRESERVED", "ADAPTED_AS_PERMITTED", "INTENTIONALLY_EXTENDED", "REVIEW_REQUIRED"];

// A fifth traced element that is not a contract field but is in every mode's must-preserve list.
export const CORRECTNESS_KEY = "correctness";

export const MODES: Record<Mode, ModeSpec> = {
  support: {
    label: "Support",
    promise: "Improve access without making the intellectual task easier.",
    must_preserve: ["core learning target", "essential cognitive demand", "required evidence of learning", "factual/mathematical correctness"],
    may_verb: "adapt",
    may: ["directions", "chunking", "sequencing", "vocabulary support", "visual organization", "scaffolds", "irrelevant language burden",
      "response format when the format is not itself being assessed", "examples", "checkpoints"],
    must_not: ["give away reasoning being assessed", "remove essential thinking", "substitute recall for analysis/application", "solve the difficult part for the student"],
    field_expectation: {
      learning_target: ["PRESERVED"],
      required_thinking: ["PRESERVED"],
      required_evidence: ["PRESERVED", "ADAPTED_AS_PERMITTED"], // format may change when format is not assessed
      teacher_constraints: ["PRESERVED", "ADAPTED_AS_PERMITTED"],
    },
  },
  advanced: {
    label: "Advanced",
    promise: "Deepen the same learning rather than merely adding more work.",
    must_preserve: ["relationship to the original learning target", "prerequisite knowledge", "factual/mathematical correctness"],
    may_verb: "intentionally extend",
    may: ["cognitive demand", "abstraction", "transfer", "ambiguity", "justification", "comparison", "generalization", "interacting variables"],
    must_not: ["merely add more questions", "increase workload without increasing depth", "introduce unrelated content and call it enrichment"],
    field_expectation: {
      learning_target: ["PRESERVED", "INTENTIONALLY_EXTENDED"],
      required_thinking: ["INTENTIONALLY_EXTENDED"],
      required_evidence: ["INTENTIONALLY_EXTENDED", "PRESERVED"],
      teacher_constraints: ["PRESERVED", "ADAPTED_AS_PERMITTED"],
    },
  },
  visible: {
    label: "Make Thinking More Visible",
    promise: "Make the student's reasoning more observable while preserving the learning target and avoiding unreasonable additional teacher workload.",
    must_preserve: ["learning target", "intended cognitive demand", "required evidence", "reasonable teacher workload"],
    may_verb: "adapt",
    may: ["question structure", "sequence", "context", "intermediate reasoning requirements", "prediction", "error analysis", "reflection",
      "brief verification", "personalization of inputs", "process evidence"],
    must_not: ["claim to be AI-proof", "depend on AI detection", "use surveillance as verification", "turn everything into oral defense",
      "create disproportionate grading burden", "confuse inconvenience with assessment validity"],
    field_expectation: {
      learning_target: ["PRESERVED"],
      required_thinking: ["PRESERVED"],
      required_evidence: ["PRESERVED", "ADAPTED_AS_PERMITTED"], // evidence may be made more observable, not replaced
      teacher_constraints: ["PRESERVED"],
    },
  },
};

// ── Output of a transformation ───────────────────────────────────────────────
export interface Trace {
  changed: { what: string; why: string }[];
  protected: string[];
  check_this: string[];
}
export interface TransformOutput {
  title: string;
  new_version: string;                 // the full student-facing assignment, Markdown
  teacher_notes: string;               // brief: how to use it, answer/rubric notes if the original had them
  trace: Trace;
  statuses: Record<ContractField | typeof CORRECTNESS_KEY, { status: PreservationStatus; note: string }>;
  teacher_workload: "same" | "slightly more" | "more" | "less";
  teacher_workload_note: string;
  reviewer_notes: string;              // uncertainty for the operator; not shown to the teacher
}

// ── Prompts, built from the tables above ─────────────────────────────────────
const STANCE = `You work inside Assignment Studio, a product of The Sovereign Academy run by a former high-school mathematics teacher. The teacher is a professional who brought an assignment they already trust. Your role is controlled TRANSFORMATION of the teacher's own material — never generation of new curriculum, never grading, never advice about the teacher's competence. The teacher remains the instructional authority.

Hard rules:
- Never invent, infer, or refer to any student's disability, diagnosis, label, or identity. You receive instructional requests only ("chunk the directions", "reduce language load"). If a request is phrased as a characteristic, act on the instructional need it implies for the assignment as a whole and say nothing about individuals.
- The output is a classroom version of the assignment, never an accommodation for a named student and never an IEP/504 modification. Do not describe it as compliant with, or a substitute for, any individual plan.
- Never mention students by name. If the material contains student names, work, or grades, do not use those parts and say so in reviewer_notes.
- Do not manufacture certainty. If you are not sure something was preserved, mark it REVIEW_REQUIRED and say why in check_this. A short, honest check_this list is part of the product.
- Keep the teacher's voice, numbering style, and level of formality unless the request says otherwise.
- Output ONLY one JSON object. No prose before or after.`;

export function inferSystemPrompt(): string {
  return `${STANCE}

TASK: infer the Learning Contract of the assignment — four fields the teacher will Confirm or Correct before any transformation runs. Write each as 1–3 plain sentences a colleague would recognise as their own intention. Be specific to THIS assignment (quote item numbers or phrases where useful). Do not pad. If the teacher supplied notes about what students should learn, treat them as primary evidence and reconcile with the items.

Fields:
- learning_target: what students must understand (the idea, not the activity).
- required_thinking: what students must actually do cognitively to complete it as intended (e.g. compare two representations and justify; not "answer questions").
- required_evidence: what must appear in the finished work for the teacher to know the learning occurred (the observable products/moves).
- teacher_constraints: only what the teacher stated or the document itself makes explicit (time limit, format, grading approach, curriculum/standard named). If none, return "".

Also return:
- title: a short name for the assignment (from the document if it has one).
- item_count: number of items/tasks you can identify.
- assignment_markdown: the assignment transcribed faithfully as Markdown (this is what the transformation will be applied to and what the teacher sees as "Original"). Keep every item, number, and instruction; fix nothing. If parts are unreadable, write [unreadable] in place and note it in reviewer_notes.
- reviewer_notes: uncertainties, unreadable parts, any student data seen.

JSON schema:
{ "title": string, "item_count": number, "assignment_markdown": string,
  "contract": { "learning_target": string, "required_thinking": string, "required_evidence": string, "teacher_constraints": string },
  "reviewer_notes": string }`;
}

export function transformSystemPrompt(mode: Mode): string {
  const m = MODES[mode];
  const expectations = CONTRACT_FIELDS.map((f) => `  - ${f}: ${m.field_expectation[f].join(" or ")}`).join("\n");
  return `${STANCE}

TRANSFORMATION MODE: ${m.label.toUpperCase()} — ${m.promise}

The teacher has CONFIRMED a Learning Contract (below). It governs. Judge every change against it.

MUST PRESERVE:
${m.must_preserve.map((x) => `  - ${x}`).join("\n")}

MAY ${m.may_verb.toUpperCase()}:
${m.may.map((x) => `  - ${x}`).join("\n")}

MUST NOT:
${m.must_not.map((x) => `  - ${x}`).join("\n")}

${mode === "advanced" ? `For ADVANCED: depth, not volume. Fewer items that demand more are better than more items. Every extension must be traceable to the original learning target; if you extend the target, say exactly how it still depends on the original prerequisite knowledge.` : ""}${mode === "support" ? `For SUPPORT: the student must still do the same essential thinking and produce the same essential evidence. Scaffolds may structure the path; they may not walk it. A worked example must use a DIFFERENT case from the ones being assessed. Some language-related support (plain directions, glossed vocabulary that is not itself the construct) is allowed here.` : ""}${mode === "visible" ? `For MAKE THINKING MORE VISIBLE: add the smallest set of observable reasoning moves that lets the teacher see HOW a student got there (a prediction before, an explanation of a choice, a brief error analysis, a personalised input, a two-line verification). Do not replace the task with a process log. Estimate grading cost honestly: if the new version takes meaningfully longer to grade, say so in teacher_workload and consider a lighter option. Never describe the result as AI-proof.` : ""}

Expected preservation statuses for this mode (use exactly these tokens: PRESERVED | ADAPTED_AS_PERMITTED | INTENTIONALLY_EXTENDED | REVIEW_REQUIRED):
${expectations}
  - correctness: PRESERVED (or REVIEW_REQUIRED if you changed numbers, data, or claims and could not fully verify them)
Any status outside the expected set for a field means you are outside the contract: either fix the version, or mark REVIEW_REQUIRED and explain in check_this.

Output:
- title: same as original unless the request renames it.
- new_version: the complete student-facing assignment as Markdown, ready to hand out. Complete, not a diff. Keep item numbering. Recompute any numbers you change and show your check in reviewer_notes.
- teacher_notes: 2–6 lines for the teacher: what to do with it, where an answer key changed, what to watch for.
- trace.changed: 3–8 entries {what, why}, concrete ("Split Q3 into 3a–3c" not "added scaffolding").
- trace.protected: 3–6 short lines: what was deliberately kept and, where useful, how.
- trace.check_this: 1–5 short lines: what the teacher should verify before using it — anything you are unsure you preserved, any change that could plausibly alter what is being measured, any recomputed value. Never empty.
- statuses: one entry per field {status, note}; note = one sentence of evidence.
- teacher_workload: "same" | "slightly more" | "more" | "less", with teacher_workload_note explaining prep and grading cost honestly.
- reviewer_notes: for the operator, not the teacher.

JSON schema:
{ "title": string, "new_version": string, "teacher_notes": string,
  "trace": { "changed": [{"what": string, "why": string}], "protected": [string], "check_this": [string] },
  "statuses": { "learning_target": {"status": string, "note": string}, "required_thinking": {"status": string, "note": string},
                "required_evidence": {"status": string, "note": string}, "teacher_constraints": {"status": string, "note": string},
                "correctness": {"status": string, "note": string} },
  "teacher_workload": string, "teacher_workload_note": string, "reviewer_notes": string }`;
}

export interface TransformRequest {
  constraints_text?: string | null;   // free text: "I can't grade anything additional", "45 minutes", "must stay one page"
  supports?: string[];                // instructional requests, from the checklist below
  notes?: string | null;              // anything else, teacher's words
  needs_text?: string | null;         // Support only: functional classroom needs/barriers in ordinary language — constraints on the transformation, not claims about students
  repair_note?: string | null;        // set only by the one bounded repair cycle (audits.ts); never by the teacher UI
  previous_version?: string | null;   // the version being repaired
}

// Instructional requests the UI offers. These are transformation requests, never learner characteristics.
export const SUPPORT_REQUESTS: Record<Mode, { key: string; label: string }[]> = {
  support: [
    { key: "chunk_directions", label: "Chunk multi-step directions" },
    { key: "reduce_language_load", label: "Reduce language load that isn't the point" },
    { key: "vocabulary_support", label: "Gloss key vocabulary (without giving away answers)" },
    { key: "visual_organization", label: "Add visual organization (tables, boxes, space to work)" },
    { key: "worked_example", label: "Add a worked example on a different case" },
    { key: "checkpoints", label: "Add self-check points between steps" },
    { key: "alternate_response", label: "Allow an alternate response format (when format isn't assessed)" },
    { key: "fewer_items_same_demand", label: "Fewer items, same demand per item" },
    { key: "reduce_direction_reading", label: "Reduce unnecessary reading in directions" },
    { key: "more_workspace", label: "Give more workspace" },
    { key: "scaffold_process", label: "Scaffold the process without supplying the reasoning" },
  ],
  advanced: [
    { key: "abstraction", label: "Push toward generalization / abstraction" },
    { key: "transfer", label: "Require transfer to a new context" },
    { key: "justification", label: "Require justification of method, not just answer" },
    { key: "comparison", label: "Compare competing approaches or interpretations" },
    { key: "interacting_variables", label: "Introduce interacting variables / ambiguity" },
    { key: "counterexamples", label: "Ask for counterexamples or limits of a rule" },
    { key: "strategic_choice", label: "Require a strategic choice between methods, with justification" },
    { key: "same_length", label: "Keep it the same length as the original" },
  ],
  visible: [
    { key: "prediction", label: "Ask for a prediction before solving" },
    { key: "explain_choice", label: "Ask students to explain a choice they made" },
    { key: "error_analysis", label: "Add a brief error-analysis item" },
    { key: "personalize_inputs", label: "Personalize inputs (each student uses their own value/example)" },
    { key: "verification", label: "Add a two-line verification of the result" },
    { key: "process_evidence", label: "Ask for lightweight process evidence (plan, draft line, sketch)" },
    { key: "no_extra_grading", label: "No additional grading time" },
  ],
};

export function transformUserPrompt(args: {
  subject: string; grade: string; original_markdown: string; contract: LearningContract; request: TransformRequest; mode: Mode;
}): string {
  const r = args.request || {};
  const supports = (r.supports || []).map((k) => SUPPORT_REQUESTS[args.mode].find((s) => s.key === k)?.label || k);
  const lines = [
    `Subject: ${args.subject}`,
    `Grade / course: ${args.grade}`,
    ``,
    `TEACHER-CONFIRMED LEARNING CONTRACT (governs everything):`,
    `- Learning target: ${args.contract.learning_target}`,
    `- Required thinking: ${args.contract.required_thinking}`,
    `- Required evidence: ${args.contract.required_evidence}`,
    `- Teacher constraints: ${args.contract.teacher_constraints || "(none stated)"}`,
    ``,
  ];
  if (supports.length) lines.push(`INSTRUCTIONAL REQUESTS from the teacher for this version:\n${supports.map((s) => `- ${s}`).join("\n")}`);
  if (r.needs_text && args.mode === "support") lines.push(`FUNCTIONAL CLASSROOM NEEDS the teacher described, in ordinary language (these are constraints on the transformation, not claims about any student; act on them for the assignment as a whole): ${r.needs_text}`);
  if (r.constraints_text) lines.push(`CLASSROOM CONSTRAINTS for this version, in the teacher's words: ${r.constraints_text}`);
  if (r.notes) lines.push(`OTHER NOTES from the teacher: ${r.notes}`);
  if (r.repair_note) lines.push(``, `REPAIR CYCLE (one bounded pass). Your previous version was audited and failed for this reason:\n${r.repair_note}\n\nProduce a corrected version that removes exactly this failure with the SMALLEST change, keeping everything else. Record the repair as the first entry in trace.changed.`, ``, `YOUR PREVIOUS VERSION:\n"""\n${r.previous_version || ""}\n"""`);
  lines.push(``, `THE ORIGINAL ASSIGNMENT (Markdown):\n"""\n${args.original_markdown}\n"""`, ``, `Return the JSON object now.`);
  return lines.join("\n");
}

// ── Normalisation / validation ───────────────────────────────────────────────
function str(v: unknown): string { return v == null ? "" : String(v).trim(); }
function arr(v: unknown): unknown[] { return Array.isArray(v) ? v : []; }

export function normalizeContract(raw: unknown): LearningContract {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    learning_target: str(c.learning_target).slice(0, 1500),
    required_thinking: str(c.required_thinking).slice(0, 1500),
    required_evidence: str(c.required_evidence).slice(0, 1500),
    teacher_constraints: str(c.teacher_constraints).slice(0, 1500),
  };
}

export function normalizeTransform(raw: Record<string, unknown>, mode: Mode): TransformOutput {
  const trace = (raw.trace ?? {}) as Record<string, unknown>;
  const st = (raw.statuses ?? {}) as Record<string, Record<string, unknown>>;
  const keys = [...CONTRACT_FIELDS, CORRECTNESS_KEY] as (ContractField | typeof CORRECTNESS_KEY)[];
  const statuses = {} as TransformOutput["statuses"];
  const outside: string[] = [];
  for (const k of keys) {
    const s = st[k] ?? {};
    let status = STATUSES.includes(str(s.status) as PreservationStatus) ? (str(s.status) as PreservationStatus) : "REVIEW_REQUIRED";
    const expected = k === CORRECTNESS_KEY ? (["PRESERVED", "REVIEW_REQUIRED"] as PreservationStatus[]) : [...MODES[mode].field_expectation[k as ContractField], "REVIEW_REQUIRED" as PreservationStatus];
    if (!expected.includes(status)) { outside.push(`${k}: model reported ${status}, outside this mode's permissions`); status = "REVIEW_REQUIRED"; }
    statuses[k] = { status, note: str(s.note).slice(0, 600) };
  }
  const check = arr(trace.check_this).map(str).filter(Boolean);
  for (const o of outside) check.push(o);
  if (!check.length) check.push("Read the new version once against your original before using it; the engine reported no specific uncertainty, which is itself worth a look.");
  const wl = ["same", "slightly more", "more", "less"].includes(str(raw.teacher_workload)) ? (str(raw.teacher_workload) as TransformOutput["teacher_workload"]) : "same";
  return {
    title: str(raw.title).slice(0, 200),
    new_version: str(raw.new_version),
    teacher_notes: str(raw.teacher_notes).slice(0, 4000),
    trace: {
      changed: arr(trace.changed).map((c) => { const o = (c ?? {}) as Record<string, unknown>; return { what: str(o.what).slice(0, 400), why: str(o.why).slice(0, 400) }; }).filter((c) => c.what),
      protected: arr(trace.protected).map(str).filter(Boolean).slice(0, 8),
      check_this: check.slice(0, 8),
    },
    statuses,
    teacher_workload: wl,
    teacher_workload_note: str(raw.teacher_workload_note).slice(0, 600),
    reviewer_notes: str(raw.reviewer_notes).slice(0, 3000),
  };
}

/** Diff two contracts field by field (for contract_corrections). */
export function diffContract(before: LearningContract, after: LearningContract) {
  const out: { field: ContractField; before: string; after: string }[] = [];
  for (const f of CONTRACT_FIELDS) if ((before[f] || "").trim() !== (after[f] || "").trim()) out.push({ field: f, before: before[f] || "", after: after[f] || "" });
  return out;
}

/** The object span of a model reply: fences stripped, first "{" to last "}". */
function sliceObject(text: string): string {
  const t = String(text).replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Model returned no JSON object.");
  return t.slice(start, end + 1);
}

const CTRL: Record<string, string> = { "\n": "\\n", "\r": "\\r", "\t": "\\t", "\b": "\\b", "\f": "\\f" };

/** Escape what a model leaves unescaped inside a long string value.
 *  `new_version` carries the whole rewritten assignment, and teacher assignments quote people
 *  ('A student says, "If we release the cart from 80 cm..."') and contain tables. A quotation mark
 *  the model failed to escape ends the string early and the parse dies. A quote only terminates a
 *  string when the next non-space character is one of , : } ] or the input ends; otherwise it is
 *  part of the document and is escaped. Raw control characters are escaped the same way.
 *  Anything this cannot repair still fails to parse — it degrades to a loud error, never a silent
 *  half-document. */
function repairJsonStrings(src: string): string {
  let out = "";
  let inStr = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (!inStr) { out += c; if (c === '"') inStr = true; continue; }
    if (c === "\\") { out += c + (src[i + 1] ?? ""); i++; continue; }
    if (c === '"') {
      let j = i + 1;
      while (j < src.length && /\s/.test(src[j])) j++;
      const nxt = src[j];
      if (j >= src.length || nxt === "," || nxt === ":" || nxt === "}" || nxt === "]") { out += c; inStr = false; }
      else out += '\\"';
      continue;
    }
    if (CTRL[c] !== undefined) { out += CTRL[c]; continue; }
    if (c < " ") { out += "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"); continue; }
    out += c;
  }
  return out;
}

/** Strict parse first; the repair runs only after that fails, so well-formed JSON is never touched. */
export function extractJson(text: string): Record<string, unknown> {
  const body = sliceObject(text);
  try { return JSON.parse(body); } catch { /* fall through to the bounded repair */ }
  try { return JSON.parse(repairJsonStrings(body)); }
  catch (e) { throw new Error(`Model returned JSON this parser could not repair: ${(e as Error).message}`); }
}
