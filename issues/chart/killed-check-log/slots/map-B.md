# Slot B independent territory map

Date: 2026-10-27. Read only the assigned brief and `INTAKE.md` → `Source: Tamdoma/akrogon#120` inside this chart. That intake contains only the title and source identity, so I retrieved the original issue body. No implementation or reproduction was performed.

## Findings and observable outcomes

- **F1: Evidence disappears at two boundaries.** `src/shell.ts` → `spawnFiles` writes live stdout/stderr into `<runRoot>/akrogon-io-*/{out,err}`. `finishCaptured` reads and removes those files only after exit. `src/run-check.ts` → `spawnLogged` then creates `out.log`, and `checkedRun` finally copies it into the holder. Thus the report's description of the child writing live output to `out.log` is inaccurate. The kept log and tool output both depend on wrapper survival.
- **F2: The actual timeout bypasses finalization.** Installed pi 1.4.0 → `createLocalShellOperations` starts a detached shell and calls `killProcessTree` at timeout. On this Linux build that sends `SIGKILL` to the process group, with a PID fallback. A killed wrapper cannot execute its JavaScript `finally`. Its capture files may survive temporarily, but `src/reconcile.ts` → `reconcile` deletes run roots with dead owners. Adding another final-copy handler does not solve this.
- **F3: Process cleanup already has an owner.** `src/scope.ts` → `startRunGuard` notices wrapper death, removes its admission record and stops the run scope. Existing `tests/run-units.test.ts` cases cover wrapper SIGTERM/SIGKILL and descendant cleanup, not retention of emitted bytes. Do not add a second child reaper.
- **F4: The absent alert matches the locked design.** `observeBusy` evaluates elapsed busy time only when `next` runs. The plugin triggers startup and pane/tab events, with no stillness event. A long command is not necessarily stalled. No event means no new observation, irrespective of the recorded duration.
- **F5: The release mismatch is resolved for the named surfaces.** This checkout HEAD is `63c20f9859578c179a30dac9c6ab0ac648a6f62b`, the reported release. Installed `run-check.ts`, `shell.ts`, `scope.ts` and `next.ts` match the checkout byte for byte. The incident's exact process tree and leftover captures remain unverified.

**D1: Emit one leaf for durable interrupted-check evidence.** Its observable result is that stdout and stderr already emitted before wrapper death remain discoverable and readable after run cleanup and owner packing. Successful/failed normal commands retain their current exit and completed-log behavior. An interrupted log must never count as a successful check or completed verify receipt.

No dependency orders log retention and stall notification. The latter has no authorized leaf under the locks. Extending arbitrary commands to survive their callers is a separate optional outcome, not a prerequisite for retention.

## Material forks

### D2: Where evidence becomes durable

- **O1, pick: Capture to retained regular files before launching the command.** Keep separate stdout/stderr captures with run-unique names and `.log` suffixes, expose their paths before waiting, and preserve the existing completed combined-log result on normal exit. Remove redundant captures only after successful final publication. This removes dependency on a dying wrapper doing recovery. It introduces live evidence files, so writer/pack coordination belongs in the same leaf. Avoid changing the shared shell helper's behavior for unrelated callers.
- **O2: Recover dead-run captures during reconciliation.** Reuses existing cleanup entry points and leaves normal publication alone. Requires recording destination and identity before launch, reading evidence before deletion, checking owner movement, and handling partially finalized captures. Recovery waits for another event and can become another evidence-loss boundary. More states than O1.
- **O3: Copy from a signal handler or `finally`.** Small apparent diff, but SIGKILL still loses the kept log. Reject.
- **O4: Stream through pipes/tee or rely on the system journal.** Can improve live viewing, but introduces relay lifetime/backpressure or a second evidence store, retention policy and reader. Streaming alone does not make evidence durable. Reject for this report.

### D3: Durable capture versus owner closure

- **O5, pick: Serialize owner packing/movement against active capture writers.** Use a zero-clock lifetime mechanism, such as a shared writer lock and exclusive pack lock, with lock ownership lasting until every file writer is stopped. Concurrent checks may share writer access. Preserve refusal for already closing/closed owners and avoid recreating vanished open owners. This is necessary work if O1 is selected, not an independent cleanup leaf. Incorrect lock ordering could deadlock completion, so prove it with the real owner lifecycle.
- **O6: Put durable staging outside the owner and import only finalized evidence.** Avoids exposing growing files to pack, but adds a durable store, destination metadata, recovery and retention responsibilities. Consider only if the owner-lock proof shows O5 cannot fit the existing lifecycle cleanly.
- **O7: Assume `.closing` already protects live files.** Reject. `ownerRefusal` checks before/after the command, while `packFolder` snapshots and unlinks regular `.log` files. Neither check prevents an already-open descriptor from writing after that snapshot. A hard link or symlink alone does not solve this. Symlinks are explicitly refused by pack.

### D4: What a seat timeout means

- **O8, pick: Preserve current cancellation semantics and retain evidence.** No new background runner, joining protocol or repeated automatic run. The existing process guard remains responsible for stopping descendants. This does not save computation after cancellation, but it stops evidence-free retries.
- **O9: Make every `run-check` survive the seat.** Changes admission ownership, stop-run behavior, worktree lifetime and joining semantics. `src/verify.ts` already has a service-owned pass for configured verification. Its existence is not evidence that every arbitrary command needs that architecture. Separate operator decision if requested.
- **O10: Increase every tool timeout or revise foreground instructions alone.** Cannot guarantee completion for unknown durations and does not fix operator cancellation or SIGKILL. `implement-issue` → `Shared context` already requires the timeout to exceed expected duration. Do not change that rule as a substitute for durable capture.

### D5: Busy notification

- **O11, pick: Keep the current conditional notifier unchanged.** State explicitly that pure silence remains invisible.
- **O12: Add a timer, heartbeat, repeated next call or watchdog.** Foreclosed, even if renamed as recovery or progress reporting.
- **O13: Announce an actual known failure event at its producer.** Potentially valid without clocks: process exit, EOF, cancellation or an already-generated tool-timeout result can carry failure information. This detects a concrete event, not silence. No suitable new Herdr hook was verified here, so do not promise one or add a harness integration leaf without evidence and scope approval.

## Questions for the chart door

- **Q1:** Is the desired result evidence retention, command survival, or both? The report supplies no expected behavior. D1/D4 choose retention without changing cancellation.
- **Q2:** What exact holder argument and log search path did the incident use? `leafTarget` honors `--holder` literally. A leaf-directory holder does not automatically become `implementation/`. Verify before making the missing-file assertion location-specific.
- **Q3:** Must interrupted evidence remain available through `akrogon log` after closure and packing? Pick yes. Otherwise a new retention location merely postpones loss and violates the existing evidence workflow.
- **Q4:** How should a seat distinguish partial captures from a completed check? Pick run-unique explicit partial paths and the existing completed result/receipt as authority. File existence, test progress and an empty log are not outcomes.
- **Q5:** Is a new known-failure notification actually required? Keep it separate from the impossible promise of a clock-free silence alert.

## Lifetime pitfalls and proof boundaries

- **R1: SIGKILL during output or finalization.** Remove the post-exit-only retention boundary. A planned reproduction should emit distinguishable stdout/stderr markers, acknowledge that they were written, kill the wrapper, exercise real cleanup and read them back. Do not rerun a 40-minute suite to prove this mechanism.
- **R2: Pack snapshots growing files or unlinks them under live writers.** O5 must exclude that state. Prove packing/owner movement concurrent with a live check, then interruption and read-back from `evidence.tar.zst`. Existing `.closing` refusal cases remain relevant and must keep passing.
- **R3: Broad shell-helper changes break stream/exit behavior.** Preserve `Result`, stdout/stderr replay, final-newline handling and `checkedRun`'s completed return. `verify.ts` → `runOnce` calls it for setup, full checks and concurrent remaining checks. An interrupted capture must not create a green/reusable receipt.
- **R4: Cleanup deletes evidence or runs accumulate forever.** Keep scratch and retained evidence lifetimes separate. Reuse owner packing and archive readers rather than adding TTLs or blanket keep-all rules. Preserve the special retained `refusal.json` path and closed-owner refusal behavior.
- **R5: Same-name concurrent/nested checks overwrite each other.** Use a run identity, not just the check label. Cover nested admission as well as held admission because only held runs create their own guard/scope.
- **R6: Misleading diagnosis leads to repeat work.** An early path makes partial evidence discoverable even when run-check is piped to `tail`. Do not emit the completed `check <name>: <exit> <path>` claim before an actual exit.

These are boundary proofs for the one retention leaf, not new test frameworks or independent features. Existing run-unit, run-check, reconcile and pack tests supply the relevant runners. This map does not claim those proofs passed.

## Locks and zero-clock mechanisms

The 2026-09-18 `Taken` decisions prohibit new elapsed-time detection and accept permanent invisibility of pure silence. The later correction explicitly preserves `observeBusy`, `STALL_MS`, `busy_since` and `busy_notified`. That correction retains conditional observation, not permission to add a trigger.

Durable file-backed capture requires no clock. OS-released lifetime locks and positive child-exit/EOF events can coordinate ownership without periodic observation. They cannot detect a living, silent, hung process.

The current `startRunGuard` uses `tail --pid=... -f /dev/null`, which is a polling mechanism, and the existing verify waiter uses `Bun.sleep(200)`. Neither is a zero-clock design to copy. Their presence does not authorize more polling. Replacing those existing mechanisms is outside this report's retention scope.

## Evidence

All local paths below are rooted at `/home/ivan/Work/infra/akrogon` unless absolute.

- **E1 | operator | 2026-09-18:** `issues/chart/seat-stall-detection/forks/no-akrogon-detector.md` → `Taken`, and `forks/stall-detection.md` → `Taken`. Prohibit clocks/polls/watchdogs and accept invisible silence.
- **E2 | operator | 2026-09-18:** `issues/chart/stall-notifier-removal/forks/delete-notifier.md` → `Taken (correction, 2026-09-18)`. Preserve the four named notifier surfaces. Its recorded historical fire is an observation supporting conditional usefulness, not a universal detection guarantee.
- **E3 | better-than-training | observed 2026-10-27:** [Tamdoma/akrogon#120](https://github.com/Tamdoma/akrogon/issues/120), created/updated 2026-10-27. Unverified incident report. Supplies the timeout, missing-log observation and absent expected behavior. It does not prove wrapper finalization or absence of raw captures.
- **E4 | better-than-training | inspected 2026-10-27:** `src/run-check.ts` → `runCheck`, `leafTarget`, `spawnLogged`, `checkedRun`, `ownerRefusal`; `src/shell.ts` → `spawnFiles`, `finishCaptured`, `spawnCaptured`. Primary evidence for delayed publication, actual capture paths and explicit-holder behavior.
- **E5 | better-than-training | inspected 2026-10-27:** `/home/ivan/.local/share/mise/installs/pi/1.4.0/pi/package.json` identifies 1.4.0. Embedded code in `/home/ivan/.local/share/mise/installs/pi/1.4.0/pi/pi` → `createLocalShellOperations` and `killProcessTree` establishes detached process groups and SIGKILL on timeout/abort. Inspected installed code, not inferred from another pi version.
- **E6 | better-than-training | inspected 2026-10-27:** `src/scope.ts` → `startRunGuard`, `runUnitArgv`; `src/reconcile.ts` → `ownerDead`, `ownerKeeps`, `reconcile`; `tests/run-units.test.ts` → wrapper SIGTERM/SIGKILL cases. Evidence for process cleanup and dead-owner capture deletion. Existing tests were read, not executed.
- **E7 | better-than-training | inspected 2026-10-27:** `src/next.ts` → `observeBusy`; `plugin/herdr-plugin.toml` → startup/events; `plugin/next.sh`. Establish event-triggered observation.
- **E8 | better-than-training | inspected 2026-10-27:** `src/pack.ts` → `packFolder`; `src/pack-command.ts` → `packOne`; `src/phase.ts` → `completeOwner`; `src/evidence.ts` → `locate`, `readLog`, `readMember`. Establish archive compatibility, symlink refusal, snapshot/unlink behavior and owner movement.
- **E9 | better-than-training | inspected 2026-10-27:** `src/verify.ts` → `runOnce`, `launchPass`, `waitPass`; `skills/implement-issue/SKILL.md` → `Shared context`. Establish shared checkedRun callers, service-owned verify lifetime and current foreground/timeout instructions.
- **E10 | better-than-training | measured 2026-10-27:** `git rev-parse HEAD` plus byte comparisons against `/home/ivan/.akrogon/releases/63c20f9859578c179a30dac9c6ab0ac648a6f62b/src/{run-check,shell,scope,next}.ts`. All four match.
- **E11 | model-knowledge | assessment 2026-10-27:** D1–D5 and R1–R6 are this consultant's engineering judgments from E1–E10. No independent practitioner interview or source was collected, and these picks are not operator approval.
- **E12 | model-knowledge | assessment 2026-10-27:** SIGKILL cannot run user-space finalization, open file descriptors can outlive pathname changes, and no event-driven observer can discover pure silence without an observation trigger. The concrete timeout and file-lifetime conclusions are additionally grounded in E4–E8.

**Recommendation: one leaf that makes emitted check output durable before exit, including safe owner packing. Keep cancellation and the locked notifier unchanged.**
