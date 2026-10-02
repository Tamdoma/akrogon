# Design: concurrent-suite

## Binding decisions, verbatim
From `issues/chart/akrogon-slow-phases/forks/suite-speed.md`:

Operator 2026-10-02, verbatim: "1a | 2a"

- Q1 1a: run tests concurrently with max concurrency 8, configured in `bunfig.toml` so every seat and worker gets it; the two shared-console tests in `tests/shell.test.ts` stay serial. Reason: 80 s to about 14 s measured once. Foreclosed: splitting next.test.ts with `--parallel` (63 s), leaving it.
- Q2 2a: run a 10-run measurement on a scratch copy before handoff; result below.
- Q3 3b (operator 2026-10-02, verbatim "3b"): replaces 1a's limit of 8, which bunfig cannot hold. `bunfig.toml` `[test]` gets `concurrentTestGlob = "**/*.test.ts"` at bun's default limit 20, plus a `preload` setup file that calls `setDefaultTimeout(30_000)`. `tests/shell.test.ts:10` and `:42` become `test.serial`. Reason: one place for the setting, about 10 s, and it targets the one failure seen (a per-test timeout under load). Foreclosed: no timeout change (3a), limit 8 as command flags in `issues/config.yaml` (3c, two places, 5 s slower, unproven gain). Accepted risk: a hung test takes 30 s to fail.

From `issues/chart/akrogon-slow-phases/forks/implement-mode.md` (exclusion: no implement-mode change belongs here):

Operator 2026-10-02, verbatim: "1a | 2a | what about the b slot doing the fixes, is that still on?"

- Q1 1a: keep `implement: subagents` and the one-unit worker rule unchanged; look again once the fast suite has landed. Reason: on the Claude seat workers cost 3-18% and the suite was the cost (B,C). Foreclosed for this chart: one-unit inline exception, repo-wide inline, per-leaf mode. Accepted: the one-unit rule at `skills/implement-issue/SKILL.md:49` was skipped on proof-order and stays as written.

Excluded here: check lifetime and the changed-tests duplicate went off route (`issues/chart/akrogon-slow-phases/CHART.md`); `issues/config.yaml` stays unchanged.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: no auth, secrets, backend or browser are involved. The cheapest sufficient proof is the existing suite under the configured `checks`: it fails today when the two shell tests run concurrently, so a green concurrent run proves the serial marks. The implementation report records 3 back-to-back plain `bun test` runs with wall time and pass/fail counts and one round of 4 runs started at once, as evidence, not a criterion. (A,C) No new test is added for the timeout; the setting is configuration and the report's runs are evidence, not a vanity test. No live or outside call.

## Leaf architecture
- Owned: `bunfig.toml`, new `tests/setup.ts`, `tests/shell.test.ts` (two `test(` to `test.serial(` edits only), `tests/AREA.md`.
- Interfaces: bun 1.4.2 bunfig `[test]` keys `root`, `concurrentTestGlob`, `preload`; `setDefaultTimeout` and `test.serial` from `bun:test` (`node_modules/bun-types/test.d.ts:408,525`). Explicit per-test timeouts in test files keep overriding the default.
- Exclusions: no `--max-concurrency` anywhere, no `package.json` script change, no split of `tests/next.test.ts`, no change to `issues/` or to other tests unless a test fails under concurrency in this leaf, in which case it gets `test.serial` with the shared state named in the report.
- Dependencies: none.
