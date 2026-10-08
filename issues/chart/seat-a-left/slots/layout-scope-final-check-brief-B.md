# Final-shape check, slot B: seat-a-left / Layout scope
Operator answered `1a | 2a |` on 2026-10-08. Proposed record to add under Taken in /home/ivan/Work/infra/akrogon/issues/chart/seat-a-left/forks/layout-scope.md:
- 1a: local repair only: when recorded A is absent and recorded B survives, split B right, save the new A pane ID at once, then `herdr pane swap --source-pane <B> --target-pane <new A>` (no retry helper). A failed or lost-ack swap is reported as an error and leaves A recorded on the right; no close, no duplicate, no reversal. Other allocation paths unchanged. Fake herdr models parent-relative left/right geometry and swap; tests assert positions.
- 2a: before the swap read the focused tab; after the swap, also on failure, `herdr tab focus <prev>` when it differs from the leaf tab. Cost carried into the contract: an operator switching tabs during the ~0.1 s window is sent back once.
Evidence: /home/ivan/Work/infra/akrogon/issues/chart/seat-a-left/forks/layout-scope-probe.md (step 6 covers source=B).
Return disagreements only, or "none", to exactly: /home/ivan/Work/infra/akrogon/issues/chart/seat-a-left/slots/layout-scope-final-check-B.md
