# Brief: concurrent-suite

## What
Make plain `bun test` run the akrogon suite concurrently for every seat, worker and check, with no command-line flag: `bunfig.toml` `[test]` gains `concurrentTestGlob = "**/*.test.ts"` and `preload = ["./tests/setup.ts"]`; new `tests/setup.ts` calls `setDefaultTimeout(30_000)` from `bun:test`; the two tests sharing a console mock in `tests/shell.test.ts` (the `deadline kills sleeping attempt ...` test inside the `firstFailure` loop, and `ordinary retry preserves warning and second result with optional deadlines`) become `test.serial`. `tests/AREA.md` names the setup file and the concurrent default.

## Why
`bun test` takes 80-84 s, 63-66 s of it in `tests/next.test.ts` running one test at a time, and every implement, review, repair and merge pass pays it. Measured on a scratch copy (bun 1.4.2): this shape runs 353 tests in 9.3-9.6 s, 5 of 5 runs green, and 12 of 12 green with 4 suites at once. Concurrent runs without the serial marks fail the two shell tests; without the longer default timeout one 0.57 s test hit bun's 5000 ms limit under load.

## Done-criteria
1. Plain `bun test` (the `test` entry in `checks`) passes with `bunfig.toml` holding `concurrentTestGlob = "**/*.test.ts"` and `preload = ["./tests/setup.ts"]`. The property is the whole suite running concurrently without failures, which no smaller test proves (chart destination, `issues/chart/akrogon-slow-phases/CHART.md`). (A,B,C)

Credentials: none. Human prerequisites: none.
