# Suite speed

## Question
Q1 How should the akrogon suite get faster?
Q2 Run a repeated-run measurement first?
Q3 bunfig cannot hold the limit of 8 from 1a. Drop the limit, add a longer per-test timeout, or keep 8 as command flags?

### Carries
- Locks: `issues/chart/check-reruns/` (which checks run when), `issues/chart/reviewer-repair/`.
- Related: `check-lifetime.md`, `changed-tests-duplicate.md`.

## Findings
See `../slots/map-merged.md` and rebuttals. `bun test` 80-84 s, `tests/next.test.ts` 64-66 s (A,B,C). `--concurrent` 9.7 s and `--concurrent --max-concurrency=8` 14.1 s, both 351 pass and 2 fail in `tests/shell.test.ts` shared console mock, one run each (C). `--parallel` 63 s (C). Speed must live in `bunfig.toml` or test files to reach every seat (C).

## Taken
Operator 2026-10-02, verbatim: "1a | 2a"

- Q1 1a: run tests concurrently with max concurrency 8, configured in `bunfig.toml` so every seat and worker gets it; the two shared-console tests in `tests/shell.test.ts` stay serial. Reason: 80 s to about 14 s measured once. Foreclosed: splitting next.test.ts with `--parallel` (63 s), leaving it.
- Q2 2a: run a 10-run measurement on a scratch copy before handoff; result below.
- Q3 3b (operator 2026-10-02, verbatim "3b"): replaces 1a's limit of 8, which bunfig cannot hold. `bunfig.toml` `[test]` gets `concurrentTestGlob = "**/*.test.ts"` at bun's default limit 20, plus a `preload` setup file that calls `setDefaultTimeout(30_000)`. `tests/shell.test.ts:10` and `:42` become `test.serial`. Reason: one place for the setting, about 10 s, and it targets the one failure seen (a per-test timeout under load). Foreclosed: no timeout change (3a), limit 8 as command flags in `issues/config.yaml` (3c, two places, 5 s slower, unproven gain). Accepted risk: a hung test takes 30 s to fail.

### Measurement (Q2 2a)
2026-10-02, bun 1.4.2, 32 cores, operator's local identity. Scratch git worktree at fd1b175, `bun install`, `test(` changed to `test.serial(` at `tests/shell.test.ts:10` and `:42`. Cleanup: worktree removed with `git worktree remove --force`, `git worktree list` shows only main.
- `bun test --concurrent --max-concurrency=8`: 10 of 10 runs 353 pass, 15.0-15.8 s.
- `bunfig.toml` `[test] concurrentTestGlob = "**/*.test.ts"`, plain `bun test` (bun default limit 20): 10 of 10 runs 353 pass, 10.2-10.8 s.
- Same bunfig plus `bun test --max-concurrency=8`: 2 of 2 pass, 14.8 s. The flag applies on top of the glob.
- bunfig has no limit key. The bun 1.4.2 bunfig `[test]` parser knows preload, onlyFailures, junit, coverage keys, randomize, rerunEach, retry, concurrentTestGlob and pathIgnorePatterns (binary strings, `bunfig.mdx:345`). `maxConcurrency = 8` in bunfig was ignored without error (10.4 s).
- 4 suites at once, limit 20: 1 failure in 8 suites, `tests/next.test.ts:1571` hit bun's 5000 ms per-test timeout (0.57 s alone). Limit 8: 0 failures in 12 suites. Both about 28-29 s per suite under that load.
- Limits: one machine, small load sample, no run with real leaves overlapping. It does not prove zero flakes under `max_active: 12`.

### Shape check after measurement
Returns `../slots/suite-speed-check-B.md`, `../slots/suite-speed-check-C.md`.
- 1a cannot be built as worded: bunfig has no limit key, so a limit of 8 lives only on command lines (A,B,C). Putting it on `checks.test` alone leaves workers, `test_changed` and plain runs at 20, which changes the operator's choice (B,C).
- 1 failure in 8 against 0 in 12 does not show 8 is safer (Fisher p about 0.4), and the limit costs about 5 s per quiet run (C).
- The failure was a per-test timeout, not a wrong result. A longer default timeout targets that cause directly (C). `setDefaultTimeout` exists in bun:test (`node_modules/bun-types/test.d.ts:408`) and a bunfig `preload` file can call it, so it can live in bunfig.
- New question Q3 follows.

### Proof of 3b
2026-10-02, bun 1.4.2, fresh scratch worktree at fd1b175. `bunfig.toml` `[test]` with `root = "tests"`, `concurrentTestGlob = "**/*.test.ts"`, `preload = ["./tests/setup.ts"]`. `tests/setup.ts` calls `setDefaultTimeout(30_000)` from bun:test. Shell tests at `:10` and `:42` marked `test.serial`.
- A 6 s probe test passed with the preload and failed at 5000 ms without it. Probe deleted.
- Plain `bun test`: 5 of 5 runs 353 pass, 9.3-9.6 s.
- 4 suites at once, 3 rounds: 12 of 12 suites 0 fail, 25-27 s each.
- `bun run typecheck` passes. Prettier check passes on both files.
- Cleanup: worktree removed, `git worktree list` shows only main.
- Limits: does not prove zero flakes with 12 leaves busy at once, or on other machines.
