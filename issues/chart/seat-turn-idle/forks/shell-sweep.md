# Shell sweep: how an ended seat turn reaches delivery

## Question

Q1. When and where do a seat's leftover shells end, so the existing idle gate in `src/next.ts:dispatchSlot` delivers the next phase prompt?
- a. Inside the phase advance (`src/phase.ts:commitMove`), for every recorded seat of the leaf, sparing the calling process's own ancestry.
- b. In the dispatch pass (`next`), outside the seat scope, for a seat that is `working` with no outstanding prompt.
- c. Both: at the advance, and again at delivery after a quiet period.

Q2. Which processes count as a seat's leftover shells?
- a. Shell-program children of the harness process, with their process trees. Other children (MCP servers, helpers) are left alone.
- b. Every process in the seat's systemd scope except the harness pid.
- c. Every process in the scope except the harness pid, the caller chain and helper pids recorded by an observation.

Q3. A seat terminal that hc recovered as a bare shell after a reboot (`live`, `status: null`, foreground is a shell, not the harness): what does dispatch do?
- a. Treat it as a lost seat on that positive evidence and take the existing lost-seat path (evidence row, end, `startSeat`), charging `lost` like any lost seat.
- b. The same, but without charging `lost`.
- c. Leave it out of scope (record only).

### Carries

- Lock: issues/chart/seat-turn-idle/forks/seed-decision.md `## Taken` (operator decision on #157).
- Signposts: issues/chart/seat-turn-idle/forks/signposts.md `## Taken`.
- Opening map: issues/chart/seat-turn-idle/slots/map-merged.md section "seat-turn-idle (#157)" and "Shared facts".

## Charting proofs

- P1 claude masking (paid, standing grant `3b`, 2026-11-23).
  - Budget: 1 claude session (claude-haiku-5-5, effort low), 300 s wall, tools limited to `Bash(sleep:*)`. Reason: the merged map's masking facts came from B's unrecorded breach probe and need a recorded proof.
  - Command: `akrogon run-check --name mask-probe --holder <chart>/direct -- timeout 300 <chart>/direct/mask-probe.sh`. Run d4b66351-9f31-4f58-91ab-296d9c88d5a6, exit 0, log `direct/check-mask-probe-1795564071509-1323831.log`.
  - Identity: claude 2.1.331 (Claude Code), hc 0.1.22, 2026-11-25, this host.
  - Result:
    - Before: `status {state: idle}`, `turn 0`.
    - After the turn started `sleep 600` in the background and ended (screen shows the prompt and "1 shell"): `status {state: working, msg: "1 shell still running"}`, `records` has one entry titled "Sleep 600 seconds in background", `turn 0`.
    - The harness's only child was the tool shell `bash -c source ~/.claude/shell-snapshots/...`, leading its own process group.
    - After TERM to that process group: `status {state: done}`, `turn 1`, `records null`, within 8 s.
  - Cleanup: terminal t3m2 killed and removed (`hc get` refused), probe folder removed. The probe's claude transcript stays under ~/.claude/projects.
  - Limits: one claude version, haiku model, one background shell. Codex and agy are not probed.
- P1b claude masking with SIGKILL (paid, same grant and budget shape as P1). Reason: the Taken kill signal is SIGKILL and P1 used TERM (C leaf review).
  - Command: the same as P1 with `mask-probe-kill.sh` (the group is ended with `kill -KILL`). Run c8bf6312-0f84-4d6a-84d8-4414e6dc5ab7, exit 0, log `direct/check-mask-probe-kill-1795565520164-2181406.log`.
  - Identity: claude 2.1.331, hc 0.1.22, 2026-11-25.
  - Result: masked `working` with "1 shell still running", one `records` entry, `turn 0`. After SIGKILL of the tool shell's group: `done`, `turn 1`, `records null`.
  - Cleanup: terminal t3mg killed and removed, probe folder removed.
  - Limits: the same as P1.
- P2 keep recovery (free): C and D each ran a throwaway hc 0.1.22 core on 2026-11-25 (fork-shell-sweep-C.md and -D.md, Q3 evidence). After SIGKILL of a kept program: `live`, `status null`, `reported false`, foreground `bash`, launch `argv` rewritten to the shell. After a core stop: `pid null`, `foreground null`, `reason server_stop`. Between the program's death and the shell spawn: `pid null`, `foreground null`, `reason signaled` (C rebuttal probe, B final-check probe, 2026-11-25). A surviving program reattaches across a core restart with its real pid (B final-check probe). `hc schema` (hc 0.1.22) lists the `reason` values exited, killed, server_stop, signaled, holder_lost, stopped_by_restart and spawn_pending, where spawn_pending means "its initial spawn timed out, but the holder may still be starting it" (D fork notes Q3).
- P3 resting harness children (free census, B, C, D, 2026-11-25): codex holds `node_repl` ×2 and `codex-code-mode-host`. claude and pi hold only tool shells.

## Taken

A's autopilot pick, 2026-11-25. Not operator words. Sources: slots/fork-shell-sweep-{A,B,C,D}.md, -merged.md, -rebuttal-{B,C,D}.md, `## Charting proofs`.

- Q1 a. Sweep inside `src/phase.ts:commitMove` after the move is saved and logged, for every recorded seat of the leaf, sparing `process.pid`'s ancestor chain. A sweep failure warns with structured fields and never marks the committed move failed. Moves to `failed` and `merged` sweep too.
  - Reason (signpost 1a, value removing over adding):
    - The incident leaf advanced `implement -> check.review` with the loop already running, so this sweep ends it (INTAKE.md "Observation").
    - When the shell dies, claude flips to `done` and advances `turn` (P1), and the existing gate delivers.
  - Kill signal: SIGKILL to the collected set, with no wait under the global lock (D rebuttal R4, C rebuttal).
  - Rejected:
    - b: the first pass can land while the seat's own `akrogon phase` still runs inside the seat scope.
    - c: the listener wakes only on `turn`, `blocked`, `finished` and `lost` (`src/listen.ts:listenCommand`, no timer). The delivery sweep would need a new periodic wake plus a time threshold that kills shells in genuine long turns, since hc cannot tell those turns from ended ones (P1).
  - Standing dissent: B and D hold c. B argues a 30 to 60 min quiet period from the last delivery, with a periodic wake. D argues a few minutes from phase entry.
- Q2 a, sharpened.
  - Roots: processes in the seat scope whose `/proc/<pid>/comm` (or argv0 basename without a leading `-`) is in the shell set {sh, bash, dash, zsh, fish, ash, ksh, nu}, and whose parent is the harness pid or a pid outside the seat scope.
  - Each root is ended with its descendant tree.
  - Spared: the caller's ancestor chain, and any root subtree holding a live run-check process of the leaf (`src/admission.ts:liveRuns`).
  - Before signalling, re-check each pid's start time and its membership in the seat scope.
  - Each sweep appends one `shell_sweep` timing row with the leaf, slot, pids, comms and errors (extending timings, signpost 3a).
  - Reason:
    - Codex keeps non-shell helpers in the seat scope (P3), so b and c kill them or need a version-coupled allowlist.
    - The parent rule catches reparented shells (C) and never classifies shells under a non-shell helper (D rebuttal R5).
- Q3 a. A seat terminal is lost when it is `live` with `status` null and either shape holds:
  - Parked: `pid` is null and `reason` is set and is not `spawn_pending`.
  - Spawned: `foreground.name` is in the Q2 shell set and `argv[0]` is not `systemd-run`.
  - Dispatch then takes the existing lost-seat path in `src/next.ts:dispatchSlot` (seat_lost row, end, `lost + 1`, fail at 3, `startSeat`).
  - `src/hc.ts:terminalSchema` gains `argv`, `reason` and `foreground.name`. The predicate is used only in dispatchSlot's lost branch.
  - Reason:
    - hc `keep` makes a signal death look the same as a reboot (P2), so the `lost` charge is the only bound on a crash loop.
    - Sharing the predicate with `allocate` or `broadcastInProgress` causes a cap deadlock and a silent broadcast drop (D rebuttal R6).
  - Rejected:
    - b: an unbounded relaunch loop.
    - c: leaves the reboot stall that the intake's Expected behavior names.
    - Turning keep off: herdr-app turns keep on when it adopts a terminal into a tab (`~/.config/herdr-app/AGENTS.md`, terminal panes), so akrogon does not own that flag (B rebuttal premise confirmed, owner found).
- Residuals, recorded and not fixed here:
  - A shell started after the seat's own phase call, and a masked silent end with no advance, both stay masked with no wake. No dispatch pass runs, so even the 1 h busy notice does not post (B rebuttal). Recorded in forks/seed-decision.md `## Findings`.
  - Codex and agy masking is unobserved. If codex masks through `node_repl` or `codex-code-mode-host`, Q2 does not unblock it (D rebuttal R7).

### Final-shape check, 2026-11-25

Sources: slots/fork-shell-sweep-final-check-{B,C,D}.md. No pick breaks. These corrections are part of the Taken shape:

- Q1 kill order (C): signal the collected trees top-down, parents before children, so no parent forks after a child is killed. Then re-collect once with the same rule in the same sweep and kill anything new. There is still no wait.
- Q2 run spare (C): spare a root subtree holding the writer pid of any run record of the leaf whose writer is alive (`src/admission.ts:writerLive`) in the `waiting`, `live` or `ended` state, not only `liveRuns()`. `checkedRun` marks the record `ended` before it publishes its log and unlinks its captures. A kill in that window leaves an abandoned capture pair that refuses every later move (`src/run-check.ts:abandonedCaptures`).
  - The start-time re-check must read through `procRoot()`. `src/admission.ts:liveStartTime` reads `/proc` directly.
- Q3 spawned shape (C): require a non-empty launch `argv` whose first word is not `systemd-run`.
- Q3 schema (B): `foreground.argv` already exists in `terminalSchema`. The additions are the top-level `argv`, `reason` and `foreground.name`.
- Not taken: D's proposal to make `src/timing.ts:readTimings` skip unknown kinds. An older build reading a newer timings file loses its timings, and that holds for every kind added before this one. It is not this leaf's change (scope).
- Residual (B): when the lost path replaces a seat, shells left in the old seat's scope are not swept again. They cannot mask, because their harness is dead. Reconcile stops the leaf's scopes at close.
- Residual (B): the `reason` strings come from hc 0.1.22 probes and are undocumented. The spawned shape does not depend on them.

### Leaf review, 2026-11-25

Sources: slots/leaf-review-{B,C,D}.md. These corrections are part of the Taken shape:

- Q2 timing row (C,D): one `shell_sweep` row per swept seat that had a process ended or an error, naming that seat's slot. This replaces "one row per sweep".
- Q2 run spare (B,C,D): `src/admission.ts` gains one export listing the leaf's run records in `waiting`, `live` or `ended` state whose writer is alive. `writerLive` is private today.
- Q2 boundary (C,D): every proc read goes through `procRoot()` (including `src/seat.ts:cgroupOf` and `liveStartTime`). Scope membership is read under `cgroupRoot()`.
