# The Sovereign Academy — Math Game System Inventory & Memory

_Last audited: 2026-07-12. Owner: Dalia (dalia@thesovereign.academy). Keep this file as the durable map of where everything lives._

## TL;DR — you have THREE repos that work together

| # | Local folder (mounted) | GitHub remote | Role |
|---|---|---|---|
| A | `~/projects/Master-Gaming-App-and-OS` | `github.com/Sovereigndwp/math-game-studio-os` | **The OS / brain** — rules, pipeline, agents, design standards |
| B | `~/projects/math-games` | `github.com/Sovereigndwp/math-games` | **The factory / output** — playable games, concept packets, schemas |
| C | `~/projects/tyb-engine` | `github.com/Sovereigndwp/tyb-engine` | **The engine / shared skills** — "Train Your Brain Games" runnable skills, tools, telemetry, shipped game builds |

All three local folders are real git clones (remotes confirmed). All have **uncommitted work** right now (see "Loose ends"). A separate, older lineage — the Bitcoin course engine (`Learn-bitcoin-by-doing`) — lives on the Desktop and is NOT part of this math system.

The mental model, from your own README: **`math-game-studio-os` defines how the studio should work; `math-games` is where the studio actually produces games.**

---

## Repo A — `math-game-studio-os` (the OS)

A multi-agent pipeline that takes a raw math-game concept and decides whether it's worth building, then produces a spec + build handoff. Python-based, ~331 MB on disk (mostly `.venv`).

It self-describes as **three coexisting layers ("eras")** — this is important; don't treat the Python pipeline as the whole thing:

- **Era 1 — Python pipeline.** Runnable multi-agent system. `pipeline.py`, `agents/` (14 agents: intake_framing, kill_test, core_loop, interaction_mapper, misconception_architect, prototype_spec, implementation_plan, family_architect, visual_motion_design, playtest_diagnostic_report, etc.), `engine/gate_engine.py` (PASS/REVISE/KILL gates), `orchestrator/`, schemas, `tests/`. Runs in **stub mode** (no API key, ~5s) or **LLM mode** (calls Claude, needs `ANTHROPIC_API_KEY`).
- **Era 2 — OS design framework.** The quality/design rulebook (not runnable) in `docs/`: `os_spec_2026.md`, `game_experience_spec.md`, `delight_gate.md`, `pass_rules.md`, `game_design_intelligence.md`, `learning_and_generalization.md`, `reusable_patterns_library.md`, plus `orchestrator_v3/` (a future LangGraph orchestrator blueprint, not yet running).
- **Era 3 — Review + release pipeline.** The live workflow. **Taskade owns the active pipeline/gates**; GitHub is the review+release archive. Path: approved concept → `reviews/<slug>/current/` → `games/<slug>/releases/<version>/` via `.github/workflows/promote-build.yml` (only sanctioned path). Policy in `docs/pipeline_policy.md`, lanes in `docs/concept_lanes.md`.

**The 15-stage pipeline** (Stage 0 intake → 1 learner-fit → 1.5 standards-alignment (CCSS/NGSS) → 2 kill-test (7-dimension auto score) → 3 fantasy-integrity → 4 interaction-mapper → 5 core-loop → 6 brilliant-audit → 7 multisensory-spec → 8 content-bank → 8.5 AI-playtester (3 archetypes) → 9 ux-contract → 10 build → 11 feel-audit (20-pt juice rubric) → 12 misconception-map → 13 release → 14 live-ops). See `ENGINE-GUIDE.md` for the canonical version.

**Reusable assets worth harnessing:**
- `docs/reusable_patterns_library.md` — proven UX patterns (zero-pressure tutorial, mistake-review screen, status strip, star ratings) drawn from prior games (ATC Math Tower, Grocery Dash, Bakery Rush, Fire Dispatch).
- `careers/career-matrix.json` — 12 careers × skills × grade ranges × CCSS hooks (fantasy wrappers).
- `agents/` markdown specs: `school-pitch-generator.md`, `grant-writer.md` (IES SBIR / NSF), `stage-1-5-standards-alignment.md`, `stage-8-5-ai-playtester.md`.
- `references/` — full source HTML of past games (ATC Math Tower, Grocery Dash) to mine.

**Current content state:** only **1 concept** in `concepts/` — `snack-line-shuffle` (full packet: concept, curriculum_map, misconception_notes, p1_definition_of_done, engineer_handoff, question_audit, approvals, status). `games/` in the OS is empty (just a README) — games live in Repo B.

---

## Repo B — `math-games` (the factory)

GitHub-first operating repo, the migration target away from Taskade. ~79 MB. This is where games actually get produced and shipped.

**Playable games (`games/`), all self-contained single-file HTML5 (canvas + Web Audio), each with its own "Graphic Bible" design system:**
- `echo-heist/` — most developed (160 KB HTML + `playtest.js` + `AUDIT.md`; uses Web Audio).
- `orbital-drift/` — **calculus / "Mission Control"** theme (v1 + v2).
- `bug-counter/` — counting.
- `dino-dig/` — early prototype.

**Other structure:**
- `generated/drafts/` — machine-generated concept packets: bakery-rush-mini, number-bond-bridge-mini, snack-line-shuffle-mini, example-game (each has `concept_packet.draft.json` + manifest).
- `schemas/` — 12 JSON schemas governing the whole flow: concept_brief, concept_packet, build_plan, generation_request/manifest, qa_audit, promotion_request/record, release_certificate, repair_record, project_config.
- `taxonomy/` — `families.yaml`, `interaction_types.yaml`.
- `scripts/`, `reviews/`, `taskade_exports/` (raw Taskade export preserved as source material, NOT canonical), `AGENTS.md`.

---

## Repo C — `tyb-engine` (the shared engine) — REORGANIZED 2026-07-12

The "Train Your Brain Games" engine. Was a committed session bundle (telemetry shim + misconception classifier, patched Echo Heist & Orbital Drift builds, and the Triage concept run through Stages 0–8.5) PLUS a flat, untracked `files/` dump of the shared-skills layer.

**On 2026-07-12 the flat `files/` dump was incorporated into the canonical structure** from `ENGINE-GUIDE.md` (all JS re-verified with `node --check`; tools smoke-tested and run):

```
tyb-engine/
├── ENGINE-GUIDE.md            ← moved to root
├── skills/audio/tones.js      (TYBAudio)
├── skills/juice/juice.js      (TYBJuice + TYBEase — screen shake, particles, floating text)
├── skills/dom-panels/panel.js + panels.css (TYBPanel)
├── telemetry/telemetry.js     (TYBTelemetry class; joins existing shim + misconceptions.js)
├── careers/career-matrix.json (12 careers)
├── agents/  stage-1-5-standards-alignment, stage-8-5-ai-playtester, school-pitch-generator, grant-writer
├── tools/   kill-test-cli, portfolio-audit, lesson-inject, concept-inbox-form-spec
│            + folded-in harness: brilliant-audit-cli, feel-audit-cli, standards-alignment-cli, audit-runner, _lib/harness.js
├── rubrics/ brilliant-standard.md, feel-audit.md, standards-alignment.md   (folded in from math-games harness)
├── schemas/ audit-schemas.json                                            (folded in)
└── workflows/ pipeline.yml, a11y-gate.yml
```

The harness tools/rubrics/schemas were COPIED from `math-games/Claude Downloads/tyb-harness/` (originals left in place). **Changes are uncommitted — review then commit** (`git status` in the repo shows all-new dirs; nothing was deleted). Note: `workflows/a11y-gate.yml` must be copied to `.github/workflows/` to actually run as a GitHub Action.

**Still adaptive work remaining:** the shipped games (`echo-heist.html`, `orbital-drift.html`) still contain copy-pasted audio/juice — they don't yet import the shared `skills/` modules. The next new game (e.g. unit-circle) should consume `skills/` natively as the reference implementation.

## ⚠️ Loose ends / things sitting in the wrong place

1. **~~The shared "tyb-engine" reusable skills are generated but NOT extracted/committed.~~ ✅ DONE 2026-07-12 (see Repo C above).** Originals still sit zipped in: `ENGINE-GUIDE.md` documents `skills/audio/tones.js` (TYBAudio), `skills/juice/juice.js` (screen shake/particles/floating text), `skills/dom-panels/panel.js`, `telemetry/telemetry.js`, `careers/career-matrix.json`, and CLI tools (`kill-test-cli.js`, `portfolio-audit.js`, `lesson-inject.js`) — but these files **do not exist in either repo**. They're zipped up:
   - `math-games/files.zip` → contains `tyb-engine-payload.tar.gz` (21 files: telemetry shims, triage concept packet, echo-heist + orbital-drift builds with misconception-maps & standards-alignment), `commit-tyb-engine.sh`, `HOW-TO-COMMIT.md`, `recommended.gitignore`.
   - `math-games/Claude Downloads/tyb-harness/` → CLI tools (`kill-test-cli.js`, `brilliant-audit-cli.js`, `feel-audit-cli.js`, `standards-alignment-cli.js`, `audit-runner.js`, `_lib/harness.js`), `schemas/audit-schemas.json`, `rubrics/`.
   - `math-games/Claude Downloads/files for optimization.zip`.
   - **Where they belong:** the shared skills + tools should be extracted into the **OS repo** (it's the "how the studio works" layer). Decide OS-vs-math-games home before committing.
2. **Uncommitted git state.** OS repo: untracked `.claude/settings.local.json`, `docs/concept-journey-dashboard.tsk`. math-games repo: deleted old echo-heist HTML variants, untracked `Claude Downloads/` + `files.zip`.

---

## Where a NEW packet (e.g. unit circle) should be produced

- Concept + gates + standards alignment → run through the **OS** pipeline / `concepts/<slug>/`.
- Playable game build → **math-games** `games/unit-circle/index.html` (follow the single-file HTML + Graphic Bible + Web Audio pattern of `orbital-drift`, the closest existing analog since it's already trig/calculus-flavored).
- Schemas to validate against live in `math-games/schemas/`.
- Reuse patterns from `docs/reusable_patterns_library.md` and audio from the (to-be-extracted) `tyb-engine` skills.

---

## Voice / narration (see chat) 

Synthetic TTS in your own cloned voice is feasible. No cloned-voice asset exists in the repos yet — this would be a new capability to add to the packet pipeline. Requirements + tool options are in the chat response dated this audit.
