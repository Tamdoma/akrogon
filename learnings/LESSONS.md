# Lessons

These lessons record what happened, not what is true.

One line per lesson: mechanism, date, history file. A line leaves when applied or pruned at chart open.

- check-issue review: slot A missed three reproducible defects on the command leaf by reading only, slot B found them by running the code in a temp repo. 2026-09-10. history/2026-09-10-review-by-reading.md
- implement-issue report: core-skills deleted consult-issue and explain-issue and left dangling links in seed-issue and init-issues unreported; grep for the old path and name out-of-scope hits under known limitations. 2026-09-10. history/2026-09-10-core-skills.md
- process boundary: `retryable` in `src/next.ts` parses herdr stderr as JSON unguarded, so a non-JSON stderr surfaces as SyntaxError and the real body is lost; parse external stderr behind a guard and propagate the raw text. 2026-09-10. history/2026-09-10-stderr-json-parse.md
- check-issue review: confirm the reviewed commit is ahead of the base and `git status --porcelain` is empty before any verdict; two leaves passed review with all work uncommitted. 2026-09-11. history/2026-09-11-uncommitted-handoff.md
- chart-issues handoff audit: a grep-shaped done-criterion collided with a verbatim standing block the same design required; check forbidden-term criteria against copied verbatim text before the leaf opens. 2026-09-11. history/2026-09-11-lock-vs-criterion.md
- plan-issue D-scope: locking existing tests for sibling leaves made docs-concepts copy five browser helpers verbatim; allow a shared helper module so later page leaves import instead of duplicate. 2026-09-11. history/2026-09-11-duplicated-browser-helpers.md
- implement-issue scope: blind-initial-review changed a peer-question rule in the skill while `docs/limits.html` kept the old rule; grep `docs/` for a changed rule and own or report the hit. 2026-09-11. history/2026-09-11-stale-rule-in-docs.md
