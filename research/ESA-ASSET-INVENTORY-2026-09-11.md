# ESA asset inventory — what education work already exists, and what ESA can use

Compiled 2026-09-11 while building the ESA public homepage. Purpose: decide what feeds
Education Sovereign Academy, what stays private, and what is dead weight.

**Provenance matters here.** Three tiers, marked on every row:

- `VERIFIED` — I opened it this run and read it.
- `AUDIT` — recorded in `~/projects/Claude outputs/C-client-work-and-education.md` (Cowork
  machine audit, 2026-09-05). Not re-verified this run.
- `BLOCKED` — I could not reach it (see §0).

---

## 0 · What I could not reach, and how to fix it

`~/Desktop` returns `Operation not permitted` to the MCP process. This is macOS TCC
(Full Disk Access), not a path allowlist — `~/Documents` and `~/Downloads` both read fine.
So `~/Desktop/Education`, `~/Desktop/TSA`, `~/Desktop/TBA` are all invisible to this session.

Three ways to open it, cheapest first:

1. **Move it.** `~/Desktop/Education` → `~/Documents/Claude/Projects/TSA/projects/teach-back-flywheel/`
   (this is move #6 in the 2026-09-05 audit's own move list, and it is already overdue —
   the folder is half here, half on the Desktop, and `NEW-CHAT-KICKOFF.md` paths are already stale).
2. **Grant Full Disk Access** to the app hosting the MCP servers, in
   System Settings → Privacy & Security → Full Disk Access.
3. **Add `~/Desktop`** to the Filesystem MCP server's allowed directories (it currently
   allows `~/Documents/Claude` and `~/projects` only). This still needs TCC for Desktop.

Recommendation: option 1. It closes the split-brain problem rather than working around it.

---

## 1 · The ESA lineage — verified, in the brain

`~/Documents/Claude/Projects/TSA/projects/teach-back-flywheel/` — 12 artifacts, Aug 27 → Sep 5.
This is the real intellectual history behind ESA. Read in order, it is a record of the idea
narrowing four times, each time by discarding something that did not survive contact.

| # | Artifact | Date | What it actually is | Status | ESA use |
|---|---|---|---|---|---|
| 1 | `TEACHER-DEMAND-DISCOVERY.html` | 08-27 | Pre-K–12 market scan: who buys, what they pay for, ranked demand ledger, competitive landscape, pricing hypotheses | VERIFIED · superseded as strategy | Evidence, not copy. Do not publish. |
| 2 | `TEACH-BACK-FLYWHEEL-PLAN.html` | 08-27 | "Teachers teach teachers" — submit a lesson, agent audits it, upgrades it with a tyb interactive, publishes under revenue share | VERIFIED · **abandoned** | Keep as the record of the marketplace idea. This is Stage 3 in the Assignment Studio notes; not ESA v1. |
| 3 | `TEACH-BACK-FLYWHEEL-PROTOTYPE.html` | 08-27 | Working prototype of #2, prefilled with the Unit Circle placement game | VERIFIED · abandoned | Demo asset only. |
| 4 | `TEACHER-WORK-MAP.html` | 09-03 | 11 recurring secondary-math tasks × 8 dimensions, workflows ranked seven ways | VERIFIED · **live and valuable** | **Direct feed.** This is the empirical basis for the teacher questions on the ESA homepage. |
| 5 | `TEACHER-WORK-MAP-REVISED.html` | 09-03 | Self-correction: audits its own 43–58 hour claim, demotes the teacher model to provisional, adds a dual metric | VERIFIED · **live** | The honesty here is the ESA tone. Worth mining for voice. |
| 6 | `TEACHER-TIME-BACK-ARCHITECTURE.html` | 08-28 | "An AI OS for teacher work" — five stages, judgment in the middle, 100-hour guarantee, Math Department Edition MVP | VERIFIED · **superseded** | The phrase "Teacher Time Back" in the brief comes from here. See §4 — I recommend it does NOT ship as a named ESA tool. |
| 7 | `ASSESSMENT-STRESS-TEST-PLAN.html` | 09-03 | Demand teardown + the free-finding→$49 validation design, pass/fail thresholds set in advance, ethics/copyright section | VERIFIED · **partly superseded** | The governing document for the Stress Test. Its §9 (privacy/copyright for an assignment corpus) is still binding. |
| 8 | `FRACTIONS-DEMO.html` | 08-28 | Upload a Grade-4 fractions worksheet → diagnostic play → teacher dashboard → school heatmap | VERIFIED · **abandoned direction** | This is the "AI generates more stuff + dashboards" version ESA explicitly rejects. Keep as a counterexample. |
| 9 | `TRANSFORMATION-CONTRACT-v0.1.md` | 09-05 | Owner-issued: 3 modes, 4-field Learning Contract, 4 preservation statuses, the trace | VERIFIED · **live, central IP** | Governs Assignment Studio, which is downstream and dormant. |
| 10 | `ASSIGNMENT-STUDIO-MIGRATION-PLAN.md` | 09-05 | Approved migration w/ modifications; per-version invariant permissions; 12-item gold harness | VERIFIED · live | Engineering, not homepage. |
| 11 | `references/OWNER-DECISION-CORPUS-SEED.html` | 08-27 | 19 precedents mined from her own governance, in the owner-approval-delegation schema, 19/19 validated | VERIFIED · **live, underused** | The long-term "common decision system" the brief's §12 asks us not to foreclose. |
| 12 | `references/TRANSFORMATION-CONTRACT-machine-draft-SUPERSEDED-2026-09-05.md` | 09-05 | Machine draft replaced by #9 | VERIFIED · dead | Do not revive. |

Also present: `references/validate-corpus.py`, `references/odc-seed`, `NEW-CHAT-KICKOFF.md`
(stale — points at `~/Desktop/*.html` paths that have since moved).

---

## 2 · Desktop/Education — what the 2026-09-05 audit recorded

`AUDIT` — 900K, 42 files, newest 2026-09-04, described as *"live, coherent, mid-program"* and
*"the newest, best-documented work in the whole audit."*

- The six HTML files above are **byte-identical** on both sides (md5s recorded in the audit).
- **Desktop-only, not in the brain:** `CONTEXT.md` (a revised superset of `NEW-CHAT-KICKOFF.md`),
  Track 1 (competitive teardown), Track 2 (stress-test kit v1 + v2), Track 3 (evidence architecture
  + an **Algebra I evidence pack**, shipped as `06-EVIDENCE-PACK.pdf`), and
  `TSA-MATH-SYSTEM-INVENTORY.md` (duplicate of the one in `~/Desktop/TSA/`).
- Carries a **$6–15k department-sprint price anchor** — per the audit, only the second real price
  she has ever written down.
- The audit's #5 ranked recommendation: *decide what this is.* Either a named TSA product line
  filed wholly under `TSA/projects/`, or parked. It should not live half on the Desktop.

**That decision is now made: it is ESA.** So the merge in §0 option 1 is no longer optional
housekeeping — it is filing ESA's own founding research where ESA can reach it.

The three Desktop-only tracks are the highest-value unverified material on the machine.
Track 3's evidence architecture is where "minimum sufficient evidence" originally came from,
and the ESA engine is built on that principle today.

---

## 3 · Adjacent education assets (not ESA v1, but real)

| Asset | Where | State | Call |
|---|---|---|---|
| `tyb-engine` | `~/projects/tyb-engine` | AUDIT · dormant since 2026-07-18, has a remote | Archive as a pointer. It was the engine behind the abandoned flywheel. |
| `math-games` | `~/projects/math-games` | AUDIT · dormant since April, 78M, `.venv` + `files.zip` removable | Archive as a pointer. |
| `Master-Gaming-App-and-OS` | `~/projects/Master-Gaming-App-and-OS` | AUDIT · dormant since April, 330M | Archive as a pointer. |
| `bsa-teen`, `bsa-teen-repo` | `~/projects/` | Not audited this run | Check for duplication before ESA claims any youth surface. |
| Unit Circle placement game | inside flywheel prototype | VERIFIED as referenced | Her own classroom asset. Candidate ESA demo *if* it is hers to publish. |
| `posts/files.zip` → `SKILL.md` + `voice-and-style.md` + `common-overclaims.md` | `~/projects/posts` | AUDIT | Extract. The overclaims checklist is directly useful for policing ESA homepage copy. |

**Do not touch:** `~/Downloads/Practice_Test_3.1_-_3.5.pdf` and
`~/Downloads/2.5 Properties of Functions.html` appear to be her own Honors Precalculus
materials. Standing rule (2026-09-10): these are expert-authored benchmark negative controls
only, never market-representative, and only usable with claim-level expectations written
**before** any model execution. Noting their location; not reading, not connecting them.

---

## 4 · Recommendations for the ESA homepage

1. **Lead with the Assessment Review, because it is the only one that exists.** Everything in
   §1 marked "live" points at one capability: judging what an assessment's results can support.
   Present the others as directions, not products.
2. **"Teacher Time Back" should not ship as a named ESA tool.** It is artifact #6, superseded,
   and it names a *time* promise (the 100-hour guarantee) at exactly the moment ESA's whole
   argument is that the right output is often nothing at all. The time saving is a consequence
   of better decisions; making it the product name re-inverts the thesis.
3. **"Read the Work" has no artifact behind it.** It appears in the brief but in nothing on disk.
   Present as a direction under exploration, in future tense, or omit.
4. **"Assignment Studio" is dormant by owner ruling** and its deployed version failed her own
   test on 2026-09-09 (it changed assessments that were already fine). Do not link it.
5. **The parent-facing side has zero artifacts.** Every one of the 12 is teacher-facing. The
   homepage can state the parent intent honestly as intent — it must not imply a built capability.
6. **The Owner Decision Corpus (#11) is the future common decision layer** the brief's §12 wants
   left possible. Nothing on the homepage should contradict it.

---

## 5 · Open items

- [ ] Merge `~/Desktop/Education` into this folder (§0/§2). Blocks full verification of Tracks 1–3.
- [ ] Read Track 3 / the Algebra I evidence pack once reachable — likely the strongest public artifact ESA has.
- [ ] Confirm the Unit Circle game is publishable.
- [ ] Decide whether the $6–15k department sprint is still the ESA price anchor, given the pilot is free.
