# Slot D review of wake-cost, round 2

**Verdict `fix`**

Base `814a2387`  
Release 1 `dfef3d2e`  
Release 2 `d5a2b917`

## Findings

- **F5 · `src/next.ts:894–909, :914–922`.** The per-repo marker strands capacity waiters queued during rollback. I let release 2 create the marker, switched to release 1 in the same state home, and queued an unstarted leaf at capacity. With a slot free, two wakes on release 2 left it untouched. Release 1's wake started it on the same fixture. Carry the wait queue across each transition back to a release that uses state waits.
- **F6 · `src/next.ts:669–674, :722–732, :859, :898, :1540–1554`.** A typed `next` can reset an existing wait before the first import. I queued two leaves on release 1, then retried the older leaf with the cap still full. Release 1 kept its timestamp. The same retry on release 2, before any automatic wake, wrote a fresh capacity timestamp. The first wake imported the younger leaf's old timestamp, skipped the older leaf's populated state, and gave the younger leaf the only free slot. Carry waits before the first release 2 command that can write them.
- **F7 · `src/next.ts:894–909`, `src/timing.ts:96–105`.** A failed timing read commits the carry marker. I appended one malformed row after a valid release 1 capacity wait. Release 2 warned about the read, returned zero and wrote the marker. Restoring the original valid file left the waiter stranded on the next wake. Release 1 then refilled it. A failed read should leave the carry eligible to retry.

## Re-check

- **F1 passes on a clean first upgrade.** A release 1 waiter started on release 2's first wake, and release 1 accepted and preserved the wait state on rollback. A disposable read counter measured one timing-log read on the first healthy wake and zero on the next.
- **F2 closed.** I gated the land-triggered wait write after its read. A competing state writer waited for the global lock, then saved its counter. Both the counter and the prerequisite wait survived.
- **F3 closed.** Both releases reported the issue-level slot A model from a surviving closed worktree.
- **F4 verified with legacy state.** I seeded an already-closed merged owner with a live tab and no broadcast record. `landedWake` found it and closed the tab. The normal land completion's broadcast path was exercised by the checked-in suite.

All 350 release 1 tests and 355 release 2 tests passed across `config`, `state`, `next`, `timing`, `batch-dispatch`, `green-merge` and `merge-attempts`, using `--timeout=120000 --max-concurrency=5`. Both typechecks and `git diff --check` passed. The probes used disposable worktrees and state homes.
