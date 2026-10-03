# Round 2 intake (blind; do not read map-A*, round2-A*)

## Operator answer to round 1 Q1 (verbatim)
1 - we need to fix the criterion as well. We need to find from great practitioners what's actually worth testing. Some people on X are starting to say they only do e2e and integration tests now and are completely removing unit tests. Not sure if that is correct, but they are saying it: [Image #3] [Image #4], and here: [Image #5]. Find out what the professionals are doing to eliminate tests that are bloated and not necessary, and even new for if needed

## Operator-placed images (A transcription of readable parts; files beside this one)
- img-dwlz.png: the dwlz thread (x.com/dwlz/status/2103463289875280041). "We deleted 800k lines of unit tests from the ... monorepo earlier this week. Three hypotheses: 1. Unit tests 'lock in' slop code by making it hard to change or remove. 2. Unit tests slow down the cycle by making your agent do more work locally and by increasing CI time. ..."
- img-dwlz-replies.png: replies. mewc: "Mostly true. Keep some functional tests you don't want to break. The ci cost bloat from agents pushing all the time is nuts. I'm reverting a lot to only check on master." Paul Stack: "I wrote about this last week - stack72.dev/your-agent-wri..." (card "Your Agent-Written Tests Aren't Real Tests"). Ahmed AlNeaimy: ~45K unit tests all replaced with E2E, slower but much better, custom CI. tdubb: "replace your unit tests with hegel tests and protect your important invariants from broken guarantees". Chirag: "Aren't unit tests deterministic? They'll run in seconds. Agree on locking in code." Vincent: "deleting 800k lines sounds drastic. isn't a better approach to refactor or improve the tests instead?" Vinoth Chandar: false sense of security from unit tests.
- img-wu.png: Richard Wu (Coinbase onchain trading): "IMO the only tests you should have in the age of coding agents are, in order of priority: 1. Full E2E tests. Nothing mocked out at all. Can even be something that runs in prod on test accounts via Playwright or equivalent. 2. Integration tests. Agents make more mistakes as things bleed between data/API boundaries where schemas can drift. 3. Golden tests. This helps ground the code with real examples of data, and can be used as regressions against edge cases." Replies unreadable at this resolution; find the post if you can.

## Current Question (new fork K5, reshapes K1 and K4)
What is worth testing at all, i.e. the criterion bar that decides which tests a plan may demand, an implementer may write and a reviewer may require, and which existing tests get deleted.
Research what strong practitioners and teams (2025-2026 preferred; named people, primary sources) actually do to:
1. decide what is worth testing (unit vs integration vs E2E vs golden/snapshot vs property-based; "test behavior not implementation"; testing trophy/pyramid/honeycomb as of now),
2. delete bloated or low-value tests (mutation score, never-failed tests, flake/cost data, coverage of unchanged code, test impact analysis),
3. handle agent-written tests specifically (Paul Stack post, dwlz, Wu, Kent Beck, Anthropic, others).
Then check it against our surfaces: plan-issue criteria rules, implement-issue:57, check-issue:51, realistic-fix-bar locks, and what actually caught real bugs in our 7-day logs (failure-log, capture-asset-bytes, readiness-contract) vs what blocked (TMPDIR assertion, F17).

## Carries and locks
- K1 Q1 status: operator leans to 1a (cited source required to change an existing expectation) AND wants the criterion itself fixed. Q2 and Q3 unanswered.
- Locks: realistic-fix-bar (tests prove criteria and real bugs only, 09-30), reviewer-repair (10-02), test-time-and-temp (10-01). Open: framework-test-scope, test-runs, akrogon-slow-phases.
- Related fork paths: issues/chart/realistic-fix-bar/forks/*, issues/chart/framework-test-scope/forks/*.

## Output
Write round2-B.md here: sources with tier (operator-placed, named practitioner, primary doc/code, model knowledge + failed searches), dated; what each says; where they disagree; what our logs show; proposed questions with options, your recommended option and pitfalls. Ground repo claims in file:line.
