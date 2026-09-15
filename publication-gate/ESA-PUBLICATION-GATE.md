# ESA Publication Gate

**One page. Run it before calling any public ESA page, product or tool "published."**

A surface is *published* when a person who is not us can reach it and form an impression of ESA
from it. Until it passes this gate it is deployed, not published. Those are different words and
we should keep using them differently.

Two parts, and both are required:

- `node publication-gate/check.mjs` — the things a machine can actually prove.
- The **visual review** below — the things it cannot. No script has ever looked at a page and
  known it was off brand. Do not let a green check stand in for opening the page.

Run the script first, fix what it finds, then do the visual review last, on the deployed URL.

---

## A · ESA identity

| # | Check | How |
|---|---|---|
| A1 | `<html data-platform="esa">` on every page of the surface | auto |
| A2 | Loads `/css/esa-platform.css` after `/css/tsa-brand.css` (or its own stylesheet defining `[data-platform="esa"]`) | auto |
| A3 | No hard-coded child-brand hex — no TSA silver `#C7CCD1`, no BSA `#FF9A00`, no FSA `#34D399` | auto |
| A4 | **The ESA blue actually renders.** Accent, fade and italic display word are blue on the live page | **visual** |
| A5 | Typography, spacing and components match the ESA homepage — Playfair display, Inter body, JetBrains Mono eyebrows, `◆` section tags, sharp radii | **visual** |
| A6 | Does not read as a generic TSA page. A teacher landing here cold should be able to say which academy this belongs to | **visual** |
| A7 | TSA appears as parent, not as owner — endorsement line, footer link, never the primary identity in the header | **visual** |
| A8 | No component paints from an accent token this page never bound — an unbound token falls back to TSA silver, silently | auto |

> **The failure this gate exists to catch.** `tsa-platform-variants.css` binds the accent slots
> for BSA and FSA but never did for ESA. A page could set `data-platform="esa"`, inherit the
> shared foundation exactly as designed, and still render in TSA silver — with nothing broken,
> no error, and no warning. That is why A2 exists as a separate check from A1, and why A4 is a
> human looking at the page rather than a grep.

## B · Navigation

| # | Check | How |
|---|---|---|
| B1 | The surface is reachable from the ESA homepage by a deliberate link, placed where it belongs in the product story — not buried in the footer | auto (link exists) + **visual** (placement) |
| B2 | Every page of the surface has a visible route back to `/esa/` | auto |
| B3 | No orphan public tools: every reachable `.html` is either a declared surface or explicitly declared unlisted, with a reason | auto |
| B4 | Internal links stay inside ESA where the destination is ESA's | auto |
| B5 | TSA institutional links still available where they belong (footer, parent endorsement) | auto |

> **"Unlisted" is a decision, not a default.** A page nobody links is still public. Anyone with
> the URL, and any crawler that finds it, sees it. If a surface should not be found, it needs
> `noindex` *and* a line in the manifest saying so, so the next person knows it was a choice.

## C · Technical publication

| # | Check | How |
|---|---|---|
| C1 | Served from the ESA project on the ESA domain/route | auto (route resolves) |
| C2 | Points at the **ESA** Supabase project `svrbfpjoufhhxdshwlvt` | auto |
| C3 | No BSA operational dependency, unless the manifest declares it as rollback | auto |
| C4 | No secrets in anything shipped to the browser — service-role keys, access tokens, API keys. A `sb_publishable_*` key is not a secret | auto |
| C5 | Every local asset the page asks for exists | auto |
| C6 | Live page: no console errors, no failed requests | **visual** (DevTools) |
| C7 | Backend smoke check passes | `node assignment-studio/esa-backend-smoke.mjs` |
| C8 | **After deploy:** excluded paths return 404. `.vercelignore` is applied by Vercel, not by the script — until a deploy is checked, the boundary is intended, not verified | **visual** |
| C9 | No unresolved owner decision on the surface | auto |

> **What the deployment publishes is a subset of what the repo keeps.** Vercel serves this
> repository statically, so every committed `.html` is a public page unless `.vercelignore`
> says otherwise. That file is the serving boundary: listing something there keeps it in the
> repo and in git history while removing its URL. Research, prototypes, tooling and source
> belong there. Taking a file *out* of `.vercelignore` is a publication decision and comes
> back through this gate.

> **C9 exists so a run cannot go green while a decision is outstanding.** A finding waiting on
> the owner is a FAIL. It is not softened to a warning to make the output look clean.

## D · Presentation quality

| # | Check | How |
|---|---|---|
| D1 | Desktop (1280) and mobile (375) both work, no horizontal scroll | auto (declared) + **visual** |
| D2 | Body text readable; line length not running the width of a desktop screen | **visual** |
| D3 | Contrast: body and muted text ≥ 4.5:1, including the fade at its weakest stop | **visual** |
| D4 | Keyboard: skip link works, focus visible on every control, tab order sane | **visual** |
| D5 | No broken states — no empty containers, overlapping text, placeholder copy, or dead buttons | **visual** |

---

## The visual review

Not optional, not delegable to the script. On the **deployed URL**, not localhost:

1. Open the ESA homepage and the surface side by side. Do they look like the same institution?
2. Resize to 375px. Walk the whole page.
3. Tab through it with the keyboard from the top.
4. Open DevTools console and network. Reload. Anything red?
5. Follow the route back to ESA. Then follow the route from the ESA homepage to here.
6. Ask the honest question: **if this were the only ESA page someone ever saw, what would they
   think ESA is?**

Sign it off with a date and a name in the surface's own notes. "Ran the script" is not sign-off.

---

## Two manifests

`check.mjs` carries both halves of the boundary, and the gate checks both:

- **`SURFACES`** — what ESA publishes. Not in it and still reachable? The gate reports an orphan.
- **`INTERNAL`** — what ESA deliberately keeps without publishing: research, prototypes, source
  material, tooling, the pilot admin UI. Each entry must be excluded by `.vercelignore` **and**
  still present in the repository. Losing either is a FAIL — one means it leaked, the other means
  preservation failed.

Adding a surface means an entry in `SURFACES` and a gate run. Retiring one means moving it to
`INTERNAL` and adding it to `.vercelignore`, never deleting it.
