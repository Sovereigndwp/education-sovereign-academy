#!/usr/bin/env node
// Diagnose and repair the ANTHROPIC_API_KEY used by the Assignment Studio / ESA edge functions.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-anthropic-key.mjs            diagnose only
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-anthropic-key.mjs --set      diagnose, then set a new key
//
// --set prompts for the key on stdin with echo DISABLED. The value therefore never reaches your
// shell history, never appears on a command line, never lands in a file, and is never printed.
// It is validated against the live Anthropic API BEFORE anything is written, so a bad paste
// cannot replace a working secret.
//
// Nothing here writes to BSA. The BSA key is read only to compare hashes and test validity.

import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ESA = process.env.ESA_PROJECT_REF || "svrbfpjoufhhxdshwlvt";
const BSA = process.env.BSA_PROJECT_REF || "rdqwoqdvqpedlsbaghtr";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DO_SET = process.argv.includes("--set");

if (!TOKEN) { console.error("SUPABASE_ACCESS_TOKEN is not set."); process.exit(2); }

const sha = (s) => createHash("sha256").update(String(s), "utf8").digest("hex").slice(0, 16);
const fp = (v) => (v ? `len ${String(v.length).padStart(3)}  sha256 ${sha(v)}` : "(absent)");

async function api(path, init = {}) {
  const res = await fetch(`https://api.supabase.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  const t = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status}: ${t.slice(0, 250)}`);
  return t ? JSON.parse(t) : null;
}
const secretOf = async (ref, name) => (await api(`/v1/projects/${ref}/secrets`)).find((s) => s.name === name)?.value ?? null;

/** One 4-token call. Distinguishes 401 invalid key from 400 credit balance from 200 working. */
async function probe(key) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-3-5-haiku-20241022", max_tokens: 4, messages: [{ role: "user", content: "hi" }] }),
  });
  let j = {}; try { j = await res.json(); } catch {}
  const msg = String(j?.error?.message ?? "").slice(0, 120);
  const kind = res.status === 200 ? "WORKING"
    : res.status === 401 ? "INVALID KEY (401)"
    : /credit balance/i.test(msg) ? "VALID KEY, NO CREDIT (400)"
    : `HTTP ${res.status}`;
  return { status: res.status, kind, msg };
}

console.log("ANTHROPIC_API_KEY — diagnosis\n");

const esaKey = await secretOf(ESA, "ANTHROPIC_API_KEY");
const bsaKey = await secretOf(BSA, "ANTHROPIC_API_KEY");
console.log(`  ESA  ${ESA}   ${fp(esaKey)}`);
console.log(`  BSA  ${BSA}   ${fp(bsaKey)}`);
const same = Boolean(esaKey && bsaKey && esaKey === bsaKey);
console.log(`\n  migration fidelity: ${same ? "IDENTICAL — the copy is faithful, so any fault is in the source credential itself"
  : esaKey && bsaKey ? "DIFFERENT — the two projects hold different keys" : "cannot compare (one is absent)"}`);

// A third candidate: the key checked into the BSA repo's gitignored .env.local, if any.
const envPath = join(homedir(), "projects", "bitcoin-sovereign-academy", ".env.local");
let envKey = null;
if (existsSync(envPath)) {
  const m = readFileSync(envPath, "utf8").match(/^\s*ANTHROPIC_API_KEY\s*=\s*["']?([^"'\s]+)/m);
  if (m) { envKey = m[1]; console.log(`  local .env.local              ${fp(envKey)}`); }
}

console.log("\nlive probe (4 max_tokens, one call per DISTINCT key):");
const probed = new Map();   // key value -> { label, result }
for (const [label, key] of [["ESA secret", esaKey], ["BSA secret", bsaKey], ["repo .env.local", envKey]]) {
  if (!key) { console.log(`  ${label.padEnd(18)} (absent)`); continue; }
  const prior = probed.get(key);
  if (prior) {
    console.log(`  ${label.padEnd(18)} identical to "${prior.label}" — ${prior.result.kind} (not re-probed)`);
    continue;
  }
  const result = await probe(key);
  probed.set(key, { label, result });
  console.log(`  ${label.padEnd(18)} ${result.kind}${result.msg ? `  — ${result.msg}` : ""}`);
}

const workingEntry = [...probed.values()].find((e) => e.result.status === 200);
console.log(workingEntry
  ? `\n  A WORKING key is already available locally: "${workingEntry.label}".`
  : "\n  No key available to this script currently works.");

console.log("\nBSA impact:");
if (same) {
  console.log("  BSA's deployed Assignment Studio uses the SAME key as ESA. If ESA's probe says the key is");
  console.log("  invalid, BSA's AI generation is equally broken right now. BSA has NOT been modified.");
} else {
  console.log("  BSA holds a different key; its status is shown in the probe above. BSA has NOT been modified.");
}

if (!DO_SET) {
  console.log("\nDiagnosis only. To set a new key:  node assignment-studio/esa-anthropic-key.mjs --set");
  process.exit(0);
}

/* ── --set: hidden-input prompt, validate, then write ───────────────────── */
console.log("\nSet a new ANTHROPIC_API_KEY on ESA");
const key = await new Promise((resolve, reject) => {
  if (!process.stdin.isTTY) return reject(new Error("stdin is not a terminal — run this directly in Terminal, not through a pipe."));
  process.stdout.write("  Paste the Anthropic API key (input hidden, then press Return): ");
  process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding("utf8");
  let buf = "";
  const onData = (ch) => {
    if (ch === "\r" || ch === "\n" || ch === "") {
      process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off("data", onData);
      process.stdout.write("\n"); resolve(buf.trim());
    } else if (ch === "") {
      process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); reject(new Error("cancelled"));
    } else if (ch === "") { buf = buf.slice(0, -1); }
    else { buf += ch; }
  };
  process.stdin.on("data", onData);
});

if (!key) { console.error("  Nothing entered. Aborting; the existing secret is untouched."); process.exit(1); }
console.log(`  received: ${fp(key)}`);

console.log("  validating against the live API before writing anything…");
const v = await probe(key);
console.log(`  probe: ${v.kind}${v.msg ? `  — ${v.msg}` : ""}`);
if (v.status !== 200) {
  console.error("  REFUSING to write: that key does not work. The existing secret is untouched.");
  process.exit(1);
}

await api(`/v1/projects/${ESA}/secrets`, { method: "POST", body: JSON.stringify([{ name: "ANTHROPIC_API_KEY", value: key }]) });
const after = await secretOf(ESA, "ANTHROPIC_API_KEY");
console.log(`  written to ${ESA}: ${fp(after)}`);
console.log(`  ${after === key ? "PASS  stored value matches what was validated" : "FAIL  stored value differs from what was validated"}`);
console.log("\nBSA was not touched. Next:");
console.log("  node assignment-studio/esa-backend-smoke.mjs --no-set-key");
process.exit(after === key ? 0 : 1);
