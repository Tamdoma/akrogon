# Brief: tool-cgroup-kill

## What

Three changes in akrogon seats and phase moves.

1. Each top-level tool shell of a leaf seat runs in its own cgroup `<seat scope>/tools/t-<pid>-<starttime>`, placed when the shell starts by an akrogon-owned entry that `startSeat` wires per harness kind:
   - claude: `CLAUDE_CODE_SHELL` set to a `bash` wrapper, plus `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none`.
   - pi and codex: `BASH_ENV` set to a sourced script.
   - agy: `PATH` with the wrapper's folder first.
   The seat scope carries `Delegate=yes`. `startSeat` creates `tools/`, `akrogon/` and `helpers/` in the scope.
2. When a phase move commits, akrogon writes `cgroup.kill` on every `t-` of every seat scope of the leaf. The exception is a `t-` with an akrogon call in flight, meaning a populated `akrogon/<t-name>/`. For that `t-`, one detached helper kills it after its tool shell has ended. Every akrogon process started from a tool shell first moves itself out to `akrogon/<t-name>/`, so the kill never reaches akrogon. Harness-direct children are never in a `t-`, so the kill never reaches them. Each commit appends one timing row per seat scope. A kill failure warns and leaves the committed move in place.
3. Dispatch treats a seat terminal that hc recovered as a bare shell (after a reboot, a core restart or a signal death) as a lost seat. It takes the existing lost-seat path and charges `lost`.

This leaf replaces the stopped leaf seat-turn-idle/shell-sweep, whose per-process selection raced forks, reparenting and migration (its review-B F1 to F12).

## Why

Tamdoma/akrogon#157.
- Claude keeps its hc status at `working` while a background shell it started is alive, even after its turn ended (charting proof P1). The idle gate in `src/next.ts:dispatchSlot` then never delivers the next phase prompt, and the leaf stalls silently. The incident leaf stalled 4 h 50 m until the operator killed the shell by hand. When the shell dies, claude flips to `done` and the existing gate delivers (P1, P1b).
- After a host reboot, kept seat terminals come back as live bash shells with no status. Dispatch neither delivers to them nor relaunches them.

## Done-criteria

These are the door's criteria. The operator decision has no `Done when:`.

1. Covers the decision's second sentence, "Leftover seat shells end when the leaf's phase advances". After a committed phase move, every process in a `t-` of any seat scope of the leaf is gone, except in a `t-` that has an akrogon call in flight. That includes a looping shell that keeps starting children, a `setsid` orphan whose tool shell already exited, and the leftovers of a seat replaced through the lost path. Each enumerated seat scope gets one timing row with leaf, unit, the count of `t-` dirs seen, the `t-` dirs that read populated before the write, the deferred ones and errors. A leaf with no slice directory, or a seat scope without `tools/`, has nothing to kill and gets no warning (D). Proof: own test that drives a real commit (`commitMove` or `akrogon phase`) on a fixture leaf whose slice holds real seat scopes with real processes at the real cgroup boundary, so the moved-leaf enumeration and the ordering after `saveState` are what the test proves (B).
2. In the same move these all survive, then end as stated:
   - The tool shell that runs `akrogon phase`: the phase call exits as it does today. Once that tool shell has ended, its `t-`, including a background child started in the same command, is gone.
   - A tool shell of another seat whose `akrogon` call is waiting on the home lock: it is not killed during the commit. Its `t-` ends after that tool shell ends.
   - A process at the seat scope root (a harness-direct child) and every akrogon process: never killed.
   - A run-check writer whose stdout pipe is closed while it runs, as when the harness reaps its dead tool shell: it still publishes its kept file and `check_end` row, removes its capture pair, and exits with the run's code (B,C).
   Proof: own test in criterion 1's scenario, so it fails on the base through criterion 1's kills. The writer case is its own test that closes the read end of the writer's stdout mid-run (B,C).
3. A bash tool shell started at the seat scope root through each kind's wiring lands in its own `t-`. The kinds are the claude wrapper as `CLAUDE_CODE_SHELL`, `BASH_ENV` for pi and codex, and the wrapper first on `PATH` for agy. A nested bash stays in its parent's `t-`. Outside the seat scope root the entry does nothing. The entry never changes the command's output or exit status, including when placement fails. The seat launch argv carries `-p Delegate=yes` and each kind's env. `startSeat` creates `tools/`, `akrogon/` and `helpers/`, and a failure there fails the start. Proof: own test running real bash at the real cgroup boundary, plus an own test of the launch argv per kind. That each harness honours its channel is the charting proofs P-entry-claude, P-entry-codex, P-entry-pi and P-entry-agy.
4. When a kill, rmdir or helper spawn fails, the move stays committed, `akrogon phase` exits as it does without the kill, and a structured warning names the leaf, unit, `t-` and error. Proof: own test.
5. A recorded seat terminal that is `live` with null status is replaced through the existing lost-seat path (seat_lost row, end, `lost` + 1, failed at 3, `startSeat`) when it shows either recovery shape:
   - parked: null pid and a set reason other than `spawn_pending`
   - spawned: a shell foreground program and a non-empty launch argv whose first word is not `systemd-run`.
   A seat still starting (launch argv `systemd-run`, or reason `spawn_pending`) is left alone. Proof: own test using hc terminal records shaped like the charting proofs P2.
