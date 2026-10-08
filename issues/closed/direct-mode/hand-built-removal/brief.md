# Brief: hand-built-removal

## What
Remove the `hand_built` leaf field. A `state.yaml` containing `hand_built` is rejected by the state schema like any other
unknown key. Dispatch and the merge queue no longer have a hand-built branch. The chart-issues door and shapes no longer
mention it, and the operator guide points to `akrogon park` as the way to keep work away from agents.

## Why
A hand-built leaf can never complete: `mergeQueue` excludes it (src/turn.ts:9-10), so `akrogon phase <slug> merged` is
refused and the folder never moves to `issues/closed/`. Its purpose, keeping work out of dispatch, is covered by
`akrogon park`, and attended agent builds are covered by the direct route. The operator wants one way to do each thing.
The only two records that used it (issues/closed/akrogon-loop/bootstrap/command and core-skills) had the line removed on
main on 2026-10-08.

## Done-criteria
1. A leaf whose `state.yaml` has `hand_built: true` is reported as unreadable by `akrogon status` with the schema error, like any unknown state key.
2. `akrogon next` and the merge queue treat every readable leaf the same way; no code path reads `hand_built`.
3. skills/chart-issues/SKILL.md, skills/chart-issues/assets/shapes.md, docs/guide/state.md and docs/guide/problems.md no
   longer mention `hand_built`; docs/guide/state.md names `akrogon park` for keeping work away from agents.
4. No `state.yaml` under `issues/open`, `issues/parked` or `issues/closed` of any registered repo root contains a
   `hand_built` key, so removing the field makes no existing record unreadable. (A,B,C)
