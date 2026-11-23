# Slot D review of lane-first, round 3

**Verdict `fix`**

Base `814a2387`  
Head `542c467afe2d5959378c1f4832013e15cbbb309c`

## Findings

- **F7 · `src/admission.ts:145`, `:225`.** Cancelling a live holder releases the repo line before its scope stops. I held the stop request for one real full check while another full check from the same repo was queued. After `cancelRun` wrote `cancelled`, the waiter started and finished while the holder's scope was still active. Keep a live cancellation in the line until the run has drained. A cancelled waiter can leave immediately.
- **F8 · `src/admission.ts:113`, `src/stop.ts:95`.** Retrying a failed stop can report success while the original scope survives. In the same real-unit probe, I made the first stop of the scope and guard return `Access denied`. The CLI correctly reported failure. The retry used real systemctl, but `liveRuns()` excluded the cancelled record. It printed `stopped` and returned `0` while the scope remained active. Keep cancelled live runs discoverable for stop retries until their units are confirmed stopped.
- **F9 · `src/run-check.ts:438`, `tests/run-units.test.ts:1382`.** The new lock read widens the caller-scope test's existing readiness race under contention. The test issues `stop-run` as soon as the live record appears. In a same-caller probe using the same check launch path, I held the repo line lock after guard registration. Round 2 still registered the scope and `stop-run` returned `0`. Round 3 waited for the lock and `stop-run` returned `1` because the scope was still missing. Caller ownership matched in both. Wait for the scope to become active before exercising ownership in that test.

## Re-check

- **F4 closed for the original launch gaps.** Holding `run-check` before guard registration let `stop` mark the live admission cancelled. The wrapper refused the launch once unblocked. Holding it later, after the cancellation read and before scope registration, let `stop` remove the guard. The real systemd scope refused to start with its `Requisite` missing. Both commands left their execution markers absent.
- **F5 closed.** The regression reproduces an activating verify unit with a refused stop. The CLI preserves `Access denied`, tries the remaining units and returns nonzero. A failed state query keeps the error, and a successful query for an absent unit lets the stop continue.
- **F6 closed for the documented installation.** I ran the published link-cleanup snippet under a temporary home. It removed the installer-created link when the earlier release lacked the unit and kept a foreign link and a link needed by the earlier release.

All 118 tests passed across `install`, `rollback`, `green-merge`, `pause-next`, `run-units` and `command-reference` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The probes used private units and disposable worktrees.
