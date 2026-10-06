# Brief 1: `setup` config key, printed-command composition, fixture tests

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/check-setup-u1`

## 1. Goal

Add the optional repo key `setup` to `repoSchema`, compose it into every printed `checks`, `merge_checks` and `advisory` command in `effectiveConfig`, and prove it with real-install fixture tests. Plan decisions D1–D6, D10.

## 2. Numbered acceptance criteria

1. With `setup` set, `akrogon config` prints each `checks`, `merge_checks` and `advisory` command as exactly `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && sh -c <quoted command>` where `<quoted x>` is `quote(x)` from `src/shell.ts` (wrap in `'...'`, escape `'` as `'\''`). With `setup` absent, values print unchanged. Composition is identical from the registered checkout and a linked worktree.
2. A fresh worktree with no `node_modules` runs a printed check to exit 0 without a separate install step.
3. Worktree `node_modules` resolves its own lockfile's version even when the root's `node_modules` holds another version.
4. Four printed checks run concurrently in one worktree all exit 0; `git status --porcelain` is empty after.
5. A lockfile out of sync with `package.json` makes a printed `a || b` check exit non-zero and neither side runs.
6. All of `setup` runs inside the lock.

## 3. Read-first

- `src/config.ts` (`repoSchema`, `effectiveConfig`), `src/shell.ts` (`quote`, `command`, `run`, `Result`), `tests/config.test.ts` (copy the existing `fixture`/`cli`/`yaml` patterns and test style), `tests/helpers.ts`, `src/AREA.md`, `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/config.ts`, `tests/config.test.ts`, `src/AREA.md`. Wave 1, no prerequisites, no shared test resource.

- `src/config.ts`: `repoSchema` gains `setup: text.optional()`. Add a small helper in `effectiveConfig` (or top-level): when `repoConfig.setup` is set, map `checks` and `merge_checks` values and `advisory` entries to the composed literal in criterion 1; when unset, pass through unchanged. Reuse `quote`; do not write a new quoting helper. `init`/`writeRepoConfig` need no change: `repoSchema.parse` already carries the key through.
- `src/AREA.md`: one line under Key files or Non-obvious patterns noting `akrogon config` composes `setup` into the printed check lists.
- `tests/config.test.ts`: append tests T1–T6 (below). Do not modify existing tests.

## 5. Do-not, reasons and exceptions

- No mocking of `bun`, `flock` or git: design requires real install and real lock at the CLI boundary. Exception: none; a mismatch goes back with evidence.
- No network: the fixture must resolve offline. Exception: none — if bun hits the registry, the fixture is wrong; return a mismatch.
- Don't touch `ensureWorktree`/`src/next.ts` or `worktree_root` — design excludes them. No setup key in akrogon's own `issues/config.yaml` — operator commit, out of scope.
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief from A.

## 6. Ordered steps

Advisory size: about 3 files, under 30 turns.

0. Sanity check (2 min, real): in `$TMPDIR`, `bun init -y` a scratch dir, add a `file:` dep on a local folder, `bun install`, then `bun install --frozen-lockfile`; confirm both succeed offline. If `--frozen-lockfile` reaches the network or fails, stop and return a mismatch with the output.
1. `src/config.ts`: add `setup` to `repoSchema` and compose in `effectiveConfig` (criteria 1). Use `Map`/`Object.fromEntries(Object.entries(...).map(...))` for records and `.map` for `advisory`.
2. Fixture pattern for T2–T6 (one helper inside the test file, local to these tests): after `fixture()`, commit into `f.root`: `vendor/widget/package.json` (`{name:"widget",version:"1.0.0"}`), root `package.json` depending on `"file:vendor/widget"`, `.gitignore` gaining `node_modules/`, then run `bun install` in `f.root` (produces committed `bun.lock` and root `node_modules` with widget1). Write `issues/config.yaml` with `setup: 'bun install --frozen-lockfile'` plus the test's `checks`/`advisory`.
   Worktrees: `git worktree add --detach <f.home>/wt HEAD`. `git worktree add` copies only committed files, so a worktree needing a different lockfile gets a second committed revision first: for T3 commit `vendor/widget2` (version 2.0.0) + `package.json` switched to `"file:vendor/widget2"` + regenerated `bun.lock` before adding the worktree; root `node_modules` deliberately keeps widget1.
   Run printed commands with `sh -c <printed>` inside the worktree cwd.
3. T1 (criterion 1): config with `setup: 'bun install --frozen-lockfile'`, `checks:{t:'bun test'}`, `merge_checks:{m:'bun run verify'}`, `advisory:['bun run lint']`. Assert exact strings, e.g. checks.t === `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && sh -c 'bun test'`. Repeat `akrogon config` from a linked worktree → identical. Then config without `setup` → raw commands unchanged.
4. T2 (criterion 2): fresh worktree, printed check `bun -e 'console.log(require.resolve("widget"))'`; assert exit 0 and stdout path under the worktree's `node_modules`.
5. T3 (criterion 3): worktree lockfile pins widget2 while root `node_modules` has widget1; printed check prints `require("widget/package.json").version` and resolved path; assert `2.0.0` and worktree path.
6. T4 (criterion 4): `checks` with four trivial commands (`true` variants, distinct names); `Promise.all` four `sh -c` runs in one worktree; assert all exit 0 and `git status --porcelain` is empty.
7. T5 (criterion 5): after the worktree exists, edit its `package.json` (e.g. change the dep to `file:vendor/widget2` without regenerating the lockfile); printed check `touch <abs f.home>/a || touch <abs f.home>/b`; assert exit non-zero, stderr mentions the lockfile/install failure (lowercase contains `lockfile`), and both marker files absent.
8. T6 (criterion 6): `setup` = `touch <abs marker> && ! flock -n "$(git rev-parse --git-path akrogon-install.lock)" true` (no `|| true`). `! flock -n` succeeds only when the lock is already held, so this proves the second setup command ran inside the lock. Printed check `true`; assert exit 0 and marker file exists.
9. `src/AREA.md` one line. Commit everything with the `Test-Change:` trailer (below).

## 7. Commands

```
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```
with `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602`. Run `bun install` in your worktree first. Also run `bun test tests/config.test.ts --timeout=30000` to cover the new tests, and `bun run typecheck`.

## 8. Done-when, evidence and report

All six criteria green via the new tests; `bun run typecheck` clean; new-behavior deliberate break recorded: temporarily drop the `sh -c` grouping around the check (compose `... && <command>`), watch T5 go red, restore. Paste red/green output. Commit(s) changing `tests/config.test.ts` end with `Test-Change: tests/config.test.ts added T1–T6 setup-composition cases; no existing expectation changed`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
