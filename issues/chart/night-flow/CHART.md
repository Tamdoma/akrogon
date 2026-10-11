# Chart: night-flow

## Destination
Work keeps moving overnight in every registered repo: no repo-wide stop exists, a red main or a seat fault never ends a leaf in `failed`, a wrong plan decision is corrected inside the leaf, and `failed` means a human is genuinely needed. Repo: akrogon. Sources: Tamdoma/akrogon#79, #80, #81, #82, #83, #84, #85.

Route: lifecycle (debate not yet asked)

## Forks taken
- [Stop rules](forks/stop-rules.md): the repo hold goes, a red merge makes only that leaf wait for main to move; the round cap no longer fails a leaf, B names the plan problem and A fixes the plan; the ancestor guard runs only at worktree creation
- [Failed exits](forks/failed-exits.md): before merge a red that also fails on main lets the leaf continue under the waiting-leaf lock; seat start and prompt faults retry on the next pass instead of failing
- [Keep running](forks/keep-running.md): the watch stays an informal habit nothing depends on and never self-deletes; every registered checkout pushes its committed issue-record history and follows main without touching uncommitted edits (#80, #84)

## Open forks
- [Sibling breaks](forks/sibling-breaks.md): when a sibling's merge breaks a running leaf, how it finds out early and gets back to merge fast, and whether charting names affected siblings

## Fog
None.

## Off route
- leaf-env-file's 11.4% refusal domain and Bun's `$NAME` expansion versus `parseEnv` (forwarded note, B rebuttal RB3/RB4): owned by worktree-isolation leaf-env-file (merged); a separate seed if Bun-loaded values must match.
- leaf-env-file's encoder decision: already replaced at 05:53Z by the operator side (parser-checked rule); stays in worktree-isolation.
- A repeat-until-ack alarm: rejected by B and C; fewer stops instead.
- A separate runtime checkout for records (L5a): rejected by B and C in keep-running.
- Live-rig rounds (#79): delivered by test-proof-rules `732c896`; close offered.

## Proposed leaves (one issue, parallel)
- hold-retire (S1), plan-not-cap (S2), guard-at-creation (S3) from stop-rules
- pre-merge-red (S4), seat-retry (S5) from failed-exits
- records-sync (R), watch-steady (W) from keep-running
- locked-setting-proof: one chart-skill sentence, a locked third-party setting is proven in its exact locked form (#81; A,B,C)
- amendments in place: known-red-merge (S1), known-red-leaf (S4)

## Territory map
Merged: slots/map-merged.md (A: slots/map-A.md, B: slots/map-B.md, C: slots/map-C.md).
