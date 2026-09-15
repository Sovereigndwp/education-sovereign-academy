# Gate run — publication boundary — 2026-09-15 (second pass)

Follow-up to `2026-09-15-assignment-studio.md`. Scope: the four boundary issues left open there.
Status: **one FAIL open, awaiting an owner decision on ESA admin access control.** Nothing pushed.

## 1 · Assessment Review — route back to ESA (FIXED)

`esa/review/index.html`, header right, one anchor appended after the quota span:
`← Education Sovereign Academy` (desktop) / `← ESA` (≤620px), using the `.ast-up` pattern already
in `as.css`. Verified on the live page: header intact, invitation gate untouched, no overflow.

Not touched: pilot logic, prompts, hierarchy, invitation flow, data collection, quota display,
`esa-review` function, `esa.css`. B2 now PASSES.

## 2 · ESA admin — OPEN, owner decision required

**What is actually true.** `esa/admin.html` is a client shell. The key is typed each visit, held
in memory only, and POSTed to the `esa-review` edge function as `{action:"admin", key}`. The
function compares it to `ESA_ADMIN_KEY` server-side and returns 403 otherwise
(`functions/esa-review/index.ts:250-253`). **No pilot data is exposed without the key.** What is
public is the surface, not the data. `ESA_ADMIN_KEY` is untouched.

**The correction to the earlier finding.** Removing the page does not remove the endpoint. Anyone
can POST `{action:"admin", key}` to the function whether or not the page exists. The page is
discoverability; the endpoint is the attack surface, and the key is the only control on it.

Options are in the session report. Recommended: exclude the admin page from the deployment via
the same `.vercelignore` boundary and run it locally (CORS is `*`, so `http://localhost` works).
This is a workflow change — admin would no longer be openable from a phone — so it is the
owner's call. Carried as a **C9 FAIL** until ruled, deliberately not softened to a warning.

Separately rulable, server-side, not required by this gate: `key !== expected` is not a
constant-time comparison and the admin action has no rate limit.

## 3 · Research publication boundary (FIXED)

**Inventory — nine HTML documents, all added 2026-09-14, none carrying a robots meta, none
linked from anywhere, all publicly readable and indexable until now:**

| File | Size |
|---|---|
| `research/ASSESSMENT-STRESS-TEST-PLAN.html` — Demand Teardown & Validation Plan | 32K |
| `research/FRACTIONS-DEMO.html` — Sovereign Classrooms fractions demo | 28K |
| `research/TEACH-BACK-FLYWHEEL-PLAN.html` — system design & plan | 36K |
| `research/TEACH-BACK-FLYWHEEL-PROTOTYPE.html` — working prototype | 32K |
| `research/TEACHER-DEMAND-DISCOVERY.html` | 20K |
| `research/TEACHER-TIME-BACK-ARCHITECTURE.html` | 28K |
| `research/TEACHER-WORK-MAP-REVISED.html` — C-sim | 24K |
| `research/TEACHER-WORK-MAP.html` — secondary math | 28K |
| `research/stress-test-program/Track-3-Evidence-Architecture/06-EVIDENCE-PACK.html` | 44K |

Plus seven `research/*.md`, `CLAUDE.md`, and three other `README.md` files, all reachable.

Checked for personal data: **no email addresses and no live invite tokens** in any served
research file. `ESA-PILOT-INVITE-EMAILS-2026-09-13.md` holds drafted templates with no
recipients. So this is a positioning and indexability failure, not a privacy breach.

**Boundary implemented: `.vercelignore`.** Files stay in the repository and in git history; they
are simply not uploaded to the deployment, so they have no URL. Nothing deleted, nothing moved,
no reference or history change — a build/serving boundary, as instructed. 20 rules covering
`research/`, `Education/`, `publication-gate/`, edge-function source, the harness, gold fixtures,
SQL, the ops scripts, pilot test scaffolding, and repository documentation.

**NOT YET PROVEN.** Vercel applies `.vercelignore` at deploy time; the gate only reads the file.
Carried as check **C8**, to be verified on the next deployment by confirming
`/research/TEACHER-WORK-MAP.html`, `/CLAUDE.md` and `/assignment-studio/README.md` return 404.

Also noted: ESA has no `robots.txt` and no `sitemap.xml`. The research pages were indexable for
roughly a day. Worth a Search Console check for any that were picked up.

## 4 · ESA accent sources — documented, divergences measured and inert

Three definitions exist. Resolved values measured in a real browser on all three surfaces:

| Token | Homepage | Review | Studio | Renders anything? |
|---|---|---|---|---|
| `--tsa-silver` | `#58A6F5` | `#58A6F5` | `#58A6F5` | yes — accents, rules, focus |
| `--tsa-platinum` | `#7DD3FC` | `#7DD3FC` | `#7DD3FC` | yes — hover |
| `--tsa-pewter` | `#6B7FA8` | `#6B7FA8` | `#6B7FA8` | yes — step numerals |
| `--tsa-fade` | ESA fade | ESA fade | ESA fade | yes — buttons, marks, italics |
| `--brand` | `#58A6F5` | `#2F6FED` | `#2F6FED` | **no consumer** |
| `--accent` | `#7DD3FC` | `#38A3F1` | `#7DD3FC` | **no consumer** |
| `--brand-solid` | `#C7CCD1` ← TSA silver | `#58A6F5` | `#58A6F5` | only `.fade-brand`, unused on ESA |
| `--tsa-fade-h` | ESA fade | silver ← TSA | ESA fade | only `.tsa-hr-fade`, unused on ESA |

**Every token that actually paints is identical across all three.** No current visual
inconsistency, so convergence stays FOLLOW-UP as instructed.

The latent risk is specific and worth naming: both unbound tokens fall back to **TSA silver**,
not to something obviously broken. The day someone puts `.fade-brand` on the homepage or
`.tsa-hr-fade` on Review, it renders silver with nothing appearing wrong — the same failure that
produced the Assignment Studio problem. Gate check **A8** now catches exactly that pairing.

## Result

`62 pass · 3 warn · 1 fail`. The single FAIL is the open owner decision in §2.

Warnings, none blocking: Review and admin have no TSA parent link (B5); admin has a thin
title/description (D5).
