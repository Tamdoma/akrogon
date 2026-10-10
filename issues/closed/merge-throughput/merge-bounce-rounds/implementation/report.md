# Report: merge-bounce-rounds

## Changed files and reasons

- `src/phase.ts` — `commitMove` counts `fix_rounds` on `merge -> check.fix` (D1); `transition` cap treats `merge` origin like `check.repair` and records `failure.phase` from `state.phase` so the record names `merge` (D2).
- `tests/phase.test.ts` — `conflict` merge bounce expects `fix_rounds` 1; `capped` merge leaf at the cap expects `moved failed` with `{ cause: 'attempts', phase: 'merge', slot: 'B', reason: 'fix rounds exhausted', delivery: 'shown' }`, `herdr.env` passed for `announceFailed`. Changed under brief criteria 1-2.
- `tests/hold.test.ts` — batch `--red-on-base` fixture sets `fix_rounds: 1`, asserts still 1 after the hold (criterion 3, D3).
- `docs/guide/phases.md`, `docs/guide/setup.md` — cap sentence and `fix_rounds` bullet name merge bounces (criterion 4).

## Commands run

- `bun test tests/phase.test.ts tests/hold.test.ts` — before code: 68 pass / 1 fail (red proof: fix_rounds stayed 0); after: 69 pass / 0 fail. (worker, unit U1)
- `AKROGON_BASE=3fde73f7197f35ea17ba2ff06c0705c535f9f75e bun test --changed="$AKROGON_BASE" --timeout=30000` — 91 pass / 0 fail, 3 files. (worker)
- `bun run format` — clean; rewrote unrelated pre-existing drift in `src/status.ts` (known lesson 2026-10-08), reverted, lane diff untouched.
- `bun run typecheck` — pass.
- `bun test --timeout=30000` — 631 pass / 0 fail, 32 files, ~46s wall time.
- `grep -n "bounce" docs/guide/phases.md docs/guide/setup.md` — criterion 4 lines present.

## Base and head

- Base: `3fde73f` (AKROGON_BASE). Committed head: `2595d71` — cherry-picked worker commit `e4dfe91`, trailers carried.

## Criterion evidence

1. merge -> check.fix increments fix_rounds — phase.test.ts `conflict` leaf assertion 1.
2. capped merge leaf fails like check.repair, failure names `merge` — phase.test.ts `capped` leaf `moved failed` + failure record.
3. `--red-on-base` hold leaves fix_rounds unchanged — hold.test.ts batch hold assertion.
4. docs state merge bounces count — phases.md:108, setup.md:60.
5. blocking checks — all three pass.

## Known limitations / unverified criteria

None known; no unverified criteria. Worker U1 returned no limitations; its brief, commit and tests were verified before landing.
