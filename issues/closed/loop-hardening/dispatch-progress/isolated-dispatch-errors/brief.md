# Brief: isolated-dispatch-errors

## What
`akrogon next` continues past a repo or leaf it cannot read, dispatch or clean. Each skipped scope prints one structured stderr JSON line with `repo`, `path` or `slug`, and `error`; the command exits nonzero when anything was skipped; every other leaf and repo is still dispatched. A repo with any unreadable leaf counts all of its leaves as active for `max_active`.

## Why
One bad state.yaml, a missing blocked-by target, a deleted registered path, a failing fetch or a dirty merged worktree stops all dispatch on the machine with no signal (#6, reproduced traversal stop).

## Done-criteria
1. `bun test tests/next.test.ts` passes with new cases using the fake herdr: (a) a registered repo whose path is missing is reported and a healthy repo is still dispatched; (b) a leaf with `blocked-by: [nonexistent]` is reported and its sibling is dispatched; (c) a leaf with an invalid state.yaml is reported, its sibling is dispatched, and capacity treats the repo as full; (d) a merged leaf whose worktree removal fails is reported and the sweep still runs; (e) exit code is nonzero in each case and zero when nothing is skipped; (f) an error inside the lock helpers still propagates (not swallowed).
2. Error lines are JSON with the listed fields and the original error message; no error is converted to an empty success.
3. CLI end-to-end run with one broken and one healthy leaf leaves `implementation/cli-artifact.log` with stderr and exit code.
4. `bun run format`, `bun run typecheck`, `bun test` pass.
