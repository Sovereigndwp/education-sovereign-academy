# Gold harness — human review

Run: 2026-09-08-20-40-gold-partial · endpoint: as-studio v15 (audit-2026-09-08-v5)

**Incomplete run.** 7 of 12 cases produced a version. 5 could not: they first hit a JSON-parse defect (now fixed), and the retry hit an exhausted Anthropic API credit balance. Re-run those five once credits are restored.

Ground truth is the reviewer's verdict. Fill the last three columns. `ship` = usable as-is; `edit` = usable after a named fix; `reject` = broke the contract (name the boundary from gold.json).

| case | mode | auto: statuses in range | auto: REVIEW_REQUIRED count | auto: items orig→new | audits P/U/A (✗ = outside expected) | verdict (ship/edit/reject) | boundary violated | reviewer note |
|---|---|---|---|---|---|---|---|---|
| g10-ss-gilded-age | advanced | yes | 0 | 5→5 (39→39 lines) | P:REVIEW U:NOT_USEFUL✗ A:UNDERMINED | | | |
| g10-ss-gilded-age | support | yes | 0 | 5→0 (39→88 lines) | P:PASS U:USEFUL A:UNDERMINED | | | |
| g5-math-fractions | advanced | yes | 0 | 9→9 (35→41 lines) | P:REVIEW U:NOT_USEFUL✗ A:UNDERMINED | | | |
| g5-math-fractions | support | yes | 0 | 9→9 (35→105 lines) | P:PASS U:NOT_USEFUL✗ A:UNDERMINED | | | |
| g5-math-fractions | visible | yes | 1 | 9→9 (35→125 lines) | P:REVIEW U:NOT_USEFUL✗ A:WEAKENED | | | |
| g8-ela-evidence | advanced | yes | 0 | 0→0 (34→34 lines) | P:REVIEW U:NOT_USEFUL✗ A:UNDERMINED | | | |
| g8-ela-evidence | visible | yes | 0 | 0→3 (34→48 lines) | P:REVIEW U:USEFUL A:WEAKENED | | | |
| g10-ss-gilded-age | visible | — | — | — | — | | | NOT RUN: Unexpected non-whitespace character after JSON at position 4263 (line 19 column 1) |
| g10-ss-gilded-age | visible | — | — | — | — | | | NOT RUN: Anthropic API 400: {"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is t |
| g8-ela-evidence | support | — | — | — | — | | | NOT RUN: Expected ',' or '}' after property value in JSON at position 570 (line 3 column 511) |
| g8-ela-evidence | support | — | — | — | — | | | NOT RUN: Anthropic API 400: {"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is t |
| g8-sci-ramp-data | advanced | — | — | — | — | | | NOT RUN: Expected ',' or '}' after property value in JSON at position 1697 (line 3 column 1633) |
| g8-sci-ramp-data | advanced | — | — | — | — | | | NOT RUN: Anthropic API 400: {"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is t |
| g8-sci-ramp-data | support | — | — | — | — | | | NOT RUN: Expected ',' or '}' after property value in JSON at position 1392 (line 3 column 1328) |
| g8-sci-ramp-data | support | — | — | — | — | | | NOT RUN: Anthropic API 400: {"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is t |
| g8-sci-ramp-data | visible | — | — | — | — | | | NOT RUN: Expected ',' or '}' after property value in JSON at position 2039 (line 3 column 1975) |
| g8-sci-ramp-data | visible | — | — | — | — | | | NOT RUN: Anthropic API 400: {"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is t |
