# Test bar, slot A

Research: operator (CJ Hess post: models write tests that restate code, unit tests waste tokens). Practitioner: Kent C. Dodds, "Write tests" https://kentcdodds.com/blog/write-tests read 2026-09-30, quoting Guillermo Rauch "Write tests. Not too many. Mostly integration." and diminishing returns past ~70% coverage. Kent Beck's "test as little as possible to reach a given level of confidence" (Stack Overflow answer 153565, fetch blocked, model knowledge of the quote). Google review standard (fix-bar findings). Agreement: test the behavior people rely on, at the level that gives confidence per cost. Disagreement: Hess drops unit tests entirely, Dodds keeps some for pure logic. Flip condition: pure parsing/normalizing code is cheapest to test at unit level, so "no unit tests" is wrong there.

Q1. What tests must a leaf write?
- 1a (rec) One test per done-criterion, at the cheapest level that fails when the criterion breaks, plus one fail-first test per bug fixed. No other test is required. Remove "Mandatory negative and edge-case tests" as a blanket rule; a negative or edge test is required only when a criterion names it. Tests that restate code or assert incidental wording are deleted, not added.
- 1b Keep current rules (mandatory negative and edge tests, any reachable failure tested).
- 1c Hess: no unit tests, only end-to-end flow checks. Loses the cheapest test for parsers and pure logic.

Q2. Which test problems may block review?
- 2a (rec) Only: a done-criterion with no test that would catch its failure, a Fix (under fix-bar) repaired without a regression test, or a test that mocks the unit under test so it proves nothing. Everything else about tests, including style of assertions and untested hypothetical failures, is a Nit. Replaces `check-issue:47` "a failure the leaf's code can cause left untested" and narrows `:45` wording tests to Nit.
- 2b Keep `:45,47` as Fix triggers.

Pitfalls: a criterion written vaguely ("handles all inputs") pulls back unlimited tests, so the chart door and plan must write criteria as specific scenarios. Deleting existing tests is out of scope for a leaf unless its criterion says so. Security and data-loss paths still need a test when a criterion or a realistic Fix names them.

Live example: epic-broadcast-once F1 becomes a Nit under 2a (tests pass, no criterion lacks proof).
