# Brief: fix-red-base-tests

## What
Update the two tests that commit f3199df left stale so they match the current, documented behavior. No file under `src/`, `skills/` or `docs/` changes.
- The fake herdr (`tests/fake-herdr.ts`) answers `herdr agent list` with each fixture pane's `pane_id`, `agent` and `agent_session`, so `skills/chart-issues/scripts/peer-wait.ts` runs against it through its done, blocked, failure and budget outcomes.
- The dependents-first ordering test expects the exit code that `docs/guide/next.md` documents when every picked leaf waits only on open, in-progress dependencies: exit 0.

## Why
`bun test --timeout=30000` is red on base f3199df with 9 identical failures (8 peer-wait, 1 dependents-first). That blocks leaf merge-clean-worktree at check.fix. Neither failure comes from that leaf's diff.

## Done-criteria
1. Under the fake herdr, peer-wait reaches each of its four outcomes (done, blocked, failure, budget) with unchanged stdout and stderr, and no call fails with `Unexpected fixture invocation`.
2. `akrogon next --all` over a dependency chain still dispatches the leaf with unmerged dependents before an earlier leaf with none, prints the documented `waiting:` line, and exits 0 as `docs/guide/next.md` states.
3. The leaf's diff touches only files under `tests/`.
