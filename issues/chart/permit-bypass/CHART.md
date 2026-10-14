# Chart: akrogon

## Destination
Leaves run checks without a host-wide run line, the akrogon.slice ceiling keeps the PC safe, and concurrent runs neither clog inside the slice nor stall a seat on its tool timeout.

Route: lifecycle (debate no)

## Forks taken
- [Load guard](forks/load-guard.md): start check under 48 GB anon+shmem, one start per ~30 s; stopgap 4 lanes until it lands (operator 2026-10-13)
- [Guarantee](forks/guarantee.md): remove the run permit entirely; the akrogon.slice ceiling is the only host limit (operator 2026-10-13)
- [Cross-leaf kill](forks/cross-leaf-kill.md): per-run unit plus scoped stop-run; pattern-kill rule now (operator 2026-10-13)
- [Worker duty](forks/worker-duty.md): workers run targeted tests; A runs changed-tests (operator 2026-10-13)
- [Dispatch WIP](forks/dispatch-wip.md): max_active 12 now (operator 2026-10-13)
- [Long-run path](forks/long-run-path.md): skill background pattern with exit file (operator 2026-10-13)
- [Evidence](forks/evidence.md): closed, one check-issue sentence (operator 2026-10-13)
- [Ceiling trigger](forks/ceiling-trigger.md): verify:core only (operator 2026-10-13)

## Open forks
(none)

## Fog
(none)

## Off route
- Orphan check_start rows when a run dies: no reader in this destination depends on them; run-units ends dead runs, the timing reader is leaf-speed's concern.
- Detached run-check mode and a run-id wait API (long-run-path Taken).
- Permit count, queue visibility for the permit, entry-point gates: no line (guarantee Taken). Fork files permit-count.md and queue-visibility.md kept as records, closed by that answer.
- TasksMax: foreclosed in host-test-load (crashes suites).
- Framework fan-out caps and merge-first priority: own triggers in host-test-load.
- Raising the pi shell cap as the fix: a queued run outgrows any finite cap.
- A PATH shim on bun: breaks single-file worker tests, easy to escape (A,C).
- Re-adding ~/.akrogon/framework-tests.lock: replaced by the permit.

## Pending steps
- Before memory-start-check merges: the door reverts the operator's uncommitted 4-lane stopgap in the root checkout (`git checkout src/permit.ts`). Owner: door (A). Waits on: memory-start-check reaching merge. Check: `git status --short src/permit.ts` prints nothing.
- When every concurrent-checks leaf is merged: the door runs `akrogon close Tamdoma/akrogon#89 --by "concurrent-checks <merge shas>"` and the same for #90. Owner: door (A). Waits on: all three leaves merged. Check: both identities closed on GitHub. Status: done 2026-10-14, both closed with "concurrent-checks memory-start-check ca02364, worker-test-duty d9ab236, run-units 2dbcf99".

## Second destination
framework: /home/ivan/Work/infra/tamdoma/framework/issues/chart/test-cost/ (subset runs in parallel, shrink the 97-always floor).

Territory map: [slots/map-merged.md](slots/map-merged.md), systems map: [slots/system-merged.md](slots/system-merged.md)
Handed off 2026-10-13
