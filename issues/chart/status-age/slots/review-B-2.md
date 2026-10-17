# Direct repair review B

Verdict: ready

Base: d0ad061f909aec9fdd8c7e912d8044e2e216e427
Reviewed head: d94e128a10b7a67d27fb463b4ab1d02e0906a2cd
Worktree: /home/ivan/.akrogon/worktrees/akrogon/total-time-column

## Scope and findings

Reviewed only the repair diff: one commit changing tests/timing-report.test.ts. No Fixes or Nits. The prior review's ready verdict for the TIME implementation stands.

The removed assertions imposed a fixed 3–5 day age range on issues filed on fixed dates while production computes their ages against Date.now(). The recorded retry received 6 days on 2026-10-17. Removing these expired bounds follows forks/red-main-date-test.md and preserves the test's distinct purpose: parked and open carriers remain excluded from the backlog, whose count must still be 2.

The existing test `flow report: even counts average the middle two values for merged medians and the backlog` still checks the numeric median against ages calculated from now and the oldest against Math.floor(ageOld). I inspected both tests and the production backlog computation. No runner, filter, fixture, product code or other expectation changed. No documented behavior changed, checked against docs/guide/files.md's flow-report description. No AREA.md changes.

## Verification evidence

Read back all three logs with `akrogon log` under /home/ivan/Work/infra/akrogon/issues/chart/status-age/direct/:

- check-test-1792224181245-2602720.log: original full verify test check, 993 pass and 1 fail at the expired oldest <= 5 assertion.
- check-retry-flow-report-1792224201200-3395267.log: retry of tests/timing-report.test.ts, 13 pass and the same failure, expected <= 5, received 6.
- check-flow-report-fixed-1792224540103-414527.log: current repaired file, 14 pass, 0 fail, 78 assertions. Both the retained carrier-exclusion test and the numeric median/oldest test pass.

The saved green run follows the repair commit. No further test changes or working-tree changes are present, and HEAD equals the supplied reviewed head. Existing focused proof is sufficient for this re-check, so no duplicate run was added. Full verification remains the chart door's landing gate. This review does not claim a green full-check receipt.

## Test-Change trailer

Commit d94e128a10b7a67d27fb463b4ab1d02e0906a2cd carries:

> Test-Change: tests/timing-report.test.ts removed the oldest/median day-range asserts in 'flow report: parked-carried and open-carried issues stay carried while open uncarried issues print'; fixed fixture dates against the real clock made oldest 6d on 2026-10-17 and the bound <= 5 failed on every run. Backlog median and oldest values stay proven by 'flow report: even counts average the middle two values for merged medians and the backlog', which computes ages from now; this test keeps the backlog count 2 that proves parked and open carriers stay out of the backlog. Operator 2026-10-17: "Just delete the old test if it doesn't serve any purpose anymore."

The path matches src/test-files.ts. The trailer identifies the real failing check, explains why the old bound is false, names the retained numeric coverage and cites the operator decision. The deletion is justified.

Last operation: reviewed repair diff and recorded ready verdict. No phase command or commit.
Next: chart door to run full direct-route landing verification.
