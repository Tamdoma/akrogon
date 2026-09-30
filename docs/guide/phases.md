# Phases

A phase is one step in a leaf's workflow. Seats report completion through Akrogon so it can decide what comes next.

| Phase | Who works | Result |
| --- | --- | --- |
| plan.positions | A and B | Independent plans. |
| plan.rebuttal | A and B | Responses to disagreements, when enabled. |
| plan.synthesis | A | One execution plan. |
| implement | A | Code and validation. |
| check.review | A and B initially | Review verdicts. After a repair, B reviews the fix. |
| check.fix | A | Repairs for review findings. |
| merge | B | Checks, rebase and push. |
| merged | Nobody | Completed leaf. |
| failed | Nobody | Stopped work that needs a decision or recovery. |

Review verdicts are ready, nits or fix. Ready and nits allow merge. Fix sends the leaf to repair, subject to the configured repair-round limit.

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
                check.fix <--- fix ------+
                    ^                    |
                    |               ready / nits
                    |                    v
                    +-- red checks --- merge ---> merged

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

Failed can resume at any active phase. It cannot jump directly to merged. Recovery resets the recorded pass and delivery bookkeeping. It does not repair code or resolve the blocker for you.

## plan-issue: turn the contract into steps

Planning chooses how to meet the brief without changing its locked scope. The final plan names decisions, read-first files, interfaces, an ordered checklist and verification.

For CSV export, it might identify the current export function, add a serializer and name tests for quotes and empty data.

Chart handoff defaults to no implementation debate. A then writes the plan directly in synthesis. With debate enabled, A and B write independent positions first. The repository's rebuttal setting determines whether they get a rebuttal round before A synthesizes the plan.

Debate gives you separate implementation proposals when the tradeoff warrants it. It is not required for a small settled change.

## implement-issue: build and show the evidence

A follows the plan in the leaf worktree. Depending on configuration, A works inline or delegates bounded units in waves of up to 3 independent workers, each in its own worktree with results cherry-picked onto the lane.

Tests come from the acceptance criteria. The skill calls for the smallest set that proves every criterion, with a trivial one-line change exempt from new tests. A missing or bad test blocks only when a criterion has no test that would catch its failure, a realistic fix has no test, or a test mocks the unit under test.

A runs changed tests as work lands, then the full suite and other blocking checks before handoff. The implementation report records the code changes, commands, results, commits and any limitations.

You get a reviewable change and evidence of what was checked. A claim that “tests pass” without the relevant result is not the intended handoff.

## check-issue: review defects, then verify the repair

Both seats review the initial change independently without reading the peer's current review. They judge the diff against the contract, plan and evidence.

A blocking fix names its realistic source, its consequence today, and the criterion, check or gap it hits. The source is a real build, a real user action or content, a real integration, or untrusted input an attacker can send, while a handcrafted reproduction alone is a nit. Failed checks and scenarios a criterion names always block.

Suppose a CSV field containing a newline creates an extra row. If that violates the contract, the reviewer records the case and requests a fix. A repairs it and runs the relevant checks.

B then reviews the repair diff. That pass confirms the earlier findings and can block a new defect introduced by the repair. It does not restart an unrestricted review of the whole feature.

The configured repair cap prevents an endless review cycle. If the cap is exhausted, the leaf fails with a recorded cause.

Previous: [Next](next.md) · Next: [Files](files.md) · [Home](../../README.md)
