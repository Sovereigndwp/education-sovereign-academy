// Internal review endpoint. Auth: header x-ast-admin, compared by SHA-256 against
// ast_settings.admin_token_sha256. One reviewer (Dalia); no accounts.
import { db, json, preflight, getSetting, setSetting, sha256hex, storageDelete, storageSignedUrl, nowIso } from "../_shared/lib.ts";
import { draftSubmission } from "../_shared/analysis.ts";

const LIST_SELECT = [
  "id", "created_at", "email", "teacher_name", "subject", "grade", "copyright_bucket", "source_kind", "status",
  "purchase_status", "purchase_for", "delivered_at", "full_delivered_at", "feedback_at", "result_viewed_at",
  "channel", "cohort", "draft_error", "free_finding->>finding_type",
].join(",");

async function authed(req: Request): Promise<boolean> {
  const tok = req.headers.get("x-ast-admin") ?? "";
  if (!tok) return false;
  const want = await getSetting("admin_token_sha256");
  return Boolean(want) && (await sha256hex(tok)) === want;
}

Deno.serve(async (req: Request) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!(await authed(req))) return json({ error: "unauthorized" }, 401);

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }
  const id = typeof b.id === "string" && /^[0-9a-f-]{36}$/.test(b.id) ? b.id : null;
  const now = nowIso();

  try {
    switch (b.action) {
      case "list": {
        const rows = await db(`ast_submissions?select=${LIST_SELECT}&order=created_at.desc&limit=300`);
        return json({ rows });
      }
      case "stats": {
        const [funnel, conv, value] = await Promise.all([
          db("ast_funnel?select=*"),
          db("ast_conversion?select=*"),
          db("ast_finding_value?select=*"),
        ]);
        const evts = await db("ast_event_counts?select=*");
        return json({ funnel: (funnel as unknown[])[0], conversion: (conv as unknown[])[0], finding_value: value, events: evts });
      }
      case "get": {
        if (!id) return json({ error: "id" }, 400);
        const rows = await db<Record<string, unknown>[]>(`ast_submissions?id=eq.${id}&select=*`);
        const sub = rows?.[0];
        if (!sub) return json({ error: "not_found" }, 404);
        const file_url = sub.file_path ? await storageSignedUrl(String(sub.file_path)) : null;
        const events = await db(`ast_events?submission_id=eq.${id}&select=created_at,event,props&order=created_at`);
        return json({ sub, file_url, events });
      }
      case "draft": {
        if (!id) return json({ error: "id" }, 400);
        await draftSubmission(id); // synchronous here so the reviewer sees the result or the error
        const rows = await db<Record<string, unknown>[]>(`ast_submissions?id=eq.${id}&select=status,draft,draft_error,drafted_at`);
        return json(rows[0]);
      }
      case "save": {
        if (!id) return json({ error: "id" }, 400);
        const patch: Record<string, unknown> = {};
        for (const k of ["free_finding", "full_findings", "review_notes", "full_report_html", "draft"]) {
          if (k in b) patch[k] = b[k];
        }
        await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
        return json({ ok: true });
      }
      case "status": {
        if (!id) return json({ error: "id" }, 400);
        const st = String(b.status);
        const patch: Record<string, unknown> = { status: st };
        if (st === "approved") patch.approved_at = now;
        if (st === "delivered") { patch.approved_at = patch.approved_at ?? now; patch.delivered_at = now; patch.draft_error = null; }
        if ("free_finding" in b) patch.free_finding = b.free_finding;
        if ("full_findings" in b) patch.full_findings = b.full_findings;
        await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
        return json({ ok: true });
      }
      case "full_delivered": {
        if (!id) return json({ error: "id" }, 400);
        await db(`ast_submissions?id=eq.${id}`, {
          method: "PATCH",
          body: { full_report_html: b.full_report_html ?? null, full_delivered_at: now },
          prefer: "return=minimal",
        });
        return json({ ok: true });
      }
      case "purchase": {
        if (!id) return json({ error: "id" }, 400);
        const ps = String(b.purchase_status);
        if (!["none", "clicked", "requested", "paid", "refunded"].includes(ps)) return json({ error: "bad status" }, 400);
        const patch: Record<string, unknown> = { purchase_status: ps };
        if (ps === "paid") { patch.paid_at = now; patch.payment_ref = String(b.payment_ref ?? "").slice(0, 200) || null; }
        await db(`ast_submissions?id=eq.${id}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
        if (ps === "paid") {
          // Record the transaction in the existing purchases ledger (best effort).
          try {
            const subs = await db<{ email: string }[]>(`ast_submissions?id=eq.${id}&select=email`);
            await db("purchases", {
              method: "POST",
              prefer: "return=minimal",
              body: {
                email: subs[0]?.email,
                amount_usd: 49,
                provider: String(b.provider ?? "stripe"),
                provider_payment_id: patch.payment_ref,
                status: "completed",
                product_id: "assessment-stress-test-full",
                metadata: { submission_id: id, recorded_by: "ast-admin" },
                paid_at: now,
              },
            });
          } catch (e) {
            console.error("purchases insert failed", e);
          }
        }
        return json({ ok: true });
      }
      case "withdraw": {
        // Right of withdrawal: delete the material, keep only a stub row for the funnel count.
        if (!id) return json({ error: "id" }, 400);
        const rows = await db<{ file_path: string | null }[]>(`ast_submissions?id=eq.${id}&select=file_path`);
        if (rows[0]?.file_path) await storageDelete(rows[0].file_path);
        await db(`ast_submissions?id=eq.${id}`, {
          method: "PATCH",
          prefer: "return=minimal",
          body: {
            status: "withdrawn", assessment_text: null, file_path: null, draft: null, free_finding: null,
            full_findings: null, full_report_html: null, worry_text: null, least_confident: null,
            intended_understanding: "[withdrawn]", email: "withdrawn@invalid", teacher_name: null, review_notes: null,
          },
        });
        return json({ ok: true });
      }
      case "settings_get": {
        const keys = ["stripe_payment_link", "anthropic_model", "auto_release_free_finding"];
        const out: Record<string, string | null> = {};
        for (const k of keys) out[k] = await getSetting(k);
        out.anthropic_key_source = Deno.env.get("ANTHROPIC_API_KEY") ? "secret" : (await getSetting("anthropic_api_key")) ? "settings" : "missing";
        return json(out);
      }
      case "settings_set": {
        const allowed = ["stripe_payment_link", "anthropic_model", "auto_release_free_finding", "anthropic_api_key"];
        for (const k of allowed) if (typeof b[k] === "string") await setSetting(k, String(b[k]).trim());
        return json({ ok: true });
      }
      default:
        return json({ error: "unknown action" }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e).slice(0, 500) }, 500);
  }
});
