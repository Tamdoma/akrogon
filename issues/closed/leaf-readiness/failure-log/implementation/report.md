# Report: failure-log

## Changed files and reasons

- `src/log.ts` — `logMove` appends `failure: after.failure` to the log record when state holds a failure (i.e. moves into `failed`), omits the key on all other moves (D1). `commitMove` passes `announced` as `after`, so `delivery` persisted by `announceFailed` is included.
- `tests/phase.test.ts` — new test `a failed move logs the state failure object while a moved record omits failure and prints in status`, proving criteria 1 (`blocked` move's `failure` deep-equals `readState(path).failure`, including `delivery: 'shown'`) and 3 (non-failed `implement` record has no `failure` key; `status log-failure` exits 0 and prints its raw line under `History:`).
- `tests/next.test.ts` — extended `misses` test: last `log.jsonl` record's `failure` deep-equals state `failure` with `cause: 'attempts'` (criterion 2).

Total: +42 lines across 3 files. No `status.ts` change — non-strict `logSchema` passes the key through (D3, proven by the status assertion).

## Commands run

- Worker (worktree `failure-log-u1`, commit `145da0f`): `bun test --changed=b2c15ec... --timeout=30000` → 191 pass / 0 fail; red-first confirmed (assertions failed with `received undefined` before the `log.ts` edit).
- Lane after cherry-pick `ad67158`: `bun test --changed=$AKROGON_BASE --timeout=30000` → **191 pass, 0 fail** across phase.test.ts + next.test.ts (~7s).
- `bun run format` → all files unchanged.
- `bun run typecheck` (`tsc --noEmit`) → clean.
- `bun test --timeout=30000` (full suite) → **358 pass, 0 fail** (~11s).

Base: `b2c15ec5d2fe889e158934b084dd93cfeafc9f72`. Head: `ad67158` on `failure-log`. Worker worktree removed; lane clean.

## Known limitations

- Existing `failed` records in `log.jsonl` keep no `failure` key (design exclusion: no backfill).
- `failure` is not displayed by `akrogon status` (design exclusion: no new display).

## Unverified criteria

None — all three done-criteria verified by the passing runs above.
