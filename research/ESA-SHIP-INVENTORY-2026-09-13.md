# ESA Inventory Day — SHIP / HIDE / DELETE

Compiled 2026-09-13. Companion to `ESA-ASSET-INVENTORY-2026-09-11.md`, which inventoried the
*intellectual* assets. This one inventories the **shipping surface**: every tool and page that
exists, live or on a branch or orphaned, and exactly one call each.

Three columns. No "revisit later". Where a call was mine rather than owner-set, it is marked
**[my call]** and the reasoning is on the row.

---

## 0 · Environment findings that change the plan

1. **No GitHub push credential from this session.** SSH fails host-key verification (no `~/.ssh`
   in the tool VM); HTTPS reads fine but has no credential helper, no `GH_TOKEN`, no `gh` CLI.
   Every fix below can be *committed* here; **only Dalia can push**. Nothing reaches production
   without that step.
2. **Local BSA `main` was 25 commits behind `origin/main`** and could not fetch over SSH.
   Fetched over HTTPS so fixes build on the true base. Do not commit BSA work on stale `main`.
3. **The mount forbids `unlink` by default**, which made `git switch` move HEAD without updating
   files and left a stale `.git/index.lock`. Delete permission was granted and the lock cleared;
   BSA is recovered and clean at `981c3cfe`. If a future session sees phantom "modified" files
   across a whole repo, this is the cause — not real drift.

---

## 1 · SHIP — the single ESA path

Five things, and nothing else, constitute the path a pilot teacher walks.

| # | Item | Where | State | Note |
|---|---|---|---|---|
| 1 | `/esa/` public ESA homepage | hub `master` → `esa/index.html` | **live** | Stays the public homepage. Route ruling 2026-09-11. |
| 2 | `/esa/review/` invite-gated pilot | hub `feat/esa-pilot` | on branch, at `/esa/index.html` | Must relocate to `/esa/review/` in **its own commit**. |
| 3 | `esa-review` edge function | Supabase `rdqwoqdvqpedlsbaghtr`, v1 | **deployed 2026-09-11** | Already live. Three-review limit is server-side here. |
| 4 | ESA engine | `feat/esa-pilot` → `functions/_shared/{engine,esa,esa-prompts,safe,contract,audits,lib}.ts` | on branch | The evidence-judgment layer. Ships as engine, never as a product surface. |
| 5 | Stale-generation reliability fix | `fix/as-stale-generation` `25121c2` | on branch | Carry in from day one. **`sql/2026-09-09-stale-generation.sql` must be applied BEFORE deploy.** |

## 2 · SHIP — live, coherent, costs nothing to leave alone

| Item | Where | State | Note |
|---|---|---|---|
| FSA `/tools/` hub + the four Trump Accounts tools + `trump-account-family-session` | FSA `main` | **live URLs, hub linked from nowhere in nav** | I proposed HIDE; **owner did not confirm, so these stay as they are.** Nothing changed on the FSA site for these. Note they are already semi-orphaned by accident — reachable by direct URL and one link from `/learning-tools/` — so "live" overstates their reach. |
| FSA `/calculators/` — the six-calculator page | FSA `main` | **live**, in nav | **[my call]** Six calculators, linked from the homepage, working, on its own brand. Not on the ESA path but not in its way. Leave it. |
| FSA `/learning-tools/` — 4 tools + index | FSA `main` | **live**, in nav | **[my call]** Same reasoning. |

> **Naming correction:** nothing on disk is titled *"Money, line by line."* The six-calculator
> page is `/calculators/` — `<h1>🧮 Financial Calculators</h1>`. If "Money, line by line" is the
> intended rename, it is unwritten work, not an existing page.

## 3 · HIDE — exists, unlinked, unpublished

| Item | Where | State | Why |
|---|---|---|---|
| `/stress-test/` | hub `feat/assessment-stress-test` | **already unpublished** (not on `master`) | Owner ruling 2026-09-05: do not publish as a customer proposition. Action = confirm it never lands on `master`. |
| Assignment Studio UI (`as.js`, `as.css`) | hub branches | on branch | Dormant by ruling 2026-09-10. |
| `as-studio` edge function v24 | Supabase | **LIVE on Supabase** | Dormant product with a live backend. It failed her own test 2026-09-09 (changed assessments that were already fine). Not deleted — HIDE means unreachable, and no public surface links it. |
| BSA `/institutional/education` | BSA `main` | **live**, 6 inbound links | ESA's promise on the wrong brand, and not deliverable today. Remove 6 links + sitemap entry, redirect to `/institutional`. |
| BSA `/products/advisor-bitcoin-client-kit/` | BSA `main` | **live $499 checkout** | Pause the checkout. Page stays. |
| BSA `/products/family-bitcoin-recovery-kit/` | BSA `main` | **live $149/$49 checkout** | **Not in the brief — found today.** Same shared snippet, same owner ruling (§3 covered *three* kits). One commit fixes all three. |
| BSA `/products/self-custody-starter-kit/` | BSA `main` | **live $49 checkout** | As above. |
| FSA `/kits/` — `$39` with a placeholder Stripe link | FSA `main` | **live, advertised a price it cannot charge** | **OWNER-CONFIRMED 2026-09-13.** Done in `290bf32`: price shows only when the Payment Link is real, pending wording is localisable (ES page reads "Aún no está a la venta"), `$39` out of both pages' meta and the `/kits/` tag. The `$39` constant survives in the KITS config, ready for the day a Payment Link is pasted in. |
| BSA `membership.html` — live `$37` Apprentice and `$399` Sovereign buttons | BSA `main` | **live storefront**, linked from the homepage, 404, account and two stubs | **OWNER-RULED 2026-09-13: hide the whole storefront.** Done in `46b2ec56`. Both products retired. noindex + sitemap removal + 302 to `/`; `account.html` buttons retargeted; the two redirect stubs no longer chain through it. |

## 4 · DELETE

| Item | State | Action |
|---|---|---|
| BSA `terms.html` §4 — "Sovereign Tier ($399 Lifetime)" and "Apprentice Tier (50,000 sats)" | **live**, lines 88 + 95 | **Done** in `b563e851`. Both blocks removed. §3 still speaks of purchasing a membership and is now inconsistent with §4 — **open owner decision.** |
| BSA `transparency.html` — "Apprentice Deposits" and "Sovereign Memberships" funding cards | **live**, both reporting `$0` "launching Feb 2026" | **Done** in `46b2ec56`. Both cards describe retired products; removed, stale date qualifier dropped. |
| BSA `pricing.html` | **NOT selling anything** — correction | I reported this as selling a "$19 / ~50,000 sats" tier. Wrong. It has been a meta-refresh redirect stub since before today with its old price table inside a balanced HTML comment (16 opens, 16 closes). Nothing rendered. Its stub now points at `/` instead of the hidden membership page. |
| Supabase `evidence-a-proxy` edge function | **already gone** | No action. Verified absent from the project today. |
| `~/projects/_secrets/evidence-a-proxy-token.txt` | **already gone** | No action. Only `ast-review-token.txt` remains, which is current. |
| Worktree `/private/tmp/tsa-master` | prunable | `git worktree prune` in the hub. |
| Hub duplicate branches: `feat/assignment-studio`, `feat/assignment-studio-only`, `feat/esa-academy-homepage` (identical commit to `-v2`), `esa-recovery-2026-09-12` (identical commit) | orphaned duplicates | Delete **after** the ESA branches are reconciled, not before. |

---

## 5 · The ESA intervention hierarchy, pinned to A4

Ships with exactly **three** tiers, in this order:

1. **NO CHANGE**
2. **ADD ONE SHORT INDEPENDENT CHECK** (~5–10 min; entry/exit ticket, oral question, transfer,
   diagnosis, prediction, representation, reverse, generation, classification —
   **never default to an exit ticket**)
3. **NO CHEAP CHECK**

### `MODIFY ONE EXISTING ITEM` — out of pilot scope

Recorded here, not implemented. Not in the pilot. H2 is not run.

**Why it stays out, in one sentence that must remain visible:** H1's failure was not a bypassed
gate — all four unnecessary interventions passed gates 1–3 legitimately. Gate 1 simply began
decomposing claims *more finely* once a cheap remedy existed, finding the finer pieces absent
("names *which* technique" vs the claim's "names the technique"). **The cost of the remedy had
been doing load-bearing work as a restraint mechanism.** A2 made the model earn permission;
H1 quietly made permission cheap again. Restraint is **structural, not dispositional**.

Measured: restraint 0.968 → 0.871, unnecessary interventions 1 → 4, stability failed.
A4 by contrast: stability 5/5, restraint 1.000, recall 1.000, 25/25.

Reopening this tier requires evidence, not preference — see falsification condition 2.

---

## 6 · Skills pass

One question, asked of every skill: **does this end in something a human outside my head
receives, or in a report to me?**

### The finding is the ratio

Roughly 60 skills are installed across the account, two plugins, and four repos. By the test
above, about **two-thirds end in a report to Dalia**. The generative half is real and good —
it is not short of skills that make pages, lessons, interactives and posts. What it has is a
large second layer that produces analysis *about* the first layer.

That layer is not worthless. It is how the H1 finding got caught. But it is self-fed: an audit
skill's output is an input to another audit skill, and none of it is load-bearing on a teacher,
a reader, or a buyer. Today is itself an instance — an inventory day whose one outward-facing
act is five emails.

**Recommendation: no deletions today.** A skills cull is a project, and the brief says this is
thirty minutes. What matters today is the count, and that the ship gate is an email rather than
a report.

### Ends in something a human receives — the ones that earn their place

Writing and publishing: `my-writing-style`, `substack-writer`, `fsa-educational-writer`,
`notes-to-one-pager`, `essay-evidence-brief`, `distribution-run`.
Building what a learner touches: `build-lesson-page`, `build-demo-skeleton`,
`build-interactive`, `create-education-viz`, `build-curriculum`, `copy-to-lesson-converter`,
`curriculum-from-notes`, `institutional-page-builder`, `refactor-lesson-content`,
`seo-page-upgrade`, `web-artifacts-builder`, `canvas-design`, `theme-factory`.
Reaching people: `find-prospect-contacts`, `capture-and-route`, `advisor-channel-motion`,
`offer-design`.
Governing what readers see: `brand-guidelines`, `bsa-brand-steward`, `brand-clarity-review`.

### Ends in a report — the layer to watch

`content-inventory`, `explore-corpus`, `analyze-content`, `build-education-dashboard`,
`map-learner-paths`, `audience-resonance-auditor`, `revenue-instrumentation`,
`demand-discovery`, `insight-brief`, `morning`, `learn`, `import-memory`,
`reusable-component-finder`, `plan-big-feature`, `skill-creator`, `mcp-builder`,
`data-context-extractor-for-education`, and both delegation skills.

Two that sit on the line and should be judged on use rather than description:
`audit-claims` (ends in a report, but the report changes published sentences) and
`jurisdiction-research` (ends in profiles that feed pages).

### Duplicates

**1 · `owner-approval-delegation` / `evidence-based-owner-delegation` — NOT RESOLVED TODAY.**
Both are **account** skills, synced from the Claude account rather than stored in any connected
folder, so neither SKILL.md is readable from this session. Merging them means replacing one
skill's entire SKILL.md, and doing that from the names alone would throw away whichever
distinctions the second one was written to add. Needs their text in front of me — paste both, or
connect wherever they are on disk, and the merge is a ten-minute job.

**2 · `content-inventory` — a duplicate cluster the brief did not name.** Four artifacts:

| Artifact | What it is |
|---|---|
| `hub/skills/content-inventory/SKILL.md` | the live local skill (`d8d8cc46…`) |
| `hub/skills/content-inventory-workspace/skill-snapshot-v1/SKILL.md` | an older snapshot (`41a97334…`), differs only in description wording |
| `hub/skills/content-inventory.skill/` | a packaged bundle of the same thing |
| `anthropic-skills:content-inventory` | the account copy that actually loads |

The account copy is the one that runs. The three in the repo are a workspace — iterations 1–3,
a grader, a review folder — from building it. That is fine as history, but it should be named as
history: the repo copies are not what executes, and editing them changes nothing.
