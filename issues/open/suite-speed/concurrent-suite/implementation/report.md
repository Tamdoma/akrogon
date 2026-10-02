# Implementation report: concurrent-suite

Base: 22c447039b192f4caae6cad4d5b56092941d1bed
Head: 966a847eeb898d1b032a855d9ff11bdd2513cd6b (u1 `13ed336` cherry-picked from worker `d3431f8`, then lesson `966a847`)
Outcome: stopped `failed`. Done-criterion 1 is green, but the locked timeout mechanism (D2, suite-speed Q3 3b) does not work as designed.

## Changed files
- `bunfig.toml`: adds `concurrentTestGlob = "**/*.test.ts"` and `preload = ["./tests/setup.ts"]` (D1).
- `tests/setup.ts`: `setDefaultTimeout(30_000)` (D2). It only takes effect for the first test file, as shown below.
- `tests/shell.test.ts`: the deadline test (in the loop) and the ordinary retry test are now `test.serial`, because they share the `console.warn` spy (D3).
- `tests/AREA.md`: setup file line and concurrent default line (D5). The setup line says it sets the 30 s default, which is only true for the first file.
- `learnings/LESSONS.md` and `learnings/history/2026-10-02-bun-preload-default-timeout.md`: the finding below.

## Commands and results
- `bun install`: exit 0. `bun run format`: exit 0. `bun run typecheck`: exit 0.
- `bun test --changed=$AKROGON_BASE`: 12 pass, 0 fail.
- Bunfig grep for both keys: both present.
- Done-1 `bun test`, 3 back-to-back runs: 353 pass and 0 fail each. Bun-reported times: 10.92 s, 10.35 s, 34.61 s. The third run was likely slowed by other load on the machine. The baseline was 80-84 s.
- 4 runs started at once: runs 1, 3 and 4 had 353 pass. Run 2 had 352 pass and 1 fail: `next identifies dormant issue/resting without parsing and prefers active leaves [5264ms] ^ this test timed out after 5000ms.` Each run took about 34-35 s.
- Logs: `/var/tmp/akrogon-1000/concurrent-suite-5f2bdeaea53a/claude-1000/-home-ivan-Work-infra-akrogon-issues-worktrees-concurrent-suite/3c994dd2-4fd2-4966-bda0-65712ea94e00/scratchpad/{seq1..3,par1..4}.log`

## Finding (blocks handoff)
The 5000 ms timeout is the exact failure the design's 30 s default was meant to stop. The default does not reach that file. Probe: three temp files, each with two 6 s tests, run with the leaf's bunfig:
- Preload `setDefaultTimeout(30_000)`: 2 pass (first file only) and 4 fail at 5000 ms.
- Preload `beforeAll(() => setDefaultTimeout(30_000))`: 0 pass and 6 fail.
- Bunfig `[test] timeout = 30000`: 0 pass and 6 fail. bun 1.4.2 has no such key.
- `bun test --help` offers `--timeout=<val>`, and that flag works for every file.

The temp files were removed and the worktree is clean. This is not a base-red case. The failure comes from the concurrency this leaf adds, and the timeout fix this leaf was told to use is what fails.

## Operator decision needed (changes locked Q3 3b)
- O1: use `bun test --timeout=30000` in `checks.test` and `test_changed` (`issues/config.yaml`). The design excluded changes to that file.
- O2: call `setDefaultTimeout(30_000)` at the top of each of the 15 test files. The design excluded changes to other tests.
- O3: keep 5000 ms and accept rare timeouts when several suites run at once. Then drop `preload` and `tests/setup.ts`, since they do nothing for 14 of 15 files.

Known limitations: the timeout mechanism, as above.
Unverified criteria: none. Done-1 passed 3 of 3 times. The evidence round of 4 at once failed 1 of 4.

## Pass 2 (2026-10-02, plan D1/D2/D5 revised to O1)
Head: 66f85ef367c336a579f88429343658645a3222d3 (repair commit on top of 966a847)

Changes: removed `tests/setup.ts` and the bunfig `preload` key. The `tests/AREA.md` Non-obvious patterns section now says the 30 s timeout comes from `--timeout=30000` in `checks`. The lesson's Fix line now names D2.

Results (logs: `<scratchpad>/v2*.log`):
- `bun run format`: exit 0. `bun run typecheck`: exit 0.
- Probe with three temp files, two 6 s tests each, `bun test --timeout=30000`: 6 pass, 0 fail. Before, the preload gave 2 pass and 4 fail.
- `bun test --timeout=30000 --changed=$AKROGON_BASE`: 12 pass, 0 fail.
- Done-1, 3 back-to-back runs of `bun test --timeout=30000`: 353 pass and 0 fail each, in 11.46 s, 11.21 s and 11.22 s.
- 4 runs started at once with `--timeout=30000`: all 4 had 353 pass and 0 fail, in about 37 s each. That proves the timeout reaches every file.
- Bunfig grep: `concurrentTestGlob = "**/*.test.ts"` is present and `preload` is gone.

## Blocker: D2 config edit needs the operator
`akrogon phase` refuses any leaf branch that changes a file under `issues/` (`src/phase.ts:259` `requireNoIssueFiles`). So `issues/config.yaml` cannot change on this branch, and A edits only the leaf worktree. The config proof (`grep -c -- '--timeout=30000' issues/config.yaml`, expect 2) is still red.

Operator action, in the registered checkout `/home/ivan/Work/infra/akrogon/issues/config.yaml`, then sync it to main:
- `test: bun test --timeout=30000`
- `test_changed: ": \"${AKROGON_BASE:?AKROGON_BASE is required}\" && bun test --changed=\"$AKROGON_BASE\" --timeout=30000"`

After that, re-dispatch implement. A will confirm with `akrogon config`, rerun the configured `checks`, and hand off to check.review. No other code work remains.
