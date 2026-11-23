# Refused stop B: lane-first

Read at worktree head e5b59a07. (H) marks what I measured on this host on 2026-11-23. Nothing changed.

## Short answer

- Pick O4, a file-read form of O2: a run record is live while its writer lives or while its scope's cgroup still holds a process. The kernel answers that with one file read. No stop has to succeed for the hold to be right, so nothing has to be remembered after a refused stop.
- It removes the `unstopped` flag, the sweep's record writes, the guard's record delete and the test shim's fake answers. F16 to F19 have no place left to happen.
- A refused stop is not a real fault here: 0 in 24,458 run scopes over 9 days (H). All four holes come from keeping two copies of one fact in step.

## How often a stop fails (H)

User journal, 2026-11-14 to today:
- 24,458 distinct `akrogon-run-*.scope` units.
- 459 (1.9%) hit the 5 s stop timeout and were killed. All ended. 0 "still around after SIGKILL" lines.
- 319 "Failed to stop … not loaded" lines, all from the guard finding its scope already gone. 0 failed stops with any other reason.
- 3 "Access denied by review" lines. Those are D's injected refusals. Every refusal in rounds 3 to 10 was injected by D.
- Limit: the journal shows the guard's stops and systemd's own results. A CLI stop whose bus call fails leaves no line, and main drops that exit status.

## Options

- O1. Lock per run, guard keeps the record until the stop is confirmed.
  - Two copies of the fact stay. Every path that ends processes outside the lock still needs a reconcile step: a manual `systemctl stop`, an OOM kill, a sweeper killed between stop and write. `unstopped` and the retry stay.
  - The guard is a shell line (`src/scope.ts:98-101`). It would need the lock, a state query and a conditional delete.
  - Rounds 9 and 10 show the rate of this approach: one hole patched, four found.
- O2. The unit is the hold, asked from systemd.
  - Cost is small: `list-units` 5 to 16 ms and `is-active` 2 to 3 ms at 10,790 loaded units (H).
  - It breaks on its own fault: the query uses the bus that refused the stop. A refused query has no answer, so the code must guess.
  - A per-repo slice moves every run unit and collides with `akrogon-land.slice` and `AKROGON_RUN_SLICE` (`src/scope.ts:18-24`). Empty slices also stay active, so "slice active" does not mean "a run exists" (9,766 empty leaf slices in this chart's design).
- O3. Marker that only `akrogon stop` clears.
  - Adds a third piece of state and a manual step. A repo stays blocked until a person acts, against "merge speed first".
  - "After confirming the units are gone" needs the check that makes the marker pointless.
- O4 (pick). The hold reads the scope's cgroup.
  - `/sys/fs/cgroup/user.slice/user-<uid>.slice/user@<uid>.service/<slice path>/<unit>/cgroup.events` says `populated 1` while any process is left, children included. The folder goes when the scope goes. I read it on a live run scope: 5 µs per read, owned by the user, no bus (H).
  - The record already holds `slice` and `unit` (`src/admission.ts:38-40`, `src/run-check.ts:358-366`). `cgroupRoot()` exists with its test override (`src/scope.ts:145-150`), and `src/reconcile.ts:164-187` already decides from `cgroup.procs`.

## O4 in code

- C1. `ownLive` (`src/admission.ts:93-94`): boot matches, and the PID lives or the scope is populated. `unstopped` goes from the schema (`:45`).
- C2. `end` (`:365-371`): stop the units and rethrow a failure. No record write on failure, so the state stays `live` and the land fallback at `:99-116` keeps counting it. F16 closed.
- C3. The `finally` at `:374-376` removes the record only when the scope is not populated.
- C4. `sweepStale` (`:282-306`): PID gone and scope populated means try the stop, warn on failure, touch nothing. PID gone and scope empty means delete the file. It never writes a record. F18 closed.
- C5. The guard (`src/scope.ts:101`) drops `rm -f <record>` and only stops the scope. A dead writer's record ends being live when the cgroup empties. F17 closed.
- C6. `stopRunUnits` (`src/scope.ts:116-135`) excuses a failed stop by the same read in place of `systemctl show`. Then the shim's fake `not-found` (`tests/helpers.ts:100-113`) goes: under the fake `systemd-run` no cgroup exists, which reads as gone. F19 closed. The callers in `src/stop.ts:68, :76-77` know each unit's slice.
- C7. `src/state-home.ts:45-60` has its own PID-only copy of the liveness test. It should call the same predicate.
- Size: about 15 lines added (slice-to-path and the read). The flag, the write-back, the `show` branch and the 14-line shim go.

## What O4 breaks or invites

- R1. It assumes cgroup v2 and systemd's fixed path for the user manager, plus the dash rule for nested slices (`akrogon-land.slice` sits under `akrogon.slice`). Tests already build that path (`tests/run-units.test.ts:46`).
- R2. A run that cannot be killed holds its repo for ever, and waiters print its name. `unstopped` does the same today.
- R3. Refusal tests need a real scope or a fake `cgroup.events` file under `AKROGON_CGROUP_ROOT`. Tests on the fake `systemd-run` keep today's PID-only behaviour.
- R4. The gap between a live record and its scope is unchanged. The PID covers it, and `Requisite=` fails a scope whose writer died first (`src/scope.ts:54-57`).
- R5. I did not trace every reader of `liveRuns` (`src/next.ts:544, :675`, `src/reconcile.ts:227, :575, :1310`, `src/stop-run.ts:13`). They read liveness through `live`, so they should follow.

## Not taken

- Killing through the `cgroup.kill` file would make a stop impossible to refuse. It skips the 5 s graceful stop and adds a second stop path. With O4 the hold is right without it.
