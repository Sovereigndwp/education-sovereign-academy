# Planted fixtures — re-run after evaluator fixes (2026-09-08, audit prompt v4, edge function v7)

Run by Claude through the deployed `audit_text` action against the same four confirmed harness assignments as run `2026-09-08-15-56`. Each fixture was run twice to check run-to-run stability.

| case | fixture | mode | preservation | usefulness | adversarial | stable across 2 runs |
|---|---|---|---|---|---|---|
| g10-ss-gilded-age | clean_pass | support | PASS ✓ | USEFUL ✓ | UNDERMINED ✓ (exp WEAKENED/UNDERMINED) | yes |
| g5-math-fractions | valid_but_excessive_burden | visible | REVIEW ✓ (25-min constraint + workload rules, all review-level) | NOT_USEFUL ✓ | WEAKENED ✓ (conference credited as independent check) | yes |
| g8-ela-evidence | polished_subtle_invariant_violation | support | BLOCK ✓ (required_thinking; "give away reasoning") | USEFUL ✓ | UNDERMINED ✓ | yes |
| g8-sci-ramp-data | apparent_ai_resistance_bypassable | visible | BLOCK / PASS (exp REVIEW/BLOCK) — 1 of 2 runs missed the honesty-statement finding | USEFUL ✓ | UNDERMINED ✓ | usefulness/adversarial stable; preservation varies |

## What was wrong in run 2026-09-08-15-56, and what changed

| mismatch | category | fix |
|---|---|---|
| G5 preservation BLOCK | evaluator defect (3 findings) + contract-text ambiguity (2 findings) | severity calibration: teacher_constraints and the workload/burden MUST-NOTs are review-level (usefulness owns magnitude; v0.1's own "confuse inconvenience with assessment validity"); block reserved for instructional failures and the instructional MUST-NOTs; enforced in code (`BLOCK_RULES`, `REVIEW_ONLY_INVARIANTS`). "Exceeded" for the three learning fields is derived from two explicit booleans (`still_required`, `weakened_or_given_away`) rather than the model's label. |
| G5 adversarial UNDERMINED | evaluator defect | the model acknowledged the conference but did not let it move the verdict. Verdict is now derived in code from `cost_to_student` + `independent_check` (detection-based "survival" can never raise it); prompt scans for conference / in-class / before-you-begin. |
| ELA usefulness NOT_USEFUL | evaluator defect (validity leakage) | the Usefulness audit no longer receives the learning target / required thinking / required evidence at all — only the teacher's practical constraints, the original, and the version. Plus an `ignored_validity_notes` sink and per-student definitions of editing and grading burden. |
| Science usefulness NOT_USEFUL | evaluator defect (same leakage) + a real usability point (ten personalised keys) | same fix; calibration: a ten-row lookup prepared once = "slightly more", never "much more". |
| Science adversarial WEAKENED | evaluator defect | "harder to copy from peers" and "AI-sounding language might be noticed" no longer count as surviving signal (prompt + code derivation). |
| Adversarial in Support/Advanced | over-triggering risk (owner point 6) | UNDERMINED now triggers the bounded repair only in Visible mode; Support/Advanced record it and it stays out of "Check this". |

## Fixture change (not a gold-expectation change)

`g5-math-fractions/fixtures/visible-valid-excessive-burden.md`: dropped box (d) "check with a second method" and made box (c) "words or a labelled picture". The audit consistently read both as removing routes the gold contract explicitly protects (strategy choice; "a labelled picture") — a correct reading of the fixture text. The fixture now tests what it claims to: instructionally faithful, practically bad. Burden unchanged in kind (27 boxes, one-page reflection, a conference per student). Gold expectations were not changed.

## Known limitation

Run-to-run variance remains at temperature 0.2: the Science preservation verdict flipped between BLOCK and PASS on the honesty-statement finding across two runs. The verdicts that matter for each fixture's purpose (ELA BLOCK; G5 NOT_USEFUL with preservation not BLOCK; Science UNDERMINED; G10 PASS/USEFUL) were stable. Do not tune further against these four; real teacher feedback is the next evaluation layer.
