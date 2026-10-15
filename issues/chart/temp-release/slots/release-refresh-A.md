# Release refresh, slot A (2026-10-16)

## What moved since 2026-10-02 (better-than-training, inspected code)
- Leaf temp is on disk now: `/var/tmp/akr-<uid>/<4 hex repo>/<8 hex leaf>` (src/config.ts:262-272). c698170 (2026-10-14): tmpfs `/tmp` counted leftover test files as slice memory and held admission closed overnight. The intake's "clear the RAM" goal is met by moving off RAM, not by faster deletion. The leaf-path lock (`/tmp/akrogon-<uid>/<hash12>`) is superseded; the 107-byte socket rule still holds (config.ts:262).
- Each seat runs in its own transient scope inside one slice per leaf (src/scope.ts:13-18, 150-165). A detached browser daemon that calls setsid stays in that cgroup, so a slice stop reaches it; the 10-02 herdr tab-close gap is closed for finished leaves.
- Finished leaves (merged, failed) with their tab gone: the pass stops the slice first (src/reconcile.ts:416-440, `systemctl --user stop`), then deletes leaf temp (reconcile.ts:735-742). `sliceHasProcess` exists (reconcile.ts:144-148) but is not used before deletion; a failed stop is kept as a slice report while the temp is still deleted (the delete only checks run-root keeps, reconcile.ts:740).
- Unfinished leaves whose tab is gone and no pane is inside: temp is deleted with no slice stop (reconcile.ts:736-742; slice step skips `!finished`, reconcile.ts:425).
- Failed leaves keep their tab; akrogon closes tabs only for merged leaves (reconcile.ts:308-314, 498, 525). So a failed leaf's processes and temp stay until the operator closes the tab.
- store-sweep (in check.fix) adds host-level temp sweeping; not on main yet.
- Live: /var/tmp/akr-1000 holds 75 repo folders, 496M, disk 26% used.

## Q1 (reshaped): every release stops processes, confirms the slice is empty, then deletes temp?
- Pick 1a: one release step for every outcome (merged, failed, vanished tab, parked with tab gone): stop the leaf slice, confirm with `sliceHasProcess` that it is empty, delete temp only then; a slice that will not empty keeps the temp and reports it. Reason: removes the two gaps (unfinished leaves deleted with processes possibly live; failed stop still deletes). Cost: small change in reconcile.ts; a vanished-tab leaf that gets redispatched must wait for cleanup first (reconcile and dispatch already share a pass).
- 1b keep today: finished-only stop, no empty check. Cheaper, leaves the gaps; on disk an unlinked open file holds disk, not RAM, so harm is small.
- Evidence: reconcile.ts lines above; systemd.kill(5) stop kills the whole cgroup, SIGKILL after TimeoutStopSec.
- Pitfall: deleting a redispatched leaf's fresh temp. Removed by deleting only when the slice is empty and no tab or pane is inside, in the same pass that dispatches.

## Q2: does a failed leaf release (tab closed, worktree kept) once its evidence is saved?
- Pick 2a: close the failed leaf's tab after its failure record is written, then release like any other outcome; worktree, logs and seat transcripts stay; retry starts fresh seats. Reason: the failed tab is today the only thing holding processes and temp for an unbounded time. Cost: the operator no longer finds the live seat conversation in herdr; transcripts stay on disk.
- 2b keep the tab until the operator closes or retries.
- Pitfall: losing evidence that only lives in the pane. Removed by closing only after the failure record and logs are saved; seat transcripts live in the harness session files, not the pane.

## Questions the fork does not ask
- Destination text says `/tmp`; it should say leaf temp lives on disk under `/var/tmp` (c698170) and is freed at release.
- 5b2f4d0 said disk `/var/tmp` made headless Chromium captures hang; c698170 moved back without naming that. Framework flaky list shows one browser test (2026-10-14) and no hang record since. Watch item, not a fork.
