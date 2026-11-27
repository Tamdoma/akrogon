# Map A: codex-seat-scope

## Cause (confirmed)

1. `src/seat.ts` startSeat launches `systemd-run --scope ... -- env ... AKROGON_SEAT_CGROUP=<scope> BASH_ENV=<home>/tool-entry/bash-env <harness argv>` for every kind but claude and agy (`wiring`, added by bd358f3f).
2. `codex` resolves to the mise command wrapper (`~/.local/share/mise/command-wrappers/bin/codex -> /usr/bin/mise`), which execs `/bin/bash /usr/share/omarchy/bin/omarchy-agent-account-exec codex ...` in the same pid. A non-interactive bash sources BASH_ENV (A probe, INTAKE finding 4).
3. `src/tool-cgroup.ts` placementShell mints a `tools/t-$$-<start>` cgroup for any bash whose cgroup equals AKROGON_SEAT_CGROUP. The wrapper bash is the seat's own process sitting in the scope root, so it moves the seat into `tools/`.
4. `src/seat.ts` scopeEntry accepts only `cgroup.endsWith(scope)`. It reads `outside` once the move wins the race, and startSeat ends the seat and throws. That happens three times, then the leaf fails.
5. pi (`/usr/bin/pi`, `#!/bin/sh`) runs bash in sh mode, which ignores BASH_ENV. claude gets no BASH_ENV. agy (an ELF) gets the PATH wrapper. So only codex is hit today.

## Fork F1: where the seat's own process is told apart from a tool shell

- **F1a: the entry skips a shell whose parent is outside the scope.** The seat process's parent is hc's pty host, outside the scope. Every tool shell descends from the harness inside the scope. The cost is one more `/proc/$PPID/cgroup` read in placementShell. Every launcher chain is covered with no argv change. It invites a short-lived child of the wrapper (`omarchy-agent-account-home`, parent inside the scope root) to mint a `tools/t-` that the sweep later removes as dead. That is noise, not harm.
- **F1b: akrogon exports the seat pid, and the entry skips `$$ == AKROGON_SEAT_PID`.** The launch gains `sh -c 'AKROGON_SEAT_PID=$$ exec env ...'` (or equivalent) inside systemd-run. This is precise by pid. The cost is an extra exec layer in the argv and one more env name every test fixture must carry.
- **F1c: scopeEntry accepts the scope or any descendant.** This is a symptom fix. The seat then lives in `tools/t-<seat pid>` and the phase-move sweep (`sweepToolCgroups` → sweepScope) treats the seat as a tool shell: it defers on the live pid, then kills the seat's cgroup when the "shell" ends. It also removes the guard that caught this class. Reject.
- **F1d: drop BASH_ENV for codex (per-kind wiring like claude/agy).** Codex tool shells then never enter `tools/`, so tool kill is lost for codex leaves. That undoes the seat-shell-kill outcome. Reject.

Recommendation: F1a. It states the real rule ("a seat's own process is never a tool shell; a tool shell is spawned from inside the seat") in the one place that mints. It needs no launch change and holds for any future wrapper chain.

## Pitfalls

- P1 The race hides the bug in tests. The proof must drive the entry with a parent outside the scope root, deterministically, not via a timed launch. Removed by a tool-entry test with a fake cgroup root and proc root (the existing `cgroupRoot`/`procRoot` seams).
- P2 A codex seat that raced past scopeEntry before the fix sits in `tools/` now. None are live (A process scan 2026-11-25T15:55Z), and new starts after the fix are clean. No migration is needed.
- P3 The fix reaches seats only after the release installs. origin/main 9a7cf416 is not yet installed (current e3ec4b02). The landing must confirm that `~/.akrogon/current` moved before the leaves are recovered.
- P4 Leaf recovery: the two framework leaves stay `failed` until someone moves them. Needs row N2.
- P5 Keep scopeEntry strict. It is the guard that surfaced this class.

## Surfaces

- `src/tool-cgroup.ts` placementShell (one parent check).
- `tests/tool-entry.test.ts`: a red-first case where the seat process (parent outside the scope) does not mint and a child shell (parent inside) does.
- `src/AREA.md` Non-obvious patterns, if it describes who mints.
- No docs under `docs/` name the entry (grep).

## Practitioner questions

- Does any harness run its tool shells from a process outside the seat scope? None found: hc spawns only the seat.
- Does `systemd-run --scope` ever leave the seat's parent inside the scope? No. The caller moves itself into the new scope and execs, so the parent stays where hc is.
