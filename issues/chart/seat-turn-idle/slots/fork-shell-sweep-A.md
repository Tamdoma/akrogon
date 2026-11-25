# Fork notes: shell-sweep, slot A

## Q1 when and where shells end

1. Pick a: inside `commitMove`, after the move is saved, for every recorded seat of the leaf, sparing `process.pid`'s ancestor chain. This matches the decision's second sentence word for word. At an advance, every required seat has already reported, so no seat should be mid-work. The caller's chain is known exactly from `/proc`. Cost: a shell started after the seat's own `akrogon phase` call still masks the seat, and nothing wakes a pass for it. That residual is a finding against the decision's first sentence. It does not block the build.
2. Rejected:
   - b: a dispatch pass runs in a separate process (the wake after the move) and cannot tell the seat's still-running `akrogon phase` tool shell from a leftover.
   - c: needs a quiet-period number with no named source, and still has b's risk.
3. Evidence:
   - better-than-training: `src/next.ts:dispatchSlot` idle gate, `src/phase.ts:commitMove`, and `src/seat.ts:startSeat` (seat scope).
   - operator, intake #157: the operator's kill at 22:50 UTC led to delivery "within seconds", so the existing gate delivers once the shell is gone.
   - B's map probe: root flips to `done` and `turn` advances when the shell is killed from outside.
4. Pitfalls:
   - Killing the caller's own chain. Removed by the ancestry exclusion.
   - A sweep error failing a committed move. Removed by sweeping after the save, and reporting a failed kill loudly with the pids and errors without undoing the move.
5. Question: does any phase advance run while a non-required seat is legitimately mid-turn? I found none in `src/routing.ts`.

## Q2 which processes

1. Pick a: shell-program children of the harness pid, each ended with its process group or tree, except the caller's chain. Observed on this host: a resting claude (pid 1527317) has no child process except the current tool's `bash`, and each tool shell leads its own process group. Cost: a non-shell background program started directly by the harness survives. Claude starts tools through `bash -c`, so this is unlikely.
2. Rejected:
   - b: kills stdio MCP servers when a harness or user config runs them as children.
   - c: needs a helper census per harness and version, which goes stale.
3. Evidence: `ps --ppid` and `pstree` of pid 1527317, read 2026-11-25 (better-than-training, local observation).
4. Pitfalls:
   - pid reuse between read and kill. Removed by re-reading the parent pid and the scope at kill time.
   - Another leaf's processes. Removed by staying inside this seat's harness pid and scope.
5. Question: which shell names count. The design should name the set (the seat's login shell, plus `sh`).

## Q3 reboot shell

1. Pick a: positive evidence only. The terminal is `live`, the status is null, and the foreground program is not the harness the seat was started with. Then the existing lost-seat path runs and charges `lost`. One path, and a seat lost three times before ending a turn is broken whatever the cause. Cost: three reboots during one phase fail the leaf. That is rare, and failure is loud.
2. Rejected:
   - b: a second charge rule.
   - c: the seed's Expected behavior asks for it, it is the same failure class, and the change is small.
3. Evidence: C and D observed `keep: true` seats coming back as shells. `src/hc.ts:terminalSchema` lacks `foreground.name` and `argv`.
4. Pitfall: a seat in its first seconds, before status. Removed because the trigger needs the foreground to be a non-harness program, never a null status alone.
5. Question: none.
