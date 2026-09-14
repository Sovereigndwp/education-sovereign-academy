// Assignment Studio — the model calls: infer Learning Contract; transform; three audits; one bounded repair.
// Everything about WHAT is allowed lives in contract.ts and audits.ts. This file only moves bytes.
import { db, getSetting, storageGet, b64, nowIso } from "./lib.ts";
import {
  CONTRACT_VERSION, PROMPT_VERSION, type LearningContract, type Mode, type TransformRequest, type TransformOutput,
  inferSystemPrompt, transformSystemPrompt, transformUserPrompt, normalizeContract, normalizeTransform, extractJson,
} from "./contract.ts";
import {
  AUDIT_PROMPT_VERSION, type AuditRecord, type AuditRound, preservationSystem, usefulnessSystem, adversarialSystem, auditUser,
  normPreservation, normUsefulness, normAdversarial, needsRepair,
} from "./audits.ts";

/** Provider credential: read from the server-side environment only (edge-function secret).
 *  There is deliberately no database or UI fallback — provider keys never live in application tables. */
async function apiKey(): Promise<string> {
  const k = Deno.env.get("ANTHROPIC_API_KEY");
  if (!k) throw new Error("Model generation is disabled: the ANTHROPIC_API_KEY edge-function secret is not set (Supabase → Edge Functions → Secrets).");
  return k;
}
async function modelName(): Promise<string> {
  return (await getSetting("anthropic_model")) || "claude-sonnet-4-5";
}

type Block = Record<string, unknown>;

async function attachment(a: Record<string, unknown>): Promise<Block | null> {
  if (!a.file_path) return null;
  if (a.source_kind === "pdf") {
    const bytes = await storageGet(String(a.file_path));
    return { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64(bytes) } };
  }
  if (a.source_kind === "image") {
    const bytes = await storageGet(String(a.file_path));
    return { type: "image", source: { type: "base64", media_type: String(a.file_mime || "image/png"), data: b64(bytes) } };
  }
  return null; // docx: text was extracted client-side into assignment_text
}

export async function callModel(system: string, content: Block[], maxTokens: number): Promise<{ text: string; model: string; ms: number }> {
  const key = await apiKey();
  const model = await modelName();
  const t0 = Date.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.2, system, messages: [{ role: "user", content }] }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${JSON.stringify(body).slice(0, 400)}`);
  const text: string = (body.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
  return { text, model, ms: Date.now() - t0 };
}

export interface Inferred { title: string; item_count: number; assignment_markdown: string; contract: LearningContract; reviewer_notes: string }

/** Step 1: infer the Learning Contract for an assignment row; writes contract_inferred + status. */
export async function inferContract(id: string): Promise<Inferred> {
  const rows = await db<Record<string, unknown>[]>(`as_assignments?id=eq.${id}&select=*`);
  const a = rows?.[0];
  if (!a) throw new Error("assignment not found");
  const content: Block[] = [];
  const att = await attachment(a);
  if (att) content.push(att);
  const lines = [`Subject: ${a.subject}`, `Grade / course: ${a.grade}`];
  if (a.title) lines.push(`Title given by the teacher: ${a.title}`);
  if (a.teacher_notes) lines.push(`What the teacher says students should learn from this (their words):\n${a.teacher_notes}`);
  if (a.assignment_text) lines.push(`\nTHE ASSIGNMENT (text):\n"""\n${a.assignment_text}\n"""`);
  else lines.push(`\nTHE ASSIGNMENT is attached as a ${a.source_kind}. Read every item.`);
  lines.push(`\nReturn the JSON object now.`);
  content.push({ type: "text", text: lines.join("\n") });

  try {
    const { text, model } = await callModel(inferSystemPrompt(), content, 8000);
    const raw = extractJson(text);
    const inferred: Inferred = {
      title: String(raw.title ?? a.title ?? "").trim().slice(0, 200),
      item_count: Number(raw.item_count) || 0,
      assignment_markdown: String(raw.assignment_markdown ?? a.assignment_text ?? "").trim(),
      contract: normalizeContract(raw.contract),
      reviewer_notes: String(raw.reviewer_notes ?? "").trim().slice(0, 3000),
    };
    await db(`as_assignments?id=eq.${id}`, {
      method: "PATCH", prefer: "return=minimal",
      body: { contract_inferred: inferred, contract_inferred_at: nowIso(), contract_error: null, status: "contract_ready",
        title: inferred.title || a.title, model, prompt_version: PROMPT_VERSION, contract_version: CONTRACT_VERSION },
    });
    return inferred;
  } catch (e) {
    await db(`as_assignments?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal",
      body: { status: "contract_failed", contract_error: String((e as Error).message ?? e).slice(0, 1000) } });
    throw e;
  }
}

// ── helpers shared by transform + audits ─────────────────────────────────────
interface Ctx { a: Record<string, unknown>; original: string; contract: LearningContract; mode: Mode; att: Block | null }

async function ctxFor(assignmentId: string, mode: Mode): Promise<Ctx> {
  const arows = await db<Record<string, unknown>[]>(`as_assignments?id=eq.${assignmentId}&select=*`);
  const a = arows?.[0];
  if (!a) throw new Error("assignment not found");
  if (!a.contract_confirmed) throw new Error("Learning Contract not confirmed.");
  const inferred = (a.contract_inferred ?? {}) as Partial<Inferred>;
  return { a, original: inferred.assignment_markdown || String(a.assignment_text || ""), contract: a.contract_confirmed as LearningContract, mode, att: await attachment(a) };
}

async function stage(versionId: string, st: string) {
  await db(`as_versions?id=eq.${versionId}`, { method: "PATCH", prefer: "return=minimal", body: { stage: st } });
}

/** One bounded retry. The transform returns a whole assignment inside a JSON string, and roughly one call in
 *  fifteen comes back malformed in a way no parser should paper over — cut off mid-object, or answered in prose.
 *  The teacher has waited a minute by then, so a second sample is worth far more than an error screen. Two
 *  attempts, never more: if the model cannot produce usable JSON twice, that is a real failure and it surfaces. */
async function runTransform(c: Ctx, request: TransformRequest): Promise<{ out: TransformOutput; model: string; ms: number }> {
  const content: Block[] = [];
  if (c.att) content.push(c.att); // original file goes along too, so layout/diagrams are not lost
  content.push({ type: "text", text: transformUserPrompt({ subject: String(c.a.subject), grade: String(c.a.grade), original_markdown: c.original, contract: c.contract, request, mode: c.mode }) });
  const system = transformSystemPrompt(c.mode);
  let spent = 0;
  let last: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { text, model, ms } = await callModel(system, content, 12000);
    spent += ms;
    try { return { out: normalizeTransform(extractJson(text), c.mode), model, ms: spent }; }
    catch (e) { last = e as Error; }
  }
  throw new Error(`${last?.message ?? "unusable model output"} (two attempts)`);
}

/** The three audits, in parallel. Pure: reads nothing from the DB. */
export async function runAudits(c: Ctx, version: string, trace: unknown, round: number): Promise<AuditRound> {
  const user = auditUser({ subject: String(c.a.subject), grade: String(c.a.grade), contract: c.contract, original: c.original, version, mode: c.mode, trace });
  const blindUser = auditUser({ subject: String(c.a.subject), grade: String(c.a.grade), contract: c.contract, original: c.original, version, mode: c.mode, blind: true });
  const content: Block[] = [{ type: "text", text: user }];
  const [p, u, adv] = await Promise.all([
    callModel(preservationSystem(c.mode), content, 3000),
    callModel(usefulnessSystem(c.mode), [{ type: "text", text: blindUser }], 2000),
    callModel(adversarialSystem(), content, 3000),
  ]);
  return {
    round, at: nowIso(), model: p.model, prompt_version: AUDIT_PROMPT_VERSION,
    preservation: normPreservation(p.text, { original: c.original, version, mode: c.mode }), usefulness: normUsefulness(u.text), adversarial: normAdversarial(adv.text),
  };
}

function verdicts(r: AuditRound) {
  return { preservation: r.preservation.verdict, usefulness: r.usefulness.verdict, adversarial: r.adversarial.verdict };
}

/** Merge audit findings the teacher should see into the trace's "Check this", without making the trace an audit report. */
function foldIntoTrace(out: TransformOutput, r: AuditRound, mode: Mode): TransformOutput {
  const extra: string[] = [];
  for (const f of r.preservation.findings) if (f.kind !== "held" && f.severity !== "note") extra.push(`${(f.rule || f.invariant).replace(/_/g, " ")}: ${f.evidence}`);
  // The adversarial line belongs in "Check this" only where observable reasoning is the version's objective;
  // for Support/Advanced it is recorded and shown in the checks block, not raised as something to fix.
  if (mode === "visible" && r.adversarial.verdict !== "SURVIVES") extra.push(`A student with an AI assistant could ${r.adversarial.verdict === "UNDERMINED" ? "produce this without the thinking" : "shortcut part of this"}: ${r.adversarial.cheapest_path}`);
  const seen = new Set(out.trace.check_this);
  out.trace.check_this = [...out.trace.check_this, ...extra.filter((x) => !seen.has(x))].slice(0, 8);
  // The engine's own receipt may not contradict its audit. Any finding the teacher is shown in "Check this" —
  // block or review, exceeded or unclear — forces that field's status to REVIEW_REQUIRED.
  // This is where teacher_constraints bit: the audit can only ever file that field at review level (its magnitude
  // belongs to the Usefulness audit), so before this a version that silently overran the period reported
  // teacher_constraints: PRESERVED while its own "Check this" quoted the overrun back to the teacher.
  for (const f of r.preservation.findings) {
    if (f.severity === "note" || f.kind === "held") continue;
    if (!(f.invariant in out.statuses)) continue; // must_not findings belong to Check this, not to a field
    const k = f.invariant as keyof TransformOutput["statuses"];
    if (out.statuses[k].status === "REVIEW_REQUIRED") continue;
    out.statuses[k] = { status: "REVIEW_REQUIRED", note: `Audit: ${f.evidence}`.slice(0, 600) };
  }
  return out;
}

/** Step 2 (background): transform → audit → (one bounded repair → re-audit) → ready. Stage is readable while it runs. */
export async function transformVersion(versionId: string): Promise<void> {
  const vrows = await db<Record<string, unknown>[]>(`as_versions?id=eq.${versionId}&select=*`);
  const v = vrows?.[0];
  if (!v) throw new Error("version not found");
  try {
    const c = await ctxFor(String(v.assignment_id), v.mode as Mode);
    const request = (v.request ?? {}) as TransformRequest;
    await stage(versionId, "transforming");
    let { out, model, ms } = await runTransform(c, request);
    await db(`as_versions?id=eq.${versionId}`, { method: "PATCH", prefer: "return=minimal", body: { output: out, model, prompt_version: PROMPT_VERSION, contract_version: CONTRACT_VERSION, generated_ms: ms } });

    await stage(versionId, "auditing");
    const record: AuditRecord = { rounds: [], repair_reason: null };
    let round = await runAudits(c, out.new_version, out.trace, 1);
    record.rounds.push(round);

    const reason = needsRepair(round.preservation, round.adversarial, c.mode);
    let repaired = false;
    let prerepair: TransformOutput | null = null;
    if (reason) {
      record.repair_reason = reason;
      await db(`as_versions?id=eq.${versionId}`, { method: "PATCH", prefer: "return=minimal", body: { audits: record } });
      await stage(versionId, "repairing");
      prerepair = out;
      const fixed = await runTransform(c, { ...request, repair_note: reason, previous_version: out.new_version });
      out = fixed.out; ms += fixed.ms; repaired = true;
      await stage(versionId, "reauditing");
      round = await runAudits(c, out.new_version, out.trace, 2);
      record.rounds.push(round);
    }
    out = foldIntoTrace(out, round, c.mode);
    await db(`as_versions?id=eq.${versionId}`, { method: "PATCH", prefer: "return=minimal", body: {
      output: out, output_prerepair: prerepair, repaired, audits: record, audit_verdicts: verdicts(round),
      status: "ready", stage: "done", error: null, model, prompt_version: PROMPT_VERSION, contract_version: CONTRACT_VERSION, generated_ms: ms,
    } });
  } catch (e) {
    await db(`as_versions?id=eq.${versionId}`, { method: "PATCH", prefer: "return=minimal",
      body: { status: "failed", stage: "failed", error: String((e as Error).message ?? e).slice(0, 1000) } });
    throw e;
  }
}

/** Audit an arbitrary version text against a confirmed assignment (gold fixtures; a teacher's own edit). No repair. */
export async function auditText(assignmentId: string, mode: Mode, version: string): Promise<AuditRound> {
  const c = await ctxFor(assignmentId, mode);
  return runAudits(c, version, null, 1);
}
