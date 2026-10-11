# Chart: red-base-wait

## Destination
A red main never stops, parks or fails a leaf by itself: a completed check failure that also fails without the change is recorded as known-red and the leaf continues, while missing coverage, incomplete runs and unmet criteria still block; the operator is told once per newly red check, and no leaf reuses earlier base results. Repo: akrogon. Sources: Tamdoma/akrogon#76, Tamdoma/akrogon#77.

## Forks taken
- [Waiting leaf](forks/waiting-leaf.md): no leaf waits or fails on a red main; a leaf is blocked only by failures it introduces, compared per test
- [Comparison](forks/comparison.md): seat-written per-test record checked for function only; incomplete runs block; one same-command retry before the base run
- [Merge gate](forks/merge-gate.md): merge uses the same per-test rule against the stack's target; the repo hold and hold-fix/unhold are retired
- [Red record](forks/red-record.md): one entry per failing test, cleared only by a green run on landed main; it only dedupes notices; no automatic repair
- [Base evidence reuse](forks/base-evidence-reuse.md): no reuse; every comparison runs the base side fresh
- [Evidence expiry](forks/evidence-expiry.md): dissolved by the no-reuse cut
- [Worktree location](forks/worktree-location.md): delegated to framework worktree-isolation (`~/.akrogon/worktrees/<repo>/<slug>`, guard, migration, `akrogon base-run`)

## Open forks

## Fog

## Off route
- Task-copy location, ancestor guard, migration and the base-run verb: framework issues/chart/worktree-isolation.
- main-health-from-framework (issues/chart/sources/): superseded by this chart, kept as source input.
- Fixing the consumer's red checks (C8, motion-probe): framework defects.
- Load flakes and test-run throttling: owned by merge-load-flakes (#69).
- A general check-result cache: rejected in check-reruns.
- Reusing the repo-pause boolean as a health hold: manual passes bypass pause (repo-pause chart, src/pause.ts:48-63).
- Cancelling seats already running when a red is recorded.
- Automatic repair leaves, seed filing or fix-owner tracking for red tests (red-record cut).
- A wait state or release trigger for held leaves: dissolved by waiting-leaf (nothing waits).

## Territory map
Merged: slots/map-merged.md (A: slots/map-A.md, B: slots/map-B.md).

Handed off 2026-10-10
