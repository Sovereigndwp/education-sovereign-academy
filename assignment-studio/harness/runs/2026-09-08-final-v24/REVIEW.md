# Gold harness — human review (canonical 12/12)

Run: 2026-09-08-final-v24 · endpoint `as-studio` **v24** · contract v0.1 · transform `as-2026-09-05-v1` · audits `audit-2026-09-08-v5`

12 of 12 produced a version. 0 transform failures. 12/12 preservation statuses inside the gold-declared range. 0 receipt contradictions.

Ground truth is the reviewer's verdict. Fill the last three columns. `ship` = usable as-is; `edit` = usable after a named fix; `reject` = broke the contract (name the boundary from gold.json).

| case | mode | statuses in range | REVIEW_REQUIRED | items orig→new | audits P/U/A (✗ outside expected) | clarity/feas | verdict | boundary | note |
|---|---|---|---|---|---|---|---|---|---|
| g10-ss-gilded-age | advanced | yes | 0 | 5→5 (39→39 ln) | P:PASS U:NOT_USEFUL✗ A:UNDERMINED | 2/1 | | | |
| g10-ss-gilded-age | support | yes | 0 | 5→0 (39→145 ln) | P:PASS U:USEFUL A:UNDERMINED | 3/3 | | | |
| g10-ss-gilded-age | visible | yes | 1 | 5→5 (39→53 ln) | P:REVIEW U:USEFUL A:WEAKENED | 2/2 | | | |
| g5-math-fractions | advanced | yes | 1 | 9→9 (35→77 ln) | P:REVIEW U:NOT_USEFUL✗ A:UNDERMINED | 2/1 | | | |
| g5-math-fractions | support | yes | 0 | 9→9 (35→107 ln) | P:PASS U:USEFUL A:UNDERMINED | 2/2 | | | |
| g5-math-fractions | visible | yes | 1 | 9→9 (35→53 ln) | P:REVIEW U:USEFUL A:WEAKENED | 2/2 | | | |
| g8-ela-evidence | advanced | yes | 0 | 0→0 (34→34 ln) | P:PASS U:USEFUL A:UNDERMINED | 2/2 | | | |
| g8-ela-evidence | support | yes | 0 | 0→0 (34→101 ln) | P:PASS U:USEFUL A:UNDERMINED | 3/3 | | | |
| g8-ela-evidence | visible | yes | 0 | 0→3 (34→74 ln) | P:REVIEW U:USEFUL A:WEAKENED (repaired) | 2/2 | | | |
| g8-sci-ramp-data | advanced | yes | 1 | 7→7 (32→39 ln) | P:REVIEW U:USEFUL A:UNDERMINED | 2/2 | | | |
| g8-sci-ramp-data | support | yes | 0 | 7→0 (32→88 ln) | P:PASS U:USEFUL A:UNDERMINED | 3/3 | | | |
| g8-sci-ramp-data | visible | yes | 0 | 7→7 (32→57 ln) | P:PASS U:USEFUL A:WEAKENED | 2/2 | | | |
