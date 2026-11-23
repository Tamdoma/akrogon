# Teardown B: paid-budget

Read at worktree head 1b978eef. (H) marks what I ran on this host on 2026-11-23 with private throwaway hc sessions (`akr-probe-b1`, `akr-probe-b2`, both removed). Nothing in the repo changed.

## Short answer

- A's idea is right, but it does not work on the tier as it stands. Today the core, every terminal program and any replacement core run in systemd units of their own, outside any scope the test makes (H).
- It works after two changes. The core's runtime folder loses its `systemd` link, as the hc fixture already does. The test body becomes a separate process inside the scope, with the deadline judge outside it.
- The deadline then is one write to the scope's `cgroup.kill` file. It emptied a scope holding a core and a program that ignores SIGTERM and SIGHUP in 2 ms (H). F10 to F13 have no place left to happen.

## What I checked (H)

- Tier setup as it is (`XDG_RUNTIME_DIR` is the real runtime folder, `tests/e2e/watch-tier.ts:132-135`):
  - The core landed in `app.slice/hc-serve-9e590098.service`. My shell was in `app.slice/hc-hold-41bd2769.service`.
  - A program started with `hc run --bg` landed in `app.slice/hc-hold-013e4775.service`.
  - After `hc server stop`, a plain `hc ls` started a replacement core in a new unit, `hc-serve-ed2106f1.service`.
  - So a scope around the test holds only the hc clients. The unit names are new each time, so there is no fixed unit to kill either.
- Core runtime folder with only a `bus` link, started inside a transient scope:
  - The core and its program both stayed in that scope's cgroup. hc starts no unit when the folder has no `systemd` entry.
  - `echo 1 > cgroup.kill` ended all four processes. The scope read empty after 2 ms and went inactive.
- The hc fixture already runs its cores this way (`tests/hc-fixture.ts:214-230`: `coreRuntime` gets a `bus` link and no `systemd` link).

## Pick

- P1. Containment. The tier's core starts with a runtime folder that has no `systemd` link, and `tests/core-bin` goes on the core's PATH so seat scopes still reach the real manager (`tests/hc-fixture.ts:230`, `tests/core-bin/systemd-run:5`). Then the core, its holders, the watcher, each consultant and any replacement core are descendants of whoever started them.
- P2. Judge outside, body inside. The test file becomes a small judge. It starts the body as its own process in one transient scope (`systemd-run --user --scope`, with the real bus address the tier already passes at `tests/e2e/watch-tier.ts:135`). The body is today's test body with no deadline code.
- P3. The deadline. The judge waits for the body's exit or the deadline, whichever is first. Then it always does the same three steps: write `1` to the scope's `cgroup.kill`, wait for `cgroup.events` to say `populated 0`, remove state and run the absence check.
- P4. The outcome is fixed before the kill, by the rule in the design (`forks/design.md:42`):
  - Body exited 0: pass. Body exited nonzero: red, with its output.
  - Deadline first: a deadline stop at the last stage. The body writes each stage to a file as it completes.
  - A red seen before the deadline stays a red: the body writes a red marker the moment it fails, before it reads any screen. The judge reads the marker at the deadline.
  - A cleanup failure is appended to the outcome. It is plain code after the kill, with nothing running beside it.
- P5. The body writes each paid start to a file as it happens, so the session count survives a deadline stop (`tests/e2e/watch-consults.e2e.ts:468-474` writes it only in teardown today).

Why `cgroup.kill` and not `systemctl kill`: the file write needs no bus, cannot be refused, and the kernel also ends processes forked during the kill. `systemctl kill` is a bus call that can fail or time out.

## What it removes

- F10: there is no timer to clear and no teardown step that lists terminals.
- F11: the pending launch client is in the scope and dies in the same kill. A core it started is in the scope too.
- F12: there is no stop client. The kernel sends SIGKILL.
- F13: the kill cannot answer "not stopped", and the outcome is read before it.
- Code: `tests/hc-daemon.ts` (48 lines). `stopCore`, `stopAndBlockCore` and the list, kill and remove loop in `stopWatchTier` (`tests/e2e/watch-tier.ts:205-241`). The deadline helpers, the timer, `closingTier`, `deadlineStop` and the race block in the test (`tests/e2e/watch-consults.e2e.ts:157-167, :190-207, :438-460`). The nine cases in `tests/e2e/watch-consults-deadline.e2e.ts` (299 lines) become about three judge cases.
- Added: the judge, about 50 lines, and the stage, red and paid-start files.

## What it could break

- R1. agy has not run under a core whose runtime folder is not the real one. Its consultant inherits the core's environment. The watcher already runs with the tier's folder (`tests/e2e/watch-consults.e2e.ts:233-234`). One free start of agy in such a core should come before the paid run.
- R2. Seats stay outside the scope, because akrogon puts each seat in its leaf scope (`src/seat.ts:280`). In this test they are stand-ins. A consultant is started without the leaf scope (`src/seat.ts:343-345`), so the paid programs are inside. The tier home's leaf slices need a stop in cleanup.
- R3. An akrogon-side hc client still sees the `systemd` link (`tests/e2e/watch-tier.ts:139`). If the core died mid-run and such a client started a replacement, that core would be a systemd unit outside the scope. The absence check reports its socket (`tests/e2e/watch-tier.ts:52-54`). The pending-launch case in F11 is not this one: that client is `tier.hc`, with the core's environment.
- R4. SIGKILL gives the harnesses no time to flush. A transcript may miss its last lines.
- R5. Screens die with the core. On a red the body reads them itself before it exits. A deadline stop has none, as today (`tests/e2e/watch-consults.e2e.ts:441`).
- R6. If the judge is killed, the scope keeps running. Today the core's unit keeps running in that case too.

## Not taken

- Kill the `hc-serve` and `hc-hold` units: their names are new per start (H), so finding them at the deadline is another race.
- Patch F10 to F13: round 7 had three findings, round 8 four.
- An hc switch against starting a core: hc has none (`tests/hc-daemon.ts:39`), and it would close F11 only.
