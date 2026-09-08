# Gold harness — human review

Run: 2026-09-08-19-27 · endpoint: https://rdqwoqdvqpedlsbaghtr.supabase.co/functions/v1/as-studio

Ground truth is the reviewer's verdict. Fill the last three columns. `ship` = usable as-is; `edit` = usable after a named fix; `reject` = broke the contract (name the boundary from gold.json).

| case | mode | auto: statuses in range | auto: REVIEW_REQUIRED count | auto: items orig→new | audits P/U/A (✗ = outside expected) | verdict (ship/edit/reject) | boundary violated | reviewer note |
|---|---|---|---|---|---|---|---|---|
