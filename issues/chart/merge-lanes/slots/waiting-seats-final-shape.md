# waiting-seats proposed final shape (A's autopilot pick)

1. `activeCount` stops counting leaves in phase `merge` in both branches (the `unfinished` test that both branches and `seated` use excludes `merge`); `check.repair` counts; `unknown` and `unreadable` terms unchanged. A red exit keeps its seat exemption in `allocate` (count may pass 12 by about one leaf per line turn). `max_active` text in `src/config.ts`, init-akrogon and docs says it counts leaves outside merge.
2. Both seats of a waiting merge leaf stay alive; no close path. Reasons: fast hand-off and no new code (not cheap tokens: a long-idle B wake is often uncached).
3. `capacity` joins `waitReasonSchema` and the report's `waitOrder`; `dispatchLeaf` writes it where `allocate` returns null. `broadcastPass` writes no row. Baseline: B's M1 (hours with 12 or more seated, overcounted); the after figure is read in the same unit, hours with at least one open `capacity` wait.
4. Reopen triggers, recorded as a pending step, no code: `memory.events` high on `akrogon.slice` moves off 0, or more than 20 leaves wait in one repo's merge. Revisit then: idle-age seat close (broadcast-only wakes first, 73 of 201 landed leaves), `max_active`, a queue bound.
5. [new, carried to the red-exit leaf] A merge leaf's slice must not depend on live seats: `sliceKeepReason` (`src/reconcile.ts`) keeps the slice while the leaf is in `merge` and holds the turn or a live land run, so a holder whose seats die cannot lose `akrogon-land-<attempt>` during setup, gates or push.

## Check asked

Name only what is wrong, cannot be built as written, contradicts a lock in forks/signposts.md `## Taken` or forks/red-exit.md `## Taken`, or misstates your position. One short pass. "None" is valid.
