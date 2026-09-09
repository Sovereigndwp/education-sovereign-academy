# Abandoned generations reach a terminal state — change note

**Branch:** `fix/as-stale-generation`, cut from the frozen baseline `fe1903e`.
**Status:** committed, **not merged, not deployed, not applied.** The frozen baseline is untouched.
**Scope:** this defect only. No contract change, no mode change, no evidence-layer work, nothing outside
`assignment-studio/`.

## The defect

`transformVersion()` runs as background work through `EdgeRuntime.waitUntil`. If the edge isolate is
reclaimed mid-run — CPU limit, wall clock, or an eviction between the transform and the audits — nothing
catches it. No error is thrown, because the process that would throw is gone. The row keeps
`status: "generating"` and whatever `stage` it had reached, permanently.

No watchdog inside the function can fix this: the thing that would fire it is the thing that died. The
single bounded retry inside `runTransform` does not help for the same reason. Detection has to happen on
the read side.

What the teacher saw: the client polled to `n > 120` (about nine minutes) and then said *"Reload this page
in a minute — the version will appear here when it is ready."* In this failure mode that sentence is false.
It will never be ready.

## The fix

| | |
|---|---|
| `sql/2026-09-09-stale-generation.sql` | Adds `as_versions.stage_at timestamptz default now()`, backfills existing rows from `created_at`, and indexes the unfinished partition. Additive and idempotent. |
| `engine.ts` · `stage()` | Every stage transition now stamps `stage_at`. |
| `engine.ts` · `isStale()` / `reapIfStale()` | A row still claiming `generating` whose stage has not advanced within the budget is moved to `status: "failed"`, `stage: "failed"`, with an error that names the stage it stopped at. Guarded on `status=eq.generating` so a late-finishing background job and the sweep cannot clobber each other — whichever writes first wins and the other matches no rows. Never throws; a failed sweep must not break a read. |
| `engine.ts` · `sweepStale()` | Reaps abandoned rows nobody is polling any more, bounded to 25 per call, so `generating` is not a resting state in the metrics either. |
| `as-studio/index.ts` · `get_version` | Runs `reapIfStale` on the polled row — the check happens where someone is actually waiting, rather than scanning on a timer. |
| `as-studio/index.ts` · `get` / `versionsOf` | Resuming the page reaps this assignment's own stale rows, and fires `sweepStale()` in the background without awaiting it. |
| `studio/index.html` | Stops promising. The lost-contact message no longer says the version will appear; both failure paths end in *"Press Transform to make it again."* |

**The budget: `STALE_MS = 6 minutes.`** Worst legitimate run is transform (≤2 attempts, ~60s each) → three
parallel audits (~30s) → at most one repair transform (~60s) → re-audit (~30s) ≈ four minutes. Six minutes
is not a slow run any more. The client polls to roughly nine minutes, so the server now reaches a verdict
and the client shows a real reason *before* it would otherwise have given up — which is the whole point.

## The retry path

`fail()` already re-enables the **Transform** button, so retry was reachable; what was missing was a true
terminal status to trigger it and copy that told the truth. A retry creates a new version row, which is
correct — nothing half-written is reused.

## What is deliberately not done

- **Nothing is applied or deployed.** The migration must be applied *before* this code is deployed: with no
  `stage_at` column the `stage()` PATCH returns 400 and every transformation fails loudly. Order is
  migration, then deploy, then `deploy.mjs --check`.
- No cron, no scheduled function, no new endpoint. The sweep rides on reads that already happen.
- No change to what a transformation does, to the contract, or to the three audits.
- One residual case, named rather than hidden: a generation that is reaped at six minutes and then
  finishes at eight will find its row already `failed` and its late write will match nothing, so the work
  is discarded rather than surfacing under a teacher who has already retried. That is the safe direction,
  and it is why the guard is on the row rather than on a timestamp comparison.

## Verification

`deno check functions/as-studio/index.ts` — passes. The failure path itself is not unit-tested: reproducing
it means killing an edge isolate mid-run, and there is no test harness here that can. `isStale()` is a pure
function and is the piece worth a test if this ever gets one.
