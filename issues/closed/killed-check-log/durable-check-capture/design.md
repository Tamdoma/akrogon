# Design: durable-check-capture

## Binding decisions, verbatim

### Durable check capture (`issues/chart/killed-check-log/forks/durable-capture.md`, `## Taken`)

2026-10-27, A's autopilot pick (not operator words): `1a 2a`.

Reason: removes the loss at its source with the fewest moving parts and no clock; matches simplicity and removing over adding.

1. Capture: the command's stdout and stderr go to run-unique capture files inside the holder from launch, for both held and nested admission. run-check prints the capture path before waiting, without any exit claim. The shared shell helper's behavior for other callers is unchanged.
2. Publication: on command exit with a publishable owner, the completed combined log is produced as today (same name pattern, same result line, same `Result` stdout/stderr replay and final-newline handling), then the partial capture files are removed. Partial removal is conditional on successful publication; a closed, closing or vanished owner keeps today's refusal and keeps the captured output with `refusal.json`, never recreating the owner.
3. Exclusion: a kernel-released file lock whose lifetime equals the lifetime of every capture writer and of the wrapper's publication, including partial removal. It is taken before the capture files are created and the owner fence (`ownerRefusal`) is rechecked under it. Pack and owner movement take it exclusively before snapshot.
4. Authority: a partial capture never counts as a completed check or a verify receipt.
5. Proofs: SIGKILL a real wrapper after distinct stdout and stderr markers, run reconcile, read both markers from the holder; pack started during a live capture cannot finish before writers and publication end, then both streams read from `evidence.tar.zst` through `akrogon log`; normal exit leaves exactly the completed log; closed-owner refusal still keeps output.

### Correction (same fork, `## Taken (correction, 2026-10-27)`), replaces item 4 with item 7

6. Self-close: owner completion (`src/phase.ts` `completeOwner`) or pack (`src/pack-command.ts` `packOne`, `src/pack.ts` `packFolder`) started by a process running inside a run-check capture whose holder belongs to that same owner refuses loudly before waiting for the exclusive lock, naming the enclosing run, and the emitted evidence stays. Detection uses state the enclosing run-check passes to its command through the environment (beside the existing `AKROGON_RUN`), never timing or a non-blocking lock probe. Completion of a different owner, or completion from outside any capture, waits for the lock. The two existing self-close cases in `tests/close-pack.test.ts` (`run-check refuses owner-root holders before running and after completion`, `run-check refuses closed and closing owners at start and right before publish`) change expectation to this refusal; the early refusal for an owner already closed or closing at start stays as today. (B)
7. Authority narrowed: capture paths have names distinct from completed check logs, stay readable through the existing `akrogon log` reader (`src/evidence.ts` `readLog`, `readMember`), and never produce a completed check result, a `check_end` timing or a verify receipt. No reader or listing is added. (B)

Rejected: 1b reconcile rescue (stored target metadata, waits for the next reconcile, second loss boundary); 1c copy in `finally` or a signal handler (SIGKILL runs neither); 1d tee or journal streaming (no durability); 2b pack refusal on live `.owner` records (check-then-act race, fails completion); 2c staging outside the owner (new store and retention).

### Locks carried, not changed by this leaf

- Operator, 2026-09-18 (`issues/chart/seat-stall-detection/forks/no-akrogon-detector.md`): no clocks, polls or watchdogs. This leaf adds no timer, poll, heartbeat or elapsed-time trigger; the lock is OS-released, not time-based.
- Operator correction, 2026-09-18 (`issues/chart/stall-notifier-removal/forks/delete-notifier.md`): `observeBusy`, `STALL_MS`, `busy_since`, `busy_notified` stay unchanged. Excluded from this leaf.

### Excluded

- Busy alert during one long tool call, checks that survive their caller, and the implement-issue timeout wording are off route (`issues/chart/killed-check-log/CHART.md`, `## Off route`).

## Standing design

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf:

- Each done-criterion is proven by the cheapest test at the real boundary: a real `akrogon run-check` process and a real SIGKILL to its wrapper, real reconcile, real pack and `akrogon log`, using the repo's existing test runner and temp-repo helpers (`tests/run-units.test.ts`, run-check, reconcile and pack tests show the patterns). No new runner or fixture factory.
- The SIGKILL case waits on a positive signal that the markers were written (for example the command writes a ready file after flushing), never a fixed sleep.
- The pack case proves ordering with a real live writer and a positive release (the command exits on a file the test writes), not timing.
- A deliberate break turns each new test red: e.g. restoring copy-after-exit fails criterion 1, dropping the exclusive lock in pack fails criterion 5.
- No vanity tests, no hand-copied lists of other files' entries; no live model or outside call.

## Leaf architecture

Owned surfaces:

- `src/run-check.ts` `checkedRun`, `spawnLogged`, `runCheck` (capture location, early path line, publication, refusal path).
- A run-check-only capture spawn path. `src/shell.ts` `spawnFiles`, `spawnCaptured` and `finishCaptured` keep their behavior for every other caller; a new option or a sibling function is allowed when existing callers see no change.
- `src/pack.ts` `packFolder` and its owner-level callers (`src/pack-command.ts` `packOne`, `src/phase.ts` `completeOwner` owner movement) take the lock exclusively before snapshot or move, and refuse first when the environment shows an enclosing run-check capture of the same owner.
- The two self-close cases in `tests/close-pack.test.ts` named in binding item 6, whose expectations change to the refusal.

States the change alters and their consumers:

- Holder contents during a run: capture files now exist in `implementation/` (or the `--holder` dir) while the command runs and after a kill. Consumers: `src/pack.ts` `packFolder` (packs regular `.log` files, refuses symlinks) and `src/evidence.ts` `locate`/`readLog`/`readMember` (read an explicit path). No listing or classification reader exists and none is added. Capture files end in `.log` so pack keeps them as evidence. Open for the plan: the exact capture name pattern, distinct from `check-<name>-<ms>-<pid>.log`.
- Run root: `src/reconcile.ts` dead-owner sweep keeps deleting the run root; it no longer holds the only copy of output. No change expected. Open for the plan: confirm reconcile never touches holder capture files.
- Refusal path: today output stays in `<runRoot>/out.log` with `refusal.json` and reconcile keeps that run root. Open for the plan: whether refusal keeps captures where they are or moves them into the kept run root, so long as the closed owner is never written to or recreated.
- verify: `src/verify.ts` `runOnce` calls `checkedRun` for setup, full checks and concurrent checks and builds receipts from its completed result; a killed run returns no result, so receipts need no change. The `check_end` timing (`appendTiming` in `checkedRun`) is written only after a completed result.

Lock:

- Bun and Node expose no `flock` API. util-linux `flock(1)` is on this host (the repo's own `checks` commands call it). Open for the plan: the carrier, either the lock taken on an open file description every capture writer inherits (so the kernel releases it only when the last writer closes it) or a lock-file descriptor inherited by the command; whichever is chosen must also be held across publication and partial removal by the wrapper.
- Self-close is decided by binding item 6: refuse before waiting, detected from the environment the enclosing run-check passes down. Open for the plan: the variable name and how a nested run-check, worker or verify pass inherits it, so every pack and move entry point listed above sees it.
- Both admission kinds: held admission runs the command in a systemd scope stopped by `src/scope.ts` `startRunGuard`; nested admission runs it directly. The lock and capture must behave the same in both.

Dependencies: none. Sources: Tamdoma/akrogon#120.
