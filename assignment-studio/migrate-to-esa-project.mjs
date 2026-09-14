#!/usr/bin/env node
// One-time migration: move ESA's data and function secrets from the BSA Supabase project
// into ESA's own project. Copy-only — nothing in BSA is modified or deleted.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/migrate-to-esa-project.mjs --dry-run
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/migrate-to-esa-project.mjs
//
// Why this is a script and not done in the assistant session: esa_invites tokens are credentials
// (they ARE the teacher's login), ast_settings holds an admin token hash, and the function secrets
// are secrets. None of those should pass through a chat transcript. This runs on your machine,
// reads your own token from the environment, and prints only counts and short hashes — never values.
//
// AFTER this succeeds, deploy the two functions against the new project:
//   AS_PROJECT_REF=svrbfpjoufhhxdshwlvt SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy.mjs
//   AS_PROJECT_REF=svrbfpjoufhhxdshwlvt SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy-esa.mjs

import { createHash } from "node:crypto";

const SRC = process.env.SRC_PROJECT_REF || "rdqwoqdvqpedlsbaghtr";   // BSA — read only
const DST = process.env.DST_PROJECT_REF || "svrbfpjoufhhxdshwlvt";   // ESA — written
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DRY = process.argv.includes("--dry-run");

if (!TOKEN) {
  console.error("SUPABASE_ACCESS_TOKEN is not set.");
  console.error("Create one at https://supabase.com/dashboard/account/tokens, then:");
  console.error("  SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/migrate-to-esa-project.mjs --dry-run");
  process.exit(2);
}
if (SRC === DST) { console.error("SRC and DST are the same project. Refusing."); process.exit(2); }

const sha = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 12);

async function api(path, init = {}) {
  const res = await fetch(`https://api.supabase.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}
const q = (ref, query) => api(`/v1/projects/${ref}/database/query`, { method: "POST", body: JSON.stringify({ query }) });

// Dollar-quote a JSON payload safely: pick a tag that does not occur inside it.
function dq(payload) {
  let tag = "mig";
  while (payload.includes(`$${tag}$`)) tag += "x";
  return `$${tag}$${payload}$${tag}$`;
}

// FK order matters: assignments before versions, invites before reviews before feedback.
const REAL = "(pilot_id is null or pilot_id not like 'harness%')";
const TABLES = [
  { name: "ast_settings",    where: "true" },
  { name: "ast_submissions", where: "true" },
  { name: "ast_events",      where: "true" },
  { name: "as_assignments",  where: REAL },
  { name: "as_versions",     where: `assignment_id in (select id from public.as_assignments where ${REAL})` },
  { name: "esa_invites",     where: "true" },
  { name: "esa_reviews",     where: "true" },
  { name: "esa_feedback",    where: "true" },
];

console.log(`source ${SRC}  ->  destination ${DST}${DRY ? "   (DRY RUN — nothing will be written)" : ""}\n`);

// ---- preflight: destination must be empty, or we stop rather than double-insert ----
for (const t of TABLES) {
  const r = await q(DST, `select count(*)::int as n from public.${t.name}`);
  const n = r[0].n;
  if (n > 0) {
    console.error(`REFUSING: ${DST}.${t.name} already holds ${n} rows. This script only runs into an empty destination.`);
    console.error("If a previous run was interrupted, inspect before re-running.");
    process.exit(1);
  }
}
console.log("preflight: all 8 destination tables are empty.\n");

// ---- copy ----
let copied = 0;
for (const t of TABLES) {
  const rows = await q(SRC, `select coalesce(jsonb_agg(x), '[]'::jsonb) as j from public.${t.name} x where ${t.where}`);
  const payload = JSON.stringify(rows[0].j);
  const n = rows[0].j.length;
  if (n === 0) { console.log(`  ${t.name.padEnd(16)} 0 rows`); continue; }
  if (!DRY) {
    await q(DST, `insert into public.${t.name} select * from jsonb_populate_recordset(null::public.${t.name}, ${dq(payload)}::jsonb)`);
  }
  copied += n;
  console.log(`  ${t.name.padEnd(16)} ${String(n).padStart(3)} rows  ${String(payload.length).padStart(7)} bytes  payload ${sha(payload)}`);
}
console.log(`\n${DRY ? "would copy" : "copied"} ${copied} rows.`);

// ---- verify: per-table row count and a content fingerprint computed identically on both sides ----
if (!DRY) {
  console.log("\nverification — fingerprint is md5 over the sorted row set, computed in each database:");
  let allOk = true;
  for (const t of TABLES) {
    const fp = `select count(*)::int as n, coalesce(md5(string_agg(md5(x::text), '' order by md5(x::text))), '-') as fp from public.${t.name} x`;
    const s = (await q(SRC, `${fp.replace("public." + t.name + " x", `(select * from public.${t.name} where ${t.where}) x`)}`))[0];
    const d = (await q(DST, fp))[0];
    const ok = s.n === d.n && s.fp === d.fp;
    if (!ok) allOk = false;
    console.log(`  ${ok ? "OK  " : "FAIL"} ${t.name.padEnd(16)} source ${String(s.n).padStart(3)} ${s.fp.slice(0, 12)}   dest ${String(d.n).padStart(3)} ${d.fp.slice(0, 12)}`);
  }
  console.log(allOk ? "\nDATA MATCHES." : "\nDATA DIFFERS — do not cut the frontend over.");
  if (!allOk) process.exit(1);

  // esa_invites tokens are the credential: prove they survived byte-exact, without printing them.
  const inv = (await q(DST, "select count(*)::int as n, coalesce(md5(string_agg(token, '' order by token)),'-') as h from public.esa_invites"))[0];
  const invSrc = (await q(SRC, "select count(*)::int as n, coalesce(md5(string_agg(token, '' order by token)),'-') as h from public.esa_invites"))[0];
  console.log(`\nesa_invites tokens: ${invSrc.n} source / ${inv.n} dest, hash ${invSrc.h === inv.h ? "IDENTICAL" : "DIFFERENT"} (${inv.h.slice(0, 12)})`);
  if (invSrc.h !== inv.h) process.exit(1);
}

// ---- storage: copy objects bucket-for-bucket, byte-exact ----
// Needs the service-role key of each project. Those are fetched from the Management API at
// runtime using the access token already in hand, used in memory, and never printed.
console.log("\nstorage:");
async function serviceKey(ref) {
  const keys = await api(`/v1/projects/${ref}/api-keys?reveal=true`);
  const k = keys.find((x) => x.name === "service_role" || x.type === "secret");
  if (!k) throw new Error(`no service_role key returned for ${ref}`);
  return k.api_key;
}
const srcKey = await serviceKey(SRC), dstKey = await serviceKey(DST);
const objects = await q(SRC, "select b.id as bucket, o.name, (o.metadata->>'size')::bigint as bytes from storage.objects o join storage.buckets b on b.id = o.bucket_id order by b.id, o.name");
if (!objects.length) console.log("  (no objects in source)");
for (const o of objects) {
  const get = await fetch(`https://${SRC}.supabase.co/storage/v1/object/${o.bucket}/${o.name}`, {
    headers: { apikey: srcKey, Authorization: `Bearer ${srcKey}` },
  });
  if (!get.ok) { console.log(`  FAIL download ${o.bucket}/${o.name} -> ${get.status}`); process.exitCode = 1; continue; }
  const buf = Buffer.from(await get.arrayBuffer());
  const digest = createHash("sha256").update(buf).digest("hex");
  const mime = get.headers.get("content-type") || "application/octet-stream";
  if (DRY) { console.log(`  would copy ${o.bucket}/${o.name}  ${buf.length} bytes  sha256 ${digest.slice(0, 16)}`); continue; }
  const put = await fetch(`https://${DST}.supabase.co/storage/v1/object/${o.bucket}/${o.name}`, {
    method: "POST",
    headers: { apikey: dstKey, Authorization: `Bearer ${dstKey}`, "content-type": mime, "x-upsert": "true" },
    body: buf,
  });
  if (!put.ok) { console.log(`  FAIL upload ${o.bucket}/${o.name} -> ${put.status}: ${(await put.text()).slice(0, 200)}`); process.exitCode = 1; continue; }
  // read it back from the destination and compare bytes
  const back = await fetch(`https://${DST}.supabase.co/storage/v1/object/${o.bucket}/${o.name}`, {
    headers: { apikey: dstKey, Authorization: `Bearer ${dstKey}` },
  });
  const backBuf = Buffer.from(await back.arrayBuffer());
  const backDigest = createHash("sha256").update(backBuf).digest("hex");
  const ok = backBuf.length === buf.length && backDigest === digest;
  if (!ok) process.exitCode = 1;
  console.log(`  ${ok ? "OK  " : "FAIL"} ${o.bucket}/${o.name}  ${buf.length} bytes  sha256 ${digest.slice(0, 16)} ${ok ? "identical" : "MISMATCH"}`);
}

// ---- function secrets: copy from BSA to ESA without ever printing a value ----
console.log("\nfunction secrets:");
const NEEDED = ["ANTHROPIC_API_KEY", "ESA_ADMIN_KEY"];
const srcSecrets = await api(`/v1/projects/${SRC}/secrets`);
const dstSecrets = await api(`/v1/projects/${DST}/secrets`);
const have = new Set(dstSecrets.map((s) => s.name));
const toSet = [];
for (const name of NEEDED) {
  const s = srcSecrets.find((x) => x.name === name);
  if (!s) { console.log(`  ${name.padEnd(20)} NOT FOUND in ${SRC} — set it by hand in the dashboard`); continue; }
  if (have.has(name)) { console.log(`  ${name.padEnd(20)} already set on ${DST} — left alone`); continue; }
  toSet.push({ name, value: s.value });
  console.log(`  ${name.padEnd(20)} will copy (len ${String(s.value.length).padStart(3)}, sha ${sha(s.value)})`);
}
if (toSet.length && !DRY) {
  await api(`/v1/projects/${DST}/secrets`, { method: "POST", body: JSON.stringify(toSet) });
  console.log(`  set ${toSet.length} secret(s) on ${DST}.`);
}

console.log(`\n${DRY ? "Dry run complete — nothing was written." : "Migration complete."}`);
console.log(`Next:
  AS_PROJECT_REF=${DST} SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN node assignment-studio/deploy.mjs
  AS_PROJECT_REF=${DST} SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN node assignment-studio/deploy-esa.mjs`);
