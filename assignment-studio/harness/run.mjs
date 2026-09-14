#!/usr/bin/env node
// Assignment Studio — gold harness runner.
//   node assignment-studio/harness/run.mjs                 → all gold × all modes (12 cases)
//   node assignment-studio/harness/run.mjs g5-math-fractions support
//   node assignment-studio/harness/run.mjs --only-infer    → infer contracts only, compare to gold, no transforms
//   node assignment-studio/harness/run.mjs --fixtures      → audit the planted gold fixtures only (no transforms); compare to expected audits
//
// Runs through the DEPLOYED as-studio endpoint (the real product path), tagged pilot_id=harness so pilot
// metrics can exclude it. Writes harness/runs/<stamp>/ with one JSON + one Markdown packet per case and
// a REVIEW.md table for the human reviewer. Automatic checks are deliberately few and honest; the human
// ship/edit/reject in REVIEW.md is the ground truth.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const GOLD = join(here, "..", "gold");
const FN = process.env.AS_FN || "https://svrbfpjoufhhxdshwlvt.supabase.co/functions/v1/as-studio";
const MODES = ["support", "advanced", "visible"];
const args = process.argv.slice(2);
const onlyInfer = args.includes("--only-infer");
const fixturesOnly = args.includes("--fixtures");
const pos = args.filter((a) => !a.startsWith("--"));
const ids = pos[0] ? [pos[0]] : readdirSync(GOLD).filter((d) => existsSync(join(GOLD, d, "gold.json")));
const modes = pos[1] ? [pos[1]] : MODES;
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const OUT = join(here, "runs", stamp);
mkdirSync(OUT, { recursive: true });

async function api(body) {
  const r = await fetch(FN, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
function lines(s) { return String(s || "").split("\n").length; }
function items(s) { return (String(s || "").match(/^\s*\d+[.)]\s/gm) || []).length; }
function within(status, expected) { const e = Array.isArray(expected) ? expected : [expected]; return e.includes(status) || status === "REVIEW_REQUIRED"; }

const review = ["# Gold harness — human review", "", `Run: ${stamp} · endpoint: ${FN}`, "",
  "Ground truth is the reviewer's verdict. Fill the last three columns. `ship` = usable as-is; `edit` = usable after a named fix; `reject` = broke the contract (name the boundary from gold.json).", "",
  "| case | mode | auto: statuses in range | auto: REVIEW_REQUIRED count | auto: items orig→new | audits P/U/A (✗ = outside expected) | verdict (ship/edit/reject) | boundary violated | reviewer note |",
  "|---|---|---|---|---|---|---|---|---|"];
const fixtureRows = ["# Planted fixtures — audit behaviour vs expected", "", "The four planted cases: polished-but-violating · valid-but-burdensome · apparent-resistance-bypassable · clean pass. ✓ = audit verdict inside the expected set.", "",
  "| case | fixture | mode | preservation | usefulness | adversarial | reviewer note |", "|---|---|---|---|---|---|---|"];
const inferRows = ["# Learning Contract inference vs gold", "", "| case | field | gold | inferred |", "|---|---|---|---|"];

for (const id of ids) {
  const gold = JSON.parse(readFileSync(join(GOLD, id, "gold.json"), "utf8"));
  const md = readFileSync(join(GOLD, id, "assignment.md"), "utf8");
  console.log(`\n== ${id}`);
  const fd = new FormData();
  fd.append("subject", gold.cell.subject); fd.append("grade", gold.cell.grade); fd.append("title", gold.title);
  fd.append("assignment_text", md); fd.append("copyright_bucket", "teacher");
  fd.append("confirm_no_student_data", "yes"); fd.append("confirm_rights", "yes");
  fd.append("teacher_key", "harness"); fd.append("pilot_id", "harness"); fd.append("channel", "harness");
  const created = await (await fetch(FN, { method: "POST", body: fd })).json();
  if (created.error) { console.error("  create failed:", created.error); continue; }
  const t = created.t;
  const inferred = created.assignment.contract_inferred || {};
  for (const f of ["learning_target", "required_thinking", "required_evidence", "teacher_constraints"]) {
    inferRows.push(`| ${id} | ${f} | ${(gold.contract[f] || "").replace(/\|/g, "/")} | ${(inferred[f] || "").replace(/\|/g, "/")} |`);
  }
  writeFileSync(join(OUT, `${id}-inferred.json`), JSON.stringify({ id, t, inferred, gold: gold.contract, original_markdown: created.assignment.original_markdown }, null, 2));
  console.log("  contract inferred; token", t);
  if (onlyInfer) continue;

  // The GOLD contract is what gets confirmed — the transforms are judged against gold, not against the inference.
  const conf = await api({ t, action: "confirm_contract", contract: gold.contract });
  if (conf.error) { console.error("  confirm failed:", conf.error); continue; }

  // Planted fixtures: audit a hand-written version against expected audit behaviour.
  for (const fx of gold.fixtures || []) {
    const text = readFileSync(join(GOLD, id, fx.file), "utf8");
    process.stdout.write(`  fixture ${fx.kind} (${fx.mode}) … `);
    const res = await api({ t, action: "audit_text", mode: fx.mode, text });
    if (res.error) { console.log("FAILED:", res.error); fixtureRows.push(`| ${id} | ${fx.kind} | ${fx.mode} | — | — | — | FAILED ${res.error} |`); continue; }
    const got = res.verdicts, exp = fx.expected;
    const ok = (k) => { const e = Array.isArray(exp[k]) ? exp[k] : [exp[k]]; return e.includes(got[k]); };
    const cell = (k) => `${got[k]} ${ok(k) ? "✓" : "✗ (exp " + (Array.isArray(exp[k]) ? exp[k].join("/") : exp[k]) + ")"}`;
    console.log(`P ${cell("preservation")} · U ${cell("usefulness")} · A ${cell("adversarial")}`);
    writeFileSync(join(OUT, `${id}-fixture-${fx.kind}.json`), JSON.stringify({ id, fixture: fx, audit: res.audit, verdicts: got }, null, 2));
    fixtureRows.push(`| ${id} | ${fx.kind} | ${fx.mode} | ${cell("preservation")} | ${cell("usefulness")} | ${cell("adversarial")} | |`);
  }
  if (fixturesOnly) continue;

  for (const mode of modes) {
    process.stdout.write(`  ${mode} … `);
    const t0 = Date.now();
    let res = await api({ t, action: "transform", mode, request: {} });
    if (res.error) { console.log("FAILED:", res.error); review.push(`| ${id} | ${mode} | — | — | — | — | | | FAILED: ${res.error.replace(/\|/g, "/")} |`); continue; }
    // background: poll until ready (transform → audits → optional repair → re-audit)
    let v = res.version, lastStage = "";
    while (v.status === "generating") {
      await new Promise((r) => setTimeout(r, 4000));
      const g = await api({ t, action: "get_version", version_id: v.id });
      if (g.error) break;
      v = g.version;
      if (v.stage !== lastStage) { process.stdout.write(`${v.stage} `); lastStage = v.stage; }
    }
    if (v.status !== "ready") { console.log("FAILED:", v.error); review.push(`| ${id} | ${mode} | — | — | — | — | | | FAILED: ${String(v.error || "").replace(/\|/g, "/")} |`); continue; }
    const o = v.output || {};
    const exp = gold.mode_boundaries[mode].expected_statuses;
    const inRange = Object.keys(exp).every((k) => within(o.statuses?.[k]?.status, exp[k]));
    const rr = Object.values(o.statuses || {}).filter((s) => s.status === "REVIEW_REQUIRED").length;
    const io = items(md), inw = items(o.new_version);
    const av = v.audit_verdicts || {};
    const ea = gold.mode_boundaries[mode].expected_audits || {};
    const aok = (k) => { const e = Array.isArray(ea[k]) ? ea[k] : [ea[k]]; return !ea[k] || e.includes(av[k]); };
    const auditCell = `P:${av.preservation}${aok("preservation") ? "" : "✗"} U:${av.usefulness}${aok("usefulness") ? "" : "✗"} A:${av.adversarial}${aok("adversarial") ? "" : "✗"}${v.repaired ? " (repaired)" : ""}`;
    console.log(`${Math.round((Date.now() - t0) / 1000)}s · statuses ${inRange ? "in range" : "OUT OF RANGE"} · review_required ${rr} · items ${io}→${inw} · ${auditCell}`);
    writeFileSync(join(OUT, `${id}-${mode}.json`), JSON.stringify({ id, mode, t, version_id: v.id, output: o, output_prerepair: v.output_prerepair, repaired: v.repaired, audits: v.audits, audit_verdicts: av, model: v.model, prompt_version: v.prompt_version, generated_ms: v.generated_ms, gold_boundary: gold.mode_boundaries[mode] }, null, 2));
    const last = ((v.audits || {}).rounds || []).slice(-1)[0] || {};
    const packet = [
      `# ${gold.title} — ${mode.toUpperCase()}`, "", `case ${id} · model ${v.model} · prompt ${v.prompt_version} · ${v.generated_ms} ms${v.repaired ? " · REPAIRED once: " + (v.audits || {}).repair_reason : ""}`, "",
      "## Gold boundary", "", "**Pass looks like**", ...gold.mode_boundaries[mode].pass_looks_like.map((x) => `- ${x}`), "", "**Violation looks like**", ...gold.mode_boundaries[mode].violation_looks_like.map((x) => `- ${x}`), "",
      "## Preservation statuses (engine)", "", ...Object.entries(o.statuses || {}).map(([k, s]) => `- **${k}**: ${s.status} — ${s.note}`), "",
      `Workload: ${o.teacher_workload} — ${o.teacher_workload_note}`, "",
      "## Audits (final round)", "",
      `- **Preservation**: ${av.preservation} — ${last.preservation?.summary || ""}`, ...((last.preservation?.findings || []).map((f) => `  - ${f.invariant} · ${f.kind} · ${f.severity}: ${f.evidence}`)),
      `- **Usefulness**: ${av.usefulness} — clarity ${last.usefulness?.clarity}, feasibility ${last.usefulness?.feasibility}, editing ${last.usefulness?.editing_required}, grading ${last.usefulness?.grading_burden}, improves ${last.usefulness?.improves_original}`, ...((last.usefulness?.notes || []).map((n) => `  - ${n}`)),
      `- **Adversarial**: ${av.adversarial} (cost ${last.adversarial?.cost_to_student}) — ${last.adversarial?.cheapest_path || ""}`, `  - survives: ${last.adversarial?.what_survives || ""}`, `  - bypassed: ${last.adversarial?.what_is_bypassed || ""}`, `  - repair hint: ${last.adversarial?.repair_hint || ""}`, "",
      "## What we changed", ...(o.trace?.changed || []).map((c) => `- ${c.what} — _${c.why}_`), "",
      "## What we protected", ...(o.trace?.protected || []).map((c) => `- ${c}`), "",
      "## Check this", ...(o.trace?.check_this || []).map((c) => `- ${c}`), "",
      "## Teacher notes", "", o.teacher_notes || "", "", "## Reviewer notes (operator)", "", o.reviewer_notes || "", "",
      "---", "", "## NEW VERSION", "", o.new_version || "", "",
      ...(v.output_prerepair ? ["---", "", "## VERSION BEFORE REPAIR", "", v.output_prerepair.new_version || "", ""] : []),
      "---", "", "## ORIGINAL", "", md,
    ].join("\n");
    writeFileSync(join(OUT, `${id}-${mode}.md`), packet);
    review.push(`| ${id} | ${mode} | ${inRange ? "yes" : "NO"} | ${rr} | ${io}→${inw} (${lines(md)}→${lines(o.new_version)} lines) | ${auditCell} | | | |`);
  }
}
writeFileSync(join(OUT, "REVIEW.md"), review.join("\n") + "\n");
writeFileSync(join(OUT, "INFERENCE.md"), inferRows.join("\n") + "\n");
writeFileSync(join(OUT, "FIXTURES.md"), fixtureRows.join("\n") + "\n");
console.log(`\nWrote ${OUT}\nOpen REVIEW.md, FIXTURES.md and INFERENCE.md.`);
