# Phases

A phase is one step in a leaf's workflow. Seats report completion through Akrogon so it can decide what comes next.

| Phase | Who works | Result |
| --- | --- | --- |
| plan.positions | A and B | Independent plans. |
| plan.rebuttal | A and B | Responses to disagreements, when enabled. |
| plan.synthesis | A | One execution plan. |
| implement | A | Code and validation. |
| check.review | A and B initially | Review verdicts. After a repair, B reviews the fix. |
| check.repair | B | Repairs for most review findings. Hands the rest to A. |
| check.fix | A | Repairs B handed to A, or red merge checks. |
| merge | B | One leaf per repo holds the merge turn; checks, rebase and push. |
| merged | Nobody | Completed leaf. |
| failed | Nobody | Stopped work that needs a decision or recovery. |

Review verdicts are ready, nits or fix. Ready and nits allow merge. Fix sends the leaf to B's repair. Only a handoff to A counts against the configured repair-round limit.

```text
plan.positions -> plan.rebuttal -> plan.synthesis
      |          (if enabled)            ^
      +---------- skip rebuttal ---------+
                                         |
                                         v
                                     implement
                                         |
                                         v
                    +------------> check.review
                    |                    |
                    |             fix /     \ ready / nits
                    |                v         |
                    |         check.repair      |
                    |            |      \       |
                    |    handed to A      +---> merge ---> merged
                    |            v                |
                    +------- check.fix <-- red checks

Any active phase ---> failed ---> any active phase
                                  (never merged)
```

For export-csv, a quoting defect sends review back to repair, while a recorded blocker stops the leaf in failed. Without debate, the leaf starts at plan.synthesis; after recovery, you choose any active phase that fits the remaining work.

## How a phase moves

The worker reports the destination phase and its seat. For example, A finishes implementation with:

```sh
akrogon phase export-csv check.review --slot A
```

At a paired step, one seat's completion does not finish the whole phase. Akrogon waits for both required seats.

A review pass includes a verdict:

```sh
akrogon phase export-csv merge --slot B --verdict ready
```

The command validates the transition and checks the required artifacts and worktree conditions. Do not edit the phase field to bypass a refusal.

When a seat cannot continue, it records a reason:

```sh
akrogon phase export-csv failed --reason "CSV column order needs a decision" --slot A
```

After resolving the cause, resume at the active phase that fits the work:

```sh
akrogon phase export-csv plan.synthesis
akrogon next export-csv
```

Failed can resume at any active phase. It cannot jump directly to merged. Recovery resets the recorded pass and delivery bookkeeping. Recovery keeps the repair count (`fix_rounds`), so a leaf failed at the cap gets one more A repair and a B-only re-check on each recovery. It does not repair code or resolve the blocker for you. A call carrying `--slot` cannot move a failed leaf; recovery omits `--slot`.

## plan-issue: turn the contract into steps

Planning chooses how to meet the brief without changing its locked scope. The final plan names decisions, read-first files, interfaces, a checklist grouped into waves (each unit lists the paths it owns, its shared test resources and the units that must land first) and verification. The plan proves the brief's done-criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name; a whole run the brief names stays.

For CSV export, it might identify the current export function, add a serializer and name tests for quotes and empty data.

Chart handoff defaults to no implementation debate. A then writes the plan directly in synthesis. With debate enabled, A and B write independent positions first. The repository's rebuttal setting determines whether they get a rebuttal round before A synthesizes the plan.

Debate gives you separate implementation proposals when the tradeoff warrants it. It is not required for a small settled change.

## implement-issue: build and show the evidence

A follows the plan in the leaf worktree. Depending on configuration, A works inline or delegates. Delegated, A runs each plan wave whole, up to 3 independent workers at once, each in its own worktree with results cherry-picked onto the lane. Inline work follows wave order.

Tests come from the acceptance criteria, which are observable outcomes, never a test file, assertion or count; the plan picks each criterion's proof, and proof is replaceable work, not contract. The skill calls for the smallest set that proves every criterion, with a trivial one-line change exempt from new tests. A missing or bad test blocks only when a criterion has no test that would catch its failure, a realistic fix has no test, or a test mocks the unit under test. An existing assertion, fixture or recorded output changes or is deleted only with a cited brief outcome or real source (a real build, user action or content, integration or attacker-reachable input) that the old expectation contradicts, while a new test needs no cited source. Tests run at the smallest real boundary first (CLI, HTTP, browser, DB), with unit or property tests only for logic that matters where they catch bugs more cheaply and E2E only where smaller tests miss browser, runtime or wiring bugs. A false or outdated expectation deletes with its reason, a duplicate only after naming the test that still catches the same bug, batches are judged as batches, and tests guarding real past regressions stay. A bug fix shows fail-before/pass-after and new behavior shows one deliberate break turning its test red.

A runs changed tests as work lands, then criterion proof plus every `checks` command before handoff and after repair, reusing unchanged evidence; `merge_checks` run only at merge unless a criterion needs a whole run the brief names. When a red test or check has no cause in the leaf's diff, A runs that same command once at `AKROGON_BASE` in a detached worktree; when base is red too because the test's expectation is itself wrong, contradicting a brief outcome or real source, A fixes that one expectation in its own commit with the reason and continues, while a really broken base still ends the pass `failed`. The implementation report records the code changes, commands, results, commits and any limitations.

You get a reviewable change and evidence of what was checked. A claim that “tests pass” without the relevant result is not the intended handoff.

## check-issue: review defects, then verify the repair

Both seats review the initial change independently without reading the peer's current review. They judge the diff against the contract, plan and evidence.

A blocking fix names its realistic source, its consequence today, and the criterion, check or gap it hits. The source is a real build, a real user action or content, a real integration, or untrusted input an attacker can send, while a handcrafted reproduction alone is a nit. Failed checks always block, and a scenario a criterion names blocks as an outcome the criterion names, never as a named test; review judges each changed existing expectation against its cited source. When a red test or check has no cause in the leaf's diff, the reviewing seat runs that same command once at `AKROGON_BASE` in a detached worktree; when base is red too, a test whose expectation is itself wrong becomes a fix routed to repair rather than an automatic `failed`, while a really broken base still ends the pass `failed`.

Suppose a CSV field with a newline pasted from a user spreadsheet creates an extra row. If that breaks the import criterion, the reviewer records the source, consequence, and criterion and requests a fix. B repairs most findings itself, each with a failing test first, then merges. B hands plan or design changes, missing units, required live runs and too-large work to A.

B re-checks only A's repair diff. That pass confirms the earlier findings and can block a new defect introduced by the repair. It does not restart an unrestricted review of the whole feature.

The configured repair cap prevents an endless review cycle and counts handoffs to A. If the cap is exhausted, the leaf fails with a recorded cause.

Previous: [Next](next.md) · Next: [Files](files.md) · [Home](../../README.md)
