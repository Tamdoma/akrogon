# Slot D review of wake-cost, round 4

**Verdict `fix`** for release 1 `3ff3f5b5` and release 2 `7faab20b` on `814a2387`.

## Findings

- **F9 remains open for manual seat · release 2 `src/next.ts:683–687, 705–708, 748–760, 1342–1343`**. Park and unpark now preserve the first visit. A manual `seat` before wait import can still hide an existing visit from the next wake. I seeded a release 1 `visit_start` and capacity wait, with no state cache. Release 2's `seat` wrote `{ reason: none }` without importing `visited`. The next wake trusted that cache and appended a second `visit_start`. Import existing visit evidence before making the wait known in the manual seat path.
- **F10 remains open for escaped JSON · release 2 `src/timing.ts:134–145`**. The whitespace regression passes. A valid capacity row with `"slug":"\u0073paced"` decodes to slug `spaced`, but the raw substring filter drops it. The wake saved `{ reason: none }` and left the slot unused. Select rows by the decoded slug.
- **F11 · release 2 `src/timing.ts:135–142`**. A malformed row for a different slug can block a valid waiter. With a valid capacity row for `amber` and a truncated row naming `child-amber`, the wake warned for both leaves, left `amber` without a wait and left the slot unused. Identify the leaf named by a bad row before using it to skip an import.
- **F12 · release 2 `src/next.ts:1334–1343`, release 1 `src/next.ts:849–875`**. Rollback can requeue a leaf already seated by release 2. I queued two leaves, manually seated the newer one on release 2, then removed its terminal and woke on release 1. Release 2 had cleared the state wait without writing a prompt row. Release 1 used the old capacity row and gave the free slot to the older waiter. Keep the manual seat's prompt transition in both releases' timing history.
- **F13 · release 1 `src/next.ts:1302–1311`, `src/timing.ts:85–93`**. Release 1 still deletes the state wait when the prompt append fails. I made the timing path a directory during the manual seat, then restored the original file before waking on release 2. The seat succeeded with an append warning. Release 2 imported the old capacity row and started the older waiter. Keep the completed transition recoverable if its timing append fails.

## Re-check

- **F2 passes.** I tried a nonblocking `flock` from a separate process at entry to the landed dependent dispatch, after `mergeWake` returned. It found the global lock held in both releases. The wait writes read state under that lock.
- **F8 passes on the original replay.** A release 1 manual seat with a writable timing log wrote one prompt row before deleting the state wait. After the terminal disappeared, release 2 resumed that leaf before refilling the queue.

All 351 release 1 and 360 release 2 focused tests passed across seven files. Both typechecks and diff checks passed. The supplied full Verify logs record 1,379 and 1,388 passes. The probes used disposable worktrees and private fixture cores.
