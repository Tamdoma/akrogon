# Durable check capture

## Question

Q1. Where does a run-check's output become durable, so a caller killed by SIGKILL still leaves what the command printed so far in the holder?

Q2. How is a live capture in the holder kept safe from owner packing and closure?

### Carries

- Lock, operator 2026-09-18 (`../seat-stall-detection/forks/no-akrogon-detector.md`, `## Taken`): no clocks, polls or watchdogs; pure silence stays invisible.
- Lock, operator correction 2026-09-18 (`../stall-notifier-removal/forks/delete-notifier.md`): keep `observeBusy`, `STALL_MS`, `busy_since`, `busy_notified` unchanged.
- `skills/implement-issue/SKILL.md` `Shared context` step 3 already says the tool timeout must exceed the expected run time; unchanged.

## Findings

Merged notes: [slots/map-merged.md](../slots/map-merged.md). Maps: [A](../slots/map-A.md), [B](../slots/map-B.md). Rebuttal: [slots/map-rebuttal-B.md](../slots/map-rebuttal-B.md).

- (A,B) `src/shell.ts` `spawnFiles` writes stdout/stderr to `<runRoot>/akrogon-io-*/{out,err}`; `finishCaptured` reads and removes them after exit; `src/run-check.ts` `spawnLogged` builds `out.log` and `checkedRun` copies it to the holder only after the child exits. Evidence depends on wrapper survival. better-than-training, inspected 2026-10-27.
- (A,B) pi 1.4.0 kills a timed-out bash call with SIGKILL on the process group (installed binary, `killProcessTree`), so no `finally` or signal handler runs. better-than-training, inspected 2026-10-27.
- (A,B) `src/reconcile.ts` drops a run root whose `.owner` pid is dead, deleting the raw captures. `src/scope.ts` `startRunGuard` already stops the run scope on wrapper death.
- (B) `src/pack.ts` `packFolder` snapshots and unlinks regular `.log` files; `ownerRefusal` checks only before and after the command, so a live descriptor can write after the snapshot and the bytes are lost. A symlink is refused by pack.
- (B) `src/verify.ts` `runOnce` calls `checkedRun` for setup, full checks and concurrent checks; a partial capture must never yield a receipt. Nested admission has no guard or scope of its own, so both admission kinds need the same capture path.
- (B) The four named installed release files match this checkout byte for byte (`63c20f98`).
- (A) Run-check prints the child's output and the log path only at the end, so a killed caller sees nothing and cannot find partial output.

## Taken

2026-10-27, A's autopilot pick (not operator words): `1a 2a`.

Reason: removes the loss at its source with the fewest moving parts and no clock; matches simplicity and removing over adding.

Binding final shape (B final check: "No defect.", [slots/durable-capture-final-check-B.md](../slots/durable-capture-final-check-B.md)):

1. Capture: the command's stdout and stderr go to run-unique capture files inside the holder from launch, for both held and nested admission. run-check prints the capture path before waiting, without any exit claim. The shared shell helper's behavior for other callers is unchanged.
2. Publication: on command exit with a publishable owner, the completed combined log is produced as today (same name pattern, same result line, same `Result` stdout/stderr replay and final-newline handling), then the partial capture files are removed. Partial removal is conditional on successful publication; a closed, closing or vanished owner keeps today's refusal and keeps the captured output with `refusal.json`, never recreating the owner. (B)
3. Exclusion: a kernel-released file lock whose lifetime equals the lifetime of every capture writer and of the wrapper's publication, including partial removal. It is taken before the capture files are created and the owner fence (`ownerRefusal`) is rechecked under it. Pack and owner movement take it exclusively before snapshot. (B)
4. Authority: a partial capture never counts as a completed check or a verify receipt.
5. Proofs: SIGKILL a real wrapper after distinct stdout and stderr markers, run reconcile, read both markers from the holder; pack started during a live capture cannot finish before writers and publication end, then both streams read from `evidence.tar.zst` through `akrogon log`; normal exit leaves exactly the completed log; closed-owner refusal still keeps output. (B)

Rejected: 1b reconcile rescue (stored target metadata, waits for the next reconcile, second loss boundary); 1c copy in `finally` or a signal handler (SIGKILL runs neither); 1d tee or journal streaming (no durability); 2b pack refusal on live `.owner` records (check-then-act race, fails completion); 2c staging outside the owner (new store and retention).

Standing consultant dissent: none.

## Taken (correction, 2026-10-27)

A's autopilot pick after B's leaf review ([slots/leaf-review-B.md](../slots/leaf-review-B.md) F1, F2); B final check "No defect." ([slots/self-close-final-check-B.md](../slots/self-close-final-check-B.md)). Adds to the binding shape; item 4 is replaced by item 7:

6. Self-close: owner completion (`src/phase.ts` `completeOwner`) or pack (`src/pack-command.ts` `packOne`, `src/pack.ts` `packFolder`) started by a process running inside a run-check capture whose holder belongs to that same owner refuses loudly before waiting for the exclusive lock, naming the enclosing run, and the emitted evidence stays. Detection uses state the enclosing run-check passes to its command through the environment (beside the existing `AKROGON_RUN`), never timing or a non-blocking lock probe. Completion of a different owner, or completion from outside any capture, waits for the lock. The two existing self-close cases in `tests/close-pack.test.ts` (`run-check refuses owner-root holders before running and after completion`, `run-check refuses closed and closing owners at start and right before publish`) change expectation to this refusal; the early refusal for an owner already closed or closing at start stays as today. (B)
7. Authority narrowed: capture paths have names distinct from completed check logs, stay readable through the existing `akrogon log` reader (`src/evidence.ts` `readLog`, `readMember`), and never produce a completed check result, a `check_end` timing or a verify receipt. No reader or listing is added. (B)

Reason: existing tests already complete an owner inside its own run-check, which would deadlock on the new lock; refusing before the wait removes that state. The original item 6 named readers that do not exist.
Rejected: keeping successful self-completion (needs a different lock ownership design); asking the planner to choose (forces a guess).
