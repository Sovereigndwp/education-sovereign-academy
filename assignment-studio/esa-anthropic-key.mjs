#!/usr/bin/env node
// Diagnose and repair the ANTHROPIC_API_KEY used by the Assignment Studio / ESA edge functions.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-anthropic-key.mjs            diagnose only
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-anthropic-key.mjs --set-from-local   set from .env.local (preferred)
//   SUPABASE_ACCESS_TOKEN=sbp_... node assignment-studio/esa-anthropic-key.mjs --set              set from a hidden prompt
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
const SET_FROM_LOCAL = process.argv.includes("--set-from-local");

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

/** Does this string even look like an Anthropic key, or is it a digest the API handed back? */
function shape(v) {
  const digest = /^[0-9a-f]{64}$/.test(v);
  return { len: v.length, digest, skant: /^sk-ant-/.test(v),
    note: digest ? "64-char hex — this is a DIGEST, not a key" : /^sk-ant-/.test(v) ? "sk-ant- prefixed" : "unrecognised shape" };
}

/**
 * Probe a credential without assuming any model id.
 *
 * GET /v1/models authenticates, needs no model name and costs nothing, so it separates a bad
 * credential from a bad model id. Only then do we spend one token on a model the account can
 * actually see. A hardcoded model is exactly how the first probe produced a misleading 404:
 * claude-3-5-haiku-20241022 no longer exists on this account.
 */
async function probe(key) {
  const m = await fetch("https://api.anthropic.com/v1/models?limit=60", {
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
  });
  if (m.status !== 200) {
    let j = {}; try { j = await m.json(); } catch {}
    return { kind: m.status === 401 ? "INVALID CREDENTIAL (401)" : `models endpoint HTTP ${m.status}`,
      status: m.status, model: null, msg: String(j?.error?.message ?? "").slice(0, 140) };
  }
  const ids = ((await m.json()).data || []).map((x) => x.id);
  const pick = ids.find((i) => /haiku/i.test(i)) || ids[ids.length - 1];
  if (!pick) return { kind: "AUTHENTICATED, but the account can see no models", status: 200, model: null, msg: "" };

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: pick, max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
  });
  let j = {}; try { j = await r.json(); } catch {}
  const msg = String(j?.error?.message ?? "").slice(0, 140);
  const kind = r.status === 200 ? "VALID + SUFFICIENT CREDIT"
    : /credit balance/i.test(msg) ? "VALID CREDENTIAL, INSUFFICIENT CREDIT"
    : `AUTHENTICATED, request HTTP ${r.status}`;
  return { kind, status: r.status, model: pick, msg, models: ids.length };
}

console.log("ANTHROPIC_API_KEY — diagnosis\n");

const esaKey = await secretOf(ESA, "ANTHROPIC_API_KEY");
const bsaKey = await secretOf(BSA, "ANTHROPIC_API_KEY");
console.log(`  ESA  ${ESA}   ${fp(esaKey)}${esaKey ? "  " + shape(esaKey).note : ""}`);
console.log(`  BSA  ${BSA}   ${fp(bsaKey)}${bsaKey ? "  " + shape(bsaKey).note : ""}`);
const same = Boolean(esaKey && bsaKey && esaKey === bsaKey);
console.log(`\n  migration fidelity: ${same ? "IDENTICAL — the copy is faithful, so any fault is in the source credential itself"
  : esaKey && bsaKey ? "DIFFERENT — the two projects hold different keys" : "cannot compare (one is absent)"}`);

// A third candidate: the key checked into the BSA repo's gitignored .env.local, if any.
const envPath = join(homedir(), "projects", "bitcoin-sovereign-academy", ".env.local");

/**
 * Read one variable out of a .env file without mangling the value.
 *
 * Strips ONLY the env-file representation: an optional `export `, whitespace around the `=`,
 * a matched pair of surrounding quotes, and trailing whitespace. For an unquoted value it also
 * drops a trailing ` #` comment, which cannot occur inside an Anthropic key. The credential
 * itself is never altered - no case change, no unescaping, no character substitution.
 */
function readEnvVar(file, name) {
  if (!existsSync(file)) return null;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.replace(/^\s*export\s+/, "");
    const eq = line.indexOf("=");
    if (eq < 0 || line.slice(0, eq).trim() !== name) continue;
    let v = line.slice(eq + 1).trim();
    const q = v[0];
    if ((q === '"' || q === "'") && v.length > 1 && v[v.length - 1] === q) v = v.slice(1, -1);
    else v = v.split(/\s+#/)[0].trim();
    return v;
  }
  return null;
}

const envKey = readEnvVar(envPath, "ANTHROPIC_API_KEY");
if (envKey) console.log(`  local .env.local              ${fp(envKey)}  ${shape(envKey).note}`);

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
  console.log(`  ${label.padEnd(18)} ${result.kind}${result.model ? `  [model ${result.model}]` : ""}${result.msg ? `  — ${result.msg}` : ""}`);
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

/* ── --set-from-local: take the already-validated key straight from .env.local ──
 *
 * The interactive paste path produced a 111-character value where the file holds 108, so the
 * terminal added three characters somewhere between the clipboard and the process. Reading the
 * file removes that entire class of failure: no clipboard, no terminal, no raw mode, no retyping.
 */
if (SET_FROM_LOCAL) {
  console.log("\n--set-from-local");
  if (!envKey) { console.error(`  FAIL  no ANTHROPIC_API_KEY found in ${envPath}`); process.exit(1); }

  const sh = shape(envKey);
  console.log(`  parsed from ${envPath}`);
  console.log(`         ${fp(envKey)}  ${sh.note}`);

  const EXPECT_LEN = 108, EXPECT_SHA = "e1afa2901f6cdab7";
  const lenOK = sh.len === EXPECT_LEN, shaOK = sha(envKey) === EXPECT_SHA, formOK = sh.skant && !sh.digest;
  console.log(`  ${lenOK  ? "PASS" : "FAIL"}  length is ${EXPECT_LEN}${lenOK ? "" : ` (got ${sh.len})`}`);
  console.log(`  ${shaOK  ? "PASS" : "FAIL"}  sha256 prefix is ${EXPECT_SHA}${shaOK ? "" : ` (got ${sha(envKey)})`}`);
  console.log(`  ${formOK ? "PASS" : "FAIL"}  sk-ant- shape, not a digest`);
  if (!(lenOK && shaOK && formOK)) {
    console.error("\n  REFUSING to write: this is not the candidate that was validated. Nothing changed.");
    process.exit(1);
  }

  console.log("\n  re-validating against the live API before writing…");
  const v = await probe(envKey);
  console.log(`  ${v.kind}${v.model ? `  [model ${v.model}]` : ""}${v.msg ? `  — ${v.msg}` : ""}`);
  if (v.status !== 200) {
    console.error("  REFUSING to write: the key did not complete a minimal request. Nothing changed.");
    process.exit(1);
  }

  await api(`/v1/projects/${ESA}/secrets`, { method: "POST", body: JSON.stringify([{ name: "ANTHROPIC_API_KEY", value: envKey }]) });

  // Verify WITHOUT reading the secret back: GET /secrets returns a digest, so compare that
  // digest to sha256(local key). Matching proves the stored bytes are the bytes we sent.
  const digest = (await api(`/v1/projects/${ESA}/secrets`)).find((x) => x.name === "ANTHROPIC_API_KEY")?.value ?? "";
  const expected = createHash("sha256").update(envKey, "utf8").digest("hex");
  const match = digest.toLowerCase() === expected.toLowerCase();
  console.log(`\n  stored on ${ESA}`);
  console.log(`  ${match ? "PASS" : "FAIL"}  Supabase digest === sha256(local key)   digest ${digest.slice(0, 16)}…  expected ${expected.slice(0, 16)}…`);
  if (!match) {
    console.log("  (a mismatch here can also mean Supabase digests differently than plain sha256 —");
    console.log("   check the length and prefix above before assuming the write was wrong)");
  }
  console.log(`\n  ${match ? "PASS" : "CHECK"}  ANTHROPIC_API_KEY set on ESA — len ${sh.len}, sha256 ${sha(envKey)}`);
  console.log("  BSA was not modified.");
  console.log("\nNext:  node assignment-studio/esa-backend-smoke.mjs --no-set-key");
  process.exit(match ? 0 : 1);
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
