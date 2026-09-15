#!/usr/bin/env node
// ESA backend: configure ESA_ADMIN_KEY and run the pre-cutover smoke suite.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-backend-smoke.mjs
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-backend-smoke.mjs --no-set-key
//
// Runs locally because every step needs a credential that must not pass through a chat
// transcript: the admin key, an invite token (which IS a teacher's credential), and the
// Anthropic key. Nothing secret is printed - only pass/fail, lengths and short hashes.
//
// It creates NO teacher review. check_invite is a pure read in the deployed function
// (invite() + used(), both SELECTs), and this script asserts the review count is unchanged.

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const REF = process.env.ESA_PROJECT_REF || "svrbfpjoufhhxdshwlvt";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SET_KEY = !process.argv.includes("--no-set-key");
const FN = `https://${REF}.supabase.co/functions/v1`;

if (!TOKEN) {
  console.error("SUPABASE_ACCESS_TOKEN is not set.");
  console.error("  SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-backend-smoke.mjs");
  process.exit(2);
}

let failures = 0;
const sha = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);
const ok = (label, pass, detail = "") => {
  if (!pass) failures++;
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${label}${detail ? `   [${detail}]` : ""}`);
  return pass;
};

async function api(path, init = {}) {
  const res = await fetch(`https://api.supabase.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}
const q = (sql) => api(`/v1/projects/${REF}/database/query`, { method: "POST", body: JSON.stringify({ query: sql }) });
const post = async (body) => {
  const res = await fetch(`${FN}/esa-review`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  let j = null; try { j = JSON.parse(await res.text()); } catch {}
  return { status: res.status, body: j };
};

console.log(`ESA backend smoke — project ${REF}\n`);

/* ── 1 · ESA_ADMIN_KEY ──────────────────────────────────────────────────── */
console.log("1 · ESA_ADMIN_KEY");
let adminKey = null;
let secrets = await api(`/v1/projects/${REF}/secrets`);
const had = secrets.find((s) => s.name === "ESA_ADMIN_KEY");
if (had) {
  // NOTE: had.value is a DIGEST, not the secret - GET /secrets never returns secret values.
  // It cannot be used to exercise the admin gate. Only a value generated in this process can.
  console.log("  ESA_ADMIN_KEY already exists on this project — NOT overwriting.");
  ok("secret exists", true, "value not readable back from this API, so the accept-path is skipped");
  adminKey = null;
} else if (!SET_KEY) {
  ok("secret exists", false, "absent and --no-set-key was passed");
} else {
  // 48 random bytes, base64url: 64 chars, ~384 bits. Generated here, never typed, never logged.
  adminKey = randomBytes(48).toString("base64url");
  await api(`/v1/projects/${REF}/secrets`, { method: "POST", body: JSON.stringify([{ name: "ESA_ADMIN_KEY", value: adminKey }]) });
  secrets = await api(`/v1/projects/${REF}/secrets`);
  const now = secrets.find((s) => s.name === "ESA_ADMIN_KEY");
  ok("ESA_ADMIN_KEY created and present", Boolean(now), `len ${adminKey.length}, sha ${sha(adminKey)}`);
  console.log("  (value never printed; read it from the dashboard when you need it for /esa/admin.html)");
}
const names = secrets.map((s) => s.name).sort();
console.log(`  secrets on ${REF}: ${names.join(", ") || "(none)"}`);
ok("ANTHROPIC_API_KEY present", names.includes("ANTHROPIC_API_KEY"));

/* ── 2 · invalid invite ─────────────────────────────────────────────────── */
console.log("\n2 · invalid invite");
{
  const r = await post({ action: "check_invite", invite: "0".repeat(32) });
  ok("invalid invite returns 403", r.status === 403, `status ${r.status}`);
  ok("403 carries a clean error string", typeof r.body?.error === "string", r.body?.error ?? "no error field");
}

/* ── 3 · a real migrated invite, without consuming quota ────────────────── */
console.log("\n3 · migrated invite check (must not consume quota)");
{
  const before = (await q("select count(*)::int as n from public.esa_reviews"))[0].n;
  const row = (await q("select token, teacher_label, reviews_allowed from public.esa_invites where revoked = false order by created_at asc limit 1"))[0];
  if (!row) {
    ok("an unrevoked migrated invite exists", false, "esa_invites has no usable row");
  } else {
    const r = await post({ action: "check_invite", invite: row.token });
    ok("migrated invite validates", r.status === 200 && r.body?.ok === true, `status ${r.status}`);
    ok("teacher_label round-trips", r.body?.teacher_label === row.teacher_label, `sha ${sha(row.teacher_label)}`);
    ok("reviews_allowed matches the migrated row", Number(r.body?.reviews_allowed) === Number(row.reviews_allowed),
       `allowed ${r.body?.reviews_allowed}, used ${r.body?.reviews_used}, left ${r.body?.reviews_left}`);
    const after = (await q("select count(*)::int as n from public.esa_reviews"))[0].n;
    ok("no review row was created by the check", before === after, `esa_reviews ${before} -> ${after}`);
    ok("quota is computed server-side from rows", Number.isInteger(Number(r.body?.reviews_used)));
  }
}

/* ── 4 · as-studio at its new endpoint ──────────────────────────────────── */
console.log("\n4 · as-studio endpoint");
{
  const res = await fetch(`${FN}/as-studio`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "__smoke__" }),
  });
  const txt = await res.text();
  ok("as-studio answers at the ESA project", res.status > 0 && res.status < 500, `status ${res.status}`);
  ok("answer is the function's own JSON, not an edge error", txt.trim().startsWith("{"), txt.slice(0, 80));
}

/* ── 5 · the DEPLOYED function can use its own ANTHROPIC_API_KEY ─────────── */
//
// The previous version of this check took the `value` from GET /v1/projects/{ref}/secrets and
// sent it to Anthropic as an x-api-key. That value is a SHA-256 DIGEST, not the secret, so the
// check returned 401 no matter what was actually stored - including after a verified good write.
// A secrets-listing digest is never a credential and must never be used as one.
//
// What we actually care about is whether the DEPLOYED edge function can reach the model with the
// secret it holds. as-studio's `audit_text` action is the smallest safe route to that:
//   auditText(assignmentId, mode, text) -> ctxFor() [SELECT only] + runAudits() [audits.ts makes
//   zero database calls]. It returns verdicts and writes nothing. The PATCH calls in engine.ts
//   all live in the transform path, which this does not enter, and its own comment says
//   "No repair cycle".
// So this exercises the real model path with no teacher review, no new row, and no invite used.
console.log("\n5 · deployed function -> Anthropic (via as-studio audit_text, read-only)");
{
  ok("secret present by NAME only (never by value)", names.includes("ANTHROPIC_API_KEY"));

  const before = (await q("select (select count(*) from public.as_assignments) a, (select count(*) from public.as_versions) v"))[0];
  const row = (await q("select access_token from public.as_assignments where contract_confirmed is not null and coalesce(length(assignment_text),0) > 0 order by created_at asc limit 1"))[0];

  if (!row) {
    ok("a confirmed assignment exists to audit against", false, "none with a confirmed contract and inline text");
  } else {
    let r = null;
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${FN}/as-studio`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "audit_text", t: row.access_token, mode: "support",
          text: "Explain in two sentences why the answer changes when the order of the two steps is swapped." }),
      });
      let j = null; try { j = JSON.parse(await res.text()); } catch {}
      r = { status: res.status, body: j };
      if (res.status === 200) break;
      if (i === 0) console.log("  retrying — a newly set secret can take a moment to reach warm instances…");
      await new Promise((t) => setTimeout(t, 8000));
    }

    const pass = ok("deployed as-studio completed a model call", r.status === 200,
      r.status === 200 ? "" : `status ${r.status} ${JSON.stringify(r.body ?? {}).slice(0, 180)}`);
    if (pass) {
      const v = r.body?.verdicts ?? {};
      ok("audit returned all three verdicts", Boolean(v.preservation && v.usefulness && v.adversarial),
        `preservation=${v.preservation} usefulness=${v.usefulness} adversarial=${v.adversarial}`);
    } else if (/api[-_ ]?key|401|authentication/i.test(JSON.stringify(r.body ?? {}))) {
      console.log("  The function reached Anthropic and was rejected — the stored secret is wrong.");
    }

    const after = (await q("select (select count(*) from public.as_assignments) a, (select count(*) from public.as_versions) v"))[0];
    ok("no row was created or changed by the audit", before.a === after.a && before.v === after.v,
      `as_assignments ${before.a}->${after.a}, as_versions ${before.v}->${after.v}`);
  }
}

/* ── 6 · admin gate ─────────────────────────────────────────────────────── */
console.log("\n6 · admin gate");
{
  const bad = await post({ action: "admin", key: "not-the-admin-key-" + randomBytes(8).toString("hex") });
  ok("incorrect admin key rejected with 403", bad.status === 403, `status ${bad.status}, ${bad.body?.error ?? ""}`);
  const none = await post({ action: "admin" });
  ok("missing admin key rejected with 403", none.status === 403, `status ${none.status}`);

  if (!adminKey) {
    console.log("  SKIP  correct admin key accepted — the secret exists but this API cannot read it");
    console.log("        back, and a digest is not a key. Re-run without --no-set-key against a");
    console.log("        project where the key was generated in-process to exercise this path.");
  } else {
    // Function instances may take a moment to see a newly set secret.
    let good = null;
    for (let i = 0; i < 10; i++) {
      good = await post({ action: "admin", key: adminKey });
      if (good.status === 200) break;
      await new Promise((r) => setTimeout(r, 6000));
      if (i === 0) console.log("  waiting for the new secret to reach warm instances…");
    }
    const pass = ok("correct admin key accepted with 200", good.status === 200, `status ${good.status}`);
    if (pass) {
      ok("admin returns the migrated invites", Array.isArray(good.body?.invites) && good.body.invites.length === 5,
         `invites ${good.body?.invites?.length ?? "none"}`);
      ok("admin returns the migrated reviews", Array.isArray(good.body?.reviews) && good.body.reviews.length === 2,
         `reviews ${good.body?.reviews?.length ?? "none"}`);
    } else {
      console.log("  If this stayed 403, the secret is set but instances have not picked it up.");
      console.log("  Re-run with --no-set-key in a few minutes; do NOT redeploy the function for this.");
    }
  }
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED." : `${failures} CHECK(S) FAILED.`}`);
console.log("No teacher review was created. No invite token, admin key or API key was printed.");
process.exit(failures === 0 ? 0 : 1);
