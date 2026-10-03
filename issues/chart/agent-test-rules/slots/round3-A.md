# Round 3 map A (Q4 reshaped)

## Where a return would happen today
- plan.synthesis: plan-issue:65 forbids reopening locked scope. A seat with a bad criterion can only write a note (plan:37) or stop with `akrogon phase failed` (plan:29). failed = leaf dead until the operator re-charts. Manual.
- implement: same, implement can't change criteria (implement:75 for check.fix).
- check.review: check-issue:55 makes every named criterion scenario block. A bad criterion can't be downgraded. Repair must satisfy it or fail.
So under 4a the "send back" is a `failed` stop plus an operator re-chart. That is the manual step the operator rejects.

## Automatic options
- 4d (rec) Bar enforced at the chart door, where the operator already is. After handoff, plan.synthesis (A, before any code) may drop or narrow a criterion that fails the bar, with the reason in plan.md, never adding or widening. check.review (B, other seat, other model) checks every drop. An unjustified drop is a Fix that B repairs itself. No human step.
- 4e Door only. Lifecycle can't touch criteria. Any bad criterion that slips through still blocks.
- 4f Door plus a review downgrade: B treats a test demanded only by a failing criterion as a Nit (not required) but nobody edits the criterion. Simplest, but the implementer still spends time writing that test.

## Pitfalls
- A plans and implements, so A dropping hard criteria is the risk. B's review of drops is the guard.
- Drops only before code. After implement starts, criteria are fixed, so nobody shrinks the target to fit code already written.
