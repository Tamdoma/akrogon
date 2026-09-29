# Brief: unreadable-capacity

## What
In `activeCount` (src/next.ts:265-284), when a fully enumerated repo has unreadable entries, its contribution becomes the readable leaves counted by the normal rule (not merged, not failed, a live pane in the recorded tab or worktree) plus one per unreadable entry. Unknown-population holds (`registered.unknown`, `inventory.unknown` reserve `max_active`) and foreign-leaf exclusion stay unchanged. `findLeaf`/`allLeaves` stay strict.

## Why
Tamdoma/akrogon#39: with any unreadable entry, the repo counted every readable non-failed leaf, merged history included, plus the unreadable entries. A repo with many merged leaves reached `max_active` and `akrogon next` started nothing anywhere.

## Done-criteria
1. `activeCount` uses the normal activity predicate for readable leaves in both branches and adds `inventory.unreadable` when it is above zero. Each leaf counts once.
2. Existing capacity tests are updated to the new rule: tests/next.test.ts:699-715 at max_active 2 with one malformed entry and two waiting leaves allocates exactly one; tests/next.test.ts:1111-1134 (one live leaf plus two unreadable entries) does not allocate `new` at capacity 3 and allocates it at capacity 4; tests/next.test.ts:1353-1373 admits the healthy leaf at max_active 2.
3. New test: register two repos at max_active 3. The first has one unreadable entry, several readable merged leaves and two waiting leaves with no live panes. The second has one waiting leaf with no live panes. Explicitly dispatch the second repo's waiting leaf, then one waiting leaf in the first repo, and assert both allocate. Explicitly attempt the remaining waiting leaf and assert it stays unallocated. Exactly two leaves are allocated across the repos, and the unreadable reservation brings counted occupancy to three. Preserve structured diagnostics and nonzero exit for the unreadable entry. This regression fails on current code. (A,B)
4. New negative test: max_active 1 with one unreadable entry allocates nothing. Existing failed-leaf exclusion (tests/next.test.ts:2334-2359), existing-tab continuation (1496-1511), duplicate-slug rejection and foreign summary tests keep passing.
5. Unreadable entries still print their structured stderr line and `akrogon next` still exits nonzero when any entry was skipped.
6. `bun run format`, `bun run typecheck` and `bun test` pass.
