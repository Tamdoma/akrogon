# Review A: check-setup

Base: `923c6c98fac3f051a54ac27168ea024215652602` · Reviewed head: `331d7bf262962ade448d1954b03a8caecebae9aa` · Diff: 3 commits, `git status --porcelain` empty, ahead of base confirmed.

## Findings

None.

## Verification evidence

- Read the full diff: `src/config.ts` adds `setup: text.optional()` and composes `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && sh -c <quoted command>` in `effectiveConfig` output only, via existing `quote`; `repoSchema.parse` carries the raw key through `init`/`writeRepoConfig` untouched, matching the plan.
- Live probe beyond the suite: registered a scratch fixture in a scratch `AKROGON_HOME`, added a detached worktree, ran `akrogon config` and executed the printed check verbatim via `sh -c`: `bun install --frozen-lockfile` ran under the lock, `require.resolve("widget")` resolved to `/tmp/setup-probe/wt/node_modules/widget/index.js`, exit 0, `git status --porcelain` empty, lock materialized at `.git/worktrees/wt/akrogon-install.lock` (under the git dir, per-worktree). Two earlier probe failures were my own malformed YAML/quoting, never the code path — the harness pipes `akrogon config` output directly to `sh -c` and passed.
- Criteria mapping confirmed against `implementation/report.md`: T1–T6 prove criteria 1–6 at the CLI boundary with a real `file:`-dependency fixture (offline verified by the worker); criteria 7–9 verified by re-reading the skill and guide diffs — locked-setup rule present in both skills including the base-run clause, init-akrogon proposes `setup` only on a committed lockfile with per-manager frozen commands, `setup.md` documents the key, per-worktree lock location and the proposal rule.
- Deliberate break evidence in the report: removing the `sh -c` grouping turned T5 red (`||` caught the failed setup), restored green.
- AREA.md check: `src/AREA.md` gained one line; all paths it names exist (`ls src/config.ts src/shell.ts src/akrogon.ts src/init.ts src/phase.ts src/preflight.ts src/readiness.ts tests/helpers.ts` — all present).
- No changed doc claims contradict the diff; no mocks of the unit under test; no prose-wording assertions added (assertions are exit codes, exact literal command strings, resolved paths, stderr `lockfile` substring — all within the literal-command allowance).
- Docs checklist honored: `skills/AREA.md`, README, other guide pages unchanged and unaffected.

## Verdict

ready
