# Map A: akrogon slow phases

## Measured (2026-10-02, scratch worktree at HEAD fd1b175, bun 1.4.2)
- `bun run format` 0.7 s, `bun run typecheck` 1.1 s, `bun test` 80 s (353 tests, 15 files).
- `tests/next.test.ts` alone is 63-66 s (148 tests). The next slowest file is `tests/phase.test.ts` at 6.3 s. All other files are under 2.5 s.
- Inside next.test.ts no single test dominates: 9 tests over 1 s sum to 12.8 s; the rest is about 0.4 s each, mostly fixture setup (git repos, herdr fakes).
- `bun test --changed=$AKROGON_BASE` (the `test_changed` check) ran 72-83 s in leaf-temp-dir, the same as the full suite, because next.test.ts imports most of `src/`.
- leaf-temp-dir implement+repair session (pi, 46 min): subagent waits 24 min, 8 bun test runs 6.7 min, everything else under 2 min.
- bun 1.4.2 offers `--parallel=<N>` (files in worker processes) and `--concurrent` (tests inside a file at once, default max 20). Neither is used in package.json or config.

## Forks
1. Speed the suite: split next.test.ts into files so `--parallel` spreads it, or make its tests safe for `--concurrent`, or both.
2. Make `test_changed` actually narrow: today it equals the full suite for any src change.
3. Count of runs per leaf: how many times A, workers, B review and B merge each run the suite (peers measuring).
4. Worker (subagent) time: the largest block in the sampled session; whether `implement: subagents` pays off for small akrogon leaves versus `inline`.

## Pitfalls
- Concurrent tests sharing env vars, cwd or TMPDIR in fixtures will flake. `tests/helpers.ts` builds isolated repos; process-global state (process.env, chdir) is the risk.
- The check-reruns chart (handed off 2026-10-01) already set which checks run when. This chart changes how fast they run, not when.

## Recommended destination
The akrogon suite runs in about 15 s instead of 80 s, by splitting next.test.ts and running files in parallel, so every implement, worker, review and merge pass pays a fraction of today's test time. Worker overhead is a second fork once run counts are known.
