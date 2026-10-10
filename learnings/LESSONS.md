# Lessons

These lessons record what happened, not what is true.

One line per lesson: mechanism, date, history file. A line leaves when the leaf that guards it retires it, or when `/learn-issues` removes a guarded line.

- check-issue review: slot A missed three reproducible defects on the command leaf by reading only, slot B found them by running the code in a temp repo. 2026-09-10. history/2026-09-10-review-by-reading.md
- implement-issue report: core-skills deleted consult-issue and explain-issue and left dangling links in seed-issue and init-issues unreported; grep for the old path and name out-of-scope hits under known limitations. 2026-09-10. history/2026-09-10-core-skills.md
- process boundary: `retryable` in `src/next.ts` parses herdr stderr as JSON unguarded, so a non-JSON stderr surfaces as SyntaxError and the real body is lost; parse external stderr behind a guard and propagate the raw text. 2026-09-10. history/2026-09-10-stderr-json-parse.md
- check-issue review: confirm the reviewed commit is ahead of the base and `git status --porcelain` is empty before any verdict; two leaves passed review with all work uncommitted. 2026-09-11. history/2026-09-11-uncommitted-handoff.md
- chart-issues handoff audit: a grep-shaped done-criterion collided with a verbatim standing block the same design required; check forbidden-term criteria against copied verbatim text before the leaf opens. 2026-09-11. history/2026-09-11-lock-vs-criterion.md
- implement-issue scope: blind-initial-review changed a peer-question rule in the skill while `docs/limits.html` kept the old rule; grep `docs/` for a changed rule and own or report the hit. 2026-09-11. history/2026-09-11-stale-rule-in-docs.md
- check-issue review: when the worktree schema cannot read the live store, `AKROGON_HOME=<scratch>` with copied real data verifies command output end to end. 2026-09-13. history/2026-09-13-akrogon-home-scratch-verify.md
- merge-issue nit: `bun -e` shifts argv so the first user positional is `process.argv[1]`; pass a dummy positional or read from argv[1], and verify indexing once per harness. 2026-09-14. history/2026-09-14-bun-eval-argv.md
- chart-issues live surface: reported a configured webhook missing from `~/.config/akrogon/env` because the grep class `[A-Z_]*` excluded the digit in `_2`; read key names with a plain listing before claiming a live failure. 2026-09-14. history/2026-09-14-env-grep-digit.md
- check-issue review: removing `implementation/brief.md` left "fix the brief" prose in excluded guide files pointing at the wrong referent; sweep prose for the old term, not only the old path, and Nit ambiguous hits. 2026-09-14. history/2026-09-14-ambiguous-prose-after-rename.md
- check-issue review: `z.string().min(1)` accepts whitespace-only input, so a "non-empty reason" contract stored `' '`; require `.trim().min(1)` or `\S` and probe with a blank argument. 2026-09-19. history/2026-09-19-min1-not-nonblank.md
- chart-issues open: the door cited stale skill lines because local main was 5 commits behind origin/main and `akrogon pull` refreshes only issue mirrors; compare `main..origin/main` before citing lines. 2026-09-27. history/2026-09-27-stale-door-checkout.md
- herdr plugin commands: startup and hooks run with the plugin directory as cwd, which for akrogon is inside a registered repo, so cwd-sensitive `--all` narrowed startup `pull --all` to akrogon; check a hook command's cwd behavior before trusting it to cover every repo. 2026-09-28. history/2026-09-28-plugin-cwd-pull.md

- Explanatory prose assertions couple behavior tests to wording. Prefer refusal, reason and side-effect assertions in criteria. 2026-10-01. History: [failed-stop-guard wording](history/2026-10-01-failed-stop-guard-wording.md).
- bun 1.4.2 preload `setDefaultTimeout` reaches only the first test file, and bunfig has no timeout key. Prove a runner setting with a multi-file probe that fails without it. 2026-10-02. History: [bun preload default timeout](history/2026-10-02-bun-preload-default-timeout.md).
- `bun run format` rewrites pre-existing prettier drift in untouched files, so `src/status.ts` needed a revert after every format run. 2026-10-08. history/2026-10-08-pause-dispatch.md

- Automatic cascade lock ownership (2026-10-09): trace post-reconciliation dependent launches across lock release points and prove pause cannot acknowledge during their launch. History: [case](history/2026-10-09-pause-dispatch-cascade-lock.md).

- Conditional automatic-dispatch documentation (2026-10-09): check general wake descriptions against pause exceptions, and distinguish a documented exception from proven operator confusion. History: [case](history/2026-10-09-pause-dispatch-doc-qualifier.md).
- Attempt records: a one-shot write driven by a persistent state record replays when the record survives its trigger (post-phase mergeWake, mid-call failure retry, recovery reconcile); exactly-once needs a persisted `recorded` flag and a phase gate on the holder. 2026-10-10. History: [case](history/2026-10-10-attempt-record-replay.md).

- 2026-10-10: A hold-clear decision must revalidate the current record under its deletion lock. A stale pre-lock comparison can erase a newer hold. History: [red-main-hold stale clear](history/2026-10-10-red-main-hold-stale-clear.md).
