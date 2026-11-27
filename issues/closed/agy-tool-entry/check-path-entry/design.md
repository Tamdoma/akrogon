# Design: check-path-entry

## Binding decisions, verbatim

### fix-place (issues/chart/agy-tool-entry/forks/fix-place.md)
Operator 2026-11-27: "1 o3". O3 taken: constructedEnv drops <homePath()>/tool-entry from PATH via one helper extracted from realBash. F5/F6 seeded as one report.

Route: direct, reviewer slot D (codex gpt-6.2-sol high), named by the operator: "Use Codex GPT-SOL 6.2 Hi as your reviewer."

## Standing-design interpretation

Fix at the one boundary that builds every checked env (run-check, verify-pass via checkedRun, land via verify, setup in next.ts). launchPass and launchLand stay unchanged: their children pass through constructedEnv (A,B; C agreed in rebuttal). Match homePath() only: seat and check share one AKROGON_HOME.

## Leaf architecture

- src/tool-cgroup.ts: export `isToolEntryDir(dir: string, home: string): boolean` (name free), body taken from realBash's filter; realBash calls it.
- src/run-check.ts: constructedEnv filters `PATH` through it with `homePath()`.
- tests/run-check.test.ts: one case per criterion 1.

Out of scope (separate seed): direct `bun test` from a seat shell with the entry dir or BASH_ENV; realBash baking the host wrapper into scratch homes.
