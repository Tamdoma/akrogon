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

## Refresh 2026-10-16
- Round files: slots/release-refresh-A.md, -B.md, -C.md, -merged.md, -rebuttal-B.md, -rebuttal-C.md.
- (A,B,C) Leaf temp is disk-backed `/var/tmp/akr-<uid>/<4>/<8>` since c698170 (tmpfs held admission closed overnight); the leaf-path lock is superseded on place.
- (A,C; B rebuttal qualifies) worktree-cleanup #93 (store-sweep merged at 74472d3) stops merged and failed leaves' slices once the tab is gone and deletes temp only with no pane inside, no running unit in the slice and no process using the folder (src/reconcile.ts:476-500, 951-973, 702-711).
- (B,C rebuttals) Gaps left: the stop step skips every unfinished leaf (`finished`, src/reconcile.ts:190, 486, 1056), so an unfinished leaf whose tab vanished keeps its slice processes; with the unit inventory unreadable, temp is deleted without a slice check (src/reconcile.ts:965-972); parked leaves are outside the leaf map (src/state.ts:153-156), and park checks only the tab and worktree fields (src/park.ts:23-26).
- (A, measured) issues/log.jsonl 2026-09-16..10-16: 116 of 117 failed leaves were recovered into the same tab (akrogon 16, median 12 min; framework 100, median 19 min); one still failed (framework model-run-harness).
- (A) Framework `akrogon flaky`: no Chromium hang recorded since c698170.

### Round, 2026-10-16 (written by A; operator on autopilot)
Q1. When a leaf fails, should akrogon close its tab right away to free its processes? 1a (recommended) keep the tab: 116 of 117 failures last month were resumed in the same tab within about 15 minutes, and closing would make each one a cold restart. 1b close the tab once the failure is saved.
Q2. Should akrogon also clean up a leaf that did not finish when its tab is gone? 2a (recommended) one small leaf: drop the merged-or-failed condition from the slice stop, so any leaf whose recorded tab is gone and that has no running check gets its processes stopped, then its temp deleted; an unreadable unit list keeps the temp. It removes a special case instead of adding one. Parked leaves stay as today, since park refuses a leaf that has a tab. 2b close the chart and accept the gaps.
Q3. Where should leaf temp live? 3a (recommended) keep it on disk under `/var/tmp`, where it uses no RAM; c698170 moved it there after tmpfs temp held admission closed overnight, and no Chromium hang has been recorded since. 3b move it back to `/tmp`, which is RAM.
Challenge check: B picked closing failed tabs (1b) before the recovery measurement; C picked keeping them. B and C both rejected "Q1 delivered" because of the unfinished-leaf and inventory gaps, and 2a covers both. Parked-leaf temp stays with the unowned sweep (C accepts it as a small, rare remainder).

## Taken
2026-10-16, A on operator autopilot delegation (operator, verbatim: "only you decide for me and start the charts when they're handed off"): `1a | 2a | 3a`.

Reason: 1a: 116 of 117 failed leaves last month resumed in the same tab (median 12-19 min), so closing failed tabs would turn recoveries into cold restarts for little gain now that temp is on disk. 2a: one rule for every phase removes the merged-or-failed special case and closes the unfinished-tab and unreadable-inventory gaps B and C found. 3a: disk temp uses no RAM, and c698170's overnight admission incident is the newer evidence.

Final shape, after the final-shape check (C no disagreements; B F1, F2 applied):
1. Failed leaves keep their tab. No change.
2. Both slice-stop paths (src/reconcile.ts:476-500 per repo, :1045-1068 host) stop the loaded slice of any leaf, whatever its phase, whose recorded tab is proven gone, that is not the pass's own slice and that no live run record names. An unfinished leaf with no recorded tab is not stopped. `reconcileNeedsPanes` (src/reconcile.ts:397-405) requests real pane inventory for every such candidate with a recorded tab, even when its temp folder is absent; a skipped or unavailable inventory never counts as a vanished tab (B F2).
3. Leaf temp deletion (src/reconcile.ts:951-973) keeps the temp with an inventory-unavailable reason when the unit list is unreadable, for every phase.
4. Every dispatch path, manual merge dispatch included (src/next.ts:1169-1175), takes the global lock that reconcile holds, so a pass never stops or deletes temp for a dispatch that recorded its tab but has not adopted seats; tab-loss cleanup finishes before replacement seats join the same slice, and a later pass keeps them (B F1). The admission-lock recheck stays.
5. After a tab-loss stop the existing tab_closed flow still re-dispatches the leaf.
6. Parked leaves stay outside the leaf map; their temp stays with the unowned sweep.
7. Leaf temp stays at `/var/tmp/akr-<uid>/<4>/<8>`.
Foreclosed: closing failed tabs at failure (1b), accepting the gaps (2b), moving temp back to tmpfs `/tmp` (3b), a parked-leaf release rule.

