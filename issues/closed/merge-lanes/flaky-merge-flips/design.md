# Design: flaky-merge-flips

## Binding decisions, verbatim

### forks/signposts.md `## Taken` (issues/chart/merge-lanes)

Operator, 2026-11-21T17:48Z, door t2z2, verbatim: "1a | 2a - test it but it was slower before, I don't think it's worth it | 3a | 4b | 5a | 6a | What did Fable and Neon come up with?"

Account: the session ranks merge speed first, counted from a leaf's first entry into merge to landed with failed rounds included, under three hard limits: no leaf adds a new test failure to main, the PC stays inside its limits, token cost does not grow. Each leaf is still tested alone (no batching). A framework chart that brings the merge suite back toward its early-November ~5 min is taken first (4b, the operator's yes to that chart), then merge-lanes. In merge-lanes a failed merge leaves the line at once and is retested or repaired off the line (5a), and leaves waiting to merge stop counting against max_active (6a). Two suites at once is measured with the N2 probe after the suite fix lands, and is allowed only if neither run is more than 1.25x slower and no new test fails; the operator expects it not to pay off. Given up: batching, red-then-revert landing, any extra PC load without a passing measurement.

Order: 1. suite-regrowth (framework, /home/ivan/Work/infra/tamdoma/framework/issues/chart/suite-regrowth), 2. merge-lanes (akrogon). Nothing dropped.

### forks/red-exit.md `## Taken` (issues/chart/merge-lanes)

A's pick under autopilot, 2026-11-21 (signposts 1a speed from first entry, 5a, 2a, and the operator's values simplicity and removing over adding decided it):

5. `akrogon flaky` keeps seeing flakes: a named unit red on a leaf's merge run and green on its next merge run, with the leaf's own commits unchanged and no base run or covered landing failing that unit between them, counts as one flip. The verify-runs row records at run time what "own commits unchanged" needs; the field is open for the plan. Reason: 5a removes all same-tree reruns, the list's whole merge-scope input (B).

- Excluded here: forks/red-exit.md Taken 1, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 2, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 3, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 4, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 6, owned by leaf merge-red-exit.
- Excluded here: forks/red-exit.md Taken 7, owned by leaf main-red-cover.
- Excluded here: forks/red-exit.md Taken 8, owned by no leaf in this handoff: it waits on operator row N3.
- Excluded here: forks/red-exit.md Taken 9, owned by CHART.md Off route.


/home/ivan/.akrogon/releases/4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444/skills/chart-issues/assets/standing-design.md

How it applies here: a flip is mechanical (same leaf, consecutive merge runs, own commits unchanged, no base or landed run failing the unit between), so it is proven by own tests in `bun test` over hand-written ledger rows and a temporary repo; no new machinery. Each behavior shows one deliberate break turning its test red. The flaky list stays evidence for B's judgment; nothing in this leaf decides a red is a flake.

## Leaf architecture

- Owned surfaces: `src/flaky.ts` `flips` and the listing; `src/verify.ts` the `verify-runs.jsonl` row schema and its writer (a new optional field recorded at run time); `src/verify-pass.ts` (`passRecordSchema`, if the pass forwards the value to `runOnce`); docs `docs/reference/files.md` (the new field), `docs/reference/commands.md` and `docs/reference/checks.md` (both say flips need the same tree).
- Literal interfaces: the new row field is optional, so rows written before this change parse; a ledger holding the field does not parse under an older akrogon (the same pattern `files.md` already states for `failures`).
- Consumers of changed state: `src/verify.ts` readers of `verify-runs.jsonl` (`newRedUnits`, `knownRedReceipt`, `decideSlow`) must ignore the new field; the `flaky` case in `src/akrogon.ts` prints it, and chart-issues Open reads it.
- Exclusions: red-exit itself (leaf merge-red-exit); the main-red cover (leaf main-red-cover), though a landed-main run failing the unit (by ancestry, as `newRedUnits` reads it) breaks the pair here.
- Open for the plan: what the field holds to tell the leaf's own commits apart across a rebase (for example a patch id of merge-base..sha compared across the two runs, or a stored pre-rebase head compared as `run2.pre_rebase_head === run1.sha`) and where the verify writer gets it; nothing else.
