# Design: main-red-cover

## Binding decisions, verbatim

### forks/signposts.md `## Taken` (issues/chart/merge-lanes)

Operator, 2026-11-21T17:48Z, door t2z2, verbatim: "1a | 2a - test it but it was slower before, I don't think it's worth it | 3a | 4b | 5a | 6a | What did Fable and Neon come up with?"

Account: the session ranks merge speed first, counted from a leaf's first entry into merge to landed with failed rounds included, under three hard limits: no leaf adds a new test failure to main, the PC stays inside its limits, token cost does not grow. Each leaf is still tested alone (no batching). A framework chart that brings the merge suite back toward its early-November ~5 min is taken first (4b, the operator's yes to that chart), then merge-lanes. In merge-lanes a failed merge leaves the line at once and is retested or repaired off the line (5a), and leaves waiting to merge stop counting against max_active (6a). Two suites at once is measured with the N2 probe after the suite fix lands, and is allowed only if neither run is more than 1.25x slower and no new test fails; the operator expects it not to pay off. Given up: batching, red-then-revert landing, any extra PC load without a passing measurement.

Order: 1. suite-regrowth (framework, /home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth), 2. merge-lanes (akrogon). Nothing dropped.

### forks/red-exit.md `## Taken` (issues/chart/merge-lanes)

A's pick under autopilot, 2026-11-21 (signposts 1a speed from first entry, 5a, 2a, and the operator's values simplicity and removing over adding decided it):

7. Main-red cover: the land run accepts a red head in the first turn, with no rerun, no base run and no seat, when every failing unit is a named test title (never `(script)`, `(unnamed)`, `(no test name)`, `(log gone)`) that is an unresolved red on main from a completed base run at or before the head's merge-base. A covered unit resolves when a later completed run on landed main passes that command, or fails it without that unit and with only named failures. The cover is accepted through `requireGreenReceipt` (`knownRedReceipt`), so `landGates` and `landPush` pass a covered head, reading stored `failures` first as `newRedUnits` does. A nameless main red is not covered and goes to `check.repair`. Reason: the 11-15..17 incident cost about 10 h; bar unchanged from base-red forks/red-base-policy.md. Accepted cost: a new break inside an already-red test can land. Standing dissent (C): also exclude `flakyLines` titles from covers.

- Excluded here: forks/red-exit.md Taken 1, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 2, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 3, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 4, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 5, owned by leaf flaky-merge-flips.
- Excluded here: forks/red-exit.md Taken 6, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 8, owned by no leaf in this handoff: it waits on operator row N3.
- Excluded here: forks/red-exit.md Taken 9, owned by CHART.md Off route.


/home/ivan/.akrogon/releases/4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444/skills/chart-issues/assets/standing-design.md

How it applies here: the cover is a mechanical rule with one right answer per unit (named title, red in a completed base run at or before the merge-base, not resolved by a later landed-main run), so it is a script decision, proven by own tests at the command boundary in `bun test` over temporary repos and hand-written ledger rows; no new machinery. Each behavior shows one deliberate break turning its test red. The unit names are the ledger's stored `failures`, a literal contract, not a text match standing in for a model's choice. The accepted cost (a new break inside an already-red test can land) is the operator's base-red bar, kept as decided.

## Held disagreements

- Not a decision, the decision stands. Against forks/red-exit.md Taken 7 (no `flakyLines` exclusion). Fact: a flake seen red in a base run opens a cover for that title. Consequence: a real break of that test can land while the cover is open. Raised by slot C (slots/red-exit-rebuttal-C.md). State: unanswered by the operator.

## Leaf architecture

- Owned surfaces: `src/verify.ts` `requireGreenReceipt` and `knownRedReceipt` (accept a covered merge-scope head), the main-red unit reader beside `newRedUnits` (unresolved units per command from base runs and landed-main runs); `src/land.ts` `land` (a red verify whose units are all covered continues to gates and push instead of handing off); docs `docs/reference/checks.md` and `docs/reference/files.md` (the known-red receipt now reads stored `failures` for the merge cover).
- Literal interfaces: a unit is the pair (command, failure name) from `verify-runs.jsonl` `failures`; nameless names are `(script)`, `(unnamed)`, `(no test name)` and `(log gone)`; a base run is a completed run with `compares` set; a landed-main run is a completed run whose `sha` is an ancestor of the tracked default branch, as `newRedUnits` reads it (`isAncestor` with `trackingRef`), so direct-route and operator runs on main count.
- Consumers of changed state: `src/phase.ts` `landGates`/`recordTested` and `landPush`/`batchPush` (both call `requireGreenReceipt`); the direct route's `akrogon verify --holder --known-red` (skills/chart-issues/assets/direct-route.md), whose explicit linked-base two-log judgment in `knownRedReceipt` must not change, and any direct-route guard that calls `requireGreenReceipt` for merge scope, which must either share the ledger cover or be shown not to reach it; `src/flaky.ts` reads the same rows; leaf merge-red-exit owns what happens to an uncovered red.
- Exclusions: where an uncovered red goes and every hand-off (leaf merge-red-exit); the first-observation base pass (red-exit Taken 8, waits on N3); flaky flips (leaf flaky-merge-flips); showing active covers in `akrogon status` (not taken).
- Open for the plan: whether the cover is a new branch in `requireGreenReceipt` for merge scope or a change inside `knownRedReceipt`, given the direct route's contract; one reader of unresolved main-red units for both the cover and `newRedUnits`' main-red notice, or a stated reason for two, since the cover also resolves a unit when the command fails without it; how "at or before the head's merge-base" is read for a base run (ancestry of its `sha`).
