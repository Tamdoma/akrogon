# Fork shell-sweep: merged notes (A, B, C, D)

Sources: fork-shell-sweep-A.md, -B.md, -C.md, -D.md.

## Q1 when and where shells end

- a. Sweep inside `commitMove`, after the move is saved, for every recorded seat, sparing the caller's ancestry (A,C).
  - Reasons:
    - The decision's second sentence, word for word.
    - It covers command-driven moves too: land, merged, failed (C).
    - Killing the shell during the phase call means claude reports `done` when the turn ends, which gives a `turn` event and a wake with no polling (C).
  - Cost: a shell started after the seat's own phase call, and a masked silent end with no advance, both stay notice-only (1 h busy notice) (A,C,D named).
- c. Both: the advance sweep, plus a delivery sweep after a quiet period (B,D).
  - D's condition: the seat is `working`, no prompt is outstanding, no live run, and a quiet period of a few minutes from phase entry.
  - B's quiet period is 30 to 60 min from `busy_since`.
  - Reasons: it closes the post-advance tail shell and a skipped advance sweep (D).
  - B's claim is wrong. B says the incident stalled inside one phase, so an advance sweep never fires. The intake shows A moved the leaf `implement -> check.review` at 18:07 and then waited on its check.review prompt. The advance sweep fires in the incident (A's reading of INTAKE.md "Observation").
  - Cost: the listener wakes only on events (`turn`, `blocked`, `finished`, `lost`; `src/listen.ts:listenCommand`). A masked seat makes no event, so a quiet-period sweep runs only when an unrelated pass happens (C). It also adds a time number with no named source.
- b. Dispatch only: rejected by every slot. The first pass after a move can land while the seat's own `akrogon phase` is still running inside the seat scope (A,C,D).
- Points where slots agree:
  - Sweep after the save and the move log. A sweep failure warns with structured fields and never marks a committed move failed (C,D), following the `renameTab` warning in `src/phase.ts`.
  - Moves to `failed` and `merged` sweep too (C,D).

## Q2 which processes

- a. Shell-program processes, each killed with its whole descendant tree, sparing the caller's ancestry (A,B,C,D).
  - Evidence: a resting codex seat holds non-shell helpers `node_repl` ×2 and `codex-code-mode-host` as harness children, so option b would kill them on every advance (B,C,D census, 2026-11-25). Claude runs tools as a two-level bash chain (B,C).
  - Scope of the match:
    - Shells anywhere in the seat scope, including ones reparented away from the harness (B,C).
    - Direct shell children of the harness with their trees (A,D).
  - Shell set from `/proc/<pid>/comm` or the argv0 basename: sh, bash, dash, zsh, fish, ash, ksh (C), plus nu (D, hc's `shell` setting).
  - Signals: TERM to the whole collected set, a short wait, then KILL survivors (C). D proposed KILL at a later sweep, which option a never has.
  - Spare any subtree holding a live run-check process from `liveRuns()` (C, narrower), or skip the whole sweep while the leaf has a live run (D).
  - pid reuse: re-check the start time and scope membership before signalling (C,D).
  - Record each sweep as a `shell_sweep` timing row with the killed pids and comms. This extends an existing record (B,D).
- b and c rejected by every slot (codex helpers; c is a version-coupled allowlist).

## Q3 recovered bare shell

- a. Lost seat on positive evidence, charging `lost` (A,B,C,D).
  - Reason: hc `keep` turns a signal death (OOM, SIGKILL) into the same shape as a reboot, so no field says "reboot". Without the charge, a crash-looping harness relaunches forever (B,C,D probed).
  - Evidence shapes:
    - `status` null and foreground name is a shell, not the harness (A,B,C,D).
    - D's probe adds the core-restart shape: `pid` null, `foreground` null, `reason` in {server_stop, stopped_by_restart, holder_lost}. The shell spawns lazily. Exclude `reason: spawn_pending` (D).
  - Schema: add `foreground.name`, `reported` and `reason` to `src/hc.ts:terminalSchema` (B,C,D). The launch `argv` is rewritten on recovery, so it is unusable for comparison (D).
  - One shared predicate also used by `activeCount`/`liveSeat` (capacity hold) and by `broadcastInProgress` (cleanup stall) (C).
- b and c rejected by every slot.

## Open questions

- Turn `keep` off for seats so a lost agent ends as `finished` and the existing path handles it (D,C). Who sets `keep: true` is unknown: `src/hc.ts:run` passes no `--keep`.
- Does codex or agy mask like claude? Unobserved (B,D). Option a still ends their shells, so the fix stays harness-independent.
