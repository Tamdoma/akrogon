# Test worth

## Question
Q5. Ban unit tests, or pick the test level by what it catches?
Q6. What lets a seat delete an existing test?
Q7. How does a seat prove a new test can catch its bug?

### Carries
- Operator round 1 answer (INTAKE). realistic-fix-bar test-bar 1c rejected "no unit tests" (09-30).
- standing-design.md:7-13 (no vanity tests, cheapest sufficient proof, independent expected results). implement-issue:57, check-issue:51.

## Findings
- Full exchange: [slots/round2-merged.md](../slots/round2-merged.md), [slots/round2-B.md](../slots/round2-B.md), [slots/round2-A.md](../slots/round2-A.md), rebuttal [slots/round2-rebuttal-B.md](../slots/round2-rebuttal-B.md).
- No measured source supports deleting all unit tests. Wu, dwlz, AlNeaimy report moves to E2E with no before/after numbers. Paul Stack (2026-09-23, 2026-04-21) keeps unit, contract and property tests per PR plus a separate release UAT gate. Beck Composable Tests (2025-11-10), TigerBeetle (2025-02-13), ColeMurray PR #2065 (2026-09-25, delete unit copies a real-DB test owns). (A,B)
- Chromium (2026-02-18): two tests can each look redundant only because the other exists; judge deletions as a batch. (B)
- Echlin (2026-08-11): restoring known bugs separated strong tests from weak; counts and green runs did not. Antithesis mutation study (2026-09-25) found real bugs but cost ~24h. (B)
- Our real catches ran the real CLI or browser (failure-log, readiness-contract, capture-asset-bytes). Faking an outside failure through the real CLI is fine (failure-log). (A,B)

## Taken
Operator 2026-10-03: "4 - ... | 5a | 6a | 7a |"
- Q5 -> 5a. Default to the smallest test at the real boundary (CLI, HTTP, browser, DB). Unit or property tests only for logic that matters where they catch bugs more cheaply. E2E only where smaller tests miss browser, runtime or wiring bugs. Foreclosed: 5b ban unit tests.
- Q6 -> 6a. Delete false or outdated expectations with the reason. Delete a duplicate only after naming the test that still catches the same bug. Judge a batch of deletions as a batch. Keep every test guarding a real past regression. Applies whenever a seat touches tests. Foreclosed: 6b one-time prune leaf per repo, 6c delete by label or signal.
- Q7 -> 7a. Fail-before/pass-after for bug fixes. For new behavior, one deliberate break shown red. No mutation score. Foreclosed: 7b mutation score per leaf, 7c green test plus written scenario.
