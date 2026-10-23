# Design: record-panes-early

## Binding decisions, verbatim

Chart: issues/chart/orphan-pane, fork [pane-record](../../../chart/orphan-pane/forks/pane-record.md). Taken 2026-10-22, A's pick under autopilot (not operator words): (a).

1. allocate saves each seat pane id to state as soon as it has it, before boxing that pane. A after `first` is resolved, B after `second` is resolved; the B save carries A and can replace the final save.
2. No save drops a live recorded seat: the repair path saves `{A: first, B: recordedB}`.
3. broadcastPass loses its live-B shortcut; every pending broadcast obtains its state through allocate (today's dead-B path), so dispatchSlot is reached only after allocation boxed both seats.
4. The comment "Boxed before any save records it" is replaced by the new invariant: a recorded pane may be unboxed only until the entry sweep or the box step runs; dispatch follows successful boxing.
5. Stated limit: a pane herdr creates whose id is never durably saved (kill during the split call, lost response, failed saveState) stays unrecorded; operators close it by hand. No ownership marker is built.

Reason: recording at creation removes the orphan class on every allocate path (bootstrap, repair-A, missing-B) and relies on existing recovery (entry sweep closes a recorded outside pane), moving saves rather than adding a mechanism. Deleting the broadcast shortcut removes code and the one consumer of the old ordering.

Rejected: (b) bootstrap reuses an unrecorded member as B: bootstrap-only, adopts operator hand-split panes, picks by position. (c) reconcile unrecorded members with an ownership marker and /proc probe: new machinery for a millisecond window. (d) catch/finally close of the fresh pane: misses process death, can mask the error. (e) rebuild the tab: destroys operator panes. Clearing stale ids when the sweep closes a pane: not needed, consumers re-resolve against live panes. Standing dissent: none.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: every criterion is proven at the `akrogon next` boundary through the existing test files and fixtures (tests/seat-containment.test.ts, tests/next.test.ts, tests/fake-herdr.ts and the existing busctl/proc fakes) run by the `test` check. These fakes are existing test fixtures, not machinery. (B,C) Criteria 1, 2 and 3 are bug fixes: each test fails on the current code and passes after the change. (A,B,C) The existing all-calls `busctl.fail` switch (tests/fake-busctl.ts) suffices because `box` skips adoption for a pane already inside its scope: criterion 1 runs a pass with a live boxed recorded A and a missing B (its recorded pane closed), so only B's adoption reaches busctl; criterion 2 keeps a boxed recorded B and removes A, so only the replacement A's adoption reaches busctl; each then removes the switch and runs the retry pass. No new fake switch is added. Criterion 4 guards an existing contract (docs/guide/next.md: hand-split panes are not boxed). No live run, no outside call, no model stage.

## Leaf architecture

Owned surfaces: src/next.ts `allocate` (save order and its comment) and `broadcastPass` (the live-B shortcut); docs/guide/next.md, the paragraph on boxing pane shells; the tests proving the criteria.

- `allocate`: save `{...tabState, pane: {A: first.pane_id, B: <recordedB id when live, else none>}}` once `first` is resolved and before `box(first)`; save `{...tabState, pane: {A: first.pane_id, B: second.pane_id}}` once `second` is resolved and before `box(second)`. The existing repairB save before the swap is the same pair and may merge with the first save. Return value is unchanged.
- Entry sweep in `allocate` (close recorded panes `inOwnScope` reports `outside`, throw on `unreadable`) is the recovery for a recorded unboxed pane; unchanged. Its precondition is that the recorded id is in the live pane list, which holds for a pane allocate just split.
- `broadcastPass`: replace `(await panes()).some(... fresh.state.pane.B) ? fresh.state : await allocate(...)` with `await allocate(...)`. allocate already runs for a pending broadcast whose B is dead, so a merged leaf through allocate (ensureWorktree, tab match, sweep) is an existing path. (C) Open for the plan: confirm, against today's dead-B path, allocate's `null` return (max_active with no matching tab), ensureWorktree's live and dead `.env` write behavior on a merged leaf, and the entry sweep on a merged leaf whose live B is `outside` (closed and recreated) or `unreadable` (throws, broadcast skipped that pass, a new stop the shortcut never had and the intended one).
- Consumers of recorded pane ids that read without prompting: src/log.ts session logging, src/reconcile.ts `broadcastInProgress`, src/next.ts `observeBusy` in dispatch, `ownsPane`/hook owner checks, `dispatchSlot` (called only after allocate). They re-resolve ids against the live pane list or only read status; none needs change.
- Exclusions: no ownership marker, no sweep of unrecorded tab members, no catch/finally pane close, no change to reconcile, stop or `adoptShell`/`inOwnScope`.
