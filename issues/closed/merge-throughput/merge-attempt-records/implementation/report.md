# Implementation report: merge-attempt-records

## Changed files and reasons

- `src/state.ts` — `batchSchema` gains `started` (batch creation time) and `recorded` (append-once flag).
- `src/attempts.ts` (new) — `attemptOutcomeSchema` (`merged|red|split|held|reuse|ejected`), `attemptRecordSchema`, `Outcome`, and `appendAttempt(repo, holder, batch, outcome, culprit?)` appending one JSON line to `issues/merge-attempts.jsonl`, mirroring `src/log.ts`. Interface for red-main-hold (`held`) and red-batch-culprit (`ejected`, `culprit`).
- `src/next.ts` — `started` written at batch creation in `mergeTurn`; `reconcileBatch` appends `merged`/`reuse` inside the `holderNow.state.phase === 'merge'` landed branch, appends and persists `recorded: true` in the failed-holder landed branch, and appends `red` on unlanded discard only for a `merge`-phase, unrecorded batch.
- `src/phase.ts` — `batchPush` appends `merged`/`reuse` at a successful push then persists `recorded: true` on the record; `finishPush` appends at the verified landing and persists `recorded: true`; `phaseCommand` appends `split` on the `check.fix` member split and `red` through `transition`'s `onCommitted` on the solo `check.fix`.
- `tests/merge-attempts.test.ts` (new) — 7 serial cases covering criteria 1–5 (see below).
- `docs/guide/files.md` — new `## merge-attempts.jsonl` section documenting the file and all fields.

`src/log.ts`, `issues/log.jsonl` and its readers unchanged.

## Commits

- `085b9c0` writer, `started`, six call sites (worker U1, cherry-picked)
- `2db9afd` `recorded` flag + reconcile phase guards — fixes a double-append: `mergeWake`/`reconcileBatch` re-entered the landed/discard branches on the surviving batch record after `phase merged`/`check.fix`/`reuse` pushes, writing a second line (found by worker U2's failing exactly-one assertions; fix mechanism: `batch.recorded` persisted where the record survives, plus appends gated on holder phase `merge`)
- `1450393` files.md section (worker U3, cherry-picked)
- `8c9f902` tests/merge-attempts.test.ts (worker U2, cherry-picked)
- `52bd80e` prettier formatting of the `finishPush` append

Base: `2e78945`. Head: `52bd80e`.

## Commands run

| Command | Result | Wall time |
|---|---|---|
| `bun run format` | pass; also rewrote pre-existing drift in `src/status.ts` (untouched by the leaf), reverted per the known lesson | seconds |
| `bun test --timeout=30000` | 610 pass, 0 fail, 30 files | 49.74s |
| `bun run typecheck` | clean | seconds |
| `bun test --changed="$AKROGON_BASE" --timeout=30000` | 489 pass, 0 fail, 15 files | 36.47s (lane re-run after cherry-picks: 482 pass / 35.44s pre-wave-2) |

## Done-criteria evidence

1. Green holder+2 members → one `merged` line, both members, `start < end`: `tests/merge-attempts.test.ts` green-batch case (pass). Recovery merge via `next` reconcile: landed-candidate case (pass).
2. `red` solo, `split` batch, exactly one `reuse` at the landing push: three cases in `merge-attempts.test.ts` (pass). Deliberate break (`batchPush` appending `'merged'` unconditionally) turned the reuse case red, then reverted (worker log).
3. Unlanded candidate discarded by `reconcileBatch` → one `red` line: discard case (pass).
4. `log.jsonl` unchanged: test asserts pre-existing bytes are a strict prefix and every appended line parses as `logSchema` (whole-file byte equality cannot hold — `logMove` appends per committed move; plan.md implementation note).
5. Stale `--attempt` and non-holder `merged` calls append nothing: refused-calls case (pass).
6. `docs/guide/files.md` documents the file and every field: grep `merge-attempts` shows the section and all ten fields.
7. Blocking `checks`: all green (table above).

## Known limitations

- `mergeTurn`'s never-pushed stale-record discard writes no line (plan's named limitation); turn time for never-pushed attempts stays unmeasured.
- Batches in flight at upgrade write `start` absent; schema allows it.

## Unverified criteria

None.
