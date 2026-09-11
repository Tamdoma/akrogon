# Intake: repo-active-cap

## Scope
Add an optional per-repo `max_active` in `issues/config.yaml` so a registered repo cannot take more than its share of the machine-wide pool. The global `max_active` stays the ceiling. One leaf.

## Provenance
- Operator: charting-claude session, 2026-09-11

## Source: operator charting-claude 2026-09-11
> no, the max_active has to be max_active on that particular repo. We need to fix that. Do you agree?

> but if I only have that number, how can I spread it across repos?

> ok, chart it

## Agent findings
- `src/config.ts` line 13: global `max_active` defaults to 3; `repoSchema` at line 26 is strict and has no cap key.
- `src/next.ts` `activeCount` (line 261) sums live non-merged leaves across all registered repos, charging the full global cap for an unknown registration and leaves plus unreadable count for an unreadable inventory. `allocate` (line 293) refuses a new tab only when that machine-wide sum reaches the global cap.
- `sweepAll` (line 524) walks repos in registration order, so the first repo with eligible leaves fills the pool first. This is the starvation the operator saw coming for a second repo.
- Tests already cover the machine-wide cap across two repos (`tests/next.test.ts` line 460) and single-repo caps at lines 369, 392, 837, 847, 926. `configure(f, ...)` at line 772 writes global config in fixtures.
- Guide pages describing the cap: `docs/guide/install.html` lines 67 and 79, `limits.html` line 58, `next.html` lines 64 and 81, `in-practice.html` lines 104 and 124, `cheat.html` lines 82 and 87. `docs/guide/setup.html` shows the repo config keys.
- The operator raised the global cap from 3 to 6 in the tool `config.yaml` during this session, uncommitted.
