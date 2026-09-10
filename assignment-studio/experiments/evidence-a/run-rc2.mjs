#!/usr/bin/env node
// ESA structural check — the narrowest run that tests the two things we now know are broken.
//
//   A  over-decomposition        S1/G5C3, S2/E1     — every component must be authorised by the claim
//   B  the conditions branch     X1, X2, X3         — coverage sufficient AND conditions limited
//   C  preserve known successes  P2, split, V1      — one coverage gap, the A4 split, no-change
//
// Plus ONE variant: X1 asked again with the teacher needing only "what students can produce with the
// resources available". Same assessment, same conditions, different intended inference. If the
// architecture is right, that changes the answer — which is the whole point of path B.
//
//   node run-rc2.mjs --emit-a | --emit-b <dir> | --score <dir>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assertNoRemedyLeak, freezeDiagnosis, sha256, canonical } from "./lib/stages.mjs";
import {
  diagnosisSystem2, diagnosisUser2, remedySystemCoverage, remedySystemConditions, remedyUser2,
  validateSpans, hasCoverageGap, hasConditionsGap, mergeRemedy2, ESA_ARCH_VERSION_2,
} from "./lib/stages2.mjs";
import { deriveClaim, extractJson } from "./lib/derive.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const AS = join(here, "..", "..");
const args = process.argv.slice(2);
const RC = join(here, "rc2-runs");

const MAIN = JSON.parse(readFileSync(join(here, "cases", "cases.json"), "utf8"));
const SPLIT = JSON.parse(readFileSync(join(here, "cases", "cases-a4.json"), "utf8"));
const CLAIMS_MAIN = JSON.parse(readFileSync(join(here, "groundtruth", "claims.json"), "utf8"));
const CLAIMS_SPLIT = JSON.parse(readFileSync(join(here, "groundtruth", "claims-a4.json"), "utf8"));

const PICK = ["S1-g5-supervised", "S2-g8ela-supervised", "X1-g5-takehome", "X2-g10ss-takehome",
              "X3-calc-takehome", "P2-g5-selected-response", "S1split-g5-supervised", "V1-g5-over-verified"];

// The pilot asks the teacher directly (screen 3). Here it is DERIVED from the declared purpose:
// a summative, individual grade is a claim about the individual, so it needs individual attribution.
// Recorded as derived, not as something the teacher said, because in this corpus she did not say it.
function attribution(c) {
  const needs = c.conditions.purpose === "summative" && c.conditions.collaboration === "individual";
  return { needs, source: `derived for this check from purpose="${c.conditions.purpose}" and collaboration="${c.conditions.collaboration}"; in the pilot the teacher answers this directly` };
}

function allCases() {
  const out = [];
  for (const c of MAIN.cases) if (PICK.includes(c.id)) out.push({ ...c, _claims: CLAIMS_MAIN, _name: c.id });
  for (const c of SPLIT.cases) if (PICK.includes(c.id)) out.push({ ...c, _claims: CLAIMS_SPLIT, _name: c.id });
  // The variant: identical inputs, one different confirmed intention.
  const x1 = MAIN.cases.find((c) => c.id === "X1-g5-takehome");
  out.push({ ...x1, _claims: CLAIMS_MAIN, _name: "X1-g5-takehome__resource-purpose", _attributionOverride: false });
  return out;
}
const claimsFor = (c) => { const all = c._claims[c.claims]; return c.claims_subset ? all.filter((x) => c.claims_subset.includes(x.id)) : all; };
const textFor = (c) => readFileSync(join(AS, c.source), "utf8");
const attrFor = (c) => c._attributionOverride === false
  ? { needs: false, source: "variant: the same assessment and conditions, with the teacher wanting to know what students can produce using available resources" }
  : attribution(c);

if (args.includes("--emit-a")) {
  const dir = join(RC, new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "-"));
  mkdirSync(join(dir, "prompts", "stageA"), { recursive: true });
  mkdirSync(join(dir, "replies", "stageA"), { recursive: true });
  const system = diagnosisSystem2();
  const systemHash = assertNoRemedyLeak("stageA.system", system);
  const jobs = [];
  for (const c of allCases()) {
    const a = attrFor(c);
    const user = diagnosisUser2({
      subject: c.subject, grade: c.grade, assessment: textFor(c), conditions: c.conditions,
      claims: claimsFor(c), needsIndividualAttribution: a.needs, attributionSource: a.source,
    });
    assertNoRemedyLeak(`stageA.user:${c._name}`, user, [textFor(c), ...claimsFor(c).map((x) => x.statement)]);
    writeFileSync(join(dir, "prompts", "stageA", `${c._name}.system.txt`), system);
    writeFileSync(join(dir, "prompts", "stageA", `${c._name}.user.txt`), user);
    jobs.push({ name: c._name, case_id: c.id, needs_individual_attribution: a.needs, claims: claimsFor(c).map((x) => x.id) });
  }
  writeFileSync(join(dir, "manifest.json"), JSON.stringify({ architecture: ESA_ARCH_VERSION_2, at: new Date().toISOString(), stage_a: { system_sha256: systemHash, leak_check: "PASSED", jobs } }, null, 2));
  console.log(`Stage A: ${jobs.length} prompts → ${dir}`);
  console.log(`leak check passed on 1 system prompt and ${jobs.length} user prompts`);
  process.exit(0);
}

if (args.includes("--emit-b")) {
  const dir = args.find((a) => !a.startsWith("--"));
  mkdirSync(join(dir, "prompts", "stageB"), { recursive: true });
  mkdirSync(join(dir, "replies", "stageB"), { recursive: true });
  const sysCov = remedySystemCoverage(), sysCon = remedySystemConditions();
  const frozen = {}, gaps = [];
  for (const c of allCases()) {
    const p = join(dir, "replies", "stageA", `${c._name}.json`);
    if (!existsSync(p)) { console.log(`  (no Stage A reply: ${c._name})`); continue; }
    const raw = extractJson(readFileSync(p, "utf8"));
    frozen[c._name] = {};
    for (const cl of raw.claims || []) {
      const { diagnosis, diagnosis_hash } = freezeDiagnosis(cl);
      frozen[c._name][cl.claim_id] = { diagnosis, diagnosis_hash };
      const cov = hasCoverageGap(diagnosis), con = hasConditionsGap(diagnosis);
      if (!cov && !con) continue;
      // A claim limited on both paths goes to the coverage prompt first: fix what is asked before
      // you reason about who produced it. Only one Stage B call per claim in this check.
      const limitationType = cov ? "coverage" : "conditions";
      const claim = claimsFor(c).find((x) => x.id === cl.claim_id);
      if (!claim) continue;
      const a = attrFor(c);
      const user = remedyUser2({
        subject: c.subject, grade: c.grade, assessment: textFor(c), conditions: c.conditions,
        claim, diagnosis, diagnosis_hash, limitationType, needsIndividualAttribution: a.needs,
      });
      const name = `${c._name}__${cl.claim_id}`;
      writeFileSync(join(dir, "prompts", "stageB", `${name}.system.txt`), limitationType === "coverage" ? sysCov : sysCon);
      writeFileSync(join(dir, "prompts", "stageB", `${name}.user.txt`), user);
      gaps.push({ name, case: c._name, claim_id: cl.claim_id, limitation_type: limitationType });
    }
  }
  writeFileSync(join(dir, "frozen-diagnoses.json"), JSON.stringify(frozen, null, 2));
  console.log(`Stage B: ${gaps.length} limitations`);
  for (const g of gaps) console.log(`  ${g.limitation_type.padEnd(11)} ${g.name}`);
  process.exit(0);
}

if (args.includes("--score")) {
  const dir = args.find((a) => !a.startsWith("--"));
  const frozen = JSON.parse(readFileSync(join(dir, "frozen-diagnoses.json"), "utf8"));
  const out = { architecture: ESA_ARCH_VERSION_2, at: new Date().toISOString(), cases: {}, span_violations: [], arch_violations: [] };
  for (const c of allCases()) {
    if (!frozen[c._name]) continue;
    const rows = [];
    for (const [claimId, rec] of Object.entries(frozen[c._name])) {
      const claim = claimsFor(c).find((x) => x.id === claimId);
      const comps = (rec.diagnosis.coverage || {}).components || [];
      const sv = validateSpans(comps, claim ? claim.statement : "");
      for (const v of sv) out.span_violations.push({ case: c._name, claim_id: claimId, ...v });
      const cov = hasCoverageGap(rec.diagnosis), con = hasConditionsGap(rec.diagnosis);
      const limitationType = cov ? "coverage" : con ? "conditions" : "none";
      let merged = { ...rec.diagnosis }, stageB = null;
      if (limitationType !== "none") {
        const p = join(dir, "replies", "stageB", `${c._name}__${claimId}.json`);
        if (existsSync(p)) {
          const r = mergeRemedy2({ claimRecord: rec.diagnosis, diagnosis_hash: rec.diagnosis_hash, remedyRaw: extractJson(readFileSync(p, "utf8")), limitationType });
          merged = r.merged; stageB = r.merged.stage_b;
          for (const v of r.violations) out.arch_violations.push({ case: c._name, claim_id: claimId, ...v });
        }
      }
      const d = deriveClaim({ ...merged, why_no_intervention: merged.why_no_gap ?? "", no_short_check_reason: (stageB || {}).no_short_check_reason ?? "" }, c.conditions);
      rows.push({
        claim_id: claimId, verdict: d.verdict,
        coverage: (rec.diagnosis.coverage || {}).coverage_status,
        conditions: (rec.diagnosis.conditions_support || {}).status,
        limitation_type: rec.diagnosis.limitation_type,
        routed_as: limitationType,
        components: comps.map((x) => `${x.status[0].toUpperCase()}:${x.component}`),
        stage_b: stageB && { tier: stageB.tier ?? null, assessment_change: stageB.assessment_change ?? null, verification: stageB.verification ?? null, modify_item: (stageB.modify || {}).item_ref ?? null },
        span_violations: sv,
      });
    }
    out.cases[c._name] = { supervision: c.conditions.supervision, needs_attribution: attrFor(c).needs, rows };
  }
  writeFileSync(join(dir, "rc2-results.json"), JSON.stringify(out, null, 2));
  for (const [cid, v] of Object.entries(out.cases)) {
    console.log(`\n${cid}  [${v.supervision}, needs individual attribution: ${v.needs_attribution}]`);
    for (const r of v.rows) {
      const sb = r.stage_b ? `  stageB: ${r.stage_b.tier || r.stage_b.verification}${r.stage_b.modify_item ? ` (item ${r.stage_b.modify_item})` : ""}${r.stage_b.assessment_change ? ` change=${r.stage_b.assessment_change}` : ""}` : "";
      console.log(`  ${r.claim_id.padEnd(9)} ${String(r.verdict).padEnd(14)} coverage=${String(r.coverage).padEnd(10)} conditions=${String(r.conditions).padEnd(8)} limitation=${String(r.limitation_type).padEnd(10)}${sb}`);
      if (r.span_violations.length) for (const s of r.span_violations) console.log(`      !! ${s.code}: ${s.detail}`);
    }
  }
  console.log(`\nspan violations: ${out.span_violations.length}   architecture violations: ${out.arch_violations.length}`);
  for (const v of out.arch_violations) console.log(`  ${v.case}/${v.claim_id} ${v.code}: ${v.detail}`);
  process.exit(0);
}
console.log("usage: run-rc2.mjs --emit-a | --emit-b <dir> | --score <dir>");
