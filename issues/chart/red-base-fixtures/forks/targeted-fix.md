# Targeted test-only fix

## Question
Q1. Which side is stale, the code or the tests, for each of the two failures?

### Carries
Operator 2026-10-10: make the new test targeted for only that so it can continue moving fast.

## Findings
- peer-wait: code is the new intended behavior (agent kind and session read before waiting, so Claude peers are judged by transcript). The fake herdr fixture is stale: it needs an `agent list` handler returning each pane's `agent` and `agent_session`. The test pane has `agent: 'fake'`, so the Claude transcript path is not entered.
- dependents-first: code is the new intended behavior, documented in docs/guide/next.md ("waiting normally ... does not change the exit code"). The test's `expect(result.code).toBe(1)` is stale; the same test's prompt-order assertions remain valid.
- Fix touches tests/ only. No src/ or skills/ change.
- Targeted proof: run only the two failing files while iterating; the merge gate still runs the full suite.

## Taken
Both are stale tests, fixed in tests/ only, proven by running only the two failing files. Operator 2026-10-10: "make the new test targeted for only that so it can continue moving fast." Foreclosed: reverting f3199df's src changes, widening the leaf into a full-suite cleanup.
