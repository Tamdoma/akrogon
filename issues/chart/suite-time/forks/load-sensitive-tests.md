# Load-sensitive tests

## Question

Q1 About 48 tests fail when three full suites run at once on this host (load 57 to 86 on 32 cores), with the old serial command as well as with 2 or 4 workers. For each failing test or group: what limit makes it fail (the 15 s per-test cap, a short budget inside the test, an ordering race, a shared resource), and what change makes it pass under that overload while it keeps proving the same outcome and the suite gets faster, not slower?

Q2 What overload is the bar for S1: three full suites at once at the chosen worker count, or a level taken from how many suites actually overlap in akrogon's recorded runs?

### Carries

- Operator 2026-10-25, verbatim: "3a", answering: "Fix the tests' sensitivity to load first, then re-prove three at once. These ~10 tests fail today with the old command too, so the fix pays off either way. It's a new fork: for each test, find what waits too long or too tightly. Speed stays the goal, and removing tests isn't on the table."
- Operator 2026-10-25 earlier, verbatim: "2 no" to O5, raising explicit per-test timeouts. A plain timeout raise contradicts that answer and must be shown as such if proposed.
- Operator correction 2026-10-25, verbatim: "if we need to improve the background tools like bun etc, or replace it with something better, that's also an option. Look at it from a systemic point of view. I'm not locked into anything except for the overall workflow and how it works today. We can replace stack in the backend if it will improve something and if it doesn't change the actual workflow or make things worse. Communicate this to yourself and the agents."
- Lock: [suite shape](suite-shape.md) Taken, including S1 proof runs and the handoff review: `checks.test` gets `--parallel=4 --no-isolate` (2 on failure) as a step on main; L1 `faster-suite-files` (O1a, O1b) is direct route.
- Off route: akrogon's repeated git calls and the prebuilt fake herdr live in chart issues/chart/git-calls (census first).
- Evidence: slots/s1-runs.txt (every run with wall, CPU, load, counts), slots/s1-logs/*.log, slots/s1-logs/fail-names.txt (failing test names with how many of the 10 overloaded runs each failed in).

## Findings

Merged notes: [../slots/load-tests-merged.md](../slots/load-tests-merged.md). Blind notes ../slots/load-tests-{B,C}.md, rebuttals ../slots/load-tests-rebuttal-{B,C}.md, A runs ../slots/s1-runs.txt.

- Five causes (A,B,C): real systemd slice names shared across suites (tests/leaf-slices.test.ts, src/scope.ts); short budgets in two peer-wait tests; a 700 ms ordering sleep in tests/door-reset.test.ts; separate clock samples in tests/status.test.ts (O4's defect); 38 names past 15 to 30 s caps under CPU pressure in tests/next.test.ts and tests/batch-dispatch.test.ts, plus the named-target 60 s case owned by O1b.
- Cap group: both slots now agree to trial `--max-concurrency=4` in interleaved paired runs, then seed or split only names still failing (B F28, C R1-R3). A, one run each under rising outside load: cap 4 124.5 s green, cap 8 136.9 s 2 fail, cap 20 116.4 s green; serial 192 to 216 s.
- Bar: B keeps three at once hard; C proposes two hard and three reported, since history shows three only briefly (169 s confirmed full-command, 205 s all test entries, over two weeks) and never a sustained same-second triple (B F30-F31, C R4-R5).

## Taken

Operator 2026-10-25, verbatim: "1a | 2a | 3a" (after "elid").

- Q1 1a: trial `--max-concurrency=4` beside `--parallel=4 --no-isolate`, proved with alternating paired runs; rewrite only cap-group tests that still fail. Reason: one setting, both slots agree, measured green at 124.5 s whole suite and 19 to 0 fails on three batch-dispatch copies. Foreclosed: rewriting the 38 heavy tests up front (1b), per-test cap raises (O5 "2 no"), --retry, test.serial, replacing bun or git.
- Q2 2a: the target is three full checks at once all green; when two at once is green and three fails only on per-test caps from CPU stretch, the door returns to the operator instead of failing. Reason: history shows three only briefly and never same-second. Foreclosed: no-exception three (2b), two-only bar (2c).
- Q3 3a: the status clock fix (O4) joins this job and O4 needs no chart. Reason: one small fix the overload proof needs green. Foreclosed: separate O4 chart (3b).
- Fixed as agreed by A, B and C: unique real-systemd names per test process in tests/leaf-slices.test.ts with the sdrun exit asserted before marker polls; per-site peer-wait budgets; door-reset session change on the fake's second agent-list read; one epoch in tests/status.test.ts.


Handoff review 2026-10-25: L1 `faster-suite-files` (direct: O1a, O1b, slice names, peer-wait budgets, door-reset ordering, status epoch) first, then S1. Operator, verbatim: "1a" (after "elid").

## Direct review F32 (2026-10-25)

B (slots/review-B-1.md F32) refused the restated peer-wait wall-time criterion without an operator decision. Options shown: O1 accept the restated outcome, O2 a test-only grace setting in peer-wait.ts as later separate work, O3 shorter proven-open waits with lost coverage. Operator, verbatim: "ok, do o1".
