# Review A: merge-attempt-records

Base: `2e78945`. Reviewed head: `52bd80e` (`085b9c0`, `2db9afd`, `1450393`, `8c9f902`, `52bd80e`).

## Evidence

- Diff inspection: `src/attempts.ts` mirrors `src/log.ts` (schema + `appendFileSync`, no new lock — every call site runs inside `withLock(globalHome/.lock)`); six append sites match plan D3/D4.
- Exactly-once trace: `batchPush` unconditional append is safe — every re-entry to `pushed.code === 0` is blocked by the dissolve throw (member lost mid-move), `Merged is terminal` (holder already moved), or reconcile landing paths guarded by `batch.recorded`/`phase === 'merge'`. `finishPush` persists `recorded: true` so a refused-then-landed replay under the same `attempt` cannot double-append. Reconcile `red` discard is gated on `fresh.state.phase === 'merge'`, so a solo `check.fix` (holder now `check.fix`, batch retained) does not replay — the defect the mid-implementation fix commit `2db9afd` repaired.
- `bun test tests/merge-attempts.test.ts --timeout=30000`: 7 pass, 0 fail (fresh run this pass).
- `mergeWake` in `src/akrogon.ts:75` runs `mergePass`/`reconcileBatch` inside every committed `phase` call, so the phase-call tests exercise the recovery double-append path live, not just `next`.
- Recovery test pushes `refs/heads/hold:main`, making `record.top` an ancestor — the lost-push-reply path of criterion 1.
- `docs/guide/files.md` section matches the shipped schema; all ten fields documented, `held`/`ejected` correctly attributed to other leaves.
- `checks` all run green by A this pass (`bun run format`, `bun test` 610 pass, `bun run typecheck`, `test_changed` 489 pass).
- `Test-Change:` trailers: `git log 2e78945..HEAD` has none; the only changed test path is the new `tests/merge-attempts.test.ts`, which needs none.
- Deliberate-break proof recorded in worker return (unconditional `merged` in `batchPush` turned the reuse case red, then reverted).

## Findings

### Fix

None.

### Nit

1. `src/AREA.md` "Key files" does not list `src/attempts.ts`, the interface module red-main-hold and red-batch-culprit import for `appendAttempt`. Concern: dependents discovering the interface by the area file will miss it. Deferred: AREA.md does not claim to be a complete file list and the interface is discoverable via `grep appendAttempt`; promotion evidence would be a dependent leaf failing to find it or AREA.md convention requiring all exported modules.
2. `attemptRecordSchema` uses `z.string()` for `end`/`start` where `logSchema` uses `z.iso.datetime()` for `ts`. Concern: the exported schema accepts non-datetime strings while sibling schemas constrain them. Deferred: writers are all in this codebase and always produce ISO datetimes; promotion evidence would be a consumer reading foreign lines or a downstream schema reuse.

## Reusable lesson recorded

`learnings/LESSONS.md` + `learnings/history/2026-10-10-attempt-record-replay.md` in the registered checkout, uncommitted, left for the operator: persistent state records create replay surfaces; exactly-once appends need a persisted `recorded` flag and a holder-phase gate.

## Verdict

`nits`
