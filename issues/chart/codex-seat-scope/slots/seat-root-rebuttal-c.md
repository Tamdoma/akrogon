# Rebuttal, slot C: fork seat-root

Agree with A's lean (**O2**). Three disagreements with [seat-root-merged.md](file:///home/ivan/Work/infra/akrogon/issues/chart/codex-seat-scope/slots/seat-root-merged.md):

1. **O1 has a functional escape hole beyond Q5 (reparented tool shells):**
   The merged notes list O1's only cost as the Q5 parent-test lock. O1 also fails to place detached/reparented `bash` tool shells. If a non-bash process at the seat root (e.g., POSIX `sh`, `node`, `python`) spawns a background/detached `bash` and exits before `bash` runs `BASH_ENV` (or a double-forked daemon execs `bash`), Linux reparents `bash` to the user subreaper (`systemd --user`), whose `/proc/$PPID/cgroup` is readable and **outside** the seat scope. Verified on this host:
   - `sh -c '(sleep 0.05; exec bash -c "echo pid=\$\$ ppid=\$PPID; cat /proc/\$PPID/cgroup") &'` -> `ppid=2317`, `0::/user.slice/user-1000.slice/user@1000.service/init.scope`.
   Under O1, `placementShell` skips that `bash`, leaving a detached background tool at the seat root to survive `sweepScope`. Under O2, `$$ != AKROGON_SEAT_PID` stays true regardless of reparenting, so the detached shell is still placed and killed.

2. **O3's cost is understated (`firstTask` confirmation and `unconfirmed` seats):**
   - `codex` receives its task in argv immediately, and `firstTask` (`src/seat.ts`, `firstTask`) confirms only once `t.status?.state === 'working' || t.turn > delivered`. Tools spawned early in turn 0 (or throughout a fast turn confirmed via `t.turn > delivered`) run before `startSeat` arms the file and escape phase-move kill.
   - `startSeat` (`src/seat.ts`, `startSeat`) keeps an `unconfirmed` seat alive (records `delivery_error` after `START_PROOF_MS` = 60s and places it in the tab). Arming only "after `firstTask` confirms" leaves an `unconfirmed` seat **permanently unarmed**; arming on `unconfirmed` too leaves a 60s unarmed window; arming earlier after `scopeEntry` reintroduces the startup race (the late failure mode).

3. **Pitfall line 32 misstates C's note and `scopeEntry`'s behavior on fork-and-wait wrappers:**
   Line 32 attributes to `(B,C)` that for fork-and-wait wrappers "O1/O2 strand the agent in the supervisor's `t-`, and `scopeEntry` refuses loudly."
   - First, `map-c.md` did not claim `scopeEntry` refuses this case. In a fork-and-wait chain where supervisor `P` (`launched.pid`) stays at the scope root and forks a child `#!/bin/bash` wrapper `Q` that execs the agent, O1/O2 move `Q` into `tools/t-Q-...` while `P` stays at `<scope>`. Because `scopeEntry` (`src/seat.ts`, `startSeat` calling `scopeEntry(launched.pid, ...)`) inspects only `launched.pid` (`P`), `scopeEntry` returns `entered` — it does **not** refuse loudly, and the first `sweepScope` kills `Q`.
   - Second, if a `#!/bin/bash` supervisor `P` forks an ELF agent `Q` directly, neither O1 nor O2 strands `Q` (`P` is exempted at root; ELF `Q` does not source `BASH_ENV`).
   Keeping `scopeEntry` strict is still right, because it catches the in-PID `exec` failure mode, not fork-and-wait.
