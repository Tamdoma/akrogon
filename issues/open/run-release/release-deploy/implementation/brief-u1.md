# Brief u1: release module

## 1. Goal

Create `src/release.ts`, the release filesystem mechanics for plan decisions D2, D5, D6, D7, D9. The orchestration (fetch, sequencing, output lines) lives in `src/self-update.ts` in a later unit; this file owns only filesystem mechanics so it never imports `install.ts`.

## 2. Numbered acceptance criteria

1. `releasesDir()` = `resolve(globalHome(), 'releases')`, `currentLink()` = `resolve(globalHome(), 'current')`, `deployRecordPath()` = `resolve(globalHome(), 'deploy.yaml')`, `releaseHoldPath()` = `resolve(globalHome(), 'release-hold.yaml')`.
2. `ensureCurrent(): void` creates `current` as a symlink to `toolRoot` when `current` does not exist (lstat undefined). When it exists (including dangling) it is left alone.
3. `buildRelease(repo: Repo, sha: string): Promise<string>`: when `resolve(releasesDir(), sha)` already exists, return it (idempotent reuse). Else `git archive --format=tar -o <releases>/.build-<sha>.tar <sha>` run with cwd `repo.root`, `tar -xf` that tar into a new dir `releases/.build-<sha>`, `process.execPath install --frozen-lockfile` inside it, then `renameSync` to `releases/<sha>` and return it. A `CommandError` from archive names step `archive`; from install, step `install`. `.build-*` entries (dirs or the tar) are deleted before building.
4. `flip(sha: string): void`: `symlinkSync(resolve(releasesDir(), sha), resolve(releasesDir(), '.next-' + sha))` then `renameSync` onto `currentLink()` — atomic replace.
5. `currentReleaseCommit(): string | null` returns the basename of the `current` target when it resolves under `releasesDir()`, else `null` (missing, dangling or workspace target).
6. `readDeployRecord()` parses `deploy.yaml` with zod `{commit?, previous: string|null, ok, step?, error?, attempted?, at?, replaced: record(string,string) default {}}` and returns null when absent.
7. `writeDeploySuccess(sha, previous)` / `writeDeployFailure(attempted, step, error)`: merge into the existing record preserving `replaced`, `at` = `new Date().toISOString()`, write via `writeYaml`.
8. `readReleaseHold(): string | null` returns the `commit` string of `release-hold.yaml`, null when absent. `clearReleaseHold()` unlinks it when present.
9. `pruneReleases(now = Date.now())`: keep the dirs named by `current` target basename and `deploy.yaml`'s `previous`; for every other dir in `releasesDir()` that is not `.build-*` or `.next-*`, stamp `replaced[name]` in `deploy.yaml` when absent, and `rmSync` the dir when its stamp is older than 24h. Never delete current or previous even when stamped.
10. Pure typed signatures throughout; no `any`.

## 3. Read-first

- `src/config.ts` — `globalHome`, `toolRoot`, `Repo`
- `src/shell.ts` — `command`, `run`, `writeYaml`, `CommandError`
- `src/state-home.ts` — the state-home pattern (`globalHome` usage)
- `src/self-update.ts` — how errors surface (`errorLine`, `describeError`)
- skill folder `ponytail.md`

## 4. Change list and needed interfaces

Create `src/release.ts` only. Export: `releasesDir`, `currentLink`, `deployRecordPath`, `releaseHoldPath`, `ensureCurrent`, `currentReleaseCommit`, `buildRelease`, `flip`, `readDeployRecord`, `writeDeploySuccess`, `writeDeployFailure`, `readReleaseHold`, `clearReleaseHold`, `pruneReleases`. The caller (`src/self-update.ts`, a later unit) wraps `buildRelease`/`flip`/link-sync/reload and calls the record writers; a thrown `CommandError` maps `argv` to step by the caller. Exception: record the step inside the error path only if simpler — the caller may inspect `error.argv`. Keep `release.ts` free of `install.ts` imports (hard rule, no circular dependency).

## 5. Do-not, reasons and exceptions

- Do not import `src/install.ts` — circular dependency; link sync is the caller's job. Exception: none.
- Do not touch `src/self-update.ts`, `src/install.ts`, `src/status.ts` or any test — owned by other units; a conflict returns a mismatch.
- Do not add retry/fallback logic to `git archive` or `bun install` — failures must surface as `CommandError` so the caller can record the failing step.
- Do not write the hold record — `release-rollback` owns writing; this unit only reads and clears.
- Do not prune `current` or `previous` under any stamp (criterion 5).
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `src/config.ts`, `src/shell.ts`, `src/state-home.ts`, `src/self-update.ts` (criteria 1-10).
2. Write `src/release.ts` (all criteria).
3. Run `bun run typecheck` and `bunx prettier --check src/release.ts`; fix only this file (red=your code, green=done).

Advisory size: 1 new file, ~150 lines, under 12 turns.

## 7. Commands

- `bun install --frozen-lockfile` first (worktree has no node_modules).
- `bun run typecheck` — must exit 0 for your file's errors (pre-existing errors in files you do not own are not yours).
- `bunx prettier --check src/release.ts` — must exit 0.

## 8. Done-when, evidence and report

`src/release.ts` compiles clean, prettier-clean, exports the listed functions with the stated semantics. Keep command output through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log. Commit only `src/release.ts`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
