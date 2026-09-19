# Phases

A phase is one step in a leaf's workflow. Seats report completion through Akrogon so it can decide what comes next.

| Phase | Who works | Result |
| --- | --- | --- |
| plan.positions | A and B | Independent plans. |
| plan.rebuttal | A and B | Responses to disagreements, when enabled. |
| plan.synthesis | B | One execution plan. |
| implement | B | Code and validation. |
| check.review | A and B initially | Review verdicts. After a repair, A reviews the fix. |
| check.fix | B | Repairs for review findings. |
| merge | A | Checks, rebase and push. |
| merged | Nobody | Completed leaf. |
| failed | Nobody | Stopped work that needs a decision or recovery. |

Review verdicts are ready, nits or fix. Ready and nits allow merge. Fix sends the leaf to repair, subject to the configured repair-round limit.

## How a phase moves

The worker reports the destination phase and its seat. For example, B finishes implementation with:

```sh
akrogon phase export-csv check.review --slot B
```

At a paired step, one seat's completion does not finish the whole phase. Akrogon waits for both required seats.

A review pass includes a verdict:

```sh
akrogon phase export-csv merge --slot A --verdict ready
```

The command validates the transition and checks the required artifacts and worktree conditions. Do not edit the phase field to bypass a refusal.

When a seat cannot continue, it records a reason:

```sh
akrogon phase export-csv failed --reason "CSV column order needs a decision" --slot B
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

Chart handoff defaults to no implementation debate. B then writes the plan directly in synthesis. With debate enabled, A and B write independent positions first. The repository's rebuttal setting determines whether they get a rebuttal round before B synthesizes the plan.

Debate gives you separate implementation proposals when the tradeoff warrants it. It is not required for a small settled change.

## implement-issue: build and show the evidence

B follows the plan in the leaf worktree. Depending on configuration, B works inline or delegates bounded units to sequential workers.

Tests come from the acceptance criteria. The skill calls for meaningful failing-then-passing evidence, with a trivial one-line change exempt from new tests.

B runs changed tests as work lands, then the full suite and other blocking checks before handoff. The implementation report records the code changes, commands, results, commits and any limitations.

You get a reviewable change and evidence of what was checked. A claim that “tests pass” without the relevant result is not the intended handoff.

## check-issue: review defects, then verify the repair

Both seats review the initial change independently without reading the peer's current review. They judge the diff against the contract, plan and evidence.

A blocking finding needs a concrete defect, failed check or broken contract. A preference alone is a nit.

Suppose a CSV field containing a newline creates an extra row. If that violates the contract, the reviewer records the case and requests a fix. B repairs it and runs the relevant checks.

A then reviews the repair diff. That pass confirms the earlier findings and can block a new defect introduced by the repair. It does not restart an unrestricted review of the whole feature.

The configured repair cap prevents an endless review cycle. If the cap is exhausted, the leaf fails with a recorded cause.

Previous: [Next](next.md) · Next: [Files](files.md) · [Home](../../README.md)
