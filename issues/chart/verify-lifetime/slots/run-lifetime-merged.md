# run-lifetime merged notes

Inputs: [A map](map-A.md), [B map](map-B.md). B's map Forks D1-D3 are B's blind notes for this fork: B wrote them before seeing A's view.

## Q1 · who keeps the run alive

- 1a verify runs each check pass in its own systemd user unit (the `src/land.ts` transient-service idiom) and outlives the waiting call; the waiter prints the same lines and exit code. (A) Reason: removes the whole class (tool timeout, pane loss, TaskStop) with nothing for a seat to remember; the instruction fix of 2026-10-15 was already in place for all 21 pi kills. Cost: one moderate leaf in verify's core path; cancellation moves to `akrogon stop-run`; the existing test "a run killed during setup leaves a record with start and no end or removal" encodes the old lifetime.
- 1b replace the waiting guidance at the four verify call sites with harness-specific tool fields (pi `timeout` above the full budget, codex keep waiting on the session, Claude keep the task). (B) Reason: small, no new machinery, and the only demonstrated defect is caller usage. Cost: instructions stay probabilistic (B states this).
- 1c raise pi's global default. Rejected (A,B): reverses the operator's D3 answer and widens every forgotten command's hang bound in another repo.

## Q2 · repeat call and cancel (only under 1a)

- 2a a repeat verify on the same tree, scope and exact command set (the reuse key, `reuseSource`) waits on the live run instead of starting one; `akrogon stop-run` reaches the detached run because the unit carries the caller's owner scope. (A)
- B raised the matching risks: Q3 in B's map (deliberate stale-head cancellation must stay possible, B F2) and B Q2 (the full budget covers admission wait and a head/base pair).

## Q3 · receipt with no end

- 3a keep today's meaning: no `end` is incomplete and never reused (`completed`, `reuseSource`, `requireGreenReceipt`); no reason field, no signal handler. (A,B) Reason: handlers cannot cover SIGKILL or host loss, and a reason field adds schema without saving suite time.
- 3b reconcile marks dead-owner receipts abandoned. (B, conditional) Only if durable explanations are a goal.

## Evidence

- pi session identical-ignored messages 147-152: two 120 s timeouts, then `timeout: 900` passes. (A,B)
- `tamdoma-pi-tweaks/shell-timeout.ts` `DEFAULT_TIMEOUT_S = 120`, commit 7ec041d. (A,B)
- Claude session bacd17ee: four TaskStops of checkout verify, the first for an old head. (B)
- Journal: run scopes stop in the same second as the timeout or TaskStop, via `startRunGuard`. (A,B)
- `src/stop-run.ts` `stopRunCommand` matches live runs by `callerScope()`. (A)

## Pitfalls and what removes each

- Join returns a result for a different command set: join key equals the reuse key. (A)
- Seats misread a joined run: waiter prints the same per-command lines and exit code. (A)
- Stale runs burn CPU after a cancel: stop-run reaches the detached unit, named in the skills where seats cancel. (A; B F2)
- Lost exit status through `| tail`: existing implement-issue rule on exit status. (B R2)
- Cleanup mistaken for evidence: `completed` gating unchanged. (B R3)
- Host overload from detached runs: detached runs still pass `withAdmission`. (A)

## Where slots differ

- Q1: A picks 1a, B picks 1b.
