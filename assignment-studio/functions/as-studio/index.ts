// Assignment Studio — the one public endpoint. The access token is the credential (no accounts).
//   POST multipart/form-data                 → create assignment, infer Learning Contract (synchronous), return {t, ...}
//   POST application/json {t, action, ...}   → get | confirm_contract | transform (background; poll get_version) | get_version
//                                              | version_event | preservation | use_answer | audit_text | withdraw
import { db, json, preflight, storagePut, storageDelete, EMAIL_RE, nowIso } from "../_shared/lib.ts";
import { inferContract, transformVersion, auditText } from "../_shared/engine.ts";
import { CONTRACT_FIELDS, MODES, normalizeContract, diffContract, type LearningContract, type Mode } from "../_shared/contract.ts";

const MAX_BYTES = 15 * 1024 * 1024;
const MIME_KIND: Record<string, "pdf" | "image" | "docx"> = {
  "application/pdf": "pdf", "image/png": "image", "image/jpeg": "image", "image/webp": "image",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
const BUCKETS = new Set(["teacher", "district", "publisher"]);
const A_SELECT = "id,created_at,title,subject,grade,teacher_notes,source_kind,status,contract_inferred,contract_confirmed,contract_confirmed_at,contract_corrected,pilot_id,teacher_key";
const V_SELECT = "id,created_at,assignment_id,mode,request,output,status,stage,error,model,prompt_version,contract_version,generated_ms,viewed_at,accepted_at,edited_at,edited_text,used_at,used_note,export_docx_at,export_print_at,preservation_answer,preservation_correction,preservation_at,audit_verdicts,audits,repaired,use_answer,use_comment,use_at";

function s(form: FormData, k: string, max = 2000): string {
  const v = form.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function clean(v: unknown, max: number): string | null {
  const t = String(v ?? "").trim().slice(0, max);
  return t || null;
}

async function loadByToken(t: string) {
  if (!/^[a-f0-9]{32}$/.test(t)) return null;
  const rows = await db<Record<string, unknown>[]>(`as_assignments?access_token=eq.${t}&select=${A_SELECT}`);
  return rows?.[0] ?? null;
}
async function versionsOf(id: string) {
  return await db<Record<string, unknown>[]>(`as_versions?assignment_id=eq.${id}&select=${V_SELECT}&order=created_at.asc`);
}
function publicAssignment(a: Record<string, unknown>) {
  const inf = (a.contract_inferred ?? null) as Record<string, unknown> | null;
  return {
    id: a.id, created_at: a.created_at, title: a.title, subject: a.subject, grade: a.grade, teacher_notes: a.teacher_notes,
    source_kind: a.source_kind, status: a.status, pilot_id: a.pilot_id,
    original_markdown: inf?.assignment_markdown ?? null, item_count: inf?.item_count ?? null,
    contract_inferred: inf?.contract ?? null, contract_confirmed: a.contract_confirmed ?? null,
    contract_confirmed_at: a.contract_confirmed_at, contract_corrected: a.contract_corrected,
  };
}

async function create(req: Request): Promise<Response> {
  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "Expected multipart form data." }, 400); }
  if (s(form, "website")) return json({ ok: true, t: "ok" }); // honeypot

  const subject = s(form, "subject", 120);
  const grade = s(form, "grade", 120);
  const copyright = s(form, "copyright_bucket", 20);
  const text = s(form, "assignment_text", 60000);
  const email = s(form, "email", 200).toLowerCase();
  const file = form.get("file");
  const hasFile = file instanceof File && file.size > 0;

  const errors: string[] = [];
  if (!subject) errors.push("Subject is required.");
  if (!grade) errors.push("Grade or course is required.");
  if (!BUCKETS.has(copyright)) errors.push("Tell us where the assignment came from.");
  if (s(form, "confirm_no_student_data") !== "yes") errors.push("Confirm the assignment contains no student names, work, or grades.");
  if (s(form, "confirm_rights") !== "yes") errors.push("Confirm you have the right to adapt this material.");
  if (email && !EMAIL_RE.test(email)) errors.push("That email address doesn't look right (it is optional — leave it blank if you prefer).");
  let kind: "text" | "pdf" | "image" | "docx" = "text";
  let mime = "";
  if (hasFile) {
    const f = file as File;
    mime = f.type;
    if (!MIME_KIND[mime]) errors.push("Attach a Word (.docx), PDF, PNG, JPG, or WebP file — or paste the text.");
    if (f.size > MAX_BYTES) errors.push("File is larger than 15 MB.");
    kind = MIME_KIND[mime] ?? "pdf";
    if (kind === "docx" && text.length < 40) errors.push("We could not read text from that Word file. Paste the text instead.");
  } else if (text.length < 40) errors.push("Paste the assignment (at least a few lines) or attach a file.");
  if (errors.length) return json({ error: errors.join(" "), errors }, 400);

  const row = {
    subject, grade, email: email || null,
    title: s(form, "title", 200) || null,
    teacher_notes: s(form, "teacher_notes", 2000) || null,
    source_kind: kind,
    assignment_text: text || null,
    copyright_bucket: copyright, confirm_no_student_data: true, confirm_rights: true,
    teacher_key: s(form, "teacher_key", 80) || null,
    pilot_id: s(form, "pilot_id", 80) || null,
    channel: s(form, "channel", 80) || null,
    status: "received",
  };
  let inserted: { id: string; access_token: string };
  try {
    const rows = await db<{ id: string; access_token: string }[]>("as_assignments?select=id,access_token", { method: "POST", body: row });
    inserted = rows[0];
  } catch (e) {
    console.error("insert failed", e);
    return json({ error: "We could not save the assignment. Please try again in a minute." }, 500);
  }
  if (hasFile) {
    try {
      const f = file as File;
      const ext = kind === "pdf" ? "pdf" : kind === "docx" ? "docx" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const path = `as/${inserted.id}/assignment.${ext}`;
      await storagePut(path, new Uint8Array(await f.arrayBuffer()), mime);
      await db(`as_assignments?id=eq.${inserted.id}`, { method: "PATCH", prefer: "return=minimal", body: { file_path: path, file_mime: mime, file_bytes: f.size } });
    } catch (e) {
      console.error("upload failed", e);
      return json({ error: "The file did not upload. Please try again, or paste the text instead." }, 500);
    }
  }
  // Synchronous: the teacher is waiting to Confirm/Correct.
  try {
    await inferContract(inserted.id);
  } catch (e) {
    return json({ error: "We saved the assignment but could not read it: " + String((e as Error).message ?? e).slice(0, 300), t: inserted.access_token }, 502);
  }
  const a = await loadByToken(inserted.access_token);
  return json({ ok: true, t: inserted.access_token, assignment: publicAssignment(a!), versions: [] });
}

Deno.serve(async (req: Request) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) return create(req);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const a = await loadByToken(String(b.t ?? ""));
  if (!a) return json({ error: "not_found" }, 404);
  const id = String(a.id);
  const now = nowIso();
  if (a.status === "withdrawn") return json({ error: "withdrawn" }, 410);

  try {
    switch (b.action) {
      case "get":
        return json({ assignment: publicAssignment(a), versions: await versionsOf(id) });

      case "retry_infer": {
        await inferContract(id);
        const fresh = await loadByToken(String(b.t));
        return json({ assignment: publicAssignment(fresh!), versions: [] });
      }

      case "confirm_contract": {
        const inferred = ((a.contract_inferred as Record<string, unknown>)?.contract ?? {}) as LearningContract;
        const confirmed = normalizeContract(b.contract);
        for (const f of CONTRACT_FIELDS) if (f !== "teacher_constraints" && !confirmed[f]) return json({ error: `"${f.replace("_", " ")}" cannot be empty.` }, 400);
        const corrections = diffContract(normalizeContract(inferred), confirmed);
        await db(`as_assignments?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: {
          contract_confirmed: confirmed, contract_confirmed_at: now, contract_corrected: corrections.length > 0,
          contract_corrections: corrections, status: "confirmed" } });
        return json({ ok: true, corrected: corrections.length > 0, corrections });
      }

      case "transform": {
        const mode = String(b.mode) as Mode;
        if (!(mode in MODES)) return json({ error: "unknown mode" }, 400);
        if (!a.contract_confirmed) return json({ error: "Confirm the Learning Contract first." }, 400);
        const r = (b.request ?? {}) as Record<string, unknown>;
        const request = {
          constraints_text: clean(r.constraints_text, 1500),
          supports: Array.isArray(r.supports) ? r.supports.map(String).slice(0, 12) : [],
          notes: clean(r.notes, 1500),
          needs_text: mode === "support" ? clean(r.needs_text, 1500) : null,
        };
        const rows = await db<{ id: string }[]>("as_versions?select=id", { method: "POST", body: { assignment_id: id, mode, request, status: "generating", stage: "queued" } });
        const vid = rows[0].id;
        // Transform + three audits (+ one bounded repair) run in the background; the client polls get_version for `stage`.
        // deno-lint-ignore no-explicit-any
        const rt = (globalThis as any).EdgeRuntime;
        const work = transformVersion(vid).catch((e) => console.error("transform error", e));
        if (rt?.waitUntil) rt.waitUntil(work); else await work;
        const v = (await db<Record<string, unknown>[]>(`as_versions?id=eq.${vid}&select=${V_SELECT}`))[0];
        return json({ ok: true, version: v });
      }

      case "get_version": {
        const vid = String(b.version_id ?? "");
        if (!/^[0-9a-f-]{36}$/.test(vid)) return json({ error: "version_id" }, 400);
        const v = (await db<Record<string, unknown>[]>(`as_versions?id=eq.${vid}&assignment_id=eq.${id}&select=${V_SELECT}`))[0];
        if (!v) return json({ error: "not_found" }, 404);
        return json({ ok: true, version: v });
      }

      case "use_answer": {
        const vid = String(b.version_id ?? "");
        if (!/^[0-9a-f-]{36}$/.test(vid)) return json({ error: "version_id" }, 400);
        const own = await db<{ id: string }[]>(`as_versions?id=eq.${vid}&assignment_id=eq.${id}&select=id`);
        if (!own?.length) return json({ error: "not_found" }, 404);
        const ans = ["yes_as_is", "yes_with_changes", "no"].includes(String(b.answer)) ? String(b.answer) : null;
        if (!ans) return json({ error: "answer must be yes_as_is | yes_with_changes | no" }, 400);
        await db(`as_versions?id=eq.${vid}`, { method: "PATCH", prefer: "return=minimal", body: {
          use_answer: ans, use_comment: ans === "yes_as_is" ? null : clean(b.comment, 3000), use_at: now } });
        return json({ ok: true });
      }

      case "audit_text": {
        // Audit any version text against this confirmed assignment: gold fixtures, or a teacher's own edit. No repair cycle.
        const mode = String(b.mode) as Mode;
        if (!(mode in MODES)) return json({ error: "unknown mode" }, 400);
        const text = clean(b.text, 60000);
        if (!text) return json({ error: "text" }, 400);
        const round = await auditText(id, mode, text);
        return json({ ok: true, audit: round, verdicts: { preservation: round.preservation.verdict, usefulness: round.usefulness.verdict, adversarial: round.adversarial.verdict } });
      }

      case "version_event": {
        const vid = String(b.version_id ?? "");
        if (!/^[0-9a-f-]{36}$/.test(vid)) return json({ error: "version_id" }, 400);
        const own = await db<{ id: string }[]>(`as_versions?id=eq.${vid}&assignment_id=eq.${id}&select=id`);
        if (!own?.length) return json({ error: "not_found" }, 404);
        const patch: Record<string, unknown> = {};
        switch (String(b.event)) {
          case "viewed": patch.viewed_at = now; break;
          case "accepted": patch.accepted_at = now; break;
          case "edited": patch.edited_at = now; patch.edited_text = clean(b.text, 60000); break;
          case "used": patch.used_at = now; patch.used_note = clean(b.note, 1500); break;
          case "export_docx": patch.export_docx_at = now; break;
          case "export_print": patch.export_print_at = now; break;
          default: return json({ error: "unknown event" }, 400);
        }
        await db(`as_versions?id=eq.${vid}`, { method: "PATCH", prefer: "return=minimal", body: patch });
        return json({ ok: true });
      }

      case "preservation": {
        const vid = String(b.version_id ?? "");
        if (!/^[0-9a-f-]{36}$/.test(vid)) return json({ error: "version_id" }, 400);
        const own = await db<{ id: string }[]>(`as_versions?id=eq.${vid}&assignment_id=eq.${id}&select=id`);
        if (!own?.length) return json({ error: "not_found" }, 404);
        const answer = String(b.answer) === "yes" ? "yes" : String(b.answer) === "no" ? "no" : null;
        if (!answer) return json({ error: "answer must be yes or no" }, 400);
        await db(`as_versions?id=eq.${vid}`, { method: "PATCH", prefer: "return=minimal", body: {
          preservation_answer: answer, preservation_correction: answer === "yes" ? clean(b.correction, 3000) : null, preservation_at: now } });
        return json({ ok: true });
      }

      case "withdraw": {
        const full = (await db<Record<string, unknown>[]>(`as_assignments?id=eq.${id}&select=file_path`))[0];
        if (full?.file_path) await storageDelete(String(full.file_path));
        await db(`as_assignments?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: {
          status: "withdrawn", assignment_text: null, file_path: null, contract_inferred: null, contract_confirmed: null, teacher_notes: null, email: null, title: null } });
        await db(`as_versions?assignment_id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: { output: null, edited_text: null } });
        return json({ ok: true });
      }

      default:
        return json({ error: "unknown action" }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e).slice(0, 400) }, 500);
  }
});
