# Opening map, slot A

## Split

Two charts, one per outcome, both destination repo akrogon, independent (no shared prerequisite): `merge-slow-alarm` (#123) then `killed-run-fixture` (#124). Order by handed order.

## #123 merge-slow-alarm

Evidence (better-than-training, inspected 2026-10-28): `src/verify.ts` `runOnce` sets `start` at receipt append and `end` only after every member settled; readers (`reuseSource`, `knownRedReceipt`, `requireGreenReceipt`, `newRedUnits`) ignore time. `sendMainRedNotice` is the existing notice channel: herdr `notification show` with a `notice` field reserved `pending` under the receipt lock, then the reply reason. Merge receipts carry `leaf` (framework line 1429: `leaf: chain-evidence-capture`, scope merge). Framework has 596 merge-scope records.

Forks:
- F1 baseline and trigger. 1a: median wall time (`end - start`) of the last N completed merge-scope runs on the same command set with no `reused` or `blocked` entry; flag when this run exceeds 1.5x and the previous comparable run was not flagged, so only the first slow run names its leaf; no flag with fewer than M baseline runs. 1b: compare with the single previous run (noisy, flaps). 1c: fixed per-repo expected minutes in config (stale, a cap in disguise). Later breakage: reused/blocked runs are short and drag the median down (false alarms) unless excluded; a command-set change resets the comparable set; host load gives false alarms, which stay harmless because the flag never fails a merge.
- F2 where it shows. 2a: one herdr notification like `main red` (`<repo> merge slow`, naming leaf, run, minutes vs normal), a stdout line in the verify output, and a field on the record so dedupe and the transition rule read the ledger. 2b: add a `Slow merge:` line to `akrogon status` (persistent, seen by watch-issues). 2c: broadcast to Discord (outside the operator's herdr, adds a paid-free but external call per flag). Later breakage: a transient notice is missed when the operator is away (#456 was found next morning); a status line needs a clear rule for when it disappears.
- F3 scope. Merge scope only (leaf-scope runs differ per leaf, the median is meaningless) vs every scope. Pick merge only.

Pitfalls: operator lock 2026-09-18 forbids clocks, polls, watchdogs; this is computed once at the end of an event (verify end), no timer, so it stays inside the lock. Never a merge failure (D3). Concurrent receipt rewrites: compute under the receipt lock like `newRedUnits`. Proof: herdr `notification show` already proven by main red; the leaf reuses the existing fake herdr in tests; no new outside call.

## #124 killed-run-fixture

Evidence (inspected 2026-10-28): `startRunGuard` (`src/scope.ts`) runs `tail --pid=<wrapper>` then `systemctl --user stop <run>.scope`, SIGTERM to the test; a bun test with no SIGTERM handler exits without its `finally` (model-knowledge, Node/Bun default signal disposition; not yet measured for bun 1.4). `spawnLogged` gives the child the capture files directly (`Bun.file`), so output keeps flowing with the wrapper dead. `checkedRun` writes `check-*.log`, `check_end` and unlinks the pair only after the child returns. Lock 2026-10-27 (killed-check-log Off route): "making a check survive its caller" was out of #120's scope (not foreclosed for this report).

Forks:
- F4 the stop. 4a: a loud refusal at the point of use: `akrogon phase` (and direct-guards for a chart direct holder) refuses to move while the holder holds a capture pair whose run is not live, naming the pair and telling the seat to read it and clean any fixture it printed; the seat clears it by renaming the pair to `killed-<name>-<run>-{out,err}.log` after cleanup. Catches every cause of a dead run (seat timeout, stop-run, reboot, SIGKILL of the test). 4b: guard stops killing the test when the wrapper dies, letting the test finish so its `finally` runs. Removes the leak for the wrapper-death case only, changes admission and guard ownership, and a hung test with a dead wrapper then lives until reconcile. 4c: skill text only (check-issue/implement-issue: "after a run-check printed no check line, read the captures and run killed-run cleanup"). Already the reporter's workaround, and prose is what failed here.
- F5 liveness test for "not live": no loaded `akrogon-run-<id>.scope` and no live admission record for that run id (plan to verify both sources), vs `check_start` without `check_end` in timings (also true for live runs).

Pitfalls: a live run's pair must never trigger the refusal (a seat running a check while a sibling moves); the rename keeps evidence for `akrogon log` and `pack`. Lesson: seed names `/home/rudi/Work/akrogon/learnings/history/2026-10-28-killed-run-fixture-leak.md`, absent on this repo's main and origin; 4a is a loud refusal before the harm persists, so the owning leaf carries a retirement criterion naming that path, conditional on the file existing on its base.

Questions the intake does not ask: is the refusal also needed at `akrogon verify` holders (verify passes run their own services and do not hold fixture tests)? Does the merge lane move (land) need the check, or only seat moves?
