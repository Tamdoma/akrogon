# Brief: flaky-merge-flips

## What

`akrogon flaky` counts a flip when a named unit is red on a leaf's merge run and green on that leaf's next merge run, with the leaf's own commits unchanged between the two runs and no base run or landed-main run failing that unit between them. Each `verify-runs.jsonl` row records at run time the value that tells whether the leaf's own commits changed, since an evicted top may be gone from git after a rebase. Same-tree flips count as today.

## Why

`flips` keys on `${run.tree}\0${item.command}` (`src/flaky.ts` `flips`), and the 43 same-tree green reruns in framework 2026-11-14..21 are its whole merge-scope input. Once a red leaf leaves the line (red-exit, chart issues/chart/merge-lanes), its next merge run is on a new tree after the rebase, so the flaky list would go blind (forks/red-exit.md Taken 5).

## Done-criteria

1. A unit red on a leaf's merge run and green on its next merge run after a rebase onto a moved main, with the leaf's own commits unchanged, is listed by `akrogon flaky` as one flip. Proof: own test in `bun test` at the command boundary.
2. The same pair is not counted when the unit is nameless (`(script)`, `(unnamed)`, `(no test name)`, `(log gone)`), when the leaf's own commits changed between the runs, or when a base run or a landed-main run between them failed that unit. Proof: own tests in `bun test`.
3. A same-tree red-then-green pair counts as today, and ledger rows written before this change parse and count as today. Proof: own tests in `bun test`.
