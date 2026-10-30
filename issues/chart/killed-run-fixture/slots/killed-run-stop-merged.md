# Merged notes: killed-run-stop

Sources: [killed-run-stop-A.md](killed-run-stop-A.md), [killed-run-stop-B.md](killed-run-stop-B.md).

## Q1 · promise
- (a) loud refusal at the seat's next move, containment kept (A,B). Reason: keys on the leftover, so every death cause is caught; no timer, no new credential. Cost: nothing cleans until a seat returns; a rerun before the move is not mechanically stopped (B R1), so skills say recover before retry.
- Cleanup scope: the grant's own discovery, cleanup and authenticated absence check for that run, not only IDs the pair printed, since a create can succeed before its ID prints (B D1; A agrees).
- (b) rejected (A,B): SIGKILL, reboot still leak; reverses #120 ownership. (c) rejected (A,B): watchdog lock 2026-09-18, no cleanup authority. (d) rejected (A,B): the stop-run prose already existed in check-issue and implement-issue.
- Evidence: bun 1.4.4 skips `finally` on SIGTERM, measured 2026-10-28 (A). `startRunGuard` stops the scope after wrapper death (A,B).

## Q2 · live vs dead
- A: live while any process holds either capture file open (`procRoot()`/*/fd scan), with `checkedRun` holding its own fd on both from creation until unlink so creation, child launch and publication have no gap.
- B: a new per-run lock whose lifetime spans creation, child execution and publication, probed non-blocking.
- Agreed rejections (A,B): capture existence or age (clock, not death); admission records alone (nested runs have none, `startRunGuard` removes the record before the stop ends); owner `.lock` (one per owner, not per run).
- Pitfalls: a startup or publication gap reads a live run as dead (B R4), removed by the wrapper holding the capture from creation until unlink and proven by killing the wrapper at startup, during the child and during publication. Nested runs need their own answer (B R5); an open fd covers them because the nested child holds its own captures.
- B R6/R7 packed captures bypass the gate: pack runs only on closed owners and charts (`src/AREA.md` pack line, `completeOwner` at merged), after the guarded moves (A); B wants pending evidence read in both forms.
- Differ: A open-fd scan, no new lock; B per-run lock.

## Q3 · coverage, moves, clear
- Every leaf, regardless of fixture declarations (A,B).
- Refuse every non-failed seat move, `--check` and a single slot's completion included; moves to `failed` and operator recovery from `failed` stay open (A,B). B: also recheck before completion side effects in `commandMerged`/`completeOwner` (F8).
- Clear: A: the seat records the cleanup result in its own review or report file, then renames the pair to `killed-<name>-<run>-{out,err}.log`, so bytes stay readable by `akrogon log` and pack. B: an explicit per-run resolution action that refuses while the run is live and records run, account and evidence; rename alone is not resolution.
- Differ: rename plus seat record (A) vs resolution command with a durable record (B).

## Open questions
- B Q4: does a test killed while its wrapper survives (a printed check line with a signal exit) also keep an obligation? A: no, out of this outcome; the wrapper publishes a red check line and log the seat reads, and the death cause there is the seat's own stop-run or a rare OOM.
- B Q6: is check.fix a recovery route? A and B: no, failed plus operator recovery.
- A: the owning leaf retires the seed's lesson, conditional on its history file existing on base.
