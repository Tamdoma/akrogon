# Rebuttal: `engine-shape` (Slot E)

## Q3 (`3a` vs `3b`): `akrogon phase` already dispatches seats today, so `3a` does not avoid the two-path guard

- `fork-engine-shape-merged.md` (lines 19–20) contrasts `3a` ("one success path") against `3b` ("Cost: two success paths; double-prompt guard needed").
- In existing code, `akrogon phase` (`src/akrogon.ts:96`) calls `mergeWake` (`src/next.ts:1358-1374`) -> `mergePass` -> `mergeTurn` (`src/next.ts:1148-1269`), which **already** calls `broadcastPass` (`src/next.ts:1156,1280-1312`) and `dispatchMergeLeaf` -> `dispatchLeaf` (`src/next.ts:1178,1260,1314-1333`) synchronously during `akrogon phase` before the calling seat's turn ends.
- Specifically, when Seat A runs `akrogon phase <slug> merge --slot A` (from `check.repair`) or when Seat B runs `akrogon phase <slug> merge --slot B` (completing `check.review`), `mergeWake` inside `akrogon phase` dispatches Seat B's merge turn (or broadcast turn) immediately while the calling seat is still mid-turn (`working`), and the plugin's turn-end event fires `akrogon next` moments later.
- Therefore, **both `3a` and `3b` require the exact same `.lock` + `prompted` double-prompt guard** between `akrogon phase` and `hc events`; `3b` adds zero new concurrency mechanisms while also covering non-merge cross-seat handoffs, backgrounded Claude seats (`status: null`), and shell-run operator recovery (`akrogon phase <slug> <phase>` without `--slot`, `src/phase.ts:394-397`).
