# Fork notes, slot F (chart codex-seat-scope, fork seat-root)

Blind notes, 2026-11-25T16:15Z. Slot F's own position. Probes ran in throwaway user scopes under `akrogon-probef.slice`, stopped and checked gone. The probe files are deleted.

## Question 1: how the entry tells the seat's own process from a tool shell

### Pick

O1, pid identity. The launch passes the seat pid in a second env marker, and placement returns when the shell's own pid equals it.

- Launch: the harness argv runs through one `sh` hop inside the scope, `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"' <harness argv> <task>`. agy already uses this hop for PATH.
- Entry: one line in `src/tool-cgroup.ts:placementShell`, after the `AKROGON_SEAT_CGROUP` test: `[ "$$" != "${AKROGON_SEAT_PID:-}" ] || return 0`.
- Reason:
  - The seat pid is the one process systemd-run puts in the scope and the one `scopeEntry` reads. Its pid cannot be reused while it lives, so the test is exact and reads no other process.
  - It is the same kind of gate as the existing one: an identity minted by `startSeat`, compared in the entry. No lock decision changes. Placement still acts only at the exact scope root, `scopeEntry` keeps its suffix match, and the sweep is untouched.
  - It holds for any launcher on any kind, because it does not depend on what the launcher is.
- Cost:
  - One extra exec per seat start.
  - `tests/tool-entry.test.ts` "the seat launch argv carries ..." changes for every kind.
  - A bash child the launcher forks before the harness starts still gets its own `t-`. For codex that is `omarchy-agent-account-home`: one empty `t-` per start, removed at the next sweep, and it adds 1 to the `seen` count (E3).

### Rejected

- O2, loosen `scopeEntry` to accept `<scope>/tools/t-*`. The start would pass, but the harness would live in a `t-`. Its tool shells inherit that `t-` and the tool marker (E4), so the first sweep kills the harness or defers on it. It hides the fault and breaks the kill.
- O3, sweep skips `t-<seat pid>`. The harness survives, but every codex tool shell sits in the seat's `t-`, so nothing is ever killed for codex. The feature is silently off.
- O4, codex-native delivery: drop `BASH_ENV` from the launch env and pass `-c shell_environment_policy.set.BASH_ENV=<script>`. It works in `codex sandbox` (E6) and keeps the launcher from ever seeing the entry. Rejected as the answer because it fixes one kind, puts codex config schema into akrogon, and leaves pi, grok and every other `BASH_ENV` kind open to the same failure. It is unproven for an interactive seat without a paid run.
- O5, process-group test (skip when the shell's group is the seat's group). It would also cover a launcher that forks the harness (R1). It depends on each harness starting tool shells in their own group, which is unobserved here. A harness that does not would never be placed, with no error.
- O6, census test (skip when the shell is alone in the scope's `cgroup.procs`). The lock prefers no process census (Q1 reason), and a `$(...)` in the test adds a second pid to the list.
- O7, arm placement after bootstrap or after the start proof. `scopeEntry` reads `entered` before the launcher bash runs (intake finding 5), so the arm races the launcher. It also reverses lock [R2] (the entry creates `tools/` when a first shell beats bootstrap).
- O8, write `launched.pid` to a file the entry reads. hc returns the pid after the launcher is already running, so the entry can read before the write.
- O9, bypass the launcher and exec the real codex binary. It drops omarchy's account selection (`CODEX_HOME`), and `harnessArgv` requires `argv[0]` to be the harness name.

### Evidence

All dated 2026-11-25. Tier "observed" is slot F's own free probe, "read" is source read this session.

- E1, observed. Baseline entry, `sh -c 'exec codex --version'` in a delegated scope with `AKROGON_SEAT_CGROUP` and `BASH_ENV` set: one `t-` whose pid is the seat pid (`t-3765545-…`, seat pid 3765545). Confirms intake finding 4. codex-cli 0.172.0, bash 5.3.20, systemd 262.
- E2, observed. Same launch with the one-line pid test and `export AKROGON_SEAT_PID=$$`: no `t-` for the seat pid.
- E3, observed. In E2 one `t-` remains for a different pid (3766225 against seat pid 3766206): the launcher's forked bash child.
- E4, observed. A `#!/bin/bash` stand-in harness that spawns `bash -c`:
  - baseline entry: harness in `/tools/t-<seat pid>`, its tool shell in the same `t-`, and `AKROGON_TOOL_CGROUP` in the harness env.
  - patched entry with the marker: harness at the scope root, tool shell in its own `t-`, no tool marker in the harness env.
- E5, observed. Patched entry in a scope started without `AKROGON_SEAT_PID` (a seat live at landing): the tool shell is placed as today.
- E6, observed. `codex sandbox -c shell_environment_policy.set.BASH_ENV=/dev/null -- bash -c ...` shows the variable inside. Without the flag it is unset. Not observed for the interactive exec tool.
- E7, read. Launchers on this machine: `codex`, `claude` and `grok` resolve to mise, which execs `/usr/share/omarchy/bin/omarchy-agent-account-exec` (`#!/bin/bash`). `/usr/bin/pi` is a `#!/bin/sh` script. `agy` is a native binary. `/bin/sh` is bash.
- E8, observed. `/bin/sh` does not source `BASH_ENV`: a `sh -c` seat pid was never placed in any probe, and `tests/tool-entry.test.ts` case g asserts the same.
- E9, read. `src/tool-cgroup.ts:sweepScope` kills every `t-` whose `akrogon/<t>` is unpopulated and defers the rest on a helper that waits for the pid in the `t-` name. With E4 baseline, that pid is the harness.
- E10, read. `src/seat.ts:startSeat` passes `launched.pid` to `scopeEntry`. The argv is `systemd-run … -- env … <harness>`, an exec chain, so that pid is the launcher bash and then the harness.
- E11, read. `tests/stand-in.sh` is `#!/bin/sh`, so no current test launches a seat through a bash launcher.

### Pitfalls

- R1. A launcher that forks a bash child which then execs the harness: the child's pid is not the seat pid, so it is placed and the harness lives in a `t-`. `scopeEntry` passes, and the seat dies at the first sweep. Not observed for any kind here (codex's chain is exec all the way, E1). Nothing in the pick removes it. The lost-seat path makes it loud, late. Record it as a residual beside the lock's "shells the entry misses".
- R2. The red test can pass on the base by the race (the 15:26Z start did). Removed by asserting state, not start success: after the start, the seat pid's cgroup is the scope root and no `tools/t-<seat pid>-*` exists. Use a `#!/bin/bash` launcher that execs `tests/stand-in.sh` as the harness.
- R3. Entry files are shared by live seats and refreshed at every `startSeat`. A seat with no `AKROGON_SEAT_PID` must behave as today. Removed by the `:-` default (E5). A rollback rewrites the old entry, which ignores the new marker.
- R4. A codex seat that started by the race since 15:06Z lives in `tools/t-<seat pid>` now. The fix does not move it. It dies at its leaf's next sweep (E9). Removed only by replacing that seat, which the lost path does.
- R5. `AKROGON_SEAT_PID` reaching a nested launch. It is inert without a matching `AKROGON_SEAT_CGROUP`, which is tested first, and each `startSeat` hop sets its own value.
- R6. A harness that runs tool shells in a new pid namespace sees a small `$$`. A collision with the seat pid would only leave that shell unplaced, which is the fail-safe direction.
- R7. `src/AREA.md` and the `startSeat` comment describe the wiring per kind. They become false with the change and are fixed in the same change (signpost S6a).

### Question I would ask

- Q-F1. Should R1 get its own free test and guard now, or stay a recorded residual? My answer: residual. No launcher here forks the harness, and a guard would need the process-group heuristic (O5).

## Question 2: which leaf seat kinds carry the launch change

### Pick

K1, every leaf seat kind (claude, pi, codex, agy and any other configured kind), through one unconditional hop.

- Shape: the existing agy hop becomes the launch shape for all kinds. Its script sets `AKROGON_SEAT_PID`, and for agy also the PATH prefix.
- Reason:
  - The pid test lives in the shared placement, which both entry forms run. The seat pid marker belongs with `AKROGON_SEAT_CGROUP`, which every kind already carries.
  - The launcher is outside akrogon's control for every kind. codex, claude and grok already go through the bash launcher (E7). pi is one shebang change away from the same failure, and pi is slot A on every leaf.
  - One launch path and one argv assertion, with no per-kind condition on the hop.
- Cost: claude gains a hop it does not need today, because its entry channel (`CLAUDE_CODE_SHELL`) is never read by a launcher.

### Rejected

- K2, `BASH_ENV` kinds only (all but claude and agy). It fixes the observed failure with a smaller argv change. It keeps two launch shapes and leaves agy's PATH channel open: a `#!/usr/bin/env bash` launcher in agy's chain would run the wrapper in the seat pid.
- K3, codex only. pi and every other `BASH_ENV` kind stay one launcher change from the same failure.
- K4, consultant and direct terminals (`src/seat.ts:launch`). The lock excludes them: they get no entry wiring and no scope, so there is nothing to tell apart (intake finding 6).

### Evidence

- E7, E8 and E10 above.
- E12, read, 2026-11-25. `src/seat.ts:startSeat` wiring: claude gets `CLAUDE_CODE_SHELL`, agy gets the `sh -c` PATH hop, every other kind gets `BASH_ENV`. All kinds get `AKROGON_SEAT_CGROUP`.
- E13, read, 2026-11-25. `~/.akrogon/config.yaml`: slot a is pi, slot b is codex, and harness templates exist for claude, codex, agy and pi.
- E14, read, 2026-11-25. The lock's recovered-shell predicate requires a launch argv whose first word is not `systemd-run`. The hop sits after `systemd-run … -- env …`, so `argv[0]` is unchanged.

### Pitfalls

- R8. The hop's `sh` is a PATH lookup. agy seats already depend on it, so the change adds no new dependency.
- R9. hc `foreground.name` reads `sh` for the instant before the exec. The bare-shell predicate is used only in the lost branch and needs a non-`systemd-run` argv (E14), so it cannot fire.
- R10. Running seats at landing have no marker. Covered by R3 and E5: they keep today's behaviour, and a seat picks up the marker when it is next replaced (signpost S5b).

### Question I would ask

- Q-F2. Is there a live codex seat started since 15:06Z besides the two failed leaves? Each one is in a `t-` and will be lost at its leaf's next move (R4). The door can list them from `tools/t-<seat pid>` dirs before recovery under N2.
