# Brief: keep-chart-in-place

## What
`completeOwner` (src/phase.ts:171-174) stops moving `issues/chart/<owner>` into `issues/closed/<owner>/chart`. The completed owner still moves to `issues/closed/<owner>/`. The chart stays in `issues/chart/<owner>/` unchanged.

## Why
Tamdoma/akrogon#39: a chart holding draft leaves at `slots/leaf-draft/<slug>/state.yaml` was moved under `issues/closed`, where `discover` (src/next.ts:95-105) and `leavesUnder` (src/state.ts:93-101) read it as a leaf at an invalid depth. That made the repo's inventory unreadable, which stalled `akrogon next` and made `akrogon phase` fail for every leaf in the repo.

## Done-criteria
1. `src/phase.ts` no longer renames the chart during owner completion. The completed owner still moves to `issues/closed/<owner>/`.
2. tests/phase.test.ts:169-185 and 638-683 assert the chart stays at `issues/chart/<owner>/CHART.md` after completion, and `issues/closed/<owner>/chart` does not exist.
3. A new test in tests/phase.test.ts or tests/next.test.ts builds an epic whose chart holds `slots/leaf-draft/<slug>/state.yaml` copying a real leaf's state (same slug), merges every leaf through `akrogon phase ... merged`, then asserts: the chart file tree is byte-identical to before completion; `akrogon next --all` stderr has no `Invalid leaf depth` and no `Duplicate leaf slug`; `akrogon status <slug>` for a merged leaf exits 0.
4. Negative case: a real leaf at an invalid depth under `issues/open` or `issues/closed` still reports `Invalid leaf depth` (existing tests/state.test.ts:114-135 and tests/next.test.ts:2102-2133 keep passing unchanged).
5. `bun run format`, `bun run typecheck` and `bun test` pass.
