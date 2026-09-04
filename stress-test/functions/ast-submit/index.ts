// POST multipart/form-data → stores the submission, returns the access token,
// and drafts the analysis in the background. Public endpoint (no JWT).
import { db, json, preflight, storagePut, EMAIL_RE, nowIso } from "../_shared/lib.ts";
import { draftSubmission } from "../_shared/analysis.ts";

const MAX_BYTES = 15 * 1024 * 1024;
const MIME_KIND: Record<string, "pdf" | "image"> = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
};
const BUCKETS = new Set(["teacher", "district", "publisher"]);

function s(form: FormData, k: string, max = 2000): string {
  const v = form.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

Deno.serve(async (req: Request) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Expected multipart form data." }, 400);
  }

  // Honeypot: real teachers never fill this.
  if (s(form, "website")) return json({ ok: true, token: "ok" });

  const email = s(form, "email", 200).toLowerCase();
  const subject = s(form, "subject", 120);
  const grade = s(form, "grade", 120);
  const intended = s(form, "intended_understanding", 1500);
  const copyright = s(form, "copyright_bucket", 20);
  const text = s(form, "assessment_text", 40000);
  const file = form.get("file");
  const hasFile = file instanceof File && file.size > 0;

  const errors: string[] = [];
  if (!EMAIL_RE.test(email)) errors.push("A working email address is needed to return your finding.");
  if (!subject) errors.push("Subject is required.");
  if (!grade) errors.push("Grade or course is required.");
  if (intended.length < 20) errors.push("Tell us what students are supposed to understand (a sentence or two).");
  if (!BUCKETS.has(copyright)) errors.push("Choose where the assessment came from.");
  if (s(form, "confirm_no_student_data") !== "yes") errors.push("Confirm the file contains no student names, work, or grades.");
  if (s(form, "confirm_rights") !== "yes") errors.push("Confirm you have the right to share this material for analysis.");
  if (!hasFile && text.length < 80) errors.push("Paste the assessment text (at least a few questions) or attach a PDF/image.");
  let kind: "text" | "pdf" | "image" = "text";
  let mime = "";
  if (hasFile) {
    const f = file as File;
    mime = f.type;
    if (!MIME_KIND[mime]) errors.push("Attach a PDF, PNG, JPG, or WebP. For Word or Google Docs, export as PDF or paste the text.");
    if (f.size > MAX_BYTES) errors.push("File is larger than 15 MB.");
    kind = MIME_KIND[mime] ?? "pdf";
  }
  if (errors.length) return json({ error: errors.join(" "), errors }, 400);

  const row = {
    email,
    teacher_name: s(form, "teacher_name", 120) || null,
    subject,
    grade,
    intended_understanding: intended,
    least_confident: s(form, "least_confident", 600) || null,
    worry_text: s(form, "worry_text", 1500) || null,
    source_kind: kind,
    assessment_text: kind === "text" ? text : (text || null),
    copyright_bucket: copyright,
    confirm_no_student_data: true,
    confirm_rights: true,
    channel: s(form, "channel", 80) || null,
    cohort: s(form, "cohort", 80) || null,
    status: "received",
  };

  let inserted: { id: string; access_token: string };
  try {
    const rows = await db<{ id: string; access_token: string }[]>("ast_submissions?select=id,access_token", { method: "POST", body: row });
    inserted = rows[0];
  } catch (e) {
    console.error("insert failed", e);
    return json({ error: "We could not save your submission. Please try again in a minute." }, 500);
  }

  if (hasFile) {
    try {
      const f = file as File;
      const ext = mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const path = `${inserted.id}/assessment.${ext}`;
      await storagePut(path, new Uint8Array(await f.arrayBuffer()), mime);
      await db(`ast_submissions?id=eq.${inserted.id}`, {
        method: "PATCH",
        body: { file_path: path, file_mime: mime, file_bytes: f.size },
        prefer: "return=minimal",
      });
    } catch (e) {
      console.error("upload failed", e);
      await db(`ast_submissions?id=eq.${inserted.id}`, {
        method: "PATCH",
        body: { status: "draft_failed", draft_error: "File upload failed: " + String((e as Error).message ?? e).slice(0, 300) },
        prefer: "return=minimal",
      });
      return json({ error: "Your details were saved but the file did not upload. Please try again, or paste the text instead." }, 500);
    }
  }

  // Draft in the background; the response returns immediately.
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  const work = draftSubmission(inserted.id).catch((e) => console.error("draft error", e));
  if (rt?.waitUntil) rt.waitUntil(work);

  return json({ ok: true, token: inserted.access_token, id: inserted.id, received_at: nowIso() });
});
