# Round 2 map A (K5: what is worth testing)

## Sources
- Operator-placed: dwlz (deleted 800k lines of unit tests, "lock in slop", slow agent loop). Richard Wu (Coinbase): E2E with nothing mocked, then integration at data/API boundaries, then golden tests from real data. Replies: mewc keep functional tests you don't want to break and check only on master. AlNeaimy replaced ~45K units with E2E, slower but better. tdubb property tests (Hegel) for invariants. Chirag units are fast and deterministic. Vincent fix the tests instead of mass delete.
- Paul Stack, 2026-09-23, stack72.dev/your-agent-written-tests-arent-real-tests: agent-written tests are specification, not verification, because code and test share one misunderstanding. Keep tests an agent cannot rewrite: property, contract at service boundaries, architecture fitness, black-box at release. Swamp: 2,000 UAT runs found 80 defects that 12,000+ passing units missed.
- deftai/directive #5141 (late Sep 2026), citing OpenAI Codex skill docs, AWS Agentic AI lens, IBM study: units catch near zero schema/DB-contract mismatches. Units stay for dense pure logic (parsers, pricing, crypto) and property tests, only when expected values are independent of the implementation. Policy: test at the outermost boundary, never derive expected values from the implementation, at least one real-boundary test for DB/API/queue features, never rewrite a failing test to go green.
- ColeMurray/background-agents PR #2065, 2026-09-25: when a real-DB integration test checks the same behavior, the integration test owns it and the unit copy is deleted (~700 lines).
- Mutation-based pruning, several repos Sep 2026 (PSAT #236 etc): delete a test when every mutant it catches also fails another test. Before deleting, revert the guarded line and confirm the surviving test goes red.
- David MacIver (Antithesis), 2026-03-24: property tests on AI-written solutions made a substantial fraction fail. Agents can write the property tests.
- Ma et al., arXiv 2606.28430, 2026-06-26: agents with a test oracle hit near-perfect scores while the real library was dead or absent. Agents build to the test.
- Kent C. Dodds trophy (2018, restated 2022): mostly integration, not mostly E2E. Already cited in realistic-fix-bar/test-bar.
- SpecStory test-tampering guide: read-only tests, hidden checks, test-diff review with justification, mutation testing. Instructions alone are a weak control (METR o3 hacked 39 of 128 runs).
- Failed: Wu post not found by search (x.com/0xrwu). Replies unreadable.

## Agreement and disagreement
- Agree: value is in tests whose expected result comes from outside the code (spec, real data, real boundary). Agent-written units that restate code add little and lock it in.
- Disagree on level: Wu and AlNeaimy say E2E first. Dodds, deftai and Chirag say integration first and keep units for pure logic. Nobody credible says delete tests that guard real regressions.

## Our rules today
- realistic-fix-bar locked "cheapest sufficient test" (standing-design.md:10) and rejected "no unit tests" (test-bar.md 1c).
- Independent expected results are required only for writer/checker rules (standing-design.md:13), not in general.
- check-issue:51 bans only mocking the unit under test. No preference for real boundaries over mocks.
- No rule for deleting existing tests.

## What our logs show
- Real catches came from real boundaries or real data: readiness-contract (CLI on real state, plan.md:82), capture-asset-bytes (browser viewport), emdash-health-run (a fake runner reply hid discarded R2 data), emdash-launch (real cache regression), failure-log.
- The blocker that was pure waste was an implementation-detail assertion (TMPDIR prefix).

## Gaps
- G1 Expected results come from the criterion, real output or a recorded real sample, never from running the code under test. This also settles re-recorded goldens (K2).
- G2 Prefer the real boundary over a mock or fake. A fake reply must match a recorded real one.
- G3 Pruning rule: a test is deleted when a stronger-owner test covers the same behavior, proven by reverting the guarded line and seeing the survivor go red.
- G4 Level: cheapest sufficient stays, but "cheapest" should count what the test can catch, not only cost.

## Proposed questions
- Q4 Where do expected values come from? 4a (rec) criterion, real output or recorded real sample, never the code under test. 4b leave as is.
- Q5 Which level is default? 5a (rec) real boundary (CLI/HTTP/browser/DB call) first, units only for pure logic and property tests. 5b E2E only (Wu). 5c keep cheapest sufficient as is.
- Q6 Pruning existing tests? 6a (rec) one-time audit leaf per repo using the stronger-owner and revert-proof rule, plus same rule at any time. 6b mutation-score tooling first. 6c mass delete units (dwlz).
- Pitfalls: E2E-only makes framework slower (browser suites already the slow part). Mutation tooling for Bun/TS is a new dependency. Deleting by label removes real catches.
