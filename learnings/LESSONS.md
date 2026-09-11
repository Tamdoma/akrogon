# Lessons

One line per lesson: mechanism, date, history file. A line leaves when applied or pruned at chart open.

- check-issue review: slot A missed three reproducible defects on the command leaf by reading only, slot B found them by running the code in a temp repo. 2026-09-10. history/2026-09-10-review-by-reading.md
- implement-issue report: core-skills deleted consult-issue and explain-issue and left dangling links in seed-issue and init-issues unreported; grep for the old path and name out-of-scope hits under known limitations. 2026-09-10. history/2026-09-10-core-skills.md
- process boundary: `retryable` in `src/next.ts` parses herdr stderr as JSON unguarded, so a non-JSON stderr surfaces as SyntaxError and the real body is lost; parse external stderr behind a guard and propagate the raw text. 2026-09-10. history/2026-09-10-stderr-json-parse.md
