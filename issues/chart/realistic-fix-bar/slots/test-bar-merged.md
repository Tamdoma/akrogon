# Test bar

## Question
Q1. Which new tests must a leaf write?

Q2. When can review block because a test is missing or badly shaped?

Q3. Must every leaf touching a user-visible flow add end-to-end evidence?

### Carries
- Operator: "How do we enforce basic test only, or only the tests that are really important, but really, really important." and "I feel like a bunch of time is going on tests that aren't really that useful, so the lifecycle takes longer time than it needs to." Live example: "See? This is the BS I'm talking about." (epic-broadcast-once review-B F1).
- Related: [fix-bar](fix-bar.md) (realistic input source, failed checks and named criteria still block).

## Findings
Research: operator · CJ Hess post (INTAKE) · models add tests that restate code. Practitioner, read 2026-09-30: Kent Beck https://stackoverflow.com/a/153565 (test as little as possible for a given confidence, focus on mistakes you actually make), Kent C. Dodds https://kentcdodds.com/blog/write-tests ("Write tests. Not too many. Mostly integration.", diminishing returns past ~70% coverage), Google Testing on the Toilet https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html (test observable behavior, not implementation). They agree on confidence per cost, not counts. Pure logic is cheapest to test in isolation, so Hess's "no unit tests" does not hold for parsers. (A,B)

Code: `skills/chart-issues/assets/standing-design.md:8-13`, `skills/implement-issue/SKILL.md:42`, `skills/implement-issue/brief-template.md:13,31,43-47`, `skills/plan-issue/SKILL.md:57-59`, `skills/check-issue/SKILL.md:45,47`. `:47` makes any untested failure the code can cause a Fix. (A,B)

Q1 options:
- 1a The smallest set that proves every done-criterion (one test may prove several) plus a before/after proof for each real bug fixed. Extra negative or edge cases only when a concrete consequence on a realistic path warrants them: broken required outcome, security boundary, data loss, unsafe mutation. Extend existing tests before adding files. Drop the blanket "mandatory negative and edge-case tests" line. (A,B)
- 1b Keep mandatory negative and edge tests and a regression fixture per finding. (A,B reject)
- 1c No unit tests, end-to-end only. Loses the cheapest check for pure logic. (A,B reject)

Q2 options:
- 2a Block only when a done-criterion has no test that would catch its failure, or when the reviewer names a realistic source, a real consequence and the gap in existing proof (the fix-bar rule applied to tests), or when a test mocks the unit under test and so proves nothing. Assertion style, wording coupling that does not fail today, extra cases and coverage gaps are Nits. Replaces `check-issue:47` and makes `:45` wording tests a Nit unless they hide a real failure. (A,B on the rule; A adds the explicit wording-test downgrade)
- 2b Keep `:45,47` as Fix triggers. (A,B reject)

Q3 options (raised by B):
- 3a Use the cheapest level that proves the changed property. End-to-end with an artifact only when browser/runtime behavior or cross-component wiring cannot be shown smaller, or a criterion asks for it. Reuse unchanged-stage evidence with its revision. (B)
- 3b Keep one end-to-end artifact for every leaf touching a user-visible flow. (current `standing-design.md:9`)

Live example: epic-broadcast-once F1 (tests pass, whole-stdout asserts would break on a future rename) is a Nit under 2a. (A)

Pitfalls: vague criteria ("handles all inputs") pull unlimited tests back in, so criteria must name scenarios. "Important" means a named consequence, not a label. Deleting existing tests, full-suite scheduling and consumer check config are separate work. (A,B)

## Taken
