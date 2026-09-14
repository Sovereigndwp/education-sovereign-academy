#!/usr/bin/env node
// Assignment Studio — deploy the as-studio edge function, then prove what is live.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy.mjs           deploy, then verify
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy.mjs --check   verify only, deploy nothing
//
// Why this exists: on 2026-09-08 the repo and the deployment had silently diverged — the uploaded
// source carried an evaluator fix (audit-...-v5) that the running instances were not yet serving,
// and there was no way to answer "which code is live?" without reading audit rows. This script
// bundles _shared/*.ts beside index.ts exactly the way the function expects, deploys, then reads the
// function back and diffs it byte-for-byte against what is on disk.
//
// NOTE ON PROPAGATION: a successful deploy does not mean warm instances are serving it yet. That was
// the trap. --check compares BYTES, which is necessary but not sufficient; the runtime check at the
// bottom is what proves the new code is actually answering requests.

import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SHARED = join(here, "functions", "_shared");
const ENTRY = join(here, "functions", "as-studio", "index.ts");
const PROJECT = process.env.AS_PROJECT_REF || "rdqwoqdvqpedlsbaghtr";
const SLUG = "as-studio";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const checkOnly = process.argv.includes("--check");

if (!TOKEN) {
  console.error("SUPABASE_ACCESS_TOKEN is not set.");
  console.error("Create one at https://supabase.com/dashboard/account/tokens (scope: the TSA org), then:");
  console.error("  SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/deploy.mjs");
  process.exit(2);
}

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex").slice(0, 12);

/** The bundle the function is deployed as: _shared/*.ts flattened beside index.ts, "../_shared/" → "./". */
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
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}

async function deployed() {
  const res = await api(`/v1/projects/${PROJECT}/functions/${SLUG}/body`);
  const form = await res.formData();
  const out = [];
  for (const [, v] of form.entries()) if (typeof v !== "string") out.push({ name: v.name, content: await v.text() });
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function meta() {
  return await (await api(`/v1/projects/${PROJECT}/functions/${SLUG}`)).json();
}

async function deploy(files) {
  const fd = new FormData();
  fd.append("metadata", JSON.stringify({ entrypoint_path: "index.ts", name: SLUG, verify_jwt: false }));
  for (const f of files) fd.append("file", new Blob([f.content], { type: "text/typescript" }), f.name);
  const res = await api(`/v1/projects/${PROJECT}/functions/deploy?slug=${SLUG}`, { method: "POST", body: fd });
  return await res.json();
}

function diff(local, remote) {
  const names = [...new Set([...local, ...remote].map((f) => f.name))].sort();
  const rows = [];
  let clean = true;
  for (const n of names) {
    const l = local.find((f) => f.name === n), r = remote.find((f) => f.name === n);
    const ls = l ? sha(l.content) : "—", rs = r ? sha(r.content) : "—";
    const ok = ls === rs;
    if (!ok) clean = false;
    rows.push(`  ${ok ? "=" : "≠"} ${n.padEnd(14)} repo ${ls}  live ${rs}`);
  }
  return { rows, clean };
}

const local = bundle();
console.log(`as-studio bundle from ${SHARED}:`);
for (const f of local) console.log(`  ${f.name.padEnd(14)} ${String(f.content.length).padStart(6)} bytes  ${sha(f.content)}`);

if (!checkOnly) {
  console.log("\nDeploying…");
  const r = await deploy(local);
  console.log(`  deployed version ${r.version ?? "?"} (id ${r.id ?? "?"})`);
}

const m = await meta();
console.log(`\nFunction ${SLUG}: version ${m.version}, verify_jwt=${m.verify_jwt}, updated ${new Date(m.updated_at).toISOString()}`);
const { rows, clean } = diff(local, await deployed());
console.log("\nrepo vs deployed source:");
rows.forEach((r) => console.log(r));
console.log(clean ? "\nSOURCE MATCHES." : "\nSOURCE DIFFERS — the deployment is not what is in the repo.");

console.log(`
Source parity is not proof the new code is serving: warm instances can keep answering with the
previous bundle for some minutes. To confirm at runtime, run the fixtures and read the reported
audit prompt version — it must be the one in functions/_shared/audits.ts:

  node assignment-studio/harness/run.mjs --fixtures
  grep -h prompt_version assignment-studio/harness/runs/<newest>/*.json | head -1
`);
process.exit(clean ? 0 : 1);
