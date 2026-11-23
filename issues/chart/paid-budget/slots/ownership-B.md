# Ownership B: paid-budget

Read at worktree head aefec9d6. (H) marks what I ran on this host on 2026-11-23. Nothing in the repo changed.

1. Pick O3: a kernel lock for the judge's whole life, with the helper the repo already has. `await flockHold('<realRuntime>/akr-e2e-watch.lock', '-x')` at the top of the test file (`src/flock.ts:15`). The lock file is never removed.
2. Why not O1: a folder cannot tell a live owner from a dead one. A killed judge, a reboot (`coreState` is under the home folder and survives it) or a failed teardown all strand the claim until a person removes it. F22 is one case of that class. O1 does close F23 and F21.
3. Why not O2: one grant means one paid run at a time, so a lock is the honest form. O2 also needs the operator.
4. With the lock, leftovers at start belong to no live run, so the judge removes them with the same cleanup it runs at the end. That needs a fixed slice name (`akrogon-e2ewatch.slice`) in place of the pid one, so the next run can kill a dead judge's slice. It also closes design risk R6.
5. F22: no claim exists to strand. The kernel drops the lock on any exit. F23: the absence check runs under the lock, and a successor waits in `flock` until the judge has exited. F21: remove `<out>`, then copy, as A says.
6. Checked (H): a second Bun test waited 2,612 ms at module level and passed with a 1,000 ms test timeout, so the wait does not eat the test's time. After SIGKILL of the holder's process, the next one had the lock 1.3 s later. No holder process was left.
7. Race left, R1: the judge is SIGKILLed after the body scope starts. The lock drops in about 1 s while the body's core still runs. A second judge takes the lock and starts its cleanup. Between the lock drop and its `cgroup.kill`, the dead run's body can start one more paid session. The window is about a second and the session dies in that kill. It is in no `paid-sessions.json`.
8. Race left, R2: none between two live judges. The lock is the only shared step and the kernel orders it.
9. Could break, R3: start cleanup deletes a dead run's `coreState`. Its report under `<out>` was never copied, so that run's evidence is lost either way.
10. Could break, R4: the lock must be taken at module level, before the test's timer. Inside the test, a wait longer than `teardownMs` (`tests/e2e/watch-consults.e2e.ts:29`) lets Bun end the test before the judge's teardown.
11. Delete: `claimCoreRuntime` and its comment (`tests/e2e/watch-tier.ts:54-61`), the leftovers refusal in it, the comment at `tests/e2e/watch-consults.e2e.ts:137`, and the pid in the slice name (`:42`). `absent()` stays for the end check only. The `rmSync` of both paths moves into one cleanup function called at both ends.
12. Added: one `flockHold` line, one lock file, and `recursive` on the body's `mkdirSync` (`tests/e2e/watch-tier.ts:132`).
13. If A wants the smallest change: O1's order plus the lock, and keep the refusal on leftovers. That closes F21 to F23 and leaves point 2's strand for a person.
