# Plan: unreadable-capacity

Debate off. Direct synthesis from brief plus locked design plus live code.

## Read first

- `src/next.ts` lines 265-284 (`activeCount`), lines 60-120 (`discover`, `report`, `Inventory`)
- `tests/next.test.ts` lines 699-715, 1111-1134, 1353-1373, 1496-1511, 2334-2359, helpers at 1045-1067
- `tests/helpers.ts` lines 60-90 (`leaf`, `fixture`, `fakeHerdr`)
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`
- `learnings/LESSONS.md`

## Decisions

D1: Per repo contribution in `activeCount` becomes `inventory.unknown ? global.max_active : liveReadable + inventory.unreadable` where `liveReadable` uses the normal rule only.
D2: Normal rule is one predicate used in both branches: phase is not merged and not failed and a live pane has `pane.tab_id` equal to the recorded tab or its cwd inside the recorded worktree.
D3: Keep `registered.unknown` full hold, foreign exclusion, `discover`, `report`, stderr JSON shape, and nonzero exit on any skip unchanged.
D4: Keep `findLeaf` and `allLeaves` strict. No change to `src/phase.ts`, no new door contract, no category exemption by file location.
D5: Update the three existing capacity tests to the new counts instead of adding tolerance. Keep the failed, existing-tab, duplicate-slug, foreign-summary, and unknown-population tests passing unchanged where the new rule gives the same result.
D6: New regression test uses two repos at `max_active` 3 with explicit dispatch order so it fails on current code and passes on new code.
D7: New negative test uses `max_active` 1 with one unreadable entry and asserts zero tabs and zero prompts with nonzero exit.

## Interfaces needed

- `activeCount(global, invocation): Promise<number>` keeps its signature.
- `Inventory` keeps `{ leaves, unreadable, unknown, foreign }`. `discover` output is trusted as is.
- `panes()` is the live pane source. `inWorktree(pane.cwd, leaf)` plus `pane.tab_id === leaf.state.tab` is the liveness check.
- CLI inputs used by tests: `next --all` for sweep order plus `next [<slug>]` for explicit dispatch. Skip lines are parsed from stderr JSON per line.

## Acceptance criteria

C1: `activeCount` counts each readable leaf once by D2 and adds `inventory.unreadable` when above zero. Unknown hold stays full.
C2: Existing test at 699-715 with one malformed entry and two waiting leaves at `max_active` 2 allocates exactly one leaf.
C3: Existing test at 1111-1134 with one live leaf plus two unreadable entries blocks `new` at capacity 3 and allocates `new` at capacity 4.
C4: Existing test at 1353-1373 admits the healthy leaf at `max_active` 2 while still emitting the malformed skip plus the foreign summary.
C5: New regression test from D6 allocates exactly two leaves across repos, counted occupancy reaches three with the unreadable reservation, stderr keeps the structured line, exit is nonzero, and the test fails on current code.
C6: New negative test from D7 allocates nothing at `max_active` 1 with one unreadable entry.
C7: Failed-leaf exclusion at 2334-2359, existing-tab continuation at 1496-1511, duplicate-slug rejection, and foreign summary behavior keep passing.
C8: Unreadable entries still print structured stderr and `akrogon next` exits nonzero when any entry was skipped.
C9: `bun run format`, `bun run typecheck`, and `bun test` pass.

## Checklist

1. `src/next.ts` `activeCount` only: replace the unreadable branch that counts all non-failed leaves with D1 plus D2. Covers C1 and C8 path stays intact.
2. `tests/next.test.ts` 699-715: change `max_active` 2 expectation from zero tabs to exactly one tab and one allocation, keep one skip with malformed path and exit 1. Keep the `max_active` 4 retry allocating both. Covers C2.
3. `tests/next.test.ts` 1111-1134: split expectation by capacity. At 3 assert `new` stays unallocated with one tab and one prompt. At 4 assert `new` allocates with two tabs. Keep both skips and exit 1. Covers C3.
4. `tests/next.test.ts` 1353-1373: change zero-tab expectation to admit `healthy` with one tab, keep two skips with malformed path plus foreign count 2 and exit 1. Covers C4 and C7 foreign part.
5. `tests/next.test.ts` new regression test for C5: register two repos at `max_active` 3. First repo has one malformed entry, at least three merged leaves, and two waiting leaves with no live panes. Second repo has one waiting leaf with no live panes. Dispatch second repo leaf explicitly, then one first-repo waiting leaf explicitly, assert both allocate. Attempt the remaining waiting leaf explicitly and assert it stays unallocated with no new tab. Assert total allocated is two, skips include the malformed path, exit is nonzero. Verify it fails before the fix.
6. `tests/next.test.ts` new negative test for C6: one malformed entry plus one waiting leaf at `max_active` 1. Run `--all`, assert zero tabs, zero prompts, one skip, exit 1.
7. Run verification in worktree and record the real CLI run outside the repo per standing design. Covers C9.

No agent doc or human guide is affected. `docs/guide` does not state the old unreadable rule.

## Concrete verification

- `bun run format`
- `bun run typecheck`
- `bun test tests/next.test.ts` with stdout and stderr saved to a retained file outside the fixture and outside the repository, preserving the test exit status. Record command plus exit result plus artifact path in the implementation report.
- Full `bun test`
- Confirm C5 fails on current code by running the new regression test before applying the `src/next.ts` change or by stash and rerun.

## Notes

- Brief and locked design agree. No conflict to record.
- Live check: current code at `src/next.ts` counts `phase !== failed` plus unreadable in the unreadable branch, so merged history inflates capacity. That matches Tamdoma/akrogon#39.
- Credentials: design names none, so no env presence check applies.
- Dependencies: none. Runs in parallel with keep-chart-in-place.
- Open limitation: an unreadable entry reserves one slot even when the corrupt file holds a merged leaf. The count cannot tell merged from active without reading the file.
