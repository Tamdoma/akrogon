# Plan: merge-bounce-rounds

Debate off (`debate: "no"`); synthesized directly from brief and design. Locked design 1a binds: every `merge -> check.fix` counts toward `fix_rounds`, the existing cap applies to that origin, B-only re-review unchanged. Sequencing prerequisite red-main-hold is already landed on this branch.

## Decisions

- D1: `commitMove` in src/phase.ts counts `check.repair -> check.fix` and `merge -> check.fix`: extend `recorded.phase === 'check.repair'` to `recorded.phase === 'check.repair' || recorded.phase === 'merge'`. No other origin counts (`failed -> check.fix` recovery stays excluded, matching the check.repair rule today).
- D2: The cap in `transition` extends `state.phase === 'check.repair'` to `state.phase === 'check.repair' || state.phase === 'merge'`, and the failure record names the origin via `phase: state.phase`. `slot: slot ?? required[0]` already resolves `B` for a merge-origin call (routing['merge'].slots = ['B']).
- D3: `--red-on-base` holds and batch splits need no code change: both leave the leaf in phase `merge` without calling `commitMove`, so no transition and no count. Proven by a `fix_rounds` assertion in the existing hold test, not by new code.
- D4: `Failure.phase` is typed `phaseSchema`, so `'merge'` validates with no schema change.

## Read-first

- src/phase.ts — `commitMove` fix_rounds field (~line 151), cap + failure record in `transition` (~lines 302-318)
- src/routing.ts — merge slots `['B']`, `requiredSlots` B-only recheck rule
- tests/phase.test.ts ~100-160 — existing cap/count assertions to update
- tests/hold.test.ts ~229-300 — batch `--red-on-base` hold test
- docs/guide/phases.md ~line 108 — repair-cap sentence; docs/guide/setup.md ~line 60 — `fix_rounds` config line
- tests/helpers.ts, tests/fake-herdr.ts — `leaf()`, `fixture()`, `fakeHerdr` for `moved failed` delivery

## Interfaces

None new. `Failure { cause: 'attempts', phase: 'merge', slot: 'B', reason: 'fix rounds exhausted' }` uses the existing schema.

## Waves

### Wave 1

- U1 owns: src/phase.ts, tests/phase.test.ts, tests/hold.test.ts, docs/guide/phases.md, docs/guide/setup.md. Shared test resource: none (temp-repo fixtures and fake herdr only). Prerequisites: none.
  - src/phase.ts: apply D1 and D2.
  - tests/phase.test.ts: in the repair-cap test change `conflict` (merge, fix_rounds 0) bounce expectation `fix_rounds` 0 to 1; change `capped` (merge, fix_rounds 1, config fix_rounds 1) to expect `moved failed` with `failure: { cause: 'attempts', phase: 'merge', slot: 'B', reason: 'fix rounds exhausted', delivery: 'shown' }` and pass `herdr.env` on that call (announceFailed throws without fake herdr).
  - tests/hold.test.ts: in the batch `--red-on-base` test set holder `fix_rounds: 1` in the existing `saveState`, then assert `holderState.fix_rounds` is `1` after the hold.
  - docs/guide/phases.md: state that merge `check.fix` bounces count toward `fix_rounds` in the cap sentence. docs/guide/setup.md: `fix_rounds` line covers merge bounces too.
  - Commit trailers: `Test-Change: tests/phase.test.ts <reason>` and `Test-Change: tests/hold.test.ts <reason>` (both files are M-rows; requireTestChangeCitations blocks the handoff without them).

## Doc checklist

- docs/guide/phases.md — cap sentence names merge bounces.
- docs/guide/setup.md — `fix_rounds` bullet names merge bounces.

## Verification

| Criterion | Proof | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1 merge->check.fix increments fix_rounds | `bun test tests/phase.test.ts` — conflict-leaf assertion fix_rounds 1 | counting condition misses merge origin | seconds | any src/phase.ts or test change |
| 2 capped merge leaf fails like check.repair, failure names merge | same file — capped-leaf `moved failed` + failure object assertion | cap origin or failure.phase wrong | seconds | same |
| 3 `--red-on-base` hold leaves fix_rounds unchanged | `bun test tests/hold.test.ts` — holder fix_rounds assertion | hold path gaining a count | seconds | hold or phase change |
| 4 docs state merge bounces count | `grep -n "bounce" docs/guide/phases.md` | missing doc statement | seconds | doc edit |
| 5 blocking checks | `bun run format && bun test --timeout=30000 && bun run typecheck` | regressions, type and format drift | minutes | before every handoff |
