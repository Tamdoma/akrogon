# Report #131: pinned hc schema

## Question

Q1. Is Tamdoma/akrogon#131 fully delivered on main, and what finishes it?

### Carries

Signposts 3a, 4a (forks/signposts.md). Map: slots/map-merged.md `## #131`.

## Findings

- 47186f90 (2026-11-08 10:06 CET) changed "the parts of hc schema akrogon parses match the pinned copy" from `spawnCaptured(['hc','schema'])` (startup env, reached the operator core) to `core.hc(['schema'])` on a fixture core (`hcCore`, `cleanEnv`), and refreshed `tests/fixtures/hc-schema.json`. Report base 75f61f00 is an ancestor of 47186f90; report leaf head 6d6ef4bc is not. (A,B,C)
- Observation, A, 2026-11-09, main 49d2c916, hc 0.1.19: `bun test --timeout=30000 tests/hc-identity.test.ts -t "pinned copy"` pass (70 ms); again with `HC_SESSION=default` exported, pass. Limits: proves the test no longer reads the session the environment names; does not audit other spawns.
- Other env-less spawns in tests (C): recorded only under signpost 3a.

## Taken

A's pick under full autopilot, 2026-11-09: delivered by 47186f90; close Tamdoma/akrogon#131 naming it; no leaf. Reason: signpost 4a and unanimous evidence (A,B,C). Rejected: a regression leaf (the existing test is the regression proof); a suite-wide spawn audit (signpost 3a). No standing dissent.
