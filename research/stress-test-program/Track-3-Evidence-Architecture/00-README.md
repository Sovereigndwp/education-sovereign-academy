# Track 3 — Composable Evidence Architecture + free sample product

**Status:** drafts for Dalia's approval · 2026-09-04 · No software built. Nothing sent. Nothing published. Tracks 1 and 2 untouched. No canonical TSA/FSA/BSA material altered.

Start with `SUMMARY.md` (verdict) and `09-PROVENANCE-AND-HYPOTHESIS-LOG.md` (why the direction changed). Then open `06-EVIDENCE-PACK.pdf` at page 2.

## Files

| # | File | What it is |
|---|---|---|
| 00 | `00-README.md` | This index, approvals, and the file-structure note |
| 01 | `01-ONTOLOGY-v0.1.md` | The ontology: objects, evidence conditions (3 required), 8 primitives with the ten fields each, variant rule, scoring, where it sits in ECD / two-lane / AIAS, references |
| 02 | `02-COMPOSABLE-SCHEMA.json` | JSON Schema (draft 2020-12) for one record; field removals/additions explained in the description |
| 03 | `03-EXAMPLE-RECORDS.json` | 8 fully populated records (7 with items, 1 with `no_short_check_reason`); 12 items × 3 forms; source of truth for the pack |
| 04 | `04-ONTOLOGY-STRESS-TEST.md` | Part 5: failures, ambiguities, overlaps, fields, key verification, why no v0.2 |
| 05 | `05-EVIDENCE-PACK-CONTENT.md` | Full text of the pack, exported from the HTML for review without a PDF tool |
| 06 | `06-EVIDENCE-PACK.pdf` + `06-EVIDENCE-PACK.html` | The product: 10 pages, letter, print-ready. HTML is the source; PDF rendered from it |
| 07 | `07-ITS-JUST-A-QUIZ-TEARDOWN.md` | Part 4: the objection taken seriously; what is and isn't reproducible; revisions it forced |
| 08 | `08-COMMERCIAL-USEFULNESS-REVIEW.md` | Part 6: the two director tests, the strongest case against, pricing posture |
| 09 | `09-PROVENANCE-AND-HYPOTHESIS-LOG.md` | Part 7: H1 → falsification → H2; current uncertainty; what must not be read into this |
| — | `SUMMARY.md` | Verdict and the one-paragraph case |

File structure is exactly as the kickoff required; one addition: `06-EVIDENCE-PACK.html` alongside the PDF, because the HTML is the editable source and the PDF cannot be revised without it. `render.py` (3 lines of Playwright) is included so the PDF can be regenerated from the HTML after edits.

## Regenerating the PDF after an edit

Edit `06-EVIDENCE-PACK.html`, then `python3 render.py` (needs Playwright + Chromium). If an edit changes an item, change `03-EXAMPLE-RECORDS.json` first and re-run the key check in `04` §6 — the JSON is the source of truth, the HTML is a rendering of it done by hand for v0.1.

## What Dalia must decide before anything is sent

Ordered by how much depends on it.

1. **Topic and claim set.** Linear functions, seven claims + one honest hole. Approve, or name the topic you would rather lead with (quadratics and exponential functions are the obvious alternatives; the ontology's trigger for a v0.2 is a second topic — 04 §7).
2. **The eight primitives and the rejection of "Explain."** Approve the vocabulary or rename. Names appear on p. 3 of the pack.
3. **"Delegable: full" as printed language on the map.** It is honest and blunt (08, Test 1). Keep, soften to "producible from the task text," or drop the column and keep only the gap.
4. **The LC-8 row.** Keeping "no short check reaches this claim" in a sales-adjacent artifact is a deliberate restraint signal. Approve or move to teacher notes.
5. **Item-level review by you, as a teacher.** Every key is script-verified; no item has been read by a second human. Items most in need of your eye: EC-10 (language load), EC-04 (assumes the taxi problem was set), EC-11 (open response, scoring burden).
6. **Cost figures.** All modelled. Run one check page with one class and replace the numbers before sending; or keep "modelled" labels and send.
7. **Relationship to Track 2.** The Evidence Architecture is what a Track-2 audit should now recommend in its Section 5 instead of a single information-based mechanism (09). Decide whether Track 2's 01 template is amended to point here, or Track 3 stands alone as the free deliverable and Track 2 becomes the paid diagnostic. This decision changes the outreach copy.
8. **Cover email routing line** — "open page 2 first" — belongs in Track 2's 05 file, not the pack (08).
9. **Pricing stays absent** from the pack. Track 2's 07 sprint anchor is the only approved-for-drafting price and is sent only after an unprompted inquiry. Confirm.
10. **Attribution line** on p. 10 ("Written and checked by a working secondary mathematics teacher") — true only once item 5 is done. Do not send before.

## Constraints honoured (from the kickoff)

No software · no new teacher-demand research · secondary-math wedge not reopened · homework not called worthless (p. 1: "still good practice") · no "AI-proof" / "AI-resistant" claims (the phrase appears only to be disclaimed) · no single-item mastery claim (every item carries "cannot support") · no numerical AI-resistance score · no student PII · established terms used and cited (ECD, two-lane, POE, erroneous examples, learner-generated examples, item models, Barnett & Ceci) · ontology kept to 8 primitives / ~20 fields · the triad treated as a hypothesis and pushed back on (01 §0, §7).
