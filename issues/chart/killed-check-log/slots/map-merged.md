# Merged map: killed-check-log

## Outcomes

- (A,B) One leaf: output a run-check's command printed before its caller died stays readable in the holder and through `akrogon log` after packing. Normal-exit behavior (exit code, completed combined log, printed result line) stays as today. A partial capture never counts as a completed check or a verify receipt.
- (A,B) Busy alert during one long tool call: off route under the 2026-09-18 lock. No stillness event exists; the event-driven notifier stays unchanged.
- (A,B) Making a check survive its caller (B O9) and changing seat timeout instructions (B O10): off route; neither makes evidence durable.

## Q1 · Where output becomes durable

- 1a (A,B) pick: the command writes into run-unique capture files in the holder from launch; run-check prints their path before waiting; on normal exit the completed log is produced as today and the partial files are removed. Cost: live files in the owner folder, so Q2 is required.
- 1b (A,B) reconcile recovers a dead owner's run-root capture into the holder. Cost: needs destination metadata, waits for the next reconcile event, and is a second loss boundary.
- 1c (A,B) copy from `finally` or a signal handler. Rejected: SIGKILL runs neither.
- 1d (B) tee or journal streaming. Rejected: live view without durability, adds a second store.
- (A) the guard in `startRunGuard` copying on wrapper death is a variant of 1b with the same metadata need, and nested admission has no guard.

## Q2 · Live capture versus packing

- 2a (B) pick, (A) agrees: an OS-released lock: each live capture holds a shared lock on the owner, pack and owner movement take it exclusively, so pack waits for writers. Zero-clock: the kernel releases it on SIGKILL. Cost: lock ordering must be proven against the real completion path to rule out a deadlock.
- 2b (A) pack refuses loudly while a live run owner (existing `.owner` pid and boot_id records) targets that owner, with run-check registering before checking `.closing`. Cost: completion stops with an error until the run ends; ordering race must be proven.
- 2c (B) stage partials outside the owner and import finalized evidence. Cost: a new store, metadata and retention.

## Pitfalls and what removes them

- (A,B) SIGKILL mid-run: 1a removes the post-exit-only boundary; done-criterion kills the real wrapper with SIGKILL after distinct stdout and stderr markers and reads both back from the holder.
- (B) pack snapshots a growing file: 2a; done-criterion packs while a capture is live and reads the bytes back from `evidence.tar.zst` with `akrogon log`.
- (B) shared shell helper changes break other callers: change only the run-check capture path; keep `Result`, stdout/stderr replay and final-newline handling.
- (B) same-name concurrent or nested checks collide: run-unique names; both admission kinds covered.
- (B) partial read as a pass: the completed result line and receipts stay the authority; the early line names the path, not an exit.

## Points where slots differ

- 2a versus 2b: B picks the lock; A leans the same way because 2b leaves a check-then-act race and fails completion.
