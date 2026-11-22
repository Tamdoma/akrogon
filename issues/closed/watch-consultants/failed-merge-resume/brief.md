# Brief: failed-merge-resume

## What

A leaf that failed in `merge` while its `batch` record says `applied: true` with no candidate, moved `failed -> merge` with `akrogon phase` and then dispatched with `akrogon next` after the base moved, is rebased onto the new base and never dispatched on its stale attempt or top.

## Why

The watch (leaf watch-consults) resumes a failed merge leaf after its consultant pushes a base fix. `src/phase.ts` `commitMove` keeps `batch` when leaving `failed`, and `src/next.ts` `reconcileBatch` returns early in `merge` without a candidate, so `mergeTurn` may prompt seat B on the stale pre-fix attempt (slot C, slots/fix-and-config-rebuttal-c.md Q3). The existing test covers a landed candidate only, and the framework log's recovery shows no batch fields (slot B rebuttal Q3), so the case is unproven either way.

## Done-criteria

1. Red first: a leaf in `failed` from `merge` with `batch` `{applied: true, owner: seat}` and no candidate, whose remote default branch then gains a commit, after `akrogon phase <slug> merge` and `akrogon next <slug>`, has its next merge attempt built on the new base, and no prompt or attempt names the stale attempt or top. The test fails on the base before the fix when the stale path exists; when it already passes on the base, the leaf records that with the test's output and changes no product code. Proof: own test in `bun test` at the command boundary.
2. A failed holder with a landed candidate still moves back and reconciles without run or push. Proof: the existing batch tests in `bun test` stay green unchanged.
