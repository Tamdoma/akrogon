# Sub-brief 2: tree-kill teardown for hold loops (run-permit, pause-next)

## 1. Goal

End the orphaned `sh -c 'while [ ! -e release ]'` fake seats: teardown that kills only the `bun akrogon` child leaves its grandchildren running under PID 1. Plan decision D4 bullets 1–2 and the `killTree` interface. Depends on unit 1's `tests/isolation.ts` (`descendantsOf`) and `bunfig.toml` preload already being on the leaf HEAD — it is (`a9f8fc7` + unit-1 cherry-pick will be present in your worktree).

## 2. Numbered acceptance criteria

1. `tests/helpers.ts` exports `killTree(proc: Bun.Subprocess): void` which SIGKILLs `proc` then sweeps live descendants via `descendantsOf` imported from `./isolation`.
2. `tests/run-permit.test.ts` `stop(caps)` uses `killTree` for each `Cap.proc` instead of a bare `cap.proc.kill('SIGKILL')`.
3. `tests/pause-next.test.ts` teardown of its `procs` array uses `killTree` the same way (its `next --resume`/`pause` children can leave `sh -c 'while [ ! -e release ]'` barrier grandchildren).
4. `bun test --timeout=30000 tests/run-permit.test.ts` and `bun test --timeout=30000 tests/pause-next.test.ts` are green, and after each run `ps` shows no `marks/release`-style `while` loop still alive that the run started.

## 3. Read-first list

- `tests/helpers.ts` (top of file: `registerTemp`, exit sweep; add `killTree` beside `cli`).
- `tests/run-permit.test.ts` (`Cap`, `run()`, `hold()`, `stop(caps)` near line ~85, and every `finally` that calls `stop(caps)`).
- `tests/pause-next.test.ts` (`procs` array and its teardown; barrier wrapper around line ~500).
- `tests/isolation.ts` (unit-1 interface you import: `descendantsOf`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `tests/helpers.ts`: `import { descendantsOf } from './isolation';` then
  `export function killTree(proc: Bun.Subprocess): void { if (proc.exitCode === null && proc.signalCode === null) proc.kill('SIGKILL'); for (const pid of descendantsOf(proc.pid)) { try { process.kill(pid, 'SIGKILL'); } catch { /* dead between listing and kill */ } } }`
  Adjust to actual code style; the semantic contract is: kill the proc if alive, then SIGKILL every remaining descendant of that pid.
- `tests/run-permit.test.ts`: `stop` becomes `for (const cap of caps) killTree(cap.proc)` (same finally sites; `killTree` replaces the `exitCode === null` guard).
- `tests/pause-next.test.ts`: in the teardown loop over `procs`, replace `proc.kill()`/`kill('SIGKILL')` with `killTree(proc)`; keep `finishCaptured`/`exited` handling intact.
- Owned paths: `tests/helpers.ts`, `tests/run-permit.test.ts`, `tests/pause-next.test.ts`.
- Shared test resource: none — each test uses its own fixture home; `sweepSuite` is process-global so per-test `killTree` must sweep only descendants of the killed pid, never `sweepSuite()`.

## 5. Do-not, reasons and exceptions

- Do NOT edit `tests/isolation.ts` or `bunfig.toml` — unit 1 owns them; a missing/incorrect export is a mismatch to return, not fix. No exception.
- Do NOT change `hold()`/`while`-loop test semantics (they exercise real waits) — only their teardown. No exception.
- Do NOT call `sweepSuite()` in these files: it is process-global and would kill sibling test children mid-run. The exception is none — use `descendantsOf` only.
- Do NOT touch `run-units.test.ts`, `install.test.ts`, `config.test.ts`, `reconcile.test.ts` — other units/none-own. No exception.
- Reasons: shared worker state means a global sweep kills siblings; each unit owns disjoint paths.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in your worktree.
2. Edit `tests/helpers.ts` (criterion 1).
3. Edit `tests/run-permit.test.ts` `stop(caps)` (criterion 2).
4. Edit `tests/pause-next.test.ts` `procs` teardown (criterion 3).
5. Run `bun test --timeout=30000 tests/run-permit.test.ts tests/pause-next.test.ts` — all green (criterion 4).
6. Commit the three files. Existing test-file changes each need a `Test-Change: <path> tree-kill teardown, no expectation changed` trailer (one per changed test file in the final trailer block; `tests/helpers.ts` is also a test-surface file — include it).

Advisory size: 3 files, under 14 turns.

## 7. Commands

- `bun install --frozen-lockfile`
- `bun test --timeout=30000 tests/run-permit.test.ts`
- `bun test --timeout=30000 tests/pause-next.test.ts`

No other test command.

## 8. Done-when, evidence and report

Both test files green; commit ID returned; no surviving `while` loops from your runs (verify once with `ps -u $(id -u) -o pid,ppid,args | grep 'marks/' | grep -v grep` after a run — report any leftover as a limitation, do not try to kill by pattern).

Report format:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
