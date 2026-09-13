// Smoke test — the SHIPPED module, against the exact cases that produced the two failures.
// Not a re-run of the experiment: it checks that the code paths behave in the edge function the way
// they behaved in the harness.
import { assertNoRemedyLeak, validateSpans, mergeRemedy, isRealComponent, canonical, sha256 } from "../_shared/esa.ts";
import { DIAGNOSIS_SYSTEM, REMEDY_SYSTEM_CONDITIONS, REMEDY_SYSTEM_COVERAGE, PROMPT_SHA } from "../_shared/esa-prompts.ts";
import { isTransient, safeError, retryOnce } from "../_shared/safe.ts";

let fails = 0;
const ok = (name: string, cond: boolean, extra = "") => {
  if (!cond) fails++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}${extra ? "   " + extra : ""}`);
};

console.log("\n1 · leak check — the Stage A prompt is clean, and a leak actually throws");
let threw = false;
try { assertNoRemedyLeak("stageA.system", DIAGNOSIS_SYSTEM); } catch { threw = true; }
ok("shipped diagnosis prompt carries no remedy vocabulary", !threw);
threw = false;
try { assertNoRemedyLeak("test", "please choose a tier 1 modify_item for this"); } catch { threw = true; }
ok("a real leak throws", threw);
threw = false;
try { assertNoRemedyLeak("test", "the student must repair the error in item 9", ["the student must repair the error in item 9"]); } catch { threw = true; }
ok("teacher's own words are scanned out, not flagged", !threw);

console.log("\n2 · neither remedy offers modify_item — the tier is out of pilot scope (H1, 2026-09-10)");
ok("conditions prompt has no 'modify_item'", !REMEDY_SYSTEM_CONDITIONS.includes("modify_item"));
ok("conditions prompt has no tier hierarchy", !REMEDY_SYSTEM_CONDITIONS.includes("TIER 1"));
ok("coverage prompt does NOT offer modify_item", !REMEDY_SYSTEM_COVERAGE.includes("modify_item"));
ok("coverage prompt does NOT offer a longer observation", !REMEDY_SYSTEM_COVERAGE.includes("longer_observation"));
ok("coverage prompt ships exactly two remedy tiers", REMEDY_SYSTEM_COVERAGE.includes("TIER 1 — ADD ONE SHORT INDEPENDENT OBSERVATION") && REMEDY_SYSTEM_COVERAGE.includes("TIER 2 — NO CHEAP CHECK") && !REMEDY_SYSTEM_COVERAGE.includes("TIER 3"));
ok("coverage prompt forbids editing an existing item", REMEDY_SYSTEM_COVERAGE.includes("YOU MAY NOT REWRITE"));

console.log("\n3 · span anchoring — the two release-check failures, verbatim");
const E1 = "Infers the author's unstated position on replacing the Mill Street bridge from the text's choices rather than from any sentence that states it.";
const G5C3 = "States why adding denominators produces a wrong-sized part, and gives the correct sum.";

// what the FAILED run produced for E1: all three unanchored
const badE1 = validateSpans([
  { component: "States the author's position in the student's own words", claim_span: "States the author's position in the student's own words", verb: "States" },
  { component: "Ties that position to specific choices the author made", claim_span: "Ties that position to specific choices the author made", verb: "Ties" },
], E1);
ok("E1: components the teacher never said are rejected", badE1.filter((v) => v.code === "SPAN_NOT_IN_CLAIM").length === 2, `${badE1.length} violations`);

// a manner qualifier: real span, no verb of its own
const qualifier = validateSpans([
  { component: "Infers the position", claim_span: "Infers the author's unstated position on replacing the Mill Street bridge", verb: "Infers" },
  { component: "derives rather than finds it stated", claim_span: "from the text's choices rather than from any sentence that states it", verb: "" },
], E1);
ok("E1: a manner qualifier with no verb is caught", qualifier.some((v) => v.code === "NO_VERB"));
ok("E1: the real move passes", !qualifier.some((v) => v.code === "SPAN_NOT_IN_CLAIM"));
ok("a verbless entry is not rendered to the teacher", !isRealComponent({ verb: "" }) && isRealComponent({ verb: "Infers" }));

// G5C3: the two authorised components pass; the rogue one is rejected
const g5 = validateSpans([
  { component: "Explains what is wrong with adding the denominators", claim_span: "States why adding denominators produces a wrong-sized part", verb: "States" },
  { component: "Produces the correct value", claim_span: "gives the correct sum", verb: "gives" },
  { component: "Identifies the error in the worked example", claim_span: "Identifies the error in the worked example", verb: "Identifies" },
], G5C3);
ok("G5C3: 2 authorised components pass, 1 unauthorised rejected", g5.length === 1 && g5[0].code === "SPAN_NOT_IN_CLAIM", g5.map((v) => v.code).join(","));

const overlap = validateSpans([
  { component: "a", claim_span: "gives the correct sum", verb: "gives" },
  { component: "b", claim_span: "the correct sum", verb: "gives" },
], G5C3);
ok("overlapping spans are caught", overlap.some((v) => v.code === "SPAN_OVERLAP"));

console.log("\n4 · the merge — Stage B cannot write back");
const record = { claim_id: "G5C1", coverage: { coverage_status: "sufficient" }, supports: "x" };
const hash = await sha256(canonical(record));
const clean = await mergeRemedy({ claimRecord: record, diagnosis_hash: hash, limitationType: "coverage",
  remedyRaw: { tier: "add_observation", assessment_change: "none", add: { primitive: "Perturb" }, disagreement: "" } });
ok("a clean merge produces no violations", clean.violations.length === 0, clean.violations.map((v) => v.code).join(","));

const mod = await mergeRemedy({ claimRecord: record, diagnosis_hash: hash, limitationType: "coverage",
  remedyRaw: { tier: "modify_item", assessment_change: "modify_one_item", modify: { item_ref: "3" }, disagreement: "" } });
ok("a modify on a COVERAGE gap is recorded AND dropped",
  mod.violations.some((v) => v.code === "MODIFY_OUT_OF_PILOT_SCOPE") && mod.merged.stage_b.modify === null);
ok("the out-of-scope tier itself is recorded", mod.violations.some((v) => v.code === "TIER_OUT_OF_PILOT_SCOPE"));
ok("a rewrite on a coverage gap is forced back to none",
  mod.violations.some((v) => v.code === "ASSESSMENT_REWRITTEN") && mod.merged.stage_b.assessment_change === "none");
ok("the Stage A half is untouched", clean.merged.coverage.coverage_status === "sufficient");

const over = await mergeRemedy({ claimRecord: record, diagnosis_hash: hash, limitationType: "coverage",
  remedyRaw: { tier: "add_observation", coverage: { coverage_status: "limited" }, supports: "REWRITTEN" } });
ok("Stage B fields outside the whitelist are dropped", over.violations.some((v) => v.code === "STAGE_B_OVERREACH"));
ok("Stage B could not overwrite the diagnosis", over.merged.supports === "x" && over.merged.coverage.coverage_status === "sufficient");

const cond = await mergeRemedy({ claimRecord: record, diagnosis_hash: hash, limitationType: "conditions",
  remedyRaw: { assessment_change: "modify_one_item", modify: { item_ref: "4" }, verification: "none" } });
ok("an item modification on a conditions limitation is recorded AND dropped",
  cond.violations.some((v) => v.code === "MODIFY_OUT_OF_PILOT_SCOPE") && cond.merged.stage_b.modify === null);
ok("a rewrite on a conditions limitation is recorded AND forced back to none",
  cond.violations.some((v) => v.code === "ASSESSMENT_REWRITTEN") && cond.merged.stage_b.assessment_change === "none");

const dis = await mergeRemedy({ claimRecord: record, diagnosis_hash: hash, limitationType: "coverage",
  remedyRaw: { tier: "add_observation", disagreement: "None." } });
ok('"None." is not treated as a disagreement', !dis.violations.some((v) => v.code === "STAGE_B_DISAGREED"));

console.log("\n5 · failing safely — the 2026-09-11 production 504, verbatim");

// The exact string that reached a teacher's screen. Token redacted here; shape identical.
const PROD_504 =
  'db GET esa_reviews?access_token=eq.74fd9b42eb2ddd249da295913b59d7b3&select=id,created_at,invite_token,title' +
  ' \u2192 504: {"message":"Gateway Timeout"}';

ok("the production 504 is classified transient", isTransient(PROD_504));
const s504 = safeError(PROD_504);
ok("it answers 503, not 500", s504.status === 503);
ok("it is marked retryable", s504.retryable === true);
ok("the teacher is told nothing was saved", /nothing was saved/i.test(s504.error));
ok("no access token reaches the teacher", !s504.error.includes("74fd9b42eb2ddd249da295913b59d7b3"));
ok("no request URL reaches the teacher",
  !/esa_reviews|access_token|select=|db GET|rest\/v1/i.test(s504.error));
ok("no status code or raw payload reaches the teacher",
  !/504|Gateway Timeout|\{"message"/i.test(s504.error));

const s500 = safeError("TypeError: Cannot read properties of undefined (reading 'claims')");
ok("a genuine bug is NOT called transient", !isTransient("TypeError: Cannot read properties of undefined"));
ok("a genuine bug answers 500 and is not retryable", s500.status === 500 && s500.retryable === false);
ok("a genuine bug leaks no internals either",
  !/TypeError|undefined|claims/.test(s500.error) && /nothing was saved/i.test(s500.error));

console.log("\n6 · the bounded retry — one more attempt, never a loop");
let calls = 0;
const flaky = await retryOnce(() => {
  calls++;
  if (calls === 1) return Promise.reject(new Error(PROD_504));
  return Promise.resolve("row");
}, 1);
ok("a read lost to a gateway timeout succeeds on the second attempt", flaky === "row" && calls === 2);

calls = 0;
let rethrown = "";
try {
  await retryOnce(() => { calls++; return Promise.reject(new Error("db GET esa_reviews \u2192 400: bad filter")); }, 1);
} catch (e) { rethrown = String((e as Error).message); }
ok("a real error is not retried and surfaces unchanged", calls === 1 && rethrown.includes("400: bad filter"));

calls = 0;
let gaveUp = false;
try {
  await retryOnce(() => { calls++; return Promise.reject(new Error(PROD_504)); }, 1);
} catch { gaveUp = true; }
ok("a persistent outage gives up after exactly two attempts", gaveUp && calls === 2);

console.log(`\nprompt sha  diagnosis ${PROMPT_SHA.diagnosis}  coverage ${PROMPT_SHA.coverage}  conditions ${PROMPT_SHA.conditions}`);
console.log(fails === 0 ? "\nALL SMOKE TESTS PASS\n" : `\n${fails} FAILED\n`);
Deno.exit(fails === 0 ? 0 : 1);
