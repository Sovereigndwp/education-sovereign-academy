// Teacher-facing endpoint, keyed by the opaque access token.
//   GET  ?t=<token>                → result (only what has been approved for release)
//   POST {t, action, ...}          → purchase_click | purchase_request | feedback
// Public endpoint (no JWT); the token is the credential.
import { db, json, preflight, getSetting, nowIso } from "../_shared/lib.ts";

const SELECT = [
  "id", "created_at", "subject", "grade", "intended_understanding", "least_confident", "status",
  "free_finding", "full_findings", "delivered_at", "result_viewed_at", "purchase_status", "purchase_for",
  "full_report_html", "full_delivered_at", "feedback", "draft", "purchase_clicked_at",
].join(",");

async function load(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  const rows = await db<Record<string, unknown>[]>(`ast_submissions?access_token=eq.${token}&select=${SELECT}`);
  return rows?.[0] ?? null;
}

function publicView(sub: Record<string, unknown>, stripe: string) {
  const delivered = sub.status === "delivered";
  const draft = (sub.draft ?? {}) as Record<string, unknown>;
  const fulls = (sub.full_findings as unknown[] | null) ?? (draft.findings as unknown[] | undefined) ?? [];
  return {
    id: sub.id,
    status: delivered ? "delivered" : sub.status === "withdrawn" ? "withdrawn" : "pending",
    subject: sub.subject,
    grade: sub.grade,
    intended_understanding: sub.intended_understanding,
    least_confident: sub.least_confident,
    submitted_at: sub.created_at,
    delivered_at: sub.delivered_at,
    // Only released content crosses this line.
    free_finding: delivered ? sub.free_finding : null,
    intended_measure: delivered ? draft.intended_measure ?? null : null,
    overall_read: delivered ? draft.overall_read ?? null : null,
    least_confident_response: delivered ? draft.least_confident_response ?? null : null,
    no_strong_evidence: delivered ? Boolean(draft.no_strong_evidence) && !sub.free_finding : false,
    no_strong_evidence_note: delivered && !sub.free_finding ? draft.no_strong_evidence_note ?? null : null,
    findings_total: delivered ? fulls.length : null,
    purchase_status: sub.purchase_status,
    purchase_for: sub.purchase_for,
    stripe_link: stripe || null,
    full_report_html: sub.full_delivered_at ? sub.full_report_html : null,
    full_delivered_at: sub.full_delivered_at,
    feedback_given: Boolean(sub.feedback),
  };
}

Deno.serve(async (req: Request) => {
  const pf = preflight(req);
  if (pf) return pf;

  if (req.method === "GET") {
    const t = new URL(req.url).searchParams.get("t") ?? "";
    const sub = await load(t);
    if (!sub) return json({ error: "not_found" }, 404);
    if (sub.status === "delivered" && !sub.result_viewed_at) {
      await db(`ast_submissions?id=eq.${sub.id}`, { method: "PATCH", body: { result_viewed_at: nowIso() }, prefer: "return=minimal" });
    }
    const stripe = (await getSetting("stripe_payment_link")) ?? "";
    return json(publicView(sub, stripe));
  }

  if (req.method !== "POST") return json({ error: "method" }, 405);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }
  const sub = await load(String(body.t ?? ""));
  if (!sub) return json({ error: "not_found" }, 404);
  const id = sub.id as string;
  const now = nowIso();
  const cur = String(sub.purchase_status);
  const rank: Record<string, number> = { none: 0, clicked: 1, requested: 2, paid: 3, refunded: 3 };

  switch (body.action) {
    case "purchase_click": {
      const patch: Record<string, unknown> = { purchase_clicked_at: sub.purchase_clicked_at ?? now };
      if (rank[cur] < 1) patch.purchase_status = "clicked";
      if (["self", "department"].includes(String(body.purchase_for))) patch.purchase_for = body.purchase_for;
      await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
      return json({ ok: true });
    }
    case "purchase_request": {
      if (rank[cur] >= 3) return json({ ok: true, already: cur });
      const patch: Record<string, unknown> = {
        purchase_status: "requested",
        purchase_requested_at: now,
        purchase_for: ["self", "department"].includes(String(body.purchase_for)) ? body.purchase_for : "self",
        purchase_note: String(body.note ?? "").trim().slice(0, 1000) || null,
      };
      await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
      return json({ ok: true });
    }
    case "feedback": {
      const yn = (v: unknown) => (["yes", "no", "unsure"].includes(String(v)) ? String(v) : null);
      const feedback = {
        surprising: yn(body.surprising),
        would_change: yn(body.would_change),
        would_use_again: yn(body.would_use_again),
        comment: String(body.comment ?? "").trim().slice(0, 2000) || null,
        on: sub.full_delivered_at ? "full_report" : "free_finding",
      };
      await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: { feedback, feedback_at: now }, prefer: "return=minimal" });
      return json({ ok: true });
    }
    default:
      return json({ error: "unknown action" }, 400);
  }
});
