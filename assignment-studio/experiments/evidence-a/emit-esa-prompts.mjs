#!/usr/bin/env node
// Emits the three ESA system prompts into the edge function as string literals, generated from the
// SAME modules that produced the run which passed the structural check. The prompts are not retyped,
// so what ships is byte-identical to what was verified, and each carries its sha256 in a comment.
//
//   node assignment-studio/experiments/evidence-a/emit-esa-prompts.mjs
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { diagnosisSystem2, remedySystemCoverage, remedySystemConditions, ESA_ARCH_VERSION_2 } from "./lib/stages2.mjs";
import { REMEDY_TOKENS } from "./lib/stages.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "..", "functions", "_shared", "esa-prompts.ts");
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const lit = (s) => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

const A = diagnosisSystem2(), C = remedySystemCoverage(), D = remedySystemConditions();
writeFileSync(out, `// GENERATED — do not edit by hand.
// Emitted by assignment-studio/experiments/evidence-a/emit-esa-prompts.mjs from lib/stages2.mjs, the
// same module that produced rc2-runs/2026-09-10-19-37 — the run that passed the structural check.
// Regenerate rather than editing, so what ships can always be traced to a verified run.
//
//   diagnosis  sha256 ${sha(A)}
//   coverage   sha256 ${sha(C)}
//   conditions sha256 ${sha(D)}

export const ESA_ARCH_VERSION = ${JSON.stringify(ESA_ARCH_VERSION_2)};

export const DIAGNOSIS_SYSTEM = ${lit(A)};

export const REMEDY_SYSTEM_COVERAGE = ${lit(C)};

export const REMEDY_SYSTEM_CONDITIONS = ${lit(D)};

/** Remedy vocabulary that must never reach a Stage A prompt. Same list the check ran against. */
export const REMEDY_TOKENS: string[] = ${JSON.stringify(REMEDY_TOKENS, null, 2)};

export const PROMPT_SHA = {
  diagnosis: ${JSON.stringify(sha(A).slice(0, 16))},
  coverage: ${JSON.stringify(sha(C).slice(0, 16))},
  conditions: ${JSON.stringify(sha(D).slice(0, 16))},
};
`);
console.log(`wrote ${out}`);
console.log(`  diagnosis  ${A.length} bytes  ${sha(A).slice(0, 16)}`);
console.log(`  coverage   ${C.length} bytes  ${sha(C).slice(0, 16)}`);
console.log(`  conditions ${D.length} bytes  ${sha(D).slice(0, 16)}`);
console.log(`  conditions prompt contains "modify_item": ${D.includes("modify_item")}`);
