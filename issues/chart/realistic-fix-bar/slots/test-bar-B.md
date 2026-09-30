# Test bar: independent round B

This round settles which tests earn their cost and when missing evidence should stop a leaf. Preserve the converging Fix bar: name a realistic input source; failed configured checks and explicitly named acceptance scenarios still block. No slot A files were read.

Operator notes, verbatim:

> "This also got me thinking. How do we enforce basic test only, or only the tests that are really important, but really, really important."

> "I feel like a bunch of time is going on tests that aren't really that useful, so the lifecycle takes longer time than it needs to."

The supplied CJ Hess screenshot argues that models produce redundant tests and that unit tests waste tokens. The first concern fits the evidence; the stronger claim that models reliably write correct code is not established. The case's supported privacy flow fails at the writer/checker boundary (`Case:15-25`), independently of the contrived late parser findings.

`Case` below means `/home/ivan/Work/infra/tamdoma/framework/issues/open/landing-multi-offer/offer-join-deploy/review-B.md`.

Practitioner synthesis, read 2026-09-30: [Kent Beck's own answer](https://stackoverflow.com/a/153565) favors the least testing needed for confidence, concentrating on mistakes the team actually makes. [Kent C. Dodds's Testing Trophy](https://kentcdodds.com/blog/write-tests) favors integration tests for confidence per cost, without banning unit tests or outside-boundary substitutes. [Google's Andrew Trenk](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html) favors observable API behavior over implementation details, with justified exceptions. They agree on useful confidence rather than test counts. Their emphasis differs by context: a pure algorithm can be checked cheaply in isolation; wiring needs its real consumer; browser-only behavior needs a browser. None establishes that AI-generated code makes testing unnecessary.

### 1 · Which new tests should a leaf write?

The current rules combine cheap sufficient proof with unconditional negative/edge tests and red/green work. That can turn every finding into another fixture even when existing evidence already covers the important behavior.

Research: operator · supplied notes and screenshot; practitioner · Beck and Dodds above; code · `skills/chart-issues/assets/standing-design.md:7-13`, `skills/implement-issue/SKILL.md:42`, `skills/plan-issue/SKILL.md:57-59`, read 2026-09-30. The existing planning map already names each criterion's proof and the failure it catches; use it to justify test selection rather than count tests.

- **1a (recommended):** Write the smallest set proving the leaf's required outcomes and protecting consequential failures on realistic supported paths. Reuse or extend existing tests first. Each added case names the distinct failure and consequence it catches; no separate test per function, branch, criterion or review finding. Include meaningful rejection/boundary cases where that consequence warrants them. Important bug repairs demonstrate failure before and success after using an existing or new check, rather than automatically adding another test file. Stop once these properties are established.
- **1b:** Keep mandatory edge-case tests and a regression fixture for every reproducible finding. Stronger breadth, but preserves the fixture-growth loop.
- **1c:** Drop unit tests and retain only broad smoke/end-to-end tests. Removes cheap checks of important algorithms and can make failures slower to diagnose.

Pitfalls: “Important” means a concrete consequence, such as a broken required outcome, unsafe mutation, lost data or breached boundary, not a label the agent invents. Test length and implementation line count are poor proxies: a one-line authorization change can matter. Avoid copied expected-value calculations, mocked units under test and tests of prose; keep independent outcomes (`standing-design.md:13`, `skills/check-issue/SKILL.md:45`). Unit tests of real behavior remain valid.

### 2 · When can review block because a test is missing?

The present rule makes any possible failure left untested a Fix, but exempts a gap fillable only with a slow test. Neither shortcut identifies which assurance actually matters.

Research: practitioner · Beck's confidence-based selection and Trenk's behavior-based tests above; code · `skills/check-issue/SKILL.md:45,47,49,53`; case · `Case:559,582,610`, read 2026-09-30. Round 4 demanded another nested-template capture; round 5 resolved that fixture and demanded a regex case. Those are genuine reproductions, but their recorded evidence supplies no realistic producer path.

- **2a (recommended):** Block for missing explicitly required proof, or when the reviewer names a realistic source, a consequential failure, and the specific gap in existing evidence that leaves it unprotected. Explain why the proposed check catches that gap; uncertainty, coverage percentages and one untested branch are insufficient. If current proof suffices, extra cases are Nits. Re-check applies the same bar within the repair diff. Deferred contrived findings do not automatically require regression fixtures.
- **2b:** Block any uncovered realistic input, even if its consequence is negligible or another test establishes the same property. Still invites marginal test growth.
- **2c:** Block only after reproducing an actual bug. Prevents speculative requests, but misses essential verification gaps before a first incident.

Pitfalls: Do not require an observed production incident; a supported-path trace can justify a critical gap. Test cost influences the cheapest sufficient proof, not whether a failed configured check or explicit criterion counts. Replace the blanket slow-test-as-Nit rule: a reviewer demanding a costly new check must explain why cheaper available proof cannot establish the consequential property. Preserve the locked Fix bar rather than treating a test request as a way around it.

### 3 · Must every leaf touching a user-visible flow add end-to-end evidence?

Standing design currently requires an artifact-producing end-to-end command for every such leaf. A useful integration test can therefore be insufficient solely because it lacks a browser trace.

Research: practitioner · Dodds's confidence/cost trade-off and Trenk's public-behavior guidance above; code · `skills/chart-issues/assets/standing-design.md:9-12`, `skills/implement-issue/brief-template.md:43-47`, read 2026-09-30. The case shows meaningful focused capture checks and reuse of unaffected broad evidence (`Case:563-566,614-618`), not a new live deploy on every B pass.

- **3a (recommended):** Choose the cheapest level that proves the changed property. Require real end-to-end evidence when browser/runtime behavior or cross-component wiring cannot be established by a smaller check, or when explicitly required by the contract. Reuse relevant evidence for unchanged stages with its revision and limits. Keep real consumer execution and existing recorded-output fidelity rules for chain triggers; a narrow unit test cannot substitute for missing wiring proof.
- **3b:** Keep at least one end-to-end artifact for every leaf touching a user-visible flow, including small changes already proven below that level. A simple uniform rule, with a deliberate ongoing cost.

Pitfalls: Integration preference is not permission to fake the behavior under test or to claim browser compatibility from a pure function. Preserve Playwright/trace requirements when browser proof is needed. This choice governs proof selection, not permission to skip currently configured checks.

Reply `1a 2a 3a`, or give numbered answers in plain text.

Challenge check: The recommended minimum relies on a thinking reviewer naming both the failure and its consequence, not a mechanical quota. Existing rules must agree: standing-design lines 8-13, implement line 42, checker lines 45/47 and plan lines 57-59; delegated briefs also repeat the requirements (`skills/implement-issue/brief-template.md:13,31,43-47`). Blanket negative tests, duplicate-rule agreement tests and target-size checks must serve an applicable required or consequential property rather than automatically create another test. Q3 is a real policy choice because it narrows today's unconditional flow requirement. Full-suite scheduling (`skills/implement-issue/SKILL.md:46,50`), removing existing tests, changing consumer check configuration and modifying the running framework leaf are separate work. No measured time saving is claimed.
