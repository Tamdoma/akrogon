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
- check-issue review: when the worktree schema cannot read the live store, `AKROGON_HOME=<scratch>` with copied real data verifies command output end to end. 2026-09-13. history/2026-09-13-akrogon-home-scratch-verify.md
- check-issue review: a plan-named link target inside `.ink-band pre` renders parchment-on-parchment (`.ink-band a` matches code color); check band link color before requiring links in dark pre blocks. 2026-09-14. history/2026-09-14-ink-band-links.md
- merge-issue nit: `bun -e` shifts argv so the first user positional is `process.argv[1]`; pass a dummy positional or read from argv[1], and verify indexing once per harness. 2026-09-14. history/2026-09-14-bun-eval-argv.md
- chart-issues live surface: reported a configured webhook missing from `~/.config/akrogon/env` because the grep class `[A-Z_]*` excluded the digit in `_2`; read key names with a plain listing before claiming a live failure. 2026-09-14. history/2026-09-14-env-grep-digit.md
- check-issue review: removing `implementation/brief.md` left "fix the brief" prose in excluded guide files pointing at the wrong referent; sweep prose for the old term, not only the old path, and Nit ambiguous hits. 2026-09-14. history/2026-09-14-ambiguous-prose-after-rename.md
