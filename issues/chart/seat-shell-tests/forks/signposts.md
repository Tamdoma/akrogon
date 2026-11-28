# Signposts: seat-shell-tests

Original, door session opened 2026-11-28 by A (t126). Proposed answers come from issues/chart/unblocked-runs/forks/signposts.md (2026-11-25).

## Question

1. What wins when picks trade off? 1a (recommended) less code and fewer moving parts first, then speed and price, then breadth. 1b breadth of coverage first. Steers every fork's recommendation.
2. When a fix can remove the fragile part or guard it, which way? 2a (recommended) remove or reuse what exists (the test preload tests/isolation.ts and the #164 helper isToolEntryDir) and add nothing new unless nothing existing can carry it. 2b add guards in each affected test. Steers the mechanism.
3. How far does the fix reach? 3a (recommended) the whole bug class #165 names, on every path with the same pattern: direct test runs and the test wrappers realBash renders. 3b only the failing direct run. Steers the leaf scope.
4. How finely to split? 4a (recommended) fewest leaves that keep each outcome checkable, here likely one. 4b one leaf per observation. Steers lifecycle cost.

## Taken

## Needs

none (no keys, accounts, live outside changes or paid runs foreseen)
