# Map, slot A: seat-shell-kill

Written blind, before reading any peer map. 2026-11-25.

## What failed and why

shell-sweep's Taken Q2 picks processes one at a time from `/proc` and `cgroup.procs` snapshots: shell roots by comm and parent, descendants by parent links, spares by run records and ancestry. Between any read and the signal, the kernel can fork, reparent (to the subreaper or init) or migrate (systemd-run --scope) a process. Every repair narrowed one window and opened another (review-B F1 to F12). Any design that still answers "which of these pids is a leftover shell" in userland inherits the class. The fix must make the kernel do the grouping: a cgroup whose whole content is "to be ended", ended with one `cgroup.kill` (Linux 5.14+, this host 7.2.15, `cgroup.kill` present in this terminal's cgroup) or `systemctl --user kill/stop` on a unit.

## Live surface facts (inspected 2026-11-25)

- Seats: `src/seat.ts:startSeat` runs `systemd-run --user --scope --unit=<unit> --slice=<leaf slice> -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed -p SendSIGHUP=yes -- env <UNSET> AKROGON_BASE=... TMPDIR=... <harness argv> <task>`. akrogon owns the env and scope properties of every seat. No `Delegate=`.
- Seat teardown already exists: `src/reconcile.ts:endSeats` (kill and remove each recorded seat terminal), used by `src/stop.ts` and leaf close. Seat start: `src/next.ts` calls `startSeat` for first launch and the lost path.
- Dispatch only runs on listener wakes: `src/listen.ts` enqueues `next --wake` on hc `turn`, `blocked`, `finished`, `lost`, plus `next --resume` on (re)subscription. No timer. A masked seat (claude stays `working` while a shell lives, P1) produces no event, so nothing that waits for the next pass can end the shell. The end must be triggered by the phase move itself.
- The caller: a seat's `akrogon phase` runs as a child of a tool shell inside that seat's scope, mid-turn. Anything that kills the caller's tool shell while the call runs makes the harness see the tool call die (the model may retry the move). So the caller's own seat can only be ended after the caller exits.
- Harness shell hooks (free reads): claude 2.1.332 binary carries `CLAUDE_CODE_SHELL_PREFIX` and `CLAUDE_CODE_SHELL` (env); pi (`/usr/lib/pi-coding-agent`) has a `shellCommandPrefix` setting (settings file, not env, per its docs); codex and agy not inspected. Model knowledge: codex picks the user's shell; no env prefix known.
- Run-check: payload already runs in its own `akrogon-run-<id>` scope (`src/scope.ts:runUnitArgv`); the bun writer stays in the caller's tool-shell tree (old chart K2), so it sits in the seat scope.

## Forks

### K1. What unit is ended (the core fork)

- a. Whole seat per phase. At phase advance every recorded seat scope of the leaf is stopped (`systemctl --user stop <unit>` or `cgroup.kill`), and dispatch starts a fresh seat for the next phase prompt through the existing first-launch path. No selection at all; harness independent; codex helpers end too, so the codex residual disappears. Cost: each phase starts a new harness session (context re-read from brief, design, plan, reviews; slower start, more tokens per phase). Invites later: anything that relied on A remembering plan reasoning across phases. Removes F1, F3, F6, F8, F9, F11 by construction.
- b. Tool sub-cgroup per seat. Seat scope gets `Delegate=yes`; a per-harness hook (claude `CLAUDE_CODE_SHELL_PREFIX`, pi `shellCommandPrefix`, codex and agy unknown) moves each tool shell into `<scope>/tools` before it runs; the move ends with one write to `tools/cgroup.kill`. Keeps the session. Cost: one hook per harness, each version-coupled; a harness without a hook stays unfixed; the harness's own non-shell children are spared for free. Invites later: hook drift on harness upgrades; a fifth harness needs new work.
- c. Whole seat plus resume (end the scope, relaunch the harness with its session id). Keeps context, but resume flags differ per harness and agy's is unknown. Middle cost of a and b.
- d. Selection under `cgroup.freeze`. Stable snapshot, but still a userland selection rule (F6, F11 classes stay) and freeze completion is asynchronous (a wait under the global lock, F10). Reject.

A leans a (signposts 1a removing over adding, 3a fewest moving parts).

### K2. Who ends the caller's own seat, and when

- a. `commitMove` launches one detached helper outside the seat scope (for example `systemd-run --user --no-block` transient service, or `hc run --bg --no-parent` as the door-reset helper does), which waits for the caller pid to exit (pidfd or `/proc` poll on one known pid, not a selection) and then ends the seat(s) and runs one `next` pass. No wait under the global lock. Seats other than the caller's can be ended synchronously in commitMove or by the same helper (simpler: same helper for all).
- b. Add a listener wake on a phase-move record (for example a file the listener already watches), and end seats in dispatch. Adds a new wake type to `src/listen.ts`.
Pitfall under both: an operator or other-seat move ends a seat mid-turn; intended (its phase is over).

### K3. Run-check writers

The seat's own background run-check may still be running or publishing at its phase call; ending the seat kills the writer and leaves an abandoned capture pair that refuses later moves (`src/run-check.ts:abandonedCaptures`, old F2). Option a: the writer moves itself into its run's own scope (or a sibling writer scope) at start, before it creates captures or records, so a seat end can never reach a published writer; the kernel move is atomic, so the writer is either still pre-admission in the seat (nothing published) or out. Option b: refuse the phase move while the seat has a live run (existing refusals pattern). A leans a; needs a probe that a process can move itself into a scope it creates (systemd-run --scope moves the launcher it starts; the writer could re-exec under `systemd-run --user --scope`).

### K4. Recovered bare-shell seat is lost

shell-sweep brief criterion 4 drew no review finding. Keep its contract verbatim. Under K1 a, the "intentional end" must not take the lost path: a seat ended at phase advance is cleared from `state.seat` (or marked ended) so dispatch takes first launch, never `lost + 1`.

### K5. Split and the old leaf

- Split: K4 is independently checkable and already settled; a separate leaf can land while the kill leaf is reviewed (independent outcomes may be parallel leaves). Signpost 4a prefers fewest leaves. A leans one leaf unless the kill leaf is large.
- Old leaf: shell-sweep is stopped in `issues/open/seat-turn-idle/`; the new leaf takes #157 in `sources`, so the old leaf must leave the open queue (park its issue or remove it) and direct-visible's `blocked-by: shell-sweep` must name the new leaf. Both are steps on main the door makes at handoff.

## Pitfalls over the lifetime

- Ending a seat with `systemctl stop` sends SIGTERM then SIGKILL after `TimeoutStopSec=5`: a wait. `cgroup.kill` or `systemctl kill --signal=SIGKILL` is immediate. Run it outside the global lock (helper).
- hc `keep`: a killed seat terminal may be recovered as a bare bash shell by hc keep (P2). Under K1 a the door must end the terminal through hc (`endSeats` does kill and rm), not only the scope, or K4's lost detection fires on an intentional end.
- Fresh seat per phase changes token cost per leaf; measure on one leaf before claiming cost.
- F1 residual of the seed decision (a shell started after the phase call, a turn ending without a phase call) stays outside both K1 options; record it again.

## Questions the intake does not settle

- Is context continuity of seat A across plan, implement and fix rounds something the operator relies on? (Decides K1 a against b or c.)
