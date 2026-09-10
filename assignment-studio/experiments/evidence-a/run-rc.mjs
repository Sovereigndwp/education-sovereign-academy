#!/usr/bin/env node
// ESA release check — the two-stage architecture, run against what H1 already taught us.
//
// This is NOT a new pre-registered study. It is a product safety check with four groups, all of them
// cases whose right answer is already on record:
//   A  the four H1 false positives            expect: KEEP, no gap
//   B  the four genuine tier-1 opportunities  expect: gap found by Stage A, modify_item still reachable
//   C  the nine conditions-gap claims          expect: gap found, and NO modify_item
//   D  the Grade 5 split case                  expect: the A4 distinction preserved
//   (V1, the over-verified fixture, is run as an observation. It is not a release criterion.)
//
//   node run-rc.mjs --emit-a                 write Stage A prompts + manifest
//   node run-rc.mjs --emit-b <dir>           freeze Stage A replies, find gaps, write Stage B prompts
//   node run-rc.mjs --score  <dir>           merge, derive, score the four groups
//
// Stage A and Stage B are separate calls with separate system prompts. Every Stage A prompt is scanned
// for remedy vocabulary before it is written; a hit throws and nothing is emitted.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  diagnosisSystem, diagnosisUser, remedySystem, remedyUser,
  assertNoRemedyLeak, freezeDiagnosis, mergeRemedy, isGap, sha256, canonical,
  ESA_ARCH_VERSION,
} from "./lib/stages.mjs";
import { deriveClaim, extractJson } from "./lib/derive.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const AS = join(here, "..", "..");
const args = process.argv.slice(2);
const RC = join(here, "rc-runs");

// The release-check case set: the frozen default cases plus the A4 split case. Neither file is edited.
const MAIN = JSON.parse(readFileSync(join(here, "cases", "cases.json"), "utf8"));
const SPLIT = JSON.parse(readFileSync(join(here, "cases", "cases-a4.json"), "utf8"));
const CLAIMS_MAIN = JSON.parse(readFileSync(join(here, "groundtruth", "claims.json"), "utf8"));
const CLAIMS_SPLIT = JSON.parse(readFileSync(join(here, "groundtruth", "claims-a4.json"), "utf8"));

const GROUPS = JSON.parse(readFileSync(join(here, "groundtruth", "rc-groups.json"), "utf8"));
const WANTED = new Set(GROUPS.cases);

function allCases() {
  const out = [];
  for (const c of MAIN.cases) if (WANTED.has(c.id)) out.push({ ...c, _claims: CLAIMS_MAIN });
  for (const c of SPLIT.cases) if (WANTED.has(c.id)) out.push({ ...c, _claims: CLAIMS_SPLIT });
  return out;
}
function claimsFor(c) {
  const all = c._claims[c.claims];
  return c.claims_subset ? all.filter((x) => c.claims_subset.includes(x.id)) : all;
}
const textFor = (c) => readFileSync(join(AS, c.source), "utf8");
const stamp = () => new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "-").replace(/-(\d\d)-(\d\d)$/, "-$1-$2");

/* ── Stage A ─────────────────────────────────────────────────────────────── */
if (args.includes("--emit-a")) {
  const dir = join(RC, stamp());
  mkdirSync(join(dir, "prompts", "stageA"), { recursive: true });
  mkdirSync(join(dir, "replies", "stageA"), { recursive: true });
  const system = diagnosisSystem();
  const systemHash = assertNoRemedyLeak("stageA.system", system);      // throws on any leak
  const jobs = [];
  for (const c of allCases()) {
    const user = diagnosisUser({
      subject: c.subject, grade: c.grade, assessment: textFor(c),
      conditions: c.conditions, claims: claimsFor(c),
    });
    // Scanned with the teacher's own assessment text and claim statements removed — see assertNoRemedyLeak.
    const userHash = assertNoRemedyLeak(`stageA.user:${c.id}`, user,
      [textFor(c), ...claimsFor(c).map((x) => x.statement)]);          // throws on any leak
    writeFileSync(join(dir, "prompts", "stageA", `${c.id}.system.txt`), system);
    writeFileSync(join(dir, "prompts", "stageA", `${c.id}.user.txt`), user);
    jobs.push({ case_id: c.id, user_sha256: userHash, claims: claimsFor(c).map((x) => x.id) });
  }
  writeFileSync(join(dir, "manifest.json"), JSON.stringify({
    architecture: ESA_ARCH_VERSION, at: new Date().toISOString(),
    stage_a: { system_sha256: systemHash, system_bytes: system.length, leak_check: "PASSED — no remedy vocabulary in the Stage A system prompt or in any Stage A user prompt", jobs },
  }, null, 2));
  console.log(`Stage A: ${jobs.length} prompts → ${dir}`);
  console.log(`leak check passed on 1 system prompt and ${jobs.length} user prompts`);
  process.exit(0);
}

/* ── Stage B ─────────────────────────────────────────────────────────────── */
if (args.includes("--emit-b")) {
  const dir = args.find((a) => !a.startsWith("--"));
  mkdirSync(join(dir, "prompts", "stageB"), { recursive: true });
  mkdirSync(join(dir, "replies", "stageB"), { recursive: true });
  const system = remedySystem();
  const frozen = {};
  const gaps = [];
  for (const c of allCases()) {
    const p = join(dir, "replies", "stageA", `${c.id}.json`);
    if (!existsSync(p)) { console.log(`  (no Stage A reply yet: ${c.id})`); continue; }
    const raw = extractJson(readFileSync(p, "utf8"));
    frozen[c.id] = {};
    for (const cl of raw.claims || []) {
      const { diagnosis, diagnosis_hash } = freezeDiagnosis(cl);
      frozen[c.id][cl.claim_id] = { diagnosis, diagnosis_hash };
      if (!isGap(diagnosis)) continue;
      const claim = claimsFor(c).find((x) => x.id === cl.claim_id);
      if (!claim) continue;
      const user = remedyUser({
        subject: c.subject, grade: c.grade, assessment: textFor(c),
        conditions: c.conditions, claim, diagnosis, diagnosis_hash,
      });
      const name = `${c.id}__${cl.claim_id}`;
      writeFileSync(join(dir, "prompts", "stageB", `${name}.system.txt`), system);
      writeFileSync(join(dir, "prompts", "stageB", `${name}.user.txt`), user);
      gaps.push({ name, case_id: c.id, claim_id: cl.claim_id, diagnosis_hash });
    }
  }
  writeFileSync(join(dir, "frozen-diagnoses.json"), JSON.stringify(frozen, null, 2));
  const man = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
  man.stage_b = { system_bytes: system.length, ran_for: gaps, note: "Stage B runs ONLY for a claim Stage A recorded as a gap, and receives only that claim." };
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(man, null, 2));
  console.log(`Stage B: ${gaps.length} gap claims → ${dir}/prompts/stageB`);
  for (const g of gaps) console.log(`  ${g.name}`);
  process.exit(0);
}

/* ── Score ───────────────────────────────────────────────────────────────── */
if (args.includes("--score")) {
  const dir = args.find((a) => !a.startsWith("--"));
  const frozen = JSON.parse(readFileSync(join(dir, "frozen-diagnoses.json"), "utf8"));
  const out = { architecture: ESA_ARCH_VERSION, at: new Date().toISOString(), cases: {}, arch_violations: [] };

  for (const c of allCases()) {
    if (!frozen[c.id]) continue;
    const rows = [];
    for (const [claimId, rec] of Object.entries(frozen[c.id])) {
      const gap = isGap(rec.diagnosis);
      let merged = { ...rec.diagnosis };
      let vio = [];
      if (gap) {
        const p = join(dir, "replies", "stageB", `${c.id}__${claimId}.json`);
        if (existsSync(p)) {
          const remedyRaw = extractJson(readFileSync(p, "utf8"));
          const r = mergeRemedy({ claimRecord: rec.diagnosis, diagnosis_hash: rec.diagnosis_hash, remedyRaw });
          merged = r.merged; vio = r.violations;
          for (const v of vio) out.arch_violations.push({ case_id: c.id, claim_id: claimId, ...v });
        }
      }
      // derive.mjs is used UNCHANGED. Two field names differ between the one-stage and two-stage
      // records, so they are aliased here rather than by editing the checker.
      const forDerive = {
        ...merged,
        why_no_intervention: merged.why_no_gap ?? merged.why_no_intervention ?? "",
        no_short_check_reason: (merged.stage_b || {}).no_short_check_reason ?? "",
      };
      const d = deriveClaim(forDerive, c.conditions);
      rows.push({
        claim_id: claimId,
        stage_a_gap: gap,
        verdict: d.verdict,
        components: (rec.diagnosis.gate1_components || {}).components?.length ?? 0,
        carried: (rec.diagnosis.gate1_components || {}).carried_forward || "",
        tier: (merged.stage_b || {}).tier ?? null,
        modify_item_ref: ((merged.stage_b || {}).modify || {}).item_ref ?? null,
        diagnosis_hash: rec.diagnosis_hash,
        derive_violations: d.violations,
      });
    }
    out.cases[c.id] = { conditions: c.conditions.supervision, rows };
  }
  writeFileSync(join(dir, "rc-results.json"), JSON.stringify(out, null, 2));
  for (const [cid, v] of Object.entries(out.cases)) {
    console.log(`\n${cid}  [${v.conditions}]`);
    for (const r of v.rows) {
      console.log(`  ${r.claim_id.padEnd(10)} ${String(r.verdict).padEnd(14)} gap=${String(r.stage_a_gap).padEnd(5)} tier=${String(r.tier).padEnd(18)} comps=${r.components}${r.modify_item_ref ? `  item ${r.modify_item_ref}` : ""}`);
    }
  }
  console.log(`\narchitecture violations: ${out.arch_violations.length}`);
  for (const v of out.arch_violations) console.log(`  ${v.case_id}/${v.claim_id} ${v.code}: ${v.detail}`);
  process.exit(0);
}
console.log("usage: run-rc.mjs --emit-a | --emit-b <dir> | --score <dir>");
