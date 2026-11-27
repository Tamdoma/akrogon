# Fork: seat-root

## Question

1. How does the tool entry tell the seat's own process apart from a tool shell when the harness launcher is a bash script?
2. Which leaf seats carry the seat-pid marker, if O2 is taken?

## Findings

Merged notes: slots/seat-root-merged.md. Maps: slots/map-A.md, map-b.md, map-c.md, map-d.md. Rebuttals: slots/seat-root-rebuttal-b.md, -c.md, -d.md.

- better-than-training, src/seat.ts startSeat wiring and scopeEntry, src/tool-cgroup.ts placementShell and sweepScope, read 2026-11-25. The codex launcher sources BASH_ENV in the seat pid and moves the seat into tools/. That causes the early failure (outside, observed) and the late one (the sweep kills the seat). (A,B,C,D)
- better-than-training, closed design issues/closed/seat-shell-kill/tool-cgroup-kill/design.md Q5: "no process is read to decide" and "Rejected narrow entry: a parent test at spawn". That rules out O1. B withdrew O1.
- Probes (free, 2026-11-25). A, B, C and D each saw the same-pid sourcing. C and B saw O2 work in a real delegated scope: the seat stays at the root and a forked bash mints a t-.
- C rebuttal: O1 also skips reparented background bash (the parent becomes systemd --user, outside the scope). Observed on this host.
- F (blind, slots/seat-root-F.md): picks the seat pid marker and every kind, with real-scope probes. The red test must assert placement state, not start success, because the race can pass the base.
- C and D rebuttals: fork-and-wait wrappers are a silent residual under O2, not a loud one, because scopeEntry reads only the launched pid. No observed harness has that shape.
- C and D rebuttals: O3 leaves tools from the first task unplaced, and every option for when to arm has a hole.
- D rebuttal R3: only BASH_ENV kinds can self-place, so claude's trampoline is unneeded. C 2A: one launch shape for every kind.

## Taken

Operator, 2026-11-25T16:20:02Z: "1a 2a N2 restart N3 keep".

1. 1a, the seat pid marker. startSeat runs the harness inside the scope through `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"' <harness argv> <task>`. placementShell (shared by both entry forms) returns early when `[ "$$" = "${AKROGON_SEAT_PID:-}" ]`. An unset marker means place as today. A set marker with a different pid means place, with no fail-open (B). spawnHelper scrubs AKROGON_SEAT_PID beside the other two markers. scopeEntry stays strict. The sweep, relocation and helper are unchanged.
2. 2a, every leaf seat kind. One unconditional hop. agy's PATH prefix moves into the same `sh -c` script, which replaces agyWrap.

Binding avoidance mechanisms:
- The red-first test is in tests/tool-entry.test.ts, in a real scope. A `#!/bin/bash` launcher stand-in execs tests/stand-in.sh as the harness. It asserts state after the start, not start success (F R2): the seat pid's cgroup is the scope root, no `tools/t-<seat pid>-*` exists, and a bash the seat forks lands in its own `t-` (a real fork, not bash's last-command exec, C).
- A pinned entry test covers all three marker states: unset places, set-and-equal skips, set-and-unequal places (B, C, F E5).
- The per-kind launch-argv test asserts the hop on every kind, with `systemd-run` still argv[0].
- src/AREA.md and the startSeat wiring comment are updated in the same change (S6a).

Residuals recorded, not fixed: a launcher that forks a bash child which then execs the harness strands the harness in a `t-`. That is silent at start and surfaces as a lost seat (C, D, F). No harness here has that shape. A wrapper's forked startup child (omarchy-agent-account-home) mints one empty `t-`, which the next sweep removes.

## Charting proofs

Free observations, 2026-11-25, operator's local user (uid 1000), systemd 262, bash 5.3.20, codex-cli 0.172.0. No grant and no paid call.
- C (slots/map-c.md Probe 2): a real delegated scope with `--expand-environment=no`. `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"'` passes `$$` intact. With the patched entry, a bash-wrapped seat stays at the scope root and a forked bash lands in `tools/t-`. A real `codex --version` stays at the root. Cleanup: `systemctl --user stop`, checked gone. Limits: it does not prove an interactive codex seat with tools.
- F (slots/seat-root-F.md E1 to E5): the same for a baseline repro, the patched entry, a bash stand-in harness with a child tool shell, and an unset marker placing as today. Cleanup: stopped and checked gone. Limits: the same.
- B (slots/seat-root-rebuttal-b.md): the trampoline pid survives the exec into the chain root, and a nested bash differs. Limits: no scope placement.

