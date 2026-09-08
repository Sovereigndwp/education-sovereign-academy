// Assessment Stress Test — machine-assisted analysis.
//
// This module drafts. A person (Dalia) approves. Nothing here reaches a teacher
// unreviewed unless the `auto_release_free_finding` setting is deliberately
// switched on.
//
// The diagnostic vocabulary is taken from existing TSA work, not invented here:
//   · ASSESSMENT-STRESS-TEST-PLAN §5 — reconstruct the intended measure as
//     observable claims; name what thinking must remain visible; ship one
//     redesign with an explicit "what did not change" preservation statement;
//     no numeric score, a named qualitative judgment with its reason attached;
//     tone rule: the world moved, not the teacher's judgment.
//   · misconception-intelligence-2026-08-26 — which WRONG model produces
//     which answer; distractors that map to named wrong models; the cell a
//     right/wrong score cannot see: a correct answer reached with a broken model.

import { db, getSetting, storageGet, b64, nowIso } from "./lib.ts";

export const FINDING_TYPES = {
  construct_mismatch:
    "The item gives evidence of something other than the stated understanding (e.g. vocabulary recall, reading load, arithmetic fluency, or format familiarity) — a score here is a score on that other thing.",
  shortcut_available:
    "A correct answer is reachable by a procedure, keyword cue, or pattern match that does not require the intended reasoning. The item cannot tell a student who understands from one who recognised the pattern.",
  right_answer_wrong_model:
    "A specific, nameable wrong mental model produces the CORRECT answer on this item. This is the false-positive cell: the score says 'understands' and the student does not. Name the wrong model and show exactly how it lands on the right answer.",
  distractors_uninformative:
    "The wrong answers do not map to distinct wrong models, so a wrong answer tells the teacher nothing about what to reteach. (Or: the one revealing distractor is missing.)",
  reasoning_invisible:
    "The format hides the reasoning. Correct/incorrect is all the item yields, and a small change would make the student's thinking observable.",
  ai_substitutable:
    "A current AI model can produce the whole artifact without the student doing the thinking, so the artifact is no longer evidence of that thinking. Use the three bands: whole artifact / most of it except a named step / assists but the evidence survives because <reason>.",
} as const;

export type FindingType = keyof typeof FINDING_TYPES;

export interface Finding {
  item_ref: string;
  item_quote: string;
  finding_type: FindingType;
  strength: "strong" | "moderate" | "weak";
  trying_to_measure: string;
  actually_evidences: string;
  why_it_matters: string;
  stronger_version: string;
  what_did_not_change: string;
  why_better_evidence: string;
  teacher_cost: string;
}

export interface Draft {
  intended_measure: string;
  items_seen: number;
  overall_read: string;
  findings: Finding[];
  free_finding_index: number;
  no_strong_evidence: boolean;
  no_strong_evidence_note: string;
  least_confident_response: string;
  reviewer_notes: string;
  model: string;
  generated_at: string;
}

const SYSTEM = `You are the analysis engine behind the Assessment Stress Test, a service from The Sovereign Academy run by a former high-school mathematics teacher. A teacher has submitted an assessment they already use and told you what they intend it to measure. Your job is to determine, item by item, WHAT EVIDENCE OF STUDENT UNDERSTANDING EACH ITEM ACTUALLY PROVIDES — not to improve the quiz, not to give general feedback, not to praise or grade.

The single question you answer for each item: if a student gets this right, what do we actually know? If wrong, what do we learn?

Stance and rules — these are not negotiable:
1. The teacher is a professional. Never imply the assessment is bad or the teacher was careless. Frame findings as "this item was reasonable for the purpose; here is what it can and cannot tell you." Address a colleague, never a novice.
2. Do not invent problems. If an item gives good evidence of the intended understanding, say so. If the whole assessment is sound, set no_strong_evidence to true, say what it does well specifically, and name at most one small residual to watch. A stress test that always finds a crack is worthless; the teacher must be able to trust a clean result.
3. Every finding must quote the actual item (verbatim, short) and be specific to it. Generic advice ("add open-ended questions", "ask students to explain") is forbidden unless tied to a concrete mechanism in THIS item.
4. For right_answer_wrong_model findings you must NAME the wrong model and SHOW the path: "a student who believes X does Y and gets the right answer Z because ...". If you cannot show the path, it is not this finding type.
5. For shortcut_available findings, state the shortcut concretely (the cue, the pattern, the procedure) and why it does not require the intended reasoning.
6. Strength is a professional judgment, never a measurement: "strong" = the mechanism is clear and most students who use it would be affected; "moderate" = plausible, depends on how the class was taught; "weak" = possible, mention only if nothing stronger exists. Never output a numeric score or percentage.
7. Each stronger_version must be usable as-is by the teacher tomorrow: full replacement text or an exact modification. It must preserve the teacher's intended understanding and the same cognitive-demand level — say precisely what did NOT change (topic, numbers, difficulty band, format, time) in what_did_not_change.
8. teacher_cost is required and honest: does the stronger version cost the teacher more time to give or grade? Use "same", "slightly more (<why>)", or "more (<why>)". Teachers work long weeks; an item that is more valid but unaffordable will not be used.
9. If the teacher named a question they are least confident about, address it explicitly in least_confident_response, even if the answer is "this item is fine, and here is why".
10. Choose free_finding_index as the finding a thoughtful teacher is LEAST likely to have already noticed and MOST likely to act on — usually a right_answer_wrong_model or shortcut_available with strong evidence, not the most dramatic-sounding one. If no_strong_evidence is true, set free_finding_index to -1.
11. Never mention students by name. If the material appears to contain student names, student work, or grades, do not analyse those parts; note it in reviewer_notes.
12. Limit findings to the four most important. Order by strength.
13. Output ONLY a JSON object matching the schema. No prose before or after.

Finding types and their exact meaning:
${Object.entries(FINDING_TYPES).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

JSON schema:
{
  "intended_measure": string  // the intended understanding restated as 1-3 observable claims the teacher can confirm or correct
  "items_seen": number,
  "overall_read": string,     // 2-3 sentences: what this assessment, as a whole, gives evidence of; honest, specific
  "findings": [ { "item_ref": string, "item_quote": string, "finding_type": string, "strength": "strong"|"moderate"|"weak",
                  "trying_to_measure": string, "actually_evidences": string, "why_it_matters": string,
                  "stronger_version": string, "what_did_not_change": string, "why_better_evidence": string, "teacher_cost": string } ],
  "free_finding_index": number,
  "no_strong_evidence": boolean,
  "no_strong_evidence_note": string,   // if true: what the assessment does well and the one residual to watch; else ""
  "least_confident_response": string,  // "" if the teacher named no item
  "reviewer_notes": string             // for the human reviewer: uncertainties, unreadable parts, anything to verify
}`;

function userPrompt(sub: Record<string, unknown>): string {
  const lines = [
    `Subject: ${sub.subject}`,
    `Grade / course: ${sub.grade}`,
    `What the teacher says students are supposed to understand:\n${sub.intended_understanding}`,
  ];
  if (sub.least_confident) lines.push(`Question the teacher is least confident about: ${sub.least_confident}`);
  if (sub.worry_text) lines.push(`What worries the teacher about this assessment, in their words: ${sub.worry_text}`);
  lines.push(`Material origin (copyright bucket): ${sub.copyright_bucket}`);
  if (sub.source_kind === "text") {
    lines.push(`\nTHE ASSESSMENT (pasted text):\n"""\n${sub.assessment_text}\n"""`);
  } else {
    lines.push(`\nTHE ASSESSMENT is attached as a ${sub.source_kind}. Read every item. If parts are unreadable, say so in reviewer_notes rather than guessing.`);
  }
  lines.push(`\nReturn the JSON object now.`);
  return lines.join("\n");
}

/** The provider credential is read from the server-side environment only (edge-function secret).
 *  There is deliberately no database or UI fallback: provider keys never live in application tables. */
function apiKey(): string | null {
  return Deno.env.get("ANTHROPIC_API_KEY") ?? null;
}

export async function runAnalysis(sub: Record<string, unknown>): Promise<Draft> {
  const key = apiKey();
  if (!key) throw new Error("Model generation is disabled: the ANTHROPIC_API_KEY edge-function secret is not set. Add it in Supabase → Edge Functions → Secrets, then use Re-run machine draft.");
  const model = (await getSetting("anthropic_model")) || "claude-sonnet-4-5";

  const content: unknown[] = [];
  if (sub.source_kind === "pdf" && sub.file_path) {
    const bytes = await storageGet(String(sub.file_path));
    content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64(bytes) } });
  } else if (sub.source_kind === "image" && sub.file_path) {
    const bytes = await storageGet(String(sub.file_path));
    content.push({ type: "image", source: { type: "base64", media_type: String(sub.file_mime || "image/png"), data: b64(bytes) } });
  }
  content.push({ type: "text", text: userPrompt(sub) });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 6000,
      temperature: 0.2,
      system: SYSTEM,
      messages: [{ role: "user", content }],
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${JSON.stringify(body).slice(0, 400)}`);
  const text: string = (body.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
  const draft = parseDraft(text);
  draft.model = model;
  draft.generated_at = nowIso();
  return draft;
}

export function parseDraft(text: string): Draft {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Model returned no JSON object.");
  const raw = JSON.parse(text.slice(start, end + 1));
  const findings: Finding[] = Array.isArray(raw.findings) ? raw.findings.slice(0, 4).map(normFinding) : [];
  const nse = Boolean(raw.no_strong_evidence) || findings.length === 0;
  let idx = Number.isInteger(raw.free_finding_index) ? raw.free_finding_index : 0;
  if (nse) idx = -1;
  else if (idx < 0 || idx >= findings.length) idx = 0;
  return {
    intended_measure: str(raw.intended_measure),
    items_seen: Number(raw.items_seen) || 0,
    overall_read: str(raw.overall_read),
    findings,
    free_finding_index: idx,
    no_strong_evidence: nse,
    no_strong_evidence_note: str(raw.no_strong_evidence_note),
    least_confident_response: str(raw.least_confident_response),
    reviewer_notes: str(raw.reviewer_notes),
    model: "",
    generated_at: "",
  };
}

function normFinding(f: Record<string, unknown>): Finding {
  const type = (String(f.finding_type) in FINDING_TYPES ? String(f.finding_type) : "reasoning_invisible") as FindingType;
  const strength = ["strong", "moderate", "weak"].includes(String(f.strength)) ? (String(f.strength) as Finding["strength"]) : "moderate";
  return {
    item_ref: str(f.item_ref) || "Item",
    item_quote: str(f.item_quote),
    finding_type: type,
    strength,
    trying_to_measure: str(f.trying_to_measure),
    actually_evidences: str(f.actually_evidences),
    why_it_matters: str(f.why_it_matters),
    stronger_version: str(f.stronger_version),
    what_did_not_change: str(f.what_did_not_change),
    why_better_evidence: str(f.why_better_evidence),
    teacher_cost: str(f.teacher_cost) || "same",
  };
}

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

/** Draft a submission in place: status drafting → draft_ready | draft_failed. */
export async function draftSubmission(id: string): Promise<void> {
  const rows = await db<Record<string, unknown>[]>(`ast_submissions?id=eq.${id}&select=*`);
  const sub = rows?.[0];
  if (!sub) throw new Error("submission not found");
  await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: { status: "drafting", draft_error: null }, prefer: "return=minimal" });
  try {
    const draft = await runAnalysis(sub);
    const patch: Record<string, unknown> = { status: "draft_ready", draft, drafted_at: nowIso(), draft_error: null };
    const auto = (await getSetting("auto_release_free_finding")) === "true";
    if (auto) {
      patch.free_finding = draft.free_finding_index >= 0 ? draft.findings[draft.free_finding_index] : null;
      patch.full_findings = draft.findings;
      patch.status = "delivered";
      patch.approved_at = nowIso();
      patch.delivered_at = nowIso();
    }
    await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
  } catch (e) {
    await db(`ast_submissions?id=eq.${id}`, {
      method: "PATCH",
      body: { status: "draft_failed", draft_error: String((e as Error).message ?? e).slice(0, 1000) },
      prefer: "return=minimal",
    });
  }
}
