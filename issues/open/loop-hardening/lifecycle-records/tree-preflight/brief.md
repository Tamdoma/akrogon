# Brief: tree-preflight

## What
Leaf discovery rejects a `state.yaml` directly under `issues/open` or `issues/closed` and any leaf deeper than epic/issue/leaf, naming the path. `Missing leaf: <slug>` says `(parked)` when the slug exists under `issues/parked`. The chart door preflight in shapes.md refuses an owner whose folder name already exists under `issues/closed`.

## Why
A leaf at the wrong depth self-deadlocks on `issues/.lock` or locks and completes the wrong container, and a reused closed name fails only at completion (#14).

## Done-criteria
1. `bun test tests/next.test.ts` and `tests/status.test.ts` pass with new cases: a state.yaml directly under open is rejected with its path before any lock is taken; a four-level tree is rejected the same way; `akrogon status <slug>` and `akrogon next <slug>` for a parked slug print `Missing leaf: <slug> (parked)`; all existing fixtures still load.
2. `skills/chart-issues/assets/shapes.md` preflight paragraph names the closed-owner check; the chart-issues SKILL.md audit sentence lists it.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
