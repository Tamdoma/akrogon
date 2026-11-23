# Slot D review of wake-cost, round 1

**Verdict `fix`**

Base `814a2387`  
Release 1 `706042c0`  
Release 2 `e118b7b3`

## Findings

- **F1 · Release 2 · `src/next.ts:859–901`.** An unstarted capacity waiter can disappear on upgrade. I filled the only slot on release 1, queued a second leaf through `next`, then raised the cap. Release 1 had recorded the capacity wait in `timings.jsonl` and left the leaf without a tab or worktree. Two release 2 wakes returned zero and left the free slot empty. Release 1's wake on the same fixture started the waiter. Carry forward pending capacity waits and their order at the release transition so ordinary wakes can stay off the timing log.
- **F2 · Release 2 · `src/next.ts:669–674, :1338–1342`.** A land-triggered wake writes the dependent's entire state outside the global lock. The direct `landedWake → dispatchDependents` call reaches `recordWait` when one dependency has just merged and another remains open. I gated that call just after its state read in a disposable build, saved `attempts.A = 1` under the real global lock, then let the wait write proceed while the lock was held. It wrote the prerequisite wait and reset the counter to zero. Route this dispatch through the same lock as the phase and automatic callers.
- **F3 · Release 1 · `src/config.ts:511–532`.** `akrogon config` silently loses issue-level seat settings in a surviving closed worktree. In the same registered checkout, with its merged owner already in `issues/closed`, the base reported the `ISSUE.md` slot A model `owner-a`. Release 1 reported the default `work` and exited zero. The config lookup still needs the closed owner when the current worktree belongs to it.

## Re-check

- **Rollback.** Release 1 ran `next` on a leaf after release 2 wrote its wait and preserved that value. F1 affects the forward transition.
- **Closed inventory.** The explicit closed scans cover pending broadcasts, cleanup, batch recovery and typed leaf selection. The closed-slug fallbacks keep dispatch and phase wake working after an owner moves. The closed-dependency test started its open dependent and the parked-dependency test left its leaf untouched. Closed inventory failures can be reported during cleanup without reserving an active slot. A plain check from a surviving closed worktree was refused by both the base and release 1.
- **Residue.** The historical timing fields, verify reuse filters and supported attempt outcomes remain. The removed attempt `members` key is accepted as an unknown key by the loose reader. The separate deletion of `issues/red-records.jsonl` is still outside these two commits.
- **Cost.** In a disposable fixture with 120 closed leaves and 100,000 timing rows, an instrumented wake made one `readTimings` call on the base and release 1, and zero on release 2. Median wall times over three runs were 278 ms, 298 ms and 165 ms. This is a fixture measurement.

The six focused suites (`state`, `next`, `timing`, `batch-dispatch`, `green-merge` and `merge-attempts`) passed on both releases, 305 tests on release 1 and 309 on release 2. Typecheck passed on both and `git diff --check` passed for the full range.
