# Slot A territory map

## Cause

- Proven (better-than-training, pi session `~/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-akrogon-identical-ignored--/2026-10-19T17-13-07-423Z_01a15527-...jsonl` messages 147-152, read 2026-10-27): the pi seat ran `akrogon verify 2>&1 | tail -15` with no `timeout`; the tool result is `termination: {kind: timeout, seconds: 120}`; the seat reran the same call, timed out again, then set `timeout: 900` and the run passed (1083 tests, 180.89 s).
- The 120 s default is `DEFAULT_TIMEOUT_S` in `~/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts` (`boundShellTimeout`), commit 7ec041d 2026-10-15 07:08 +0200, which kept the default and dropped the 600 s ceiling on the operator's overnight-recs D3 answer. The same decision rewrote implement-issue Shared context step 3 ("tool timeout set above its expected run time"). Every one of the 25 stopped receipts starts after that commit, so the instruction fix was already in place and seats still forgot.
- Journal (2026-10-19, 2026-10-24): each `akrogon-run-<id>.scope` has a `tail --pid=<verify pid> ...; systemctl --user stop <scope>` guard (`src/scope.ts` `startRunGuard`), so the suite dies with the verify process. No orphaned suite keeps burning CPU.
- `src/verify.ts` `runOnce` writes `setup`, `commands`, `end` only in `finally`; the stopped receipts lack `setup` although setup finished, so `finally` never ran.
- Not proven: the checkout merge-scope stops (B found them; see B map F2).

## Forks

- Who owns keeping a verify alive when the waiting tool call gives up. Options: (a) verify runs in its own systemd user unit (the `src/land.ts` transient-service idiom) and outlives the caller; a repeat call on the same tree waits on the in-flight run instead of starting a new one; (b) sharper seat instructions at verify call sites; (c) raise pi's default. Pick (a): it removes the class (any caller death: tool timeout, pane close, TaskStop) and needs no seat to remember anything. (b) was already done on 2026-10-15 and 21 kills followed. (c) reverses an operator answer and widens every forgotten command's hang bound. Cost of (a): one moderate leaf in verify's core path; deliberate cancellation must go through `akrogon stop-run`.
- Cancellation under (a): a stale-head run would run to completion unless stopped. `stop-run` matches runs by the caller's cgroup scope (`src/stop-run.ts`, `callerScope`); a detached unit has its own cgroup, so ownership must be carried into the unit or stop-run cannot reach it.
- Receipt meaning: keep "no `end` = incomplete, never reused" (`completed`, `reuseSource`, `requireGreenReceipt`). With (a) the remaining no-end population is stop-run, slice stop and host loss.

## Pitfalls

- The existing test "a run killed during setup leaves a record with start and no end or removal" (tests/verify.test.ts) encodes today's caller-bound lifetime; the leaf changes that behavior and must say so.
- Join key must match the reuse key (tree, scope, exact command set) or a join could hand back a result for a different command set.
- Output: seats pipe verify through `tail`; the waiter must print the same per-command lines and exit with the same code as an attached run, or seats misread a joined run.
- Host load: a detached run still passes admission (`src/admission.ts` `withAdmission`), so detaching adds no unbounded parallelism.

## Proposed split

One leaf in akrogon. No dependency.
