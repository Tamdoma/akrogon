# Merged notes: stop (A, B, C)

## Agreed
- Kill target is the leaf slice, every pane scope under it, including old generations with detached browsers (A,B,C). One `systemctl --user stop`-class call on the shared derived name, not PID or tab kills (B,C).
- Fence first, then kill. Killing panes fires herdr hooks, and without a committed fence the next pass recreates and relaunches the seat (A,B,C). Fence write uses the global akrogon lock that dispatch uses (B,C).
- Pane scopes get a short stop timeout, single-digit seconds (B: TimeoutStopUSec=5s, C: same order), instead of the 90 s user default, so TERM then KILL needs no akrogon escalation code (B,C).
- A failed systemd stop keeps the fence, reports the error, and the stop can be retried (B,C).
- Pi Esc unchanged. Wait-abort leaving children is intended (manager.test.ts:1652, 2163), workers stay boxed and their runs hold the permit (A,B,C).
- Stop is run from outside the leaf box. Self-stop is not supported (B).

## Disagreements
1. Which command and fence.
   - A: `akrogon pause` itself also stops every leaf slice of the repo. The pause gate is the fence, unpause restarts. No new verb or state.
   - B: pause unchanged. New `akrogon stop <leaf>` sets the leaf to `phase: failed`, cause blocked, operator reason, interrupted phase recorded. The failed gate already blocks automatic and manual dispatch (src/next.ts:738-748). Resume: `akrogon phase <leaf> <phase>` then `akrogon next <leaf>`. Cost: failed cleanup can remove a clean worktree and scratch (src/reconcile.ts:306-316).
   - C: pause unchanged. New `akrogon stop <slug>` / `akrogon start <slug>` with a host-local `stopped.yaml` mirroring paused.yaml. One gate in dispatchLeaf blocks automatic and manual, and one in the merge path. `start` clears and dispatches. Rejects failed: a stop is not a failure, has no slot or cause, and drags notifications, tab renaming and batch-failure reconciliation.
   - B,C against A: pause has a documented, used meaning (incident workaround paused framework while the selector leaf kept running), works per repo only, and manual next bypasses it.
2. Repo-wide stop. C asks whether `stop --all` is needed. The incident had six hot leaves.

## New questions
- QR1 Must stop preserve worktree and scratch (B)?
- QR2 Stop latency while another pass holds the global lock (B).
- QR3 Should a seat be able to run `akrogon stop` on its own or another leaf (C)?
