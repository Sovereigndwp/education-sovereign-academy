#!/usr/bin/env node
// Experiment A — runner.
//
//   node run.mjs --emit                 write every prompt to runs/<stamp>/prompts/ and a manifest
//   node run.mjs --live                 call the Anthropic API directly (needs ANTHROPIC_API_KEY)
//   node run.mjs --score runs/<stamp>   derive verdicts from runs/<stamp>/replies/*.json and score
//
// --live is the reproduction path and is what the owner should run to confirm any result here. It calls
// the API directly rather than through the deployed as-studio endpoint ON PURPOSE: this experiment must
// not deploy anything to the frozen v24 function or write a row to as_assignments / as_versions.
//
// The scorer is the same code in both paths. Only the transport differs.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { reconstructionSystem, reconstructionUser, judgmentSystem, judgmentUser, EXPERIMENT_VERSION } from "./lib/prompts.mjs";
import { deriveCase, scoreCase, extractJson, VERDICTS } from "./lib/derive.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const AS = join(here, "..", "..");                       // assignment-studio/
const CASES = JSON.parse(readFileSync(join(here, "cases", "cases.json"), "utf8"));
const CLAIMS = JSON.parse(readFileSync(join(here, "groundtruth", "claims.json"), "utf8"));
const EXPECTED = JSON.parse(readFileSync(join(here, "groundtruth", "expected.json"), "utf8")).cases;
const MODEL = process.env.EXP_MODEL || "claude-sonnet-4-5";

const args = process.argv.slice(2);
const mode = args.includes("--score") ? "score" : args.includes("--live") ? "live" : "emit";

function claimsFor(c) {
  const all = CLAIMS[c.claims];
  return c.claims_subset ? all.filter((x) => c.claims_subset.includes(x.id)) : all;
}
function textFor(c) { return readFileSync(join(AS, c.source), "utf8"); }

/** Every prompt this experiment sends, named. One place, so --emit and --live cannot drift apart. */
function buildJobs() {
  const jobs = [];
  for (const c of CASES.cases) {
    const runs = CASES.stability.case_id === c.id ? CASES.stability.runs : 1;
    for (let r = 1; r <= runs; r++) {
      jobs.push({
        kind: "judgment",
        name: runs > 1 ? `${c.id}__run${r}` : c.id,
        case_id: c.id,
        system: judgmentSystem(),
        user: judgmentUser({
          subject: c.subject, grade: c.grade, assessment: textFor(c),
          conditions: { ...c.conditions, novelty_note: [c.conditions.novelty_note, c.teacher_note].filter(Boolean).join(" ") },
          claims: claimsFor(c),
        }),
      });
    }
  }
  for (const id of CASES.reconstruction_cases) {
    const c = CASES.cases.find((x) => x.id === id);
    jobs.push({
      kind: "reconstruction",
      name: `RECON__${c.text_id}`,
      case_id: c.id,
      system: reconstructionSystem(),
      user: reconstructionUser({ subject: c.subject, grade: c.grade, assessment: textFor(c), teacher_note: c.teacher_note }),
    });
  }
  return jobs;
}

function stampDir() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const out = join(here, "runs", stamp);
  mkdirSync(join(out, "prompts"), { recursive: true });
  mkdirSync(join(out, "replies"), { recursive: true });
  return out;
}

async function callModel(system, user) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set. --live needs it; use --emit otherwise.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    // temperature 0.2 matches engine.ts callModel, so a --live run is comparable to the product path.
    body: JSON.stringify({ model: MODEL, max_tokens: 8000, temperature: 0.2, system, messages: [{ role: "user", content: user }] }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return (body.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

// ── emit / live ──────────────────────────────────────────────────────────────
if (mode === "emit" || mode === "live") {
  const out = stampDir();
  const jobs = buildJobs();
  const manifest = { experiment: EXPERIMENT_VERSION, mode, model: mode === "live" ? MODEL : "(external)", at: new Date().toISOString(), jobs: [] };
  for (const j of jobs) {
    writeFileSync(join(out, "prompts", `${j.name}.system.txt`), j.system);
    writeFileSync(join(out, "prompts", `${j.name}.user.txt`), j.user);
    manifest.jobs.push({ name: j.name, kind: j.kind, case_id: j.case_id });
    if (mode === "live") {
      process.stdout.write(`· ${j.name} … `);
      try {
        const text = await callModel(j.system, j.user);
        writeFileSync(join(out, "replies", `${j.name}.json`), JSON.stringify(extractJson(text), null, 1));
        console.log("ok");
      } catch (e) { console.log("FAILED:", e.message); writeFileSync(join(out, "replies", `${j.name}.error.txt`), String(e.message)); }
    }
  }
  writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1));
  console.log(`\n${jobs.length} jobs · ${out}`);
  if (mode === "emit") console.log("Prompts written. Put one JSON reply per job in replies/<name>.json, then: node run.mjs --score " + out);
}

// ── score ────────────────────────────────────────────────────────────────────
if (mode === "score") {
  const dir = args[args.indexOf("--score") + 1];
  if (!dir || !existsSync(dir)) { console.error("usage: node run.mjs --score runs/<stamp>"); process.exit(1); }
  const replies = readdirSync(join(dir, "replies")).filter((f) => f.endsWith(".json"));
  const results = { experiment: EXPERIMENT_VERSION, at: new Date().toISOString(), cases: {}, reconstruction: {}, missing: [] };

  for (const c of CASES.cases) {
    const runs = CASES.stability.case_id === c.id ? CASES.stability.runs : 1;
    const names = runs > 1 ? Array.from({ length: runs }, (_, i) => `${c.id}__run${i + 1}`) : [c.id];
    const truth = EXPECTED[c.id];
    const perRun = [];
    for (const n of names) {
      if (!replies.includes(`${n}.json`)) { results.missing.push(n); continue; }
      const raw = JSON.parse(readFileSync(join(dir, "replies", `${n}.json`), "utf8"));
      const derived = deriveCase(raw, c.conditions);
      perRun.push({ run: n, derived, score: scoreCase(derived, truth) });
    }
    if (!perRun.length) continue;
    const primary = perRun[0];
    const stable = perRun.length > 1
      ? perRun.every((r) => JSON.stringify(r.derived.claims.map((x) => [x.claim_id, x.verdict, !!x.proposed])) ===
                            JSON.stringify(primary.derived.claims.map((x) => [x.claim_id, x.verdict, !!x.proposed])))
      : null;
    results.cases[c.id] = {
      cell: c.cell, supervision: c.conditions.supervision, runs: perRun.length, stable,
      claims: primary.derived.claims.map((x) => ({
        claim_id: x.claim_id, verdict: x.verdict, intervention: !!x.proposed,
        intervention_warranted: x.intervention_warranted, primitive: x.proposed?.primitive || null,
        negative_scope_count: x.does_not_support.length, delegation: x.delegation.answer,
        violations: x.violations.map((v) => v.code),
      })),
      score: primary.score,
      violations: primary.derived.violations,
      over_verified_note: primary.derived.claims.map((x) => x.over_verified_note).filter(Boolean),
      control: truth.control || null,
      all_runs: perRun.map((r) => ({ run: r.run, verdicts: r.derived.claims.map((x) => `${x.claim_id}:${x.verdict}${x.proposed ? "+fix" : ""}`) })),
    };
  }

  for (const name of replies.filter((f) => f.startsWith("RECON__"))) {
    const textId = name.replace("RECON__", "").replace(".json", "");
    const raw = JSON.parse(readFileSync(join(dir, "replies", name), "utf8"));
    const owner = CLAIMS[textId] || [];
    results.reconstruction[textId] = {
      owner_claim_count: owner.length,
      a: (raw.reading_a?.claims || []).map((c) => c.statement),
      b: (raw.reading_b?.claims || []).map((c) => c.statement),
      material_difference: raw.material_difference || "",
      left_out_question: raw.left_out_question || "",
      preferred: raw.preferred || "",
      preferred_reason: raw.preferred_reason || "",
      readings_materially_different: null,
      owner_claims_matched: null,
      _scoring_note: "Left null on purpose. Whether a reading matches the owner's intent is a judgment about meaning, and the experiment must not mark its own reconstruction homework. Filled in by the owner, or by a reader who is not the model that produced it.",
    };
  }

  // ── falsification criteria, computed ──────────────────────────────────────
  const sound = Object.entries(results.cases).filter(([, v]) => v.cell === "sound / supervised");
  const soundKeep = sound.filter(([, v]) => v.claims.every((c) => c.verdict === "KEEP" || (c.verdict === "LIMITED" && !c.intervention)));
  const manufactured = sound.flatMap(([id, v]) => v.score.manufactured.map((c) => `${id}/${c}`));
  const p4 = results.cases["P4-g10ss-scoped-out"];
  const falsePosP4 = p4 ? (p4.score.unexpected_claims || []).length : null;
  const planted = Object.entries(results.cases).filter(([, v]) => String(v.cell).startsWith("planted gap"));
  const plantedFound = planted.flatMap(([id, v]) => v.score.rows.filter((r) => r.expects_intervention && r.got_intervention).map((r) => `${id}/${r.claim_id}`));
  const plantedTotal = planted.flatMap(([id, v]) => v.score.rows.filter((r) => r.expects_intervention).map((r) => `${id}/${r.claim_id}`));
  const pairs = CASES.cases.filter((c) => c.pair_with).map((c) => {
    const a = results.cases[c.pair_with], b = results.cases[c.id];
    if (!a || !b) return { pair: c.id, comparable: false };
    const changed = a.claims.filter((x) => {
      const y = b.claims.find((z) => z.claim_id === x.claim_id);
      return y && y.verdict !== x.verdict;
    }).length;
    const wrongWay = a.claims.filter((x) => {
      const y = b.claims.find((z) => z.claim_id === x.claim_id);
      if (!y) return false;
      return VERDICTS.indexOf(y.verdict) < VERDICTS.indexOf(x.verdict); // unsupervised judged stronger
    }).length;
    return { pair: `${c.pair_with} → ${c.id}`, of: a.claims.length, changed, wrong_direction: wrongWay };
  });
  const v1 = results.cases["V1-g5-over-verified"];
  const stability = Object.values(results.cases).filter((v) => v.stable !== null);

  results.falsification = {
    F1_manufactures_problems: { manufactured_in_sound_cases: manufactured, sound_cases_clean: `${soundKeep.length} of ${sound.length}`, threshold: "kill if fewer than 8 of 10 sound claims-sets come back with no manufactured intervention", },
    F2_context_matters: { pairs, threshold: "kill if a pair shows 0 changed verdicts, or any wrong_direction > 0" },
    F3_discrimination: { planted_found: plantedFound, planted_total: plantedTotal, false_positive_P4_unexpected_claims: falsePosP4, threshold: "kill if fewer than 3 of 4 planted gaps found, or more than 2 manufactured gaps across the sound cases" },
    F4_minimality: { over_verified_interventions: v1 ? v1.claims.filter((c) => c.intervention).length : null, over_verified_note_given: v1 ? v1.over_verified_note.length > 0 : null, menu_violations: Object.values(results.cases).flatMap((v) => v.violations.filter((x) => x.code === "MENU_NOT_MOVE")).length, feed_forward_violations: Object.values(results.cases).flatMap((v) => v.violations.filter((x) => x.code === "FEED_FORWARD")).length, threshold: "kill if any intervention is proposed on the over-verified case, or median proposals per gap exceeds one" },
    F5_reconstruction: { status: "not scored automatically — see reconstruction._scoring_note" },
    F6_stability: { cases_with_repeats: stability.length, stable: stability.filter((v) => v.stable).length, threshold: "hold to the baseline's bar: identical verdicts across repeats" },
    all_violations_by_code: Object.values(results.cases).flatMap((v) => v.violations).reduce((a, x) => { a[x.code] = (a[x.code] || 0) + 1; return a; }, {}),
  };

  writeFileSync(join(dir, "results.json"), JSON.stringify(results, null, 1));
  console.log(JSON.stringify(results.falsification, null, 1));
  console.log(`\nresults → ${join(dir, "results.json")}`);
  if (results.missing.length) console.log(`MISSING replies: ${results.missing.join(", ")}`);
}
