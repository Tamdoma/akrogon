# Rebuttal C

## A's case against O3 is half wrong

1. "run-check refuses a merge_checks argv, so seats would either lose suite runs or run bare `bun test` outside the boxed run units" — mechanically wrong. src/run-check.ts refuses an argv matching a `merge_checks` *entry*, and entries are stored as the literal `akrogon verify --attempt <id>` (src/config.ts `withSetup`). `run-check --name x -- sh -c 'bun test --timeout=30000'` remains fully allowed and boxed. What O3 removes is the leaf-scope receipt requirement for `test`, not the ability to run or box the suite. Seats keep every tool they have; the gate stops demanding suite-green at implement/repair gates.

2. The real counter is 7ad17efc (2026-10-14): the operator dropped `test_changed` (`bun test --changed=$AKROGON_BASE`) with the message "test runs the whole suite". That is a settled choice for whole-suite *presence* in `checks`. But what was rejected is a scoping mechanism, not a stage placement: O3 keeps the identical whole suite, run once per merge attempt on the rebased tree, which is strictly later and more accurate evidence for what lands. So O3 is a reversal of an operator decision in spirit only — it deserves the operator question (my Q1), not dismissal on process grounds.

## O1's 23% is computed off the wrong denominator

A's own numbers: 191.9s is the *summed serial file time* across 69 files at load ~2. Actual suite wall is concurrent (median leaf run 137s, recent greens 190-235s under load). The ~45s saved in three files is aggregate CPU-ish work; wall saving only materializes on the critical path. next.test.ts (49.2s, the longest file) is plausibly it, but under fleet contention the wall is bound by scheduling, not by any file's duration — the same reason timeouts flake at 15-30s limits. Realistic wall gain is below 23% per run and ~0 on red-retry waste. Also unproven: "23% off every full-suite run" is an estimate needing a before/after under fleet load, the same standard my pick meets with recorded baselines.

## Does A's evidence change my pick?

7ad17efc raises the approval risk on O3 — it is a policy ask, not a pure fix. It does not change the measured waste (~1,300 min/11d leaf-scope suite vs ~180 min/11d merge scope) or the fact that `init-akrogon` prescribes `merge_checks` for exactly this case. Pick stays O3, explicitly conditioned on the operator accepting signal deferral to the merge turn; if the answer is no, O1 is the fallback and A owns its proof burden (wall-time before/after under load, not serial sum).

## Minor

Merged note "C estimate 75% of check compute" — mine, stands. B's O2 pair (397.9s for leaf+merge on one tree) is real but A's ledger check (2/51 merge trees share a leaf-verified tree) matches my dup analysis: cross-scope cases are ~4% of verifies. O2 as a leaf is small regardless of the pair number.
