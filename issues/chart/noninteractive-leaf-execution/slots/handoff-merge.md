# Handoff draft merge 2026-09-19

B's implementer review (handoff-review-B.md) against A's drafts. Every finding accepted and merged into the drafts; tags mark origin.

- F1 (B) src/akrogon.ts strict parsing added to failed-with-cause ownership; signatures for phaseCommand, transition, commitMove named.
- F2 (B) the stop path in transition bypasses the rebuttal destination check, the verdict requirement, the two-seat barrier and the review override; validates only the declaring seat; negative tests listed.
- F3 (B) review repair exhaustion gets cause `attempts`, reason `fix rounds exhausted`; legacy failed without `failure` prints `failed` alone; (A) recovery removes `failure`.
- F4 (B) activeCount excludes failed in the unreadable-inventory branch too.
- F5 (B) detection moved to one function called at every pane observation point before observeBusy; repeat-event test added.
- F6 (B) dispatchLeaf skips observation for failed like merged; assigned to failed-with-cause.
- F7 (B) herdr schemas are the inner shapes; shell.ts unwraps result.
- F8 (B) failed_notified leaves the runtime; readState strips it from legacy records; legacy-state test.
- F9 (B) delivery persisted before rename, `error` is a recorded outcome, rename failure on recovery is a warning; (A, holding 7a) the command still exits 0 because the operator chose that failed stays visible regardless of delivery.
- F10 (B) broadcast-issue and standalone implement carry the rule without the stop command.
- F11 (B) the skill stop command passes `--slot` from the dispatch prompt; failed-with-cause requires it exactly for two-seat phases.
- Final check (B, slots/final-shape-B.md): F1 no-notice assertion moved to failure-attention; F2 transport failure exits non-zero after state is persisted; shape confirmed simplest.
