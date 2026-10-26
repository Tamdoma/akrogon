# Brief 2: peer-wait budgets and door-reset ordering

## 1. Goal

D2. tests/peer-wait.test.ts finishes faster (O1a) and its two short-budget cases survive three copies at once under load. D3. tests/door-reset.test.ts "a session change during the turn wait is logged and nothing is sent" changes the session at the observed protocol point instead of after a 700 ms sleep.

## 2. Numbered acceptance criteria

1. tests/peer-wait.test.ts wall time alone is lower than base (base about 23.4 s; logs /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct/check-base-x3-peer-wait-*.log). The file is bounded by the long cases that pass budget '11' (about 11.2 s each) and "carried exchange binds the original turn on rerun" (two such waits, 22.3 s).
2. Each shortened budget is chosen per site: above that case's scripted wait/sleep sequence (the fake's sleepMs entries), above subprocess startup, and on the correct side of the IDLE_GRACE_MS / graceMs branch in skills/chart-issues/scripts/peer-wait.ts that decides between outcome budget and failure. Never one shared small constant. Each case still reaches the same outcome, status, signal, session and exchange it asserts today.
3. "budget keeps the last status herdr returned" (budget '0.3', about :899-:915) and "an unproven harness session change keeps waiting with its original exchange" (budget '1', about :582-:600) get budgets that let the required observations land when three copies of the file run at once on a loaded host. Failure seen in overload logs: status null instead of working, and session-A instead of session-B (/home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-logs). Price each from the observation sequence it needs, not a guess.
4. door-reset: the fake changes the session on its second agent-list read after returning the initial identity (B prototype passed in 77 ms with all three asserts, /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/load-tests-B.md G4). Remove the 700 ms sleep at about tests/door-reset.test.ts:211. Keep all three assertions (identity-changed log line, no prompts sent, and the third). Do not use the fake's waitScript session change (B tried it, it did not drive this observation).
5. Three copies at once of tests/peer-wait.test.ts and of tests/door-reset.test.ts all pass.

## 3. Read-first list

- tests/peer-wait.test.ts (setup, s.run, expectOutcome, every '11' budget, the '0.3' and '1' cases, the carried-exchange case).
- skills/chart-issues/scripts/peer-wait.ts (deadline at start about :261, lastStatus :272, IDLE_GRACE_MS and graceMs branch).
- The fake herdr these tests use (find it from setup in tests/peer-wait.test.ts and tests/door-reset.test.ts).
- tests/door-reset.test.ts around :200-:225.
- /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/load-tests-B.md (G3, G4), /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/load-tests-C.md (G3), /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/suite-shape-final-check-C.md (F3 on per-site budgets).
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces

- tests/peer-wait.test.ts: budget arguments only, plus any fake script timing the new budget needs to stay above.
- tests/door-reset.test.ts and, only if required, the test-side fake herdr helper it uses: session change on the second agent-list read.

## 5. Do-not, reasons and exceptions

- No change to skills/chart-issues/scripts/peer-wait.ts or any src/ file; budgets here are inputs the tests pass, the product stays as is.
- No per-test timeout raise (the third argument to test()), no retries, no assertion removed or loosened (operator rule).
- If a shared fake change would alter other tests' behaviour, return a mismatch with evidence instead.
Reasons restated: product unchanged; the operator refused timeout raises; the fake is shared.

## 6. Ordered steps

1. Map every budget site with its scripted sequence and grace branch.
2. Shorten the long ones per site; run the file; confirm each case's outcome unchanged.
3. Set floors for the 0.3 s and 1 s cases; run three copies at once.
4. door-reset change; run the file alone and three copies at once.

Advisory size: 2 to 3 files, under 25 turns.

## 7. Commands

- `bun test --timeout=30000 tests/peer-wait.test.ts`
- `bun test --timeout=30000 tests/door-reset.test.ts`
- Three at once of each as in brief 1.
- If the fake herdr is shared, also run every test file that imports it once.

## 8. Done-when, evidence and report

Paste command results. Keep output only through `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/suite-time/direct --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line. Commit your change on the current branch in /home/ivan/.akrogon/worktrees/akrogon/faster-suite-files. Every commit changing an existing test file ends with a final trailer block line per changed file: `Test-Change: <exact path> <source and reason>` (source: the S1 overload logs /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/s1-logs and the chart fork issues/chart/suite-time/forks/load-sensitive-tests.md). Do not push.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
