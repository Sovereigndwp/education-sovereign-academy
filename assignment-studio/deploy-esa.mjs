#!/usr/bin/env node
// ESA — deploy the esa-review edge function, then prove what is live.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy-esa.mjs           deploy, then verify
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy-esa.mjs --check   verify only
//
// Same shape as deploy.mjs, and for the same reason: on 2026-09-08 the repo and the deployment had
// silently diverged and there was no way to answer "which code is live?" without reading rows. This
// bundles _shared/*.ts beside index.ts the way the function expects, deploys, reads it back, and
// diffs byte-for-byte against disk.
//
// ORDER MATTERS. Apply sql/2026-09-10-esa-pilot.sql BEFORE deploying — the function writes columns
// this migration creates, and a deploy ahead of the migration fails on the first review.
//
// SECRETS the function needs (Supabase → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY   — already set for as-studio; the same key is used
//   ESA_ADMIN_KEY       — anything long and random; it gates /esa/admin.html and nothing else
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SHARED = join(here, "functions", "_shared");
const ENTRY = join(here, "functions", "esa-review", "index.ts");
const PROJECT = process.env.AS_PROJECT_REF || "rdqwoqdvqpedlsbaghtr";
const SLUG = "esa-review";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const checkOnly = process.argv.includes("--check");

if (!TOKEN) {
  console.error("SUPABASE_ACCESS_TOKEN is not set.");
  console.error("Create one at https://supabase.com/dashboard/account/tokens (scope: the TSA org), then:");
  console.error("  SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy-esa.mjs");
  process.exit(2);
}

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex").slice(0, 12);

/** The bundle: _shared/*.ts flattened beside index.ts, "../_shared/" → "./". */
function bundle() {
  const files = readdirSync(SHARED).filter((f) => f.endsWith(".ts"))
    .map((f) => ({ name: f, content: readFileSync(join(SHARED, f), "utf8") }));
  files.push({ name: "index.ts", content: readFileSync(ENTRY, "utf8").replaceAll("../_shared/", "./") });
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

async function api(path, init = {}) {
  const res = await fetch(`https://api.supabase.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

async function deploy(files) {
  const form = new FormData();
  form.append("metadata", JSON.stringify({
    name: SLUG, entrypoint_path: "index.ts", verify_jwt: false,
  }), );
  for (const f of files) form.append("file", new Blob([f.content], { type: "text/typescript" }), f.name);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT}/functions/deploy?slug=${SLUG}`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: form },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`deploy → ${res.status}: ${text.slice(0, 600)}`);
  return JSON.parse(text);
}

/** Read the deployed body back and compare it to disk, file by file. */
async function verify(files) {
  const live = await api(`/v1/projects/${PROJECT}/functions/${SLUG}/body`, {
    headers: { Accept: "application/json" },
  }).catch(() => null);
  if (!live) { console.log("  (could not read the deployed body back — check by hand in the dashboard)"); return false; }
  const liveMap = new Map((live.files || live).map((f) => [f.name, f.content]));
  let ok = true;
  for (const f of files) {
    const l = liveMap.get(f.name);
    const same = l !== undefined && l === f.content;
    if (!same) ok = false;
    console.log(`  ${same ? "same " : "DIFF "} ${f.name.padEnd(18)} disk ${sha(f.content)}${l === undefined ? "  (missing live)" : `  live ${sha(l)}`}`);
  }
  return ok;
}

const files = bundle();
console.log(`${SLUG} — ${files.length} files, ${files.reduce((n, f) => n + f.content.length, 0)} bytes`);
for (const f of files) console.log(`  ${f.name.padEnd(18)} ${sha(f.content)}`);

if (!checkOnly) {
  console.log("\ndeploying…");
  const r = await deploy(files);
  console.log(`  version ${r.version ?? "?"}  status ${r.status ?? "?"}`);
}

console.log("\nbytes on disk vs bytes live:");
const identical = await verify(files);

// A byte match is necessary, not sufficient — warm instances may still be serving the old code.
// This is the check that proves the new code is actually answering.
console.log("\nruntime check:");
const url = `https://${PROJECT}.supabase.co/functions/v1/${SLUG}`;
try {
  const res = await fetch(url, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "check_invite", invite: "0".repeat(32) }),
  });
  const body = await res.json();
  // A live function answers a bad invite with a clean 403. Anything else means it is not serving yet.
  const alive = res.status === 403 && typeof body.error === "string";
  console.log(`  ${url} → ${res.status} ${alive ? "(serving)" : JSON.stringify(body).slice(0, 200)}`);
  if (!alive) process.exitCode = 1;
} catch (e) {
  console.log(`  unreachable: ${e.message}`);
  process.exitCode = 1;
}

if (!identical) {
  console.log("\nDisk and live differ. Re-run without --check, or look at the dashboard before trusting a review.");
  process.exitCode = 1;
}
