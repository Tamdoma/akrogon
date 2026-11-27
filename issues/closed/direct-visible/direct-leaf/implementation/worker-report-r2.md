# R2 worker report

Product commit: `6cf2012297480e11d25d0aadef319169c2f07d6b`, directly on `a7127a22559407dda29958e65b6266df9d5936e1`. No test files changed. A's design-13 `Test-Change:` trailer is in `7c6fe2f3`.

Changed files and reasons:
- P1. `src/next.ts` refuses managed seat allocation for direct leaves and settles failed broadcast delivery at the original turn without resending.
- P2. `src/hc.ts` distinguishes missing sessions or terminals from transient hc errors without changing the existing probe contract.
- P3. `src/reconcile.ts` keeps cleanup on hold while B owes or is still on the broadcast turn, and releases it when B advances or is gone.
- P4. `src/status.ts` shows closed pending broadcasts in the text table and uses area-relative groups in text and JSON.

Tests run:
- T1. `akrogon run-check --name r2-land -- bun test tests/direct-land.test.ts --timeout=120000`: 7 passed. Covers criteria 2–4.
- T2. `akrogon run-check --name r2-seats -- bun test tests/direct-seats.test.ts --timeout=120000`: 4 passed. Covers criterion 1.
- T3. `akrogon run-check --name r2-status -- bun test tests/status.test.ts --timeout=120000`: 36 passed.
- T4. `akrogon run-check --name r2-reconcile -- bun test tests/reconcile.test.ts --timeout=120000`: 46 passed.
- T5. `akrogon run-check --name r2-edge -- bun -e <inline CLI probe>`: passed. Confirmed `started:false` settlement without a resend, row removal after settlement, transient hc failure on a live reviewer socket retaining cleanup, and terminal removal on that socket releasing cleanup. No test files were added or edited.
- T6. `bun run typecheck`, `bunx prettier --check src/hc.ts src/next.ts src/reconcile.ts src/status.ts`, and `git diff --check`: passed.

```text
check r2-land: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r2-land-1795642073587-1879025.log
check r2-seats: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r2-seats-1795642073551-1879029.log
check r2-status: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r2-status-1795642071476-1879033.log
check r2-reconcile: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r2-reconcile-1795642075014-1879036.log
check r2-edge: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r2-edge-1795642049217-1863352.log
```

Known limitations: None known. Full verify was not run, as required by section 5.

Unverified criteria: None.
