# Chart: night-flow

## Destination
Work keeps moving overnight in every registered repo: no repo-wide stop exists, a red main or a seat fault never ends a leaf in `failed`, a wrong plan decision is corrected inside the leaf, and `failed` means a human is genuinely needed. Repo: akrogon. Sources: Tamdoma/akrogon#79, #80, #81, #82, #83, #84, #85.

Route: lifecycle, debate no. Operator, 2026-10-11, verbatim: "1s, 2a, 3a" (1s read as 1a, go-ahead).

## Pitfalls avoided
- P1 (owner operator, done 2026-10-11 at the operator's 3a): akrogon `issues/config.yaml` gains `setup: bun install --frozen-lockfile`, so a fresh akrogon worktree gets `node_modules` before its checks (C, slots/stop-rules-final-check-C.md:11).

## Forks taken
- [Stop rules](forks/stop-rules.md): the repo hold goes through known-red-merge (S1 revised at handoff, 4a); the round cap no longer fails a leaf, B names the plan problem and A fixes the plan; the ancestor guard runs only at worktree creation
- [Failed exits](forks/failed-exits.md): before merge a red that also fails on main lets the leaf continue under the waiting-leaf lock; seat start and prompt faults retry on the next pass instead of failing
- [Keep running](forks/keep-running.md): the watch stays an informal habit nothing depends on and never self-deletes; every registered checkout pushes its committed issue-record history and follows main without touching uncommitted edits (#80, #84)
- [Sibling breaks](forks/sibling-breaks.md): A refreshes onto main at the start and end of each pass, and B reviews only the range-diff; no sibling-naming rule; a cheap check runs in the leaf's own check, never only at merge

## Open forks
None.

## Fog
None.

## Off route
- leaf-env-file's 11.4% refusal domain and Bun's `$NAME` expansion versus `parseEnv` (forwarded note, B rebuttal RB3/RB4): owned by worktree-isolation leaf-env-file (merged); a separate seed if Bun-loaded values must match.
- leaf-env-file's encoder decision: already replaced at 05:53Z by the operator side (parser-checked rule); stays in worktree-isolation.
- A repeat-until-ack alarm: rejected by B and C; fewer stops instead.
- A separate runtime checkout for records (L5a): rejected by B and C in keep-running.
- Live-rig rounds (#79): delivered by test-proof-rules `732c896`; closed 2026-10-11.
- Naming affected siblings in contracts (B F11): declined in sibling-breaks (2a).
- framework's own `issues/config.yaml` cheap-check placement: done as an operator step on framework main, `c45d6693f` (chart-framework L9).
- pre-merge-red (S4): delivered by known-red-leaf (merged 2026-10-11, `deec699`, `ca71075`, `327d4bf`); dropped with the known-red-leaf amendment (B,C, slots/handoff-review-B.md, slots/handoff-review-C.md).
- hold-retire (S1) and the known-red-merge amendment: dropped at handoff, operator "4a"; known-red-merge retires the repo hold (forks/stop-rules.md, S1 revised at handoff).

## Proposed leaves (one issue, parallel)
- plan-not-cap (S2), guard-at-creation (S3) from stop-rules
- seat-retry (S5) from failed-exits
- records-sync (R), watch-steady (W) from keep-running
- locked-setting-proof: one chart-skill sentence, a locked third-party setting is proven in its exact locked form (#81; A,B,C)
- pass-refresh (1a), cheap-check-placement (3a) from sibling-breaks; pass-refresh is blocked by plan-not-cap

## Territory map
Merged: slots/map-merged.md (A: slots/map-A.md, B: slots/map-B.md, C: slots/map-C.md).

Handed off 2026-10-11
