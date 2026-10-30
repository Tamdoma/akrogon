# Brief: verify-pass-service

## What

Each `akrogon verify` check pass (one `runOnce`) runs in its own systemd user transient service instead of inside the calling command. The calling `akrogon verify` prints the pass id, waits for the service to exit and prints the same lines and exit code an attached run prints today. A repeat call from the same caller on the same inputs joins the live pass instead of starting a second suite. `akrogon stop-run <pass id>` stops a whole pass.

## Why

Tamdoma/akrogon#119: 21 verify runs in 10 days died about 2 minutes in because the pi seat's bash tool killed the calling command at its 120 s default timeout. The checks died with it (`src/scope.ts` `startRunGuard`), and the seat started the full suite again. The instruction to set the tool timeout has been in implement-issue and pi since 2026-10-15 and did not stop it. Tying the run's lifetime to the caller is the fragile part. This removes it for every caller death: tool timeout, pane loss, task stop.

## Done-criteria

1. Killing the caller of `akrogon verify` with SIGKILL to its whole process group during the pass's `test` check leaves the pass running. The pass's receipt gains `setup`, every command's exit and log, and `end`, and its checkout is removed, the same as an uninterrupted run on that commit.
2. While a pass is live, a repeat `akrogon verify` from the same caller scope and caller target on the same tree, verify scope, command set and `compares` link starts no second pass. the verify receipt ledger holds one receipt for that pass, and the repeat call prints the pass's per-command lines and returns its exit code. A call that differs in caller scope or any key part starts its own pass.
3. The exit code of `akrogon verify` equals the pass's own outcome for an attached call and a joined call alike: 0 for green, non-zero for a red check, non-zero for a failure after the receipt is written (such as checkout removal failing), and non-zero for a pass whose service ended with no `end` in its receipt.
4. `akrogon verify` prints `run <pass id>` before any check line. `akrogon stop-run <pass id>` from the starting caller scope stops the whole pass during a check, between two checks and while a `full` check waits for admission. No later check of that pass starts, and the receipt keeps no `end` and is never reused. The same command from another scope is refused and the pass keeps running.
5. Check runs a pass starts keep the starting caller's scope as owner, so plain `akrogon stop-run` from that pane lists and stops them as it does today.
6. `docs/reference/commands.md` (verify and stop-run rows) and `src/AREA.md` (verify and run-check lines) state the pass service, the join rule and the pass stop as shipped. (A,B)
