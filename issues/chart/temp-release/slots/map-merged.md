# temp-release map: merged A + B

## Findings
- F1 (A,B) Disk vs RAM is already done: 5b2f4d0 (2026-10-02 16:56) moved leaf temp to `/tmp/akrogon-<uid>` (tmpfs), disabled the node compile cache and empties scratch on a new tab. Running panes keep their old TMPDIR and cache setting until their tab is recreated (B, src/next.ts:298-302,359-388).
- F2 (A,B) No temp-caused failure is established after 5b2f4d0 (offer-join failed at 14:59 UTC, after the 14:56 UTC commit, on a route 404, not temp) (framework issues/log.jsonl). Earlier failures had separate causes: socket length, full-suite load and timeouts, disk I/O, inode exhaustion (B, offer-join report.md:10-30, fleet-backup review-B.md:345-353). No measured speed comparison exists.
- F3 (B) A nested browser socket path is too long under leaf TMPDIR, by source arithmetic for a 32-character target ID (not a reproduced failure since 5b2f4d0). page-measure.mjs:312 makes `page-measure-XXXXXX` under tmpdir and browser-core puts `browser-core-<targetId>.sock` inside (cdp-core.mjs:67-70,118-121): 121 bytes with today's leaf path, over Linux's 107. Framework tests work around it by hardcoding `/tmp/bc-sb-` and `/tmp/bc-rf-` (offer-join worktree simple-banner.test.ts:25-32, route-fidelity.test.ts:88-98). The old 62-byte bound measured a different socket.
- F4 (A,B) Per-leaf folders sit on the same tmpfs as plain `/tmp`, so the disk vs RAM gap is gone; end-to-end speed is unmeasured (B R2). Their benefit is an owner for deletion, not more capacity: all folders share one inode pool (B R2).
- F5 (A,B) Deletion today is merged-only (src/next.ts:599-622, 777-794). Failed, parked and closed leaves keep scratch in RAM until a new tab or the 7-day sweep. The documented sweep names `/var/tmp`, not `/tmp` (B P4).
- F6 (B) Deleting files does not free RAM while a process holds them open (unlink(2)); tmpfs can also swap. A closed tab does not prove every browser or worker child exited; page-measure.mjs:323-326 kills the browser without waiting.
- F7 (A,B) Most current temp is not leaf temp: `/tmp/claude-1000` 9.5G (operator's Claude Code sessions, including this one), `page-measure-*` leftovers from 2026-09-30, `bc-sb-*` from the hardcoded tests, `/var/tmp/akrogon-1000` 12M stale. akrogon cannot safely sweep these by pattern.

## Proposed split
- akrogon (this chart): release rule and leaf path length.
- framework (new chart framework-temp-owners): browser-runtime socket path, hardcoded `/tmp/bc-*` tests, wait for child exit before removing a temp dir. Runs alongside; the socket budget waits on this chart's path answer.
- Off route: `/tmp/claude-1000` (operator's harness sessions; never swept by akrogon); one-time removal of the old `page-measure-*`, `bc-sb-*` and `/var/tmp/akrogon-1000` leftovers (operator step); `tmp-sweep` path update to `/tmp` (operator script).

## Forks (order: path first, it decides whether per-leaf ownership stays)
- T1 Path: 1a keep per-leaf folder on `/tmp`, shorten to `/tmp/akrogon-<uid>/<hash12>` and check the full socket path (B; 101 bytes for uid 1000, 107 worst case); 1b plain system `/tmp`; 1c keep the name, give browsers a separate short runtime dir. Recommend 1a (A,B). Reopens the old hash-only foreclosure on new evidence.
- T2 Release: 1a stop the leaf's processes, confirm exit, then delete scratch for merged, failed, parked and closed leaves and for a vanished tab; evidence goes to the leaf folder first; resume starts fresh (A,B); 1b merged only (today); 1c delete on state change without waiting for exit. Recommend 1a. Reopens the old failed-leaf retention.

## Pitfalls
- P1 (B) Running panes keep old settings; migration happens only after their tab restarts.
- P2 (A,B) Red-on-base log paths under TMPDIR vanish at release; names and tails already go in the report.
- P3 (B) A lost tab can redispatch the same leaf; cleanup must finish before new allocation of the same path.
- P4 (B) Per-leaf folders give ownership, not quotas; a live suite can still fill tmpfs.
- P5 (B) Before claiming a speed fix, run one named test fresh on old vs new path with identical settings.

## Research
- practitioner · systemd team, "Using /tmp/ and /var/tmp/ Safely" (systemd.io/TEMPORARY_DIRECTORIES): honor TMPDIR, tie private temp cleanup to the owner's lifetime; large temp normally on disk, departed from here on the recorded capture hangs.
- better-than-training · unix(7) 108-byte sun_path; unlink(2); kernel tmpfs docs; Node os.tmpdir and module compile cache docs; commits 1db7734, 5b2f4d0; src paths above; framework page-measure.mjs, cdp-core.mjs, offer-join tests.

## B rebuttal
slots/map-rebuttal-B.md R1-R3 applied above: timezone-corrected F2, F3 stated as arithmetic, F4 speed and inode claims narrowed.
