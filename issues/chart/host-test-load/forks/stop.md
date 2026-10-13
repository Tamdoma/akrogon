# Stop

## Question
Q1. What stops running work: pause stays dispatch-only plus a new stop verb that stops a leaf's slice, or pause itself stops slices? Does pi Esc change?

### Carries
- Fog moved in: whether pi parent Esc should cancel workers.
- Seat-scope Taken: stopping a pane scope kills the shell and herdr closes the pane. Redispatch after a stop must be fenced by leaf state.
- Restore Taken: allocate replaces any recorded pane outside its box.
- Depends on limit-boundary.
- Map B D5, C D6. Pi wait-abort leaving children is tested on purpose (tamdoma-subagents/manager.test.ts:1652).

## Findings
Round 2026-10-13, notes slots/stop-{A,B,C}.md, merge slots/stop-merged.md, rebuttals slots/stop-rebuttal-{B,C}.md.
- Pause stays dispatch-only. A withdrew "pause also stops": pause has a documented, used meaning (incident workaround paused framework while a leaf kept running), works per repo only, and manual next bypasses it (docs/guide/next.md:106-117).
- New `akrogon stop <leaf>` plus repo-scoped `akrogon stop --all` over allocated leaves (B,C). Fence first under the global lock, then stop the leaf slice, every pane scope included. Failed systemd stop keeps the fence and is retryable. Partial failures in --all are reported per leaf.
- Pane scopes get a short stop timeout (B: TimeoutStopUSec=5000000) so TERM then KILL needs no akrogon code.
- Stop runs from an operator shell outside the box. A seat wanting its leaf stopped ends its pass failed, as today (B,C).
- Pi Esc unchanged (A,B,C). Direct worker scripts can bypass the permit but stay stoppable through the seat box (B).
- Open for operator: fence kind. B: reuse `phase: failed` (blocked, operator reason), resume by `akrogon phase` plus `akrogon next`, accepts failed cleanup that can remove a clean worktree and scratch (src/reconcile.ts:306-316). C: small host-local `stopped.yaml` beside paused.yaml, one gate in dispatchLeaf and merge path, `akrogon start <leaf>` clears and dispatches, no start --all. A: C, since a stop is not a failure and restart is one command.

## Taken
1a, operator 2026-10-13. Reason: a stop is not a failure, and restart is one command.
- Pause unchanged. New `akrogon stop <leaf>` and repo-scoped `akrogon stop --all` over allocated leaves. No `start --all`.
- Fence: host-local `stopped.yaml` in akrogon home beside paused.yaml, written under the global lock before any kill. Gates in dispatchLeaf (automatic passes end quietly, a picked manual next errors and names `akrogon start`) and in the merge path before a new stack or merge seat. `akrogon status` marks stopped leaves.
- Kill: stop the leaf slice by its shared derived name, pane scopes created with SendSIGHUP=yes and TimeoutStopUSec=5000000 (proofs.md T2: interactive bash ignores TERM, so without SIGHUP every stop waits 5 s and leaves a failed unit). A failed stop keeps the fence, reports the error and is retryable. --all reports per leaf.
- `akrogon start <leaf>` removes the entry under the lock and runs the targeted `akrogon next <leaf>` pass.
- Stop runs from an operator shell outside the box. Pi Esc unchanged.
- Foreclosed: pause kills, failed-phase fence, park fence, PID or tab kills, pi Esc change.
