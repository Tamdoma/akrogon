# Sub-brief 1: suite isolation preload

## 1. Goal

Build the preload mechanism that makes `bun test` unable to reach the operator HOME or leaf-temp root and able to end every process it started. Plan decisions D1 and D2 (tests/isolation preload + `sweepSuite`).

## 2. Numbered acceptance criteria

1. `bun test --timeout=30000 tests/isolation.test.ts` is green: both tests pass under the preload.
2. `tests/isolation.ts` runs before any test file in every `bun test` worker (wired via `bunfig.toml` `[test] preload`).
3. `sweepSuite()` kills descendants deepest-first and throws (or reports) if a descendant survives.
4. No real-home write path remains reachable from an unset override: `homedir()`, `leafTemp`, `worktreeStore` resolve under the worker's scratch.

## 3. Read-first list

- `tests/isolation.test.ts` (the two proofs; do not edit — a red test is a mismatch to return, not fix).
- `tests/helpers.ts` (`process.on('exit')` sweep pattern at the top, `registerTemp`).
- `src/config.ts` `leafTemp`/`worktreeStore`/`ensureLeafTemp` (env override contract).
- `bunfig.toml` (add `preload` to the existing `[test]` table only).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- New file `tests/isolation.ts`, owned entirely. Exports:
  - `export const suiteRoot: string` — the worker's scratch dir, created by `mkdtempSync(join(tmpdir(), 'akrogon-suite-'))` BEFORE TMPDIR is rewritten (mkdtemp uses the incoming TMPDIR).
  - `export function descendantsOf(root?: number): number[]` — BFS over `/proc/<pid>/children` files for every numeric pid under `/proc`, from `root ?? process.pid`, excluding `root` itself, ordered deepest-first (children before parent). Missing/unreadable files are skipped.
  - `export function sweepSuite(): void` — SIGKILL all `descendantsOf()`, then one re-pass for stragglers adopted between passes; if a descendant still exists after the second pass, `throw new Error` naming the surviving pid(s) so the exit path reports rather than hides the leak.
  - At module top level (preload side effects, in this order): make this worker a child subreaper via `bun:ffi` `dlopen('libc.so.6')` `prctl(36, 1, 0, 0, 0)` (PR_SET_CHILD_SUBREAPER); create `suiteRoot`; set `process.env.HOME = join(suiteRoot,'home')`, `process.env.AKROGON_LEAF_TEMP_ROOT = join(suiteRoot,'leaf-temp')`, `process.env.TMPDIR = suiteRoot`; `mkdirSync` those two subdirs recursively so children can use them; `process.on('exit', () => { sweepSuite(); rmSync(suiteRoot, { recursive: true, force: true }); })` with the sweep wrapped so a throw prints to stderr without breaking the rm.
  - `prctl` signature via FFIType: `args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32], returns: FFIType.i32` — verified on this host.
- `bunfig.toml`: add one line `preload = ["./tests/isolation.ts"]` inside `[test]`. Keep `root` and `concurrentTestGlob` untouched.
- No other file.

## 5. Do-not, reasons and exceptions

- Do NOT edit `tests/isolation.test.ts` — its red/green is the criterion; a red test is a mismatch, return it. No exception.
- Do NOT touch product code (`src/`): the leaf's exclusions forbid it. No exception.
- Do NOT spawn a watcher/daemon or write outside `suiteRoot`: the whole point is no stray process/file. Exception: none.
- Do NOT make `sweepSuite` silent: a surviving descendant must surface, per D2. Exception: inside the `process.on('exit')` path a throw is printed, not re-raised (exit already in progress).
- Do NOT add dependencies or a systemd dependency: plain `/proc` and `bun:ffi` on `libc.so.6` only. No exception.
- Reasons: the leaf's criteria are no real-root writes and no surviving suite processes; every exclusion guards one of those.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Run `bun install --frozen-lockfile` in your worktree.
2. Write `tests/isolation.ts` per §4 (criterion 2,3).
3. Add the `preload` line to `bunfig.toml` (criterion 2).
4. Run `bun test --timeout=30000 tests/isolation.test.ts` — expect both tests green (criterion 1). The first previously failed with `Cannot find module './isolation'`.
5. Run `bun test --timeout=30000 tests/helpers.ts tests/config.test.ts` — config tests exercise `ensureLeafTemp`/`leafTemp` and must stay green under the preload (criterion 4).
6. Commit `tests/isolation.ts` + `bunfig.toml` with a `feat:`-style message naming the preload.

Advisory size: 2 files, under 12 turns.

## 7. Commands

- `bun install --frozen-lockfile`
- `bun test --timeout=30000 tests/isolation.test.ts`
- `bun test --timeout=30000 tests/config.test.ts`

No other test command. `akrogon verify` and the criterion whole-suite runs are A's, not yours.

## 8. Done-when, evidence and report

`tests/isolation.test.ts` both tests pass; `tests/config.test.ts` all pass; commit ID returned with the brief report below. A commit touching `tests/isolation.test.ts` would need a `Test-Change:` trailer — you are not touching it, so none. (New file `tests/isolation.ts` is a test-surface file but adds no case; the trailer rule still applies to it under `src/test-files.ts` — end the commit with `Test-Change: tests/isolation.ts added preload mechanism, no case`.)

Report format:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
