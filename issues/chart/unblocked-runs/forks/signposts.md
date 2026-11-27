# Signposts: unblocked-runs

Original: this chart (issues/chart/unblocked-runs). Session handed list: unblocked-runs only.

## Question

1. What wins when picks trade off? 1a (recommended) less code and fewer moving parts first, then speed and price, then breadth. 1b breadth of coverage first. Steers every fork's recommendation and the leaf split.
2. When a fix can remove the fragile part or guard it, which way? 2a (recommended) remove or reuse what exists (delete a probe, reuse an existing walk) and add nothing new unless no existing mechanism can carry it. 2b add a guard beside the existing code. Steers #162, #163 and #161's mechanism.
3. How finely to split leaves? 3a (recommended) fewest leaves that keep each outcome checkable: bundle tiny fixes on the same verb. 3b one leaf per report. Steers the split and lifecycle cost.
4. Paid harness runs as proof? 4a (recommended) only when no free proof can show the property, under the standing grant. 4b live-run every harness. Steers #161's done-criteria.
5. How far does a fix reach? 5a (recommended) the whole bug class the report names, on every path that has the same pattern, no wider. 5b only the reported site. Steers each leaf's scope.

## Taken

A's picks (full autopilot, `signposts: A`), 2026-11-25:

1. 1a: the operator's words "Simplicity, clarity, and elegance" and "If it's not absolutely necessary to add something new" set this.
2. 2a: the operator's words "Whenever you can reduce the amount of code to make the whole system more elegant, go that way."
3. 3a: speed and price; each extra leaf costs a full plan, implement, review and merge cycle.
4. 4a: speed and price; #161's decision also forbids added complexity, so no new live-run machinery.
5. 5a: function over form; a fix that leaves the same pattern reachable elsewhere repeats the report.

Account: the session prioritizes removal and reuse over new code, bundles small fixes, and gives up breadth (no per-harness live matrix, no fixes outside the named bug classes).

## Needs

none (no keys, accounts, live outside changes or retention foreseen; any paid harness launch falls under the standing grant `by: standing`, which needs no operator row)
