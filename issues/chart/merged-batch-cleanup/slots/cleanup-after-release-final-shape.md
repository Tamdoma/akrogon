# Proposed final shape: cleanup-after-release (A's pick under full autopilot, round 1)

Corrections from B's rebuttal are marked [R1], [R2], [R3].

## Mechanism

- Cleanup runs last in a pass: `nextCommand` and `unpausePass` (src/next.ts) run the existing `reconcileRepos` after the merge step (`mergePass`, and in `nextCommand` after the per-repo merge loop), once per invocation, under the global lock, for the same repos and the same `isAutomatic` flag as today, on a fresh discovery. The earlier pre-merge call is moved, not duplicated (signpost 3a); the plan keeps it in addition only if it names a same-pass dependency on pre-merge cleanup, recorded in the plan (B map F2b as the fallback).
- `mergeWake` is unchanged and never runs repo cleanup [R1]: its phase-command caller runs inside the reporting seat's terminal, and `endSeats` has no own-terminal veto (src/reconcile.ts `closeTabOf`, `endFinishedSeats`). That caller's own turn end is a listener event, so a later pass cleans.
- No state is cleared at the merged move [R2: the shared `commitMove` would cover both routes, but the live land unit and follow-up work objections stand].
- No new state, timer, event or listener change. Every existing veto is kept (state.batch, broadcast, foreign pane, process, owner, lock, Git cleanliness, own slice).

## Done-criteria (draft)

1. A `next` pass that releases a closed merged holder's landed, recorded batch, with no broadcast pending and finished seats, ends with no batch, no worktree pointer, path or registration, no branch, no recorded seats and its tab closed. Red on base, green after, asserted after that first invocation.
2. For each release route in a pass (holder already merged; merge holder with a landed candidate whose land unit died, moved by `commandMerged`), a second pass right after, with nothing else changed, removes nothing more than the first left.
3. Retention is unchanged: an unconfirmed publication (fetch failure) keeps batch, worktree and branch; a live land attempt is untouched; a working broadcast seat survives until it finishes; seat-owned phase completion clears the batch without closing the holder's own tab [R3].

## Stated limits

- L1. The land unit's own last event (no broadcast: `landedWake` ends seats and closes the tab, then exits) can start a pass while `landAlive` still answers active; that pass then keeps the batch and nothing follows. The pass reaches `landAlive` only after process start, discovery, sweep, cleanup and a `git fetch`, so the window is narrow; recorded, not designed for (signpost 4a).
- L2. A `mergeWake` from a land unit that releases another holder's batch leaves that holder to the next event.

## Excluded

Open-owner retention in `mergedWorktree` (B P7), leftover display (signpost 5a), the framework leftovers (operator).
