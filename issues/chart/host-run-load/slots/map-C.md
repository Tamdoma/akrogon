# Territory map: host-run-load, seat C

## 1. Cause: confirmed in code, not yet proven on a quiet host

- F1 Confirmed: no host-wide bound exists. `withAdmission` writes a `live` record and calls the run at once (`src/admission.ts:139-183`, record at `:160`); the comment at `:139-141` names the 2026-10-14 removal (81196b3b dropped the 48 GiB anon+shmem check, 16 GiB reservations, 30 s spacing, exclusive admission flock, and the `waiting` state).
- F2 The remaining host limit does not bound run count or CPU time. `systemd/akrogon.slice` sets only `CPUWeight=20`, `MemoryHigh=64G`, `MemoryMax=96G`, `MemorySwapMax=0`. There is no `CPUQuota` in the file today, so the permit-bypass guarantee premise "slice capped at 16 cores" no longer holds as installed.
- F3 Not proven: a green framework full suite today on a quiet host. The seed itself lists this under Not inspected (INTAKE.md, seed §Files read). Code confirms the missing bound; only that run confirms load as the sole cause of today's reds.

### Which runs reach admission, and what admission knows

Every path goes through `checkedRun` (`src/run-check.ts:185`) into `withAdmission` (`src/run-check.ts:220`). The holder passed at `:220-221` is only `{repo, leaf, check, run, slice, scope: callerScope(), unit}` (`src/admission.ts:9-17`). `scope` there is the caller's systemd scope name, not verify scope.

| Run | Reaches admission | Name seen | Knows repo/leaf | Knows verify? scope? phase? argv? |
|---|---|---|---|---|
| Seat `run-check` | yes, `runCheck:141-162` | `--name`, default `run` (`:158`) | yes | No. Phase/unit/attempt exist in the timing object (`:209-218`) but are not passed to admission |
| Seat printed config checks | yes, wrapped as `run-check --name <key>` for every `checks`, `merge_checks`, `advisory` entry (`src/config.ts:351-362`) | config key | yes | No. Indistinguishable from the same command inside verify |
| verify setup | yes (`src/verify.ts:326`) | `setup` | caller slug | No |
| verify checks | yes, one admission per command, sequential (`src/verify.ts:336-340`) | config key | caller slug | No. `runOnce` has `scope: VerifyScope` (`:286-292`) but does not forward it |
| verify `merge_checks` | yes, same loop; merge scope = `checks` minus `merge_covers` plus `merge_checks` (`src/verify.ts:54-61`), scope chosen at `:393` | config key (framework: `verify`) | caller slug | No |
| `--known-red` base comparison | yes, a second full `runOnce` at merge-base after the head (`src/verify.ts:402-413`) | same keys | caller slug | No. Not concurrent with its own head, concurrent with everyone else |
| Nested run (verify or run-check inside a run) | bypasses: live `AKROGON_RUN` token returns `nested`, no record, no unit (`src/admission.ts:143-144`, `src/run-check.ts:231-232`) | n/a | n/a | Counts as nothing |
| Raw seat/worker runs (bare vitest, workerd, Chromium) | never reach admission | n/a | n/a | Invisible. Part of today's snapshot (#90 class) |

Run records already live host-wide in `<globalHome>/runs/*.yaml` with repo, leaf, check, state `live|ended`, `since` (`src/admission.ts:23-37`); `liveRuns()` (`:95-103`) filters by pid start-time and boot id (`:87-88`). A count-based bound needs no new store.

Key consequence: a verify is not one admission. It is setup plus one admission per command, released between commands (`src/verify.ts:326-340`, release at `src/run-check.ts:243`). Any bound is per command unless a slot is held above `runOnce`.

## 2. Material forks

### F4 What counts as heavy

- O1 Verify commands only. Needs `VerifyScope` plumbed through `checkedRun` to the holder (today dropped, table above). Breaks: does not protect a running verify from a heavy seat run that starts after it. INTAKE shows seat suites and bisects are part of the mix. Verify-only serialization makes verifies queue behind each other but never gives one a quiet host. Fails the destination alone.
- O2 Every top-level `run-check`. Least plumbing, matches host-test-load heavy-runs Taken (every execution, no light list). Breaks: seconds-long format/typecheck/targeted runs queue behind 8-minute suites. This is the #89 cost in full, plus verify re-queues per command.
- O3 Config flag per command (for example a heavy name list). Needs a `repoSchema` change (`checks`/`merge_checks` are plain text records, `src/config.ts:47-48`), plumbing through `withSetup` (`:351-362`) and `verifyCommands` (`src/verify.ts:54-61`). Default matters: default-light leaves ad-hoc `--name run` suites and unmarked repos unbounded (#88 returns through the unmarked door); default-heavy with a light list is safer but queues every unlisted cheap check (#89). Name matching is weak identity: `--name` is caller-chosen.
- O4 Name is a config key of its own repo (no schema change). `checkedRun` already has `repo.config`. Framework `verify` and `cheap`, lingua-relay `test`, akrogon `test` become heavy; ad-hoc targeted names and `setup` stay light. Breaks: akrogon `format`/`typecheck` also become heavy; a seat can dodge by renaming `--name`.

### F5 The bound

- O1 Count of heavy runs host-wide from `liveRuns()`. Deterministic, testable with seeded records, no starter race if the decision is under lock (F8). N=1 is the only value that promises a quiet host. N=2 is unmeasured: today's reds happened at roughly 3 concurrent suites plus browsers, and framework verifies never overlapped each other, so nothing in the seed shows 2 is safe. Cost: throughput and #89 waiting.
- O2 CPU or load reading. Sees raw runs too, which count cannot. Breaks: load average lags by a minute, simultaneous starters all see room (load-guard dissent B), and it cannot protect a suite already running from later starters. It delays starts; it does not bound the running set.
- O3 Memory reading (restore 81196b3b's deleted check). Refuted for this incident: failures are CPU timing timeouts and a Chromium SIGSEGV at load 113 on a 123 GB host; the slice memory brake already exists. Restoring it re-adds exactly what the operator removed and still permits the CPU overload that caused #118.
- O4 Slice CPU quota only. Throttles, never queues (permit-bypass guarantee rejected this as 1c). Timing tests get slower under contention, so greens stay load-dependent.

### F6 Ordering

- O1 FIFO by request time. Needs a `waiting` record written before the wait, with admission granted only to the oldest live waiter when count allows. Fixes #89 starvation only while the waiter process lives: a seat whose tool call is killed at 120 s still loses its place, which is how crawl-run-binding lost 55 minutes (permit-bypass INTAKE, #89). A dead head-of-line waiter must be passed by liveness, not file presence.
- O2 Merge priority. Needs verify scope plumbed (F4-O1). Host-test-load queue-order foreclosed merge-first until merge waits are measured; its CHART keeps it off route. Under a steady merge stream it starves leaf checks, worsening #89 for non-merge runs.
- O3 Unordered poll or flock race (the pre-removal and permit behaviour). Least code, exactly the #89 failure mode. Do not repeat.

### F7 How waiting shows

- Now: nothing. The record enum has no `waiting` (`src/admission.ts:31`), `src/status.ts` prints no run lines, and `tests/run-permit.test.ts:239-260` asserts none. `wait_ms` plumbing survives: `check_start` already records it (`src/run-check.ts:224-228`, `src/timing.ts:38-40`).
- Minimum viable: one stderr line naming the holder (pre-81196b3b form) plus `waiting` records that status lists with repo, leaf, check and reason. Without this a waiting seat looks hung, wraps the call in `timeout`, and re-enters the #89 loop.

### F8 Nested runs, holder death, atomicity

- Nested must stay exempt. If an outer heavy run holds the only slot and an inner verify queued for it, that is a self-deadlock. Cost: a light-named outer run that spawns a verify inside is invisible (table above).
- A waiter must recheck holder liveness on every poll via `liveRuns()` semantics (pid plus start-time plus boot, `src/admission.ts:87-88`), not record-file presence. `sweepStale` (`:110-125`) runs only at a new admission and the `finally` delete (`:181`) does not run on SIGKILL, so a killed holder's file outlives it. Slot release also precedes unit stop (`src/run-check.ts:243-246`): the next heavy can start while the last one's units are still stopping: orphan load is the known permit-release residual.
- The admit decision must be atomic host-wide. `withAdmissionLock` takes `admission.lock` only shared plus a per-slice lock (`src/admission.ts:45-52`), which does not exclude another repo's waiter. Counting outside an exclusive section lets two waiters both see room (#88 shape, smaller). `withLock` defaults exclusive (`src/state.ts:308-312`) but cannot be nested on the same file inside the shared hold.

### F9 Past operator decisions

- Permit-bypass guarantee (2026-10-13): remove the permit entirely, slice is the only host limit; permit count and queue visibility foreclosed. Load-guard then amended it to a memory start-check with no name exemptions. 81196b3b (2026-10-14) removed that too. Any new line reverses two operator decisions and needs an explicit operator pick, not a silent restore.
- Host-test-load heavy-runs foreclosed a per-name light list; guarantee reopened it. Not currently foreclosed.
- Queue-order foreclosed merge priority, a waiter registry and a wait bound; guarantee reopened queue-order. #89 is the measured cost of its unordered form, so F6-O3 stays a bad pick.
- Merge-load-flakes rejected a heavy-run slot "until load is traced". Seed #118's per-repo verify minutes, duration table and host snapshot are that trace.
- Still foreclosed everywhere: `TasksMax` (crashes suites) and entry-point gating inside repo test scripts.

## 3. Pitfalls and tests

- P1 Test seam missing. The brief's `admissionEnv` no longer exists in `tests/helpers.ts` (dropped by 81196b3b). What remains: `seedStat`/`cgroupRoot` (`tests/helpers.ts:30-41`), which current admission never reads, and the `run()` spawn helper in `tests/run-permit.test.ts:36-73`. A poll interval and limit override parsed at the boundary must come back, or tests wait in real time.
- P2 Record compatibility. Adding a required field makes `readRecord` fail on records written by a running older binary; `sweepStale` then deletes them and stops their units mid-run (`src/admission.ts:81-85`, `:110-125`). New fields must be optional. `waiting` records must not count as live in `src/reconcile.ts:216` or `src/stop-run.ts:12`.
- P3 Existing tests assert the opposite behaviour by name ("starts at once", status shows no Run lines, `tests/run-permit.test.ts:123-260`; src scan banning `cheap`, `selftest`, `withPermit` at `:379-398`). They need a stated Test-Change like 81196b3b's, not silent edits.
- P4 Verify wall time. Per-command admission puts command 2 at the back of a FIFO behind other suites. Pin the chosen semantics (per-command vs whole-`runOnce` hold) in a test, because the two differ by hours under load.

Tests that would catch a regression, using `hold`/`touch`/`waitFor`/`timings` (`tests/run-permit.test.ts:89-122`) and `seedRunRecord` (`tests/run-units.test.ts:190`):

1. Two heavy run-checks in two leaves: second marker absent until release, then starts; its `check_start.wait_ms` is large.
2. A light check starts at once while a heavy holds (only under F4-O3 or O4).
3. FIFO: one holder, two staggered waiters, markers appear in request order.
4. Holder SIGKILLed: waiter starts within one poll bound with no new admission to trigger a sweep; a SIGKILLed waiter's record does not block the next waiter.
5. Nested: an outer heavy runs an inner run-check and verify to completion with no deadlock (shape of `tests/run-permit.test.ts:202-232`).
6. Verify: while a heavy seat run holds, verify's check command waits and its marker lands only after release; `--known-red` base run also queues.
7. Status lists the waiter with repo, leaf, check; a seeded dead waiting record is not listed.
8. Seeded records: a live heavy record counts, `ended` and dead-pid records count zero; an unknown `AKROGON_RUN` token queues as top-level (existing test at `:324-360`).

## 4. Smallest change that makes framework merge verify green again

F4-O4 plus F5-O1 at N=1 plus F6-O1: in `checkedRun`, mark a run heavy when its name is a key of its repo's `checks` or `merge_checks`; in `withAdmission`, a top-level heavy run first writes a `waiting` record, then polls `liveRuns()` and starts only when no heavy run is live and no older live heavy waiter exists, flipping to `live` under a short exclusive lock. Nested runs stay exempt. Add the stderr waiter line and status listing from F7.

Why this is the smallest sufficient form:

1. No config schema change, no verify plumbing: verify command names already are config keys (`src/verify.ts:339`), and seat printed checks already carry those names (`src/config.ts:351-355`). Framework merge verify is a single heavy command, so per-command admission already makes the whole suite exclusive while it runs, and the mutual direction also holds: heavy seat suites from any repo cannot start during it.
2. Targeted single-file runs under ad-hoc names stay instant, which is most of the #89 pain avoided; `setup` stays light.
3. It does not cover raw runs outside `run-check` (bare vitest bisects, recordings). If those dominate a given hour, greens still depend on the operator pause already in use. That gap is the #90 class, foreclosed entry-point gating aside, and should not block this change.
