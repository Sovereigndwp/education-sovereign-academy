# Gate run — Assignment Studio — 2026-09-15

Surface: `/assignment-studio/` + `/assignment-studio/studio/`
Deployment audited: `https://education-sovereign-academy.vercel.app`
Automated: `node publication-gate/check.mjs assignment-studio`
Visual review: done on the live page with the change previewed in-browser (desktop 1280, mobile 375).
Status: **Gate passed for this surface.** Not yet live — the change is committed to disk and needs
a push. One failure remains in the run, on a different surface (Assessment Review, B2).

## Before

| # | Check | Result |
|---|---|---|
| A1 | `data-platform="esa"` | **FAIL** — absent on both pages |
| A2 | ESA accent source loaded | **FAIL** — nothing bound the ESA blue |
| A4 | ESA blue renders | **FAIL** — `--tsa-silver` resolved to `#C7CCD1`, TSA silver, everywhere |
| A6 | Reads as ESA, not generic TSA | **FAIL** — logo mark "S", subtitle "The Sovereign Academy", no ESA anywhere |
| A7 | TSA as parent, not owner | **FAIL** — TSA was the identity, not the parent |
| B1 | Linked from ESA homepage | **FAIL** — named in prose, no link |
| B2 | Route back to `/esa/` | **FAIL** — header pointed to thesovereign.academy |
| A3, A5, C1–C5, D1–D5 | | PASS |

Root cause of A1–A7: `css/tsa-platform-variants.css` binds the accent slots for `bsa` and `fsa`
and never did for `esa`, while `css/README.md` claimed it did. A page could follow the documented
pattern exactly and still render in TSA silver, with nothing broken and no warning. The ESA
homepage and Assessment Review each worked around it privately. Assignment Studio did not, so it
shipped looking like TSA.

## Change made — presentation and navigation only

No change to transformation prompts, the Learning Contract, the audits, the modes, the interface
flow, the backend, or the data model. The frozen v24 baseline is untouched.

- `css/esa-platform.css` **(new)** — the missing `[data-platform="esa"]` accent swap, written once.
- `assignment-studio/index.html`, `assignment-studio/studio/index.html` — `data-platform="esa"`;
  load `esa-platform.css`; logo mark `S`→`E`; subtitle → "Education Sovereign Academy"; header
  route back to `/esa/`; footer gains ESA + "A Sovereign Academy property"; titles → ESA.
- `assignment-studio/as.css` — layout for the back-link only (long label desktop, short on phone).
- `css/README.md` — corrected the claim that caused the bug.
- `CLAUDE.md` — publishing section pointing at this gate.

## After

`50 pass · 4 warn · 2 fail` across all four ESA surfaces.

Verified by computed style on the live page with the change applied:
`--tsa-silver` → `#58A6F5`, `--tsa-fade` → `linear-gradient(135deg,#3B5BDB,#2F6FED,#7DD3FC)`.
No horizontal overflow at 375 or 1280. Header 71px, no overlap. Playfair/Inter/JetBrains Mono
all loading.

## Homepage connection — owner-ruled 2026-09-15

Two placements, both approved:

1. **"What we're building" → "Improve what already exists".** The build-state eyebrow moves from
   `Current work` to `Open to try`, the availability sentence is rewritten, and a
   `Try Assignment Studio →` link is added. The reason the product was held back stays in the
   copy — it is the most credible thing on the card.
2. **Header nav, first item.** `Assignment Studio · Current work · About · For organizations ·
   Contact`. The nav previously held only links that left for thesovereign.academy; ESA had no
   internal wayfinding at all.

Ruled: linked but **`noindex` stays**. Reachable, not advertised. Revisit when the pilot ends.

## Open failures

1. **B2 — Assessment Review has no route back to `/esa/`.** Same defect class, different surface.
   Not fixed here: it is a live invited pilot and its chrome is not mine to change mid-run.

## Open findings (not blocking this surface)

- `/esa/admin.html` is publicly reachable with no edge access control. `noindex` is not access
  control.
- Nine `research/*.html` documents are publicly reachable, unreviewed and unbranded, because
  Vercel serves the whole repository.
- Brand convergence: the ESA homepage and `esa/review/esa.css` each carry their own private copy
  of the ESA accent swap, predating `css/esa-platform.css`. Three sources of truth for one
  identity. Converging them is a follow-up, deliberately not done today.
- `.git/index.lock.stale-1789484054` needs `rm` in a real terminal — the sandbox cannot unlink.
