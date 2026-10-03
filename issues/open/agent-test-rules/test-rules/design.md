# Design: test-rules

## Binding decisions, verbatim

From `issues/chart/agent-test-rules/forks/outcome-criteria.md`:

Operator 2026-10-03: "4h, continue asking me all the questions." and "8a | 9a | 2a | 3a |"
- Q4 -> 4h. Done-criteria state observable results only, never a test file, assertion or count (shapes.md:134, :252). The plan picks proofs (plan-issue:61); proofs are replaceable work, not contract. check-issue:55 blocks on outcomes a criterion names, not on named tests. A bad test is ordinary work fixed under test-authority Q1 and test-worth 7a. B judges against the original brief outcomes. Foreclosed: 4i restrict test editors only; door bar plus correction ledger; manual return.
- Q9 -> 9a. No mechanical brief lock now; no recorded case of a seat editing a brief, and B reads the brief at review. Foreclosed: 9b dispatch-time hash.

From `issues/chart/agent-test-rules/forks/test-authority.md`:

Operator 2026-10-03: "1 - we need to fix the criterion as well. ..." (read as Q1 -> 1a plus a criterion bar, which became forks outcome-criteria and test-worth). Later: "8a | 9a | 2a | 3a |".
- Q1 -> 1a. Any seat (implementer, reviewer, merger) may change an existing assertion, fixture or recorded output only by citing the brief outcome or real source the old expectation contradicts, otherwise it does not change it. Adding new tests stays allowed. Foreclosed: 1b freeze all existing tests behind operator approval.
- Q3 -> 3a. This chart owns the rules. Test selection and speed stay in framework-test-scope and akrogon-slow-phases. Old-test deletion is the 6a rule applied as agents go, not a separate prune job. Foreclosed: 3b one chart for everything.

From `issues/chart/agent-test-rules/forks/test-worth.md`:

Operator 2026-10-03: "4 - ... | 5a | 6a | 7a |"
- Q5 -> 5a. Default to the smallest test at the real boundary (CLI, HTTP, browser, DB). Unit or property tests only for logic that matters where they catch bugs more cheaply. E2E only where smaller tests miss browser, runtime or wiring bugs. Foreclosed: 5b ban unit tests.
- Q6 -> 6a. Delete false or outdated expectations with the reason. Delete a duplicate only after naming the test that still catches the same bug. Judge a batch of deletions as a batch. Keep every test guarding a real past regression. Applies whenever a seat touches tests. Foreclosed: 6b one-time prune leaf per repo, 6c delete by label or signal.
- Q7 -> 7a. Fail-before/pass-after for bug fixes. For new behavior, one deliberate break shown red. No mutation score. Foreclosed: 7b mutation score per leaf, 7c green test plus written scenario.

From `issues/chart/agent-test-rules/forks/bad-base-test.md`:

Operator 2026-10-03: "8a | 9a | 2a | 3a |"
- Q8 -> 8a. The first seat that proves a test red on base and wrong (contradicts a brief outcome or real source, per test-authority Q1) fixes that one expectation in its own commit with the reason. B reviews it like any diff. Other leaves get it by rebase. A test red on base because the code is really broken keeps today's stop. Foreclosed: 8b B repairs in review per leaf, 8c keep stopping.

Excluded from this leaf, owned by `test-change-check`: test-authority Q2 (2a, the `akrogon phase` git check) and all of `forks/test-change-check.md` (10a built-in path rule, 11a `Test-Change:` trailer, 12a check-only run before merge push). Q9 (9a) needs no change here: it records that no brief lock is added.

Standing design: `/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. This leaf edits that file, so its rules are both input and output here.
- "No vanity tests" and "cheapest sufficient test, where cheapest counts creation plus upkeep" (lines 7, 10) are where 5a and 6a land. The leaf adds 5a's boundary-first order, 6a's deletion rule and 7a's break proof next to them, without restating line 9's E2E artifact rule.
- "Negative and edge cases are criterion and consequence driven" (line 8) stays. It already matches 5a.
- "Tests keep independent expected results" (line 13) is the reason rule 2 exists: an expectation changes only against an independent source, never to fit the code.
- The remaining lines (auth, secrets, chain triggers, slow runs, leaf ownership) do not apply to prose rules about tests.

## Leaf architecture
- Owned prose (A,B,C): `docs/guide/phases.md` (:92 test rules, :94 and :102 base-red stop and Fix bar), `skills/implement-issue/brief-template.md:13` (the worker copy of the test-set rule; `:47` stays), `skills/chart-issues/assets/shapes.md` (Done-criteria template at :134, implementer audit at :252), `skills/check-issue/SKILL.md` (:39 brief as judging input, :51 test blocking, :55 named scenarios, :59 base-run rule, check.repair :75), `skills/implement-issue/SKILL.md` (:38 base-run rule, :57 test set, :75 check.fix), `skills/merge-issue/SKILL.md` (:43-45 red after rebase and fix forward), `skills/chart-issues/assets/standing-design.md` (test lines 7-10).
- `skills/plan-issue/SKILL.md:61-63` already maps each criterion to a proof the plan chooses. It is read, not edited, unless its wording names a test as contract.
- Rule 2 wording, used the same in every skill: an existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source that the old expectation contradicts. A new test needs no cited source. Adding a case to an existing test file changes no expectation, so it cites no source, but `test-change-check` still makes the seat record it with a `Test-Change:` line saying no existing expectation changed. (A,C) "Real source" means the same as in the check-issue Fix bar (`:49`): a real build, user action or content, integration or attacker-reachable input.
- 8a sits inside the existing base-run paragraph as one added case after "Red on base requires both runs completed". Red on base with a wrong test means fix that expectation in its own commit and continue. Red on base with broken code keeps `failed --reason "<command> red on base <sha>"`. The base-run mechanics (worktree, logs, incomplete runs) stay unchanged. The 8a fix may touch a test outside the plan's owned paths. A commits it in the lane, never a worker, in delegated and inline mode alike. (A,C) In check.review no seat commits, because both seats review the same head blind (`skills/check-issue/SKILL.md:37`). A wrong base test proven there is a Fix whose realistic source (`:49`) is the brief outcome or real source the test contradicts under rule 2, and B fixes it first in check.repair. (A,C)
- Held disagreement (B): B reads 8a as requiring the proving seat to fix in that same pass, including in check.review, and calls the check.repair route an exception to 8a. A and C keep the route because a commit during check.review changes the head the peer is reviewing blind, and B, the usual prover there, still makes the one fix in its next pass, which other leaves get by rebase.
- Literal interfaces: none new. The `Test-Change:` trailer, `akrogon phase --check` and B listing the trailers in check.review are owned by `test-change-check`, which adds one sentence after rule 2 in implement-issue, brief-template, check-issue and merge-issue. This leaf owns the check.review sentence that B judges each changed existing expectation against its cited source. (A,C) Both leaves edit those files in parallel. A rebase conflict is resolved by keeping both sentences.
- Exclusions: no change to test selection, `test_changed`, Bun speed or which tests run (framework-test-scope, akrogon-slow-phases). No one-time prune of existing suites. No brief lock. No code or test changes. No `--check` or guard description in docs (`test-change-check` owns `README.md` and `docs/guide/merge.md` for those). No edit under `issues/`.
- Dependencies: none.
