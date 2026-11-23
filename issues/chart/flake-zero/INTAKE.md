# Intake: flake-zero

## Operator note (2026-11-23, verbatim)

"you need to remove all flaky tests. They must NOT exist in akrogon. We need to make sure the tests we do aren't flaky in the future, either"

## Agent findings

- `akrogon flaky` lists the recorded flaky tests: slots/flaky-list.txt.
- Today's verify runs on lane-first, wake-cost and paid-budget failed on session-reads "a manual next ignores an inherited HC_TERMINAL_ID", session-routing "the blocked notice lands in the session holding the repo space", hc-delivery "a working seat gets no send...", watch-timer "a foreground swap and a transcript flip each end the timer", run-units "a pass keeps the starting caller scope...". The first two failed 3 of 4 on base 814a2387.
- A helper is fixing session-reads/session-routing on branch session-flake (71378d15 "test: a stopped hc core stops its fixtures' leaf slices"); lane-first carries a fix for the run-units one.
- 2026-11-23, session-flake helper (71378d15, in D review): test hc cores never stop their leaf slices; ~32,000 empty akrogon-l*.slice units made `systemd-run --scope` take 1.4-3.6 s, over the 3 s shortStartProof in tests/hc-fixture.ts:185, which explains session-routing, session-reads and hc-delivery reds and probably watch-timer "foreground swap". The helper stopped the empty ones; the count was back to 3,002 within the hour while unfixed verifies run.
- 2026-11-23, wake-cost helper: next.test "busy seats persist…" timed out at 97 s under load on release 1 (3ff3f5b5), passes alone. Not yet in flaky-list.txt; flake-zero must cover it.
