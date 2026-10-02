# Release

## Question
Q1. When a leaf releases (merged, failed, parked, closed, or its tab vanished), does akrogon stop its processes, confirm exit, and delete its scratch, or keep today's merged-only deletion?

Q2. Does a failed leaf release right after its failure evidence is saved (tab closed, worktree kept), or keep its tab until the operator closes or retries it?

### Carries
- INTAKE operator note: "clearing all the ram as soon as teh leaf releases".
- Prior lock test-time-and-temp/forks/leaf-temp.md Q2: failed leaves keep their folder; reopened by the operator note.
- Map F5, F6, P2, P3 (slots/map-merged.md).

## Findings
- Round files: slots/map-A.md, slots/map-B.md, slots/map-merged.md, slots/map-rebuttal-B.md.
- (A,B) Deletion today is merged-only (src/next.ts:599-622, 777-794); failed, parked and closed leaves hold scratch until a new tab (src/next.ts:340) or the 7-day sweep, which still names `/var/tmp`.
- (B) Deleting files frees no RAM while a process holds them open (unlink(2)); a closed tab does not prove every child exited (page-measure.mjs:323-326 kills without waiting). Release = stop processes, confirm exit, then delete.
- (B) A vanished tab can redispatch the same leaf (src/next.ts:793); cleanup must finish before reallocating the same path.
- (A,B) Red-on-base log paths under TMPDIR vanish; seats copy needed logs into the leaf folder first (B R5).
- Round files: slots/release-A.md, slots/release-B.md, slots/release-merged.md, slots/release-rebuttal-B.md.
- (B) herdr tab close snapshots session PIDs, signals with 250 ms waits and returns success even if processes remain (herdr pane.rs:1185-1259, linux.rs:386-436, v0.9.3); framework browser-core daemon starts detached in a new session (cdp-core.mjs:2416-2420) and escapes it.
- (A,B) Recommend Q1 1a: each seat in its own cgroup scope; release stops the scope, confirms it is empty, then deletes scratch; failure to empty keeps scratch and reports. (A) Mechanism without herdr change: adopt the fresh pane shell PID into a transient user scope (systemd StartTransientUnit PIDs) before `herdr agent start`; all panes share the terminal scope today. (B R1, R2) only post-adoption work is contained; wait for the start job and verify membership, refuse launch on failure. Probe required before handoff.
- (B R3, held) stored run generation and exit receipt vs A's global-lock serialization: design decides.
- (A,B after R6) Q2 failed leaves: close the tab after failure evidence is saved, release like any other, keep the worktree; a retry starts fresh seats.
- Research: Poettering, Rethinking PID 1 (0pointer.de, 2010-04-30); systemd.io/CGROUP_DELEGATION; kernel cgroup v2; systemd.kill; unlink(2), setsid(2).

## Taken
