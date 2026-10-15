# Rebuttal D (disagreements only; all paths read 2026-10-15)

## 1. Tags and dropped lines

- Rework concentration line tagged (D) mixes methods. C1 clips dwell to the window, but "three leaves hold 49% (technical-pack-selection, flaky-test-fixes, page-speed-ranking)" is my by-leaf number. Clipped (same script as C1): rework is 51.7 h of 109.4 h in-window dwell (47%, not 39%), and the top three are technical-pack-selection 9.4 h, page-speed-ranking 7.6 h, backlink-audit-spine 6.9 h (46%). flaky-test-fixes drops out. Use one method throughout; the clipped one strengthens the rework reading.
- Dropped and should stay, as one M2 field: check_end records no load, so C5 (29.7 idle leaf-hours, cause not established) and my concurrency signal (verify red 20/31 at 2-4 concurrent runs vs 25/68 alone, durations 8.9 vs 6.4 min, confounded by check.fix retries) have no sensor. merge-attempts.jsonl already carries `pressure{cpu,memory,io}` (src/attempts.ts:8 schema; every row); write the same fields on check_end (src/run-check.ts:210-216). No cap, one field.

## 2. Door checks

None wrong. The dropped list stands.

## 3. M7 pick

Keep B's position (real dependencies only, no mechanism) and turn E's finding into a chart-audit line, not an edge rule: a done-criterion whose proof runs a consumer another leaf owns moves to that leaf. Evidence that "require the edge" cannot work: promotion-script stopped on criterion 6 needing `analysis/diff-vs-prior-run` (issues/closed/backlink-audit-run/run-unblock/promotion-script/review-B.md:38-46); that consumer is prior-pack-diff's work, and prior-pack-diff/state.yaml lists `blocked-by: promotion-script`. The edge E asks for is a cycle; the criterion sat on the wrong leaf.
Against A's single-leaf chains: rework hours sit in the biggest leaves (technical-pack-selection 21 moves, 5 fix rounds, 41.9 h by-leaf), and 19 of 101 Fixes were merge reds, several from main moving under a long leaf (map-D classification S3). Folding stages into one leaf buys chain wait with more of both.

## 4. Interventions that hurt quality or miss the bottleneck

- M5, half of it is backwards. `framework:verify:cheap` holds 7 domain suites (test:sb-offer-forms, six test:backlink-*; framework/package.json:168); only test:backlink-promotion-map also sits in rest-b (:171). Moving them out of cheap into rest-b makes them merge-only: a backlink leaf that breaks test:backlink-audit-spine learns it in the 42 min merge-red loop instead of a 0.45 min cheap run (verify-runs.jsonl, 41 leaf runs, median 0.45 min). The other half is right: skills:scan and sections:scan run only in rest-a (:170), so add them to cheap. Estimate for the scans alone: seconds per cheap run, one merge red avoided per leaf that touches a skill file. Keep the domain suites where they are.
- M4 needs one condition or it reopens the gap D1 closed. check.repair exits to merge (src/routing.ts:33) and B holds both seats, so an expectation B rewrites in check.repair reaches main with no other reviewer; that is why `any correction of a test expectation` is excepted at skills/check-issue/SKILL.md:79. Accept M4 only for a sync produced by a named regenerate command with the resulting diff pasted in review-B.md; a hand-edited golden or debt list stays with A.
- M1 estimate "5-8 days waiting" rests on seed body dates, not filing dates (seeds untracked, one mtime, no frontmatter; map-D data notes). Say "about a week, low confidence" so the gain is not quoted as measured.
