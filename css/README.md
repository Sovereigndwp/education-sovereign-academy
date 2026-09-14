# Vendored TSA design foundation

These three files are a **deliberate local copy** of The Sovereign Academy's shared design
foundation, taken from `Sovereigndwp/sovereign-academy-hub` at `css/` on 2026-09-14:

- `tsa-brand.css` — the brand layer ESA pages load; it `@import`s the other two
- `tsa-design-tokens.css`
- `tsa-platform-variants.css` — includes `[data-platform="esa"]`

**The hub remains the source of truth.** This copy exists so that ESA renders correctly from its
own deployment without the hub having to be online. That independence is the point: a teacher
pilot should not go unstyled because another repository's deployment is having a bad day.

**Do not fork these.** If the shared foundation changes in the hub, re-sync deliberately and note
the date here. If ESA genuinely needs something the shared foundation does not provide, put it in
ESA's own stylesheets (`esa/review/esa.css`, `assignment-studio/as.css`), not in these files —
an unexplained divergence here is a defect, not a customisation.

Last synced from the hub: 2026-09-14. Verified byte-identical at sync time.
