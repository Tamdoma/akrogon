# Sub-brief 1: merge-attempts writer, schema field, and call sites

## 1. Goal

Every merge attempt end appends one JSON line to `issues/merge-attempts.jsonl` in the registered repo. You build the writer module, add `batch.started`, and instrument the six attempt-end call sites (plan decisions D1–D4). This leaf owns outcomes `merged`, `red`, `split`, `reuse`; `held` and `ejected` are enum members written by other leaves.

## 2. Acceptance criteria

1. `batchSchema` in `src/state.ts` has `started: z.iso.datetime().optional()`; `mergeTurn` in `src/next.ts` writes `started: new Date().toISOString()` in the batch-creation literal (`const next: Batch = { attempt: attemptId(), ... }`). The conflict-rewrite literal at ~line 1184 keeps the existing `started` unchanged.
2. New `src/attempts.ts` exports `attemptOutcomeSchema = z.enum(['merged','red','split','held','reuse','ejected'])`, `type Outcome = z.infer<typeof attemptOutcomeSchema>`, `attemptRecordSchema`, and `appendAttempt(repo: Repo, holder: string, batch: Batch, outcome: Outcome, culprit?: string): void`. The record fields: `attempt` (batch.attempt), `repo` (repo.name), `holder` (argument), `members` (`batch.members.map(m => m.slug)`), `built_on` (batch.built_on), `tested_top` (batch.tested_top, optional in schema), `outcome`, `culprit` (optional, present only when passed), `start` (batch.started, optional in schema — absent on old records), `end` (set by appendAttempt via `new Date().toISOString()`). Append uses `appendFileSync` to `resolve(repo.root, 'issues/merge-attempts.jsonl')` + `JSON.stringify(record) + '\n'`, mirroring `src/log.ts`. No reader function is added.
3. `src/phase.ts`, `batchPush`: when `pushed.code === 0`, `appendAttempt(repo, leaf.state.slug, record, record.decision === 'reuse' ? 'reuse' : 'merged')` placed immediately before the member `commitMove` loop.
4. `src/phase.ts`, `finishPush` landed branch: inside `withLock`, after the attempt-match guard and before `saveState(leaf.path, {...batch, applied: true, top: pending.candidate})`, `appendAttempt(repo, slug, batch, batch.decision === 'reuse' ? 'reuse' : 'merged')` using the freshly read `batch`, never `pending.record`.
5. `src/phase.ts`, `phaseCommand` `check.fix` split branch (`record.members.length > 0`): after `saveState(leaf.path, { ...readState(leaf.path), batch: undefined, batch_limit: limit })`, `appendAttempt(repo, leaf.state.slug, record, 'split')`.
6. `src/phase.ts`, `phaseCommand` `check.fix` solo branch (members empty → `transition`): wrap the callback `() => { appendAttempt(repo, leaf.state.slug, record, 'red'); onCommitted(); }` so the line is written only when the move commits.
7. `src/next.ts`, `reconcileBatch`: landed branch — `appendAttempt(repo, holder.state.slug, batch, batch.decision === 'reuse' ? 'reuse' : 'merged')` as the first statement inside `if (landed) {`, before member moves. Unlanded discard branch — `appendAttempt(repo, holder.state.slug, batch, 'red')` placed so it runs only when `fresh !== undefined`, immediately before `saveState(fresh.path, { ...fresh.state, batch: undefined })`.
8. No append anywhere else: `logMove`, `readLog`, `issues/log.jsonl` and its readers are untouched; `mergeTurn`'s stale-record discard and dissolved-batch throws append nothing; refused/stale phase calls append nothing.

## 3. Read-first list

- `src/log.ts` — mirror this append/schema pattern.
- `src/state.ts` — `batchSchema`, `withLock`.
- `src/phase.ts` — `batchPush`, `finishPush`, `phaseCommand` batch branches, `transition` signature `onCommitted?: () => void`.
- `src/next.ts` — `reconcileBatch` ~lines 875–941, `mergeTurn` batch literal ~line 1031, rewrite ~line 1184.
- `src/batch.ts` — `attemptId`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/attempts.ts` (new), `src/state.ts`, `src/phase.ts`, `src/next.ts`. No other unit touches these files. `Batch` type comes from `src/state.ts`; `Repo` from `src/config.ts`. Every call site already executes inside `withLock(resolve(globalHome(), '.lock'), ...)` — take no new lock.

## 5. Do-not, reasons and exceptions

- Do not touch `src/log.ts`, `issues/log.jsonl`, any reader, or any test file: criterion 4 requires them unchanged; tests are another unit's work. Exception: none.
- Do not add a reader, top field, `ts` field, or anything not in the criteria: the leaf owns the schema and dependents pin it. Exception: a revised brief from A.
- Do not append on restack, refusal, error, dissolved batch, or `mergeTurn` stale-record discard: done-criterion 5 and the plan's D4. Exception: none.
- Return a mismatch with evidence instead of widening scope or changing an interface; the exception is a revised brief from A.

Reasons and exceptions restated: log readers stay untouched (criterion 4, no exception); schema stays minimal (interface pinned for red-main-hold/red-batch-culprit, exception is a revised brief); append sites are exactly the six listed (criterion 5, no exception).

## 6. Ordered steps

1. `src/state.ts`: add `started` to `batchSchema` (criterion 1).
2. `src/attempts.ts`: create the module (criterion 2).
3. `src/phase.ts`: three appends in `batchPush`, `finishPush`, `phaseCommand` split branch, plus wrapped `onCommitted` in the solo branch (criteria 3–6).
4. `src/next.ts`: `started` in the creation literal; two `reconcileBatch` appends (criteria 1, 7).
5. `bun run typecheck` to confirm signatures.

Advisory size: 4 files, under 25 turns.

## 7. Commands

```sh
bun install
AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36 && bun test --changed="$AKROGON_BASE" --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Schema field added, new module exported, six call sites appending per the table above, typecheck clean, changed-tests run reported. Commit your chunk with a `merge-attempt-records:` prefix message; return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
