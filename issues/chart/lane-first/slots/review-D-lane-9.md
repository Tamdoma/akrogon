# Slot D review of lane-first, round 9

**Verdict `fix`**

Base `814a2387`  
Head `d7190d49bae822519657de87666be9ae9678d397`

## Finding

- **F16 · `src/run-check.ts:450–454`, `src/scope.ts:113–117`, `src/admission.ts:95–113, :346–352`.** Moving release after the stop calls fixes successful teardown. A refused stop still lets the check release its record while the scope is running because `stopRunUnits` discards exit status. In a private real-systemd fixture I refused stops of the check scope and its guard. The first `akrogon stop` returned nonzero and left the verify pass alive. I then let the check's main shell exit with its background worker still active. The pass's own cleanup received the same refusals, released the record, and exited. The queued same-repo check started while the old worker was still writing heartbeats. Keep the draining scope discoverable and preserve the repo hold on cleanup failure until a stop confirms the scope is gone.

## Re-check

- **F15 passes when teardown succeeds.** In the original real draining-worker replay, the check record stayed `live` after the main shell exited. The waiter stayed queued until the worker drained and the stop completed. Both new `green-merge` regressions and the updated `run-permit` assertion also passed.
- **Killed-pair flake.** The test passed six isolated runs each on base and head, including three interleaved runs. It passed three more runs on a disposable head with only `Requisite=` removed, and passed in the seven-file suite. The new `live()` fallback applies only to land records. This fixture runs an ordinary check and the phase refusal tests the capture file lock (`src/run-check.ts:127–150`, `src/phase.ts:153–161`). The wrapper is also SIGKILLed before its finally block can run. I could not reproduce the reported split or establish a role for `Requisite=`.

All 149 focused tests passed across `install`, `green-merge`, `pause-next`, `run-units`, `run-permit`, `command-reference` and `rollback`. Typecheck and `git diff --check` passed. Probes used private units and disposable worktrees. The supplied full Verify log records 1,392 passing tests.
