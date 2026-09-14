# Tracking sheet — schema

**Status:** draft for Dalia's approval · 2026-09-04. One row per **submission** (a teacher who sends three assignments has three rows sharing a `teacher_id`). Every §7 category is covered; the columns marked *added* are ours, each with the reason. The CSV header (`tracking-sheet.csv`) is generated from this table and is ready to paste into Google Sheets.

**Two sheets, not one.** Teacher names and emails live in a separate `contacts` tab keyed by `teacher_id`, never in the analysis sheet. This keeps the sheet you filter, chart, and one day hand to a collaborator free of PII. The analysis sheet below is the one that matters.

**Principle (from §7):** behavior over opinion. Every "response" column records something the teacher *did*, with a date. Opinions are captured only as verbatim text, never as a rating.

---

## Columns

Types: `id` · `text` · `enum` (one of the listed values) · `multi` (semicolon-separated subset of listed values) · `int` · `number` · `bool` (TRUE/FALSE) · `date` (YYYY-MM-DD) · `datetime` (YYYY-MM-DD HH:MM) · `computed` (formula, don't type).

### Identity & status

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `submission_id` | id | S-001, S-002 … | Primary key. |
| `teacher_id` | id | T-001, T-002 … | Links submissions from the same teacher; the 2nd/3rd-submission metrics (§8) are computed from this, and it's the join key to the `contacts` tab. |
| `phase` | enum | `0-dry-run` · `1-signal` · `2-measure` · `3-channel` | §8 thresholds are measured on the Phase-2 cohort only. Without this column you cannot compute them honestly. |
| `cell` | enum | `math` · `ela-history` | The wedge vs. the 20-teacher contrast cell (locked decision 4). |
| `status` | enum | `asked` · `submitted` · `in-review` · `returned` · `closed` · `withdrawn` · `refused` · `refused-student-work` · `over-cap` | Where each row is in the funnel; the submission-rate denominator is rows with `status ≠ asked`-only after 7 days. |

### Source (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `channel` | enum | `direct-email-cold` · `direct-email-warm` · `reddit` · `facebook-group` · `referral` · `conference` · `personal-network` · `other` | Which channel produces *submitters*, not clicks (§6 Phase 3). |
| `channel_detail` | text | subreddit / group name / subject line used / mod reply | Lets you tell apart two subject lines or two groups inside one channel. *Added.* |
| `ask_date` | date | | Start of the friction clock. |
| `referred_by` | text | a `teacher_id`, or free text if not a participant | The ≥ 10% unprompted-referral metric (§8) and the flywheel test. |
| `role` | enum | `teacher` · `dept-chair` · `coach` · `admin` · `other` | Chairs and admins are the paid-path buyers; note when they arrive as submitters. |
| `subject` | enum | `algebra1` · `geometry` · `algebra2` · `precalc` · `stats` · `other-math` · `ela` · `history-social` · `other` | Corpus cell (with `grade_band`) for the N ≥ 20 rule. |
| `grade_band` | enum | `6-8` · `9-10` · `11-12` · `mixed` | Same. |
| `school_type` | enum | `public` · `charter` · `private` · `international` · `other` | Budget context for the paid path (Title II is public-school money). |
| `region` | text | state / country, optional | Aggregate report context only. Never school name. |

### Friction (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `submit_datetime` | datetime | | End of the friction clock. |
| `hours_ask_to_submit` | computed | `=(submit_datetime − ask_date)*24` | "Fast unprompted submission = acute pain" (§7). The single cheapest pain gauge in the experiment. |
| `reminder_needed` | bool | | Whether the 7-day nudge was sent before they submitted. |
| `reminders_sent` | int | 0 · 1 | Policy is max 1 (05 §1c). A 2 here is a process failure. |

### Their words (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `worry_verbatim` | text | exact words, no paraphrase | "The single most valuable artifact in the whole experiment" (§7). This is the language the product must speak. Copy-paste, never summarise. |
| `worry_prompted` | enum | `unprompted-email` · `unprompted-upload-note` · `form-field` · `asked-in-followup` · `none` | The §8 metric says *unprompted*. This column is what lets you compute it honestly whichever way the form question (04 §C) is decided. *Added.* |

### Assignment metadata (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `assignment_title` | text | teacher's own title | Reference. |
| `assignment_type` | enum | `take-home` · `homework-set` · `project` · `in-class-test` · `quiz` · `essay` · `dbq` · `lab` · `presentation` · `other` | Corpus structure; and the paid-path metric (07) is computed over types. |
| `length` | text | points / pages / words | Base for the teacher-minutes estimate; normalise later, not now. |
| `format` | enum | `pdf` · `docx` · `gdoc` · `photo` · `pasted-text` · `lms-export` | Tells you what the eventual intake must accept. |
| `topic` | text | unit / topic | Corpus. |
| `authorship_bucket` | enum | `teacher-authored` · `district-mandated` · `publisher-derived` · `mixed` | **Copyright routing (§9).** Determines what may enter the corpus. |
| `mixed_bucket_notes` | text | which parts are the teacher's | Without this, `mixed` rows can't be routed. *Added* (see 03 Part C). |
| `rights_confirmed` | bool | | The teacher's affirmation at submission (§9). |
| `consent_corpus` | bool | | Separate from consent to audit (§9). Corpus-eligible only if TRUE **and** bucket is `teacher-authored` (or abstract-only if `district-mandated`). |
| `consent_contact_followup` | bool | | May we email about the aggregate report / paid option. |
| `student_work_present` | bool | | Should be FALSE. TRUE triggers the deletion process. |
| `deleted_date` | date | | Written confirmation date for the student-work case (§9). |
| `deletion_confirmed_date` | date | | Date Email 2 (04) was sent. |

### Our review (capacity and the judgment itself)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `review_minutes` | number | Dalia's actual minutes on this audit | The plan's capacity estimate (45–60 min/audit, 75–100 h per 100) is **modeled**; this column replaces it with observed. *Added.* |
| `band_original` | enum | `whole-artifact` · `most-but-not-step` · `assist-evidence-survives` | The three-band judgment on the original (§5). Categorical, never numeric. |
| `band_reason` | text | the task element that drives it | A band without its reason violates locked decision 1. |
| `band_check_method` | enum | `reviewer-judgment` · `ran-1-model` · `ran-2-models` | Whether the band is an opinion or was checked (01 §2). *Added.* |
| `invariant` | text | one line | Section 3, for corpus pattern-finding. |
| `mechanism` | enum | `prediction-checkpoint` · `selected-evidence` · `worked-reasoning-artifact` · `defense-questions` | Which of the four was chosen; the distribution tells you what to automate first. |
| `band_redesign` | enum | same three values | Where the redesign lands. For the paid-path metric this should be `assist-evidence-survives`. |
| `est_class_min_orig` / `est_class_min_new` | number | per section | The audit's cost line, our estimate. *Added* (§11). |
| `est_review_min_orig` / `est_review_min_new` | number | per student | Same. |
| `what_was_removed` | text | | The "where the minutes came from" line — pattern-finding for the paid product. *Added.* |
| `return_datetime` | datetime | | |
| `turnaround_hours` | computed | `=(return_datetime − submit_datetime)*24` | Against the 48–72 h promise. |

### Our accuracy (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `objective_confirmed` | enum | `confirmed` · `partially` · `corrected` · `no-response` | §8: ≥ 75% confirmed = PASS; < 60% = KILL. "Our version of required corrections." `partially` counts as *not* confirmed for the threshold — be strict. |
| `objective_correction_verbatim` | text | exact words | The engine's error log. Copy-paste. |

### Behavioral response (§7) — the validation ladder

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `opened` | enum | `unknown` · `yes` | The plan lists "opened"; without a tracking pixel (which 04 argues against) this is `unknown` unless they say so. Kept so the ladder matches §7; expect it to be mostly `unknown`. |
| `reply_received` | bool | | §8: ≥ 60% reply = PASS. |
| `reply_date` | date | | |
| `said_would_use` | bool | | Stated intention. Weakest rung; kept because §7 lists it. |
| `used_or_adapted` | enum | `used-as-is` · `adapted` · `not-used` · `unknown` | §8: ≥ 40% used or adapted, *with specifics*. |
| `use_specifics_verbatim` | text | what they actually changed | Without specifics, `used_or_adapted` is a claim, not a behavior. |
| `teacher_min_orig_reported` | number | | The §11 follow-up: "how long did it take you to run and review, compared with the original?" *Added.* |
| `teacher_min_new_reported` | number | | Same. |
| `minutes_comparison_verbatim` | text | exact words | "Longer, and I couldn't keep it up" is the sentence that would kill the product; you want it verbatim. *Added.* |
| `asked_for_more` | bool | | Requested another audit, a variant, the department version. |
| `submission_count_for_teacher` | computed | `=COUNTIF(teacher_id, this)` | §8: ≥ 25% send a second, ≥ 15% a third. |
| `forwarded_pattern_report` | bool | | The flywheel's "honest weak link" (§6): did anyone forward the aggregate report unprompted? Only meaningful once a report ships. |

### Monetization signal (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `monetization_signal` | multi | `none` · `asked-cost` · `asked-department` · `asked-school-wide` · `offered-intro` | §8: ≥ 5 department/school inquiries or ≥ 3 introductions across 100 = the monetization gate, "the most important one." Zero after 100 = KILL. |
| `monetization_verbatim` | text | exact words | The language the sprint offer (07) must speak. |
| `intro_to_role` | text | role only, e.g. "dept chair, Algebra" | Who they offered to introduce you to. Role, not name — names go in `contacts`. |

### Which section landed (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `sections_reacted` | multi | `1` · `2` · `3` · `4` · `5` · `6` | Which of the six they quote back or react to. "Tells us what to keep when we automate." |
| `section_quote_verbatim` | text | | The quote itself. |

### Refusals (§7)

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `refused` | bool | | Rows with `status = refused`. |
| `refusal_reason_verbatim` | text | exact words | "Negative evidence is evidence." |
| `refusal_category` | enum | `no-time` · `privacy` · `no-problem-seen` · `school-policy` · `already-handled` · `dont-trust` · `other` | Coded *after* the verbatim, never instead of it. *Added* so refusals can be counted. |

### Withdrawal & notes

| Column | Type | Allowed values | Why it matters |
|---|---|---|---|
| `withdrawal_requested_date` | date | | §9 right of withdrawal. |
| `deletion_completed_date` | date | | Must be ≤ 24 h after the request (04 Email 3). |
| `notes` | text | | Anything else. Keep it short; verbatim fields are where the value is. |

---

## The `contacts` tab (separate, PII, never shared)

| Column | Type |
|---|---|
| `teacher_id` | id |
| `teacher_name` | text |
| `teacher_email` | email |
| `intro_contact_name` | text (only if they offered an intro and gave a name) |

---

## Computed views to build on top (not columns)

- **Submission rate** = rows with `status ∈ {submitted…closed}` within 7 days of `ask_date` ÷ rows asked, Phase 2 only. PASS ≥ 30%, KILL < 15%.
- **Unprompted worry rate** = `worry_prompted ∈ {unprompted-email, unprompted-upload-note}` ÷ submissions. PASS ≥ 50%. (If Dalia keeps the form field, also compute the inclusive version and report both.)
- **Reply rate**, **use rate** (with specifics), **2nd/3rd rate**, **referral rate**, **objective accuracy** — as §8.
- **Monetization gate** = count of rows with `monetization_signal ∋ asked-department | asked-school-wide` + count of `offered-intro`, across all 100.
- **Teacher-minutes delta** = median of (`teacher_min_new_reported` − `teacher_min_orig_reported`) among `used_or_adapted ≠ not-used`. This is the §11 test. No threshold was pre-registered for it in the plan — **Dalia should set one before Phase 2** (suggestion: if the median reported change is > +10% review time *and* fewer than half say they'd keep doing it, treat as a kill-level finding for the current mechanism set).
- **Corpus eligibility** = `consent_corpus = TRUE AND authorship_bucket = teacher-authored` (full) or `= district-mandated` (abstract only). Everything else: audit only.

---

## What is deliberately not here

- No satisfaction rating, no NPS, no "how useful was this 1–5." Opinion columns invite the exact data §7 calls worthless.
- No numeric substitution score. Three bands, with reason. Locked decision 1.
- No school name. Re-identification risk, no analytic use.
- No column for student anything.
