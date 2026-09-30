# Implementation report: guarded-peer-wait

Single unit, one wave of one worker (brief-1). Worker commit `8a01c36` cherry-picked clean onto the lane as `d57a64e`. No lane repair needed.

- Base: `f71f559982c3d3159510f8bbd5a98d1aab391b94`
- Committed head: `d57a64e6e97a4536836b48224fac730370c2e9bb`

## Changed files and reasons

- `skills/chart-issues/assets/questions.md` (1 line changed): replaced the old peer-wait sentence starting `For each named peer, use the supported herdr interface` with the locked taken wording verbatim (guarded prompt, bounded repeated waits, `blocked` to operator, return-file read). This is the whole leaf (plan D1-D5).

## Done-criterion evidence

- C1 (taken wording present): `sed -n '44p' skills/chart-issues/assets/questions.md` shows the new sentence verbatim; `grep -c "herdr agent prompt <pane>.\+herdr agent wait <pane> --timeout <T>"` on that line returns 1. Worker paste of the full line 44 matches the design taken wording.
- C2 (readiness sentence unchanged): `grep -F -c 'Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.'` returns 1.
- C3 (no old phrase): `grep -rn "without a timeout" skills docs README.md` prints nothing, exit 1. Hygiene sweep `grep -rn "supported herdr interface" skills docs README.md src` also empty.
- C4 (blocking checks pass): `bun test` 339 pass 0 fail; `bun run format` exit 0 (all unchanged); `bun run typecheck` exit 0.

Stale-copy sweep (`herdr agent wait` across skills/docs/README/src) finds only the new target line plus the unrelated `skills/watch-issues/SKILL.md:40` steer rule, which already uses a bounded `--timeout 10000` and is out of scope per D4.

No test file added (plan D3, vanity-test rule); no bug fixed, so no before/after bug proof applies.

## Commands run (A on lane, after cherry-pick)

- `AKROGON_BASE=f71f559982c3d3159510f8bbd5a98d1aab391b94 bun test --changed="f71f559982c3d3159510f8bbd5a98d1aab391b94"` → exit 0, 0 pass 0 fail, no test files affected (seconds).
- `bun test` → 339 pass, 0 fail, 3937 expects, 15 files. Wall time 82s (minutes).
- `bun run format` → exit 0, all files unchanged (seconds).
- `bun run typecheck` (`tsc --noEmit`) → exit 0 (seconds).
- Proof greps above, all seconds.

Worker commands (in `guarded-peer-wait-u1`, worktree since removed): `bun install` (9 packages), changed-test command exit 0 with no test files affected, `sed`/`grep` proofs as pasted in the wave return. Worker log files lived only in the removed worktree; pastes are in the wave return, no artifact path retained.

## Known limitations

- Same as plan: the operator-routed branches (`agent_prompt_stalled`, prompt `timeout`, `agent_blocked`, pre/post `blocked`) are verified as prose only, not exercised live; wait value T stays caller-chosen below the harness timeout.

## Unverified criteria

- None.
