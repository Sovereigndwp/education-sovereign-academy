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
  console.log("  ESA_ADMIN_KEY already exists on this project — NOT overwriting.");
  adminKey = had.value;
  ok("secret exists", true, `len ${String(adminKey.length)}, sha ${sha(adminKey)}`);
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

/* ── 5 · model access with the migrated ANTHROPIC_API_KEY ───────────────── */
console.log("\n5 · model access (migrated ANTHROPIC_API_KEY)");
{
  const s = secrets.find((x) => x.name === "ANTHROPIC_API_KEY");
  if (!s) ok("ANTHROPIC_API_KEY readable", false);
  else {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": s.value, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-3-5-haiku-20241022", max_tokens: 4, messages: [{ role: "user", content: "hi" }] }),
    });
    const j = await res.json().catch(() => ({}));
    ok("Anthropic accepts the migrated key", res.status === 200, `status ${res.status}${res.status !== 200 ? " " + JSON.stringify(j).slice(0, 160) : ""}`);
    if (res.status === 200) console.log(`  model replied (${j?.usage?.output_tokens ?? "?"} output tokens) — key is live`);
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
    ok("correct admin key accepted", false, "no key available to test with");
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
