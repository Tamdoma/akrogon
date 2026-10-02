# Plan: concurrent-suite

Debate: no. Built directly from `brief.md` and the locked `design.md`. The brief and the design agree. The brief's tags (A,B,C) refer to evidence in the chart.

## Read first
- `docs/reference-index.md`
- `tests/AREA.md`
- `bunfig.toml`
- `tests/shell.test.ts:10-60`
- `issues/chart/akrogon-slow-phases/forks/suite-speed.md` (Q3 3b)
- `learnings/LESSONS.md` has no lesson about concurrency or timeouts, so none applies.

## Decisions
- D1: `bunfig.toml` `[test]` keeps `root = "tests"` and adds only `concurrentTestGlob = "**/*.test.ts"`. No `preload`. Concurrency stays at bun's default limit of 20. No `--max-concurrency` flag anywhere, and no change to `package.json`.
- D2: The operator applied this in the registered checkout (commit on main, not on the leaf branch, since `akrogon phase` refuses `issues/` files): `issues/config.yaml` `checks.test` became `bun test --timeout=30000` and `checks.test_changed` now ends with `bun test --changed="$AKROGON_BASE" --timeout=30000`. No `tests/setup.ts` and no `setDefaultTimeout` (bun 1.4.2 applies a preload default only to the first test file). Remove `tests/setup.ts` and the `preload` key if the current head has them. Per-test timeouts set inside test files still override the flag.
- D3: In `tests/shell.test.ts`, `test(` becomes `test.serial(` at line 10 (the `deadline kills sleeping attempt ...` test, which the loop creates twice) and at line 42 (`ordinary retry preserves warning ...`). Nothing else in the file changes. These tests share the `spyOn(console, 'warn')` mock.
- D4: If another test fails under concurrency, it gets `test.serial`, and the report names the state it shares. No other changes to tests.
- D5: `tests/AREA.md` gets one line saying the suite runs concurrently by default, with `test.serial` for tests that share state, and one line saying the 30 s test timeout comes from `--timeout` in `issues/config.yaml`. No line naming `tests/setup.ts`.
- D6: The worktree has no `node_modules`. Run `bun install` before running checks. This is setup only. Do not change the lockfile.

## Interfaces
- bun 1.4.2 bunfig `[test]` keys: `root`, `concurrentTestGlob`. `bun test --timeout=<ms>` applies to every test file. `bun:test` `test.serial` (bun-types `test.d.ts`).

## Checklist
Wave 1 has one unit:
- U1. Owns `bunfig.toml`, `tests/setup.ts` (delete if present), `tests/shell.test.ts` (2 edits), and `tests/AREA.md`. Shared test resource: none (local temp dirs only). Prerequisites: none.
  - [ ] D1 bunfig keys
  - [ ] D2 timeout flag in config, setup file removed
  - [ ] D3 two serial marks
  - [ ] D5 AREA lines
- Docs: `tests/AREA.md` is the only affected doc. Other docs mention `bun test` only as a command, and that does not change.

## Verification
| Criterion | Proof command | Failure it catches | Size | Rerun when |
|---|---|---|---|---|
| Done-1: plain `bun test` passes with the concurrent bunfig | `bun test` (checks.test) | Shared-state races (such as the two shell tests) and per-test timeouts under load | seconds (about 10 s expected, 80 s before) | Any change to bunfig, the setup file or a test |
| bunfig holds the glob and config holds the timeout | `grep -E 'concurrentTestGlob = "\*\*/\*\.test\.ts"' bunfig.toml` and `akrogon config` shows `--timeout=30000` on `test` and `test_changed` | A key is missing, which would make the green run prove nothing | seconds | Any edit to bunfig or config |
| Timeout reaches every file under 4 concurrent runs | 4 simultaneous `bun test --timeout=30000` | The 5000 ms timeout in `tests/next.test.ts` that failed 1 of 4 before | about 35 s | Any change to the timeout mechanism |
| Types and format | `bun run typecheck`, `bun run format` | A type or format error in the edited TS files | seconds | Any TS edit |

Report evidence (not a criterion, as the design says): 3 back-to-back runs of `bun test` with wall time and pass/fail counts, plus one round of 4 runs started together (`for i in 1 2 3 4; do bun test > run$i.log 2>&1 & done; wait`, with the logs in the scratchpad). Restart boundary: each run stands alone, so a failed run is just started again.

Credentials: none named in the design, so no `.env` check is needed.

## Open limitation
A hung test now takes 30 s to fail instead of 5 s. The design accepts this risk.
