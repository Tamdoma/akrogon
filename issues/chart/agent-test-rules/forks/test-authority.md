# Test authority

## Question
Q1. When may a seat change what an existing test expects?
Q2. How is that rule enforced?
Q3. Where does this work live?

### Carries
- Locks: realistic-fix-bar (09-30, test-bar 1a/2a/3a, fix-bar), reviewer-repair (10-02, B repairs in check.repair), test-time-and-temp (10-01). Open: framework-test-scope, akrogon-slow-phases, test-runs.
- Rules today: implement-issue:75 (check.fix may not weaken criteria or failing tests); check-issue:75 (repair adds a failing test first); merge-issue:43 (red checks go to check.fix) and :45 (broken default branch fixed forward). No rule on changing an existing expectation in repair or merge.

## Findings
- Evidence: [slots/count-merged.md](../slots/count-merged.md). Good expectation changes all cited a plan criterion or real data (readiness-contract plan.md:82). Bad pattern: pi merger re-recording goldens until green after rebase. (A,B)
- Research: ImpossibleBench (arXiv 2510.20270, ICLR 2026) read-only tests stop test edits but not special-casing. Kent Beck (Pragmatic Engineer 2025-06-11) agents delete failing tests. SpecStory test-tampering guide: METR o3 hacked 39 of 128 runs despite instructions; instructions alone are weak. Olivier_Lambert (dwlz thread) proposes approval hook. (A,B)
- Edits went through apply_patch, python heredocs (87c27d871) and recorder scripts, so only a git-level check sees all of them. (A)
- K2 (merge re-recording, merge-issue:43 vs :45) is settled by Q1: the merger changing an expectation needs a cited source like any seat. (A)

## Taken
Operator 2026-10-03: "1 - we need to fix the criterion as well. ..." (read as Q1 -> 1a plus a criterion bar, which became forks outcome-criteria and test-worth). Later: "8a | 9a | 2a | 3a |".

- Q1 -> 1a. Any seat (implementer, reviewer, merger) may change an existing assertion, fixture or recorded output only by citing the brief outcome or real source the old expectation contradicts, otherwise it does not change it. Adding new tests stays allowed. Foreclosed: 1b freeze all existing tests behind operator approval.
- Q2 -> 2a. `akrogon phase` diffs pre-existing test and fixture files against the leaf base and refuses the move unless each changed file is named with its cited source. Works for every harness and every write path. Foreclosed: 2b skill text only, 2c per-harness edit hooks.
- Q3 -> 3a. This chart owns the rules. Test selection and speed stay in framework-test-scope and akrogon-slow-phases. Old-test deletion is the 6a rule applied as agents go, not a separate prune job. Foreclosed: 3b one chart for everything.
