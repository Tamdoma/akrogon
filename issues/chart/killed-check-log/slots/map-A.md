# Slot A map (written before reading map-B.md)

- Outcome 1: kept output for a killed run-check. Cause: `checkedRun` copies the log to the holder only after the child exits (`src/run-check.ts`), pi 1.4.0 SIGKILLs the process group, reconcile drops dead-owner run roots. One leaf.
- Options: write captures into the holder from launch and print the path at start (pick); guard or reconcile copies on wrapper death (needs target metadata, nested runs have no guard); `finally`/signal handler (dead under SIGKILL).
- Pitfall: `packFolder` at owner close versus a live writer in the holder; `ownerRefusal` exists for the closed-owner case. Needs a zero-clock exclusion (lock, or refusal via `.owner` records).
- Outcome 2: busy alert during one tool call. Off route: lock 2026-09-18, no stillness event in herdr, notifier kept.
- Not in scope: instruction change in implement-issue (already requires timeout above expected run time).
