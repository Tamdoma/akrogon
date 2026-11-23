# Slot D review brief: land-own-reds (direct route, role of check-issue slot B)

Same role as k1-compile-cache. The door is slot A at hc terminal t126.

Review the akrogon branch in worktree /home/ivan/.akrogon/worktrees/akrogon/land-own-reds, range 9c6ae0db..HEAD (4 commits). The branch is not yet rebased on current main. A rebases after your verdict. Destination: /home/ivan/Work/infra/akrogon/issues/chart/land-own-reds/CHART.md. Design: forks/design.md (Q1-Q3, Correction, Q4). Background: INTAKE.md (#151 and Agent findings F-temp).

Judge at the check-issue Fix bar: a concrete defect with a reproducible scenario and consequence. Check in particular:
- Q1 (8b97c7d8): a host pass stops only slices derived from its own leaves. Nothing else still lists akrogon-l*.slice or resets akrogon-run-* host-wide.
- Q2/Q3 (73a26624 schema-only, 0854e6af writer): commit 2 alone parses old and new receipts and configs, so it can ship first as a rollback-safe release. The rerun runs only the first run's failing names, at most 3, once. Final failures follow the design's Correction. flaky counts only saved names. slowEligible and resolvedOnMain treat rerun rows as the design says.
- Q4 (6570679b): the host step deletes no unknown entry under the leaf temp root or the worktree store, and the land unit forwards both temp root overrides.
- Known gaps A wants judged as Fix or not: F1 `knownRedReceipt` (src/verify.ts ~259) reads names only from the log, so does it see a rerun's names? F2 foreign or unreadable leaves' slices are now skipped silently with no kept entry. F3 the rerun reuses the check name, so it emits a second check_start and passes through the full admission queue. F4 docs/reference/config.md names the rerun key in commit 2, before the behavior exists.
- Each new or changed test fails without its src change and passes with it. No assertion is loosened beyond what the Test-Change trailers state.
Do not run the full suite. A runs akrogon verify. Run focused tests with bun test on the touched files. The host is under heavy outside load, so a 15 s timeout alone is not a finding.

Write your verdict (`ready` or `fix` with findings F1.. each with file:line, scenario, consequence) to /home/ivan/Work/infra/akrogon/issues/chart/land-own-reds/slots/review-D-1.md, then run: hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/land-own-reds/slots/review-D-1.md"
