# Planted fixtures — audit behaviour vs expected

The four planted cases: polished-but-violating · valid-but-burdensome · apparent-resistance-bypassable · clean pass. ✓ = audit verdict inside the expected set.

| case | fixture | mode | preservation | usefulness | adversarial | reviewer note |
|---|---|---|---|---|---|---|
| g10-ss-gilded-age | clean_pass | support | PASS ✓ | USEFUL ✓ | WEAKENED ✓ | |
| g5-math-fractions | valid_but_excessive_burden | visible | BLOCK ✗ (exp PASS/REVIEW) | NOT_USEFUL ✓ | UNDERMINED ✗ (exp SURVIVES/WEAKENED) | |
| g8-ela-evidence | polished_subtle_invariant_violation | support | BLOCK ✓ | NOT_USEFUL ✗ (exp USEFUL/USEFUL_WITH_EDITS) | UNDERMINED ✓ | |
| g8-sci-ramp-data | apparent_ai_resistance_bypassable | visible | BLOCK ✓ | NOT_USEFUL ✗ (exp USEFUL/USEFUL_WITH_EDITS) | WEAKENED ✗ (exp UNDERMINED) | |
