# Plan: merge-attempt-records

Every merge attempt end appends one JSON line to `issues/merge-attempts.jsonl` in the registered repo, written by the command under the same global lock its call sites already hold. This leaf owns the line schema and writes `merged`, `red`, `split`, `reuse`; `held` and `ejected` are enum members only, written by red-main-hold and red-batch-culprit.

## Decisions

- D1. New module `src/attempts.ts` mirrors `src/log.ts`: `attemptOutcomeSchema = z.enum(['merged','red','split','held','reuse','ejected'])`, `attemptRecordSchema` with fields `attempt`, `repo`, `holder`, `members` (slug array), `built_on`, `tested_top` (optional), `outcome`, `culprit` (optional), `start` (optional ISO datetime), `end` (ISO datetime). Exported append `appendAttempt(repo: Repo, holder: string, batch: Batch, outcome: Outcome, culprit?: string): void` writes `end` itself via `new Date().toISOString()`, `start` from `batch.started` (absent when the record predates the field), `members` from `batch.members.map(m => m.slug)`, `tested_top` from `batch.tested_top`. Append is `appendFileSync` to `resolve(repo.root, 'issues/merge-attempts.jsonl')`, same as `logMove`; every call site already runs inside `withLock(globalHome/.lock)`, so no new lock is taken. A `readAttempts` reader is not added: nothing in this leaf consumes the file (YAGNI; tests read the file directly).
- D2. `batchSchema` in `src/state.ts` gains `started: z.iso.datetime().optional()`, written at batch creation in `mergeTurn` (`src/next.ts`, the `const next: Batch = { attempt: attemptId(), ... }` literal). The conflict-rewrite at `src/next.ts:1183` keeps the existing `started`: it is a member removal on the same open attempt, not a new batch creation; `started` stays the batch's creation.
- D3. Outcome per call site:
  - `phase.ts` `batchPush`, `pushed.code === 0`: append before the member `commitMove` loop, so the line exists even if a member move fails. Outcome `reuse` when `record.decision === 'reuse'`, else `merged`.
  - `phase.ts` `finishPush` landed branch: append inside the lock block using the freshly read `batch` (`leaf.state.batch`), not `pending.record` (stale after restack). Outcome `reuse` when `batch.decision === 'reuse'`, else `merged`.
  - `phase.ts` `phaseCommand` `check.fix` split branch (`record.members.length > 0`): append `split` after `saveState(..., batch: undefined, batch_limit: limit)`.
  - `phase.ts` `phaseCommand` `check.fix` solo branch (`members.length === 0` → `transition`): append `red` via `transition`'s existing `onCommitted` callback so the line is written only when the move actually commits.
  - `next.ts` `reconcileBatch` landed branch: append inside the lock before the member `commitMove` loop, outcome `reuse` when `batch.decision === 'reuse'` else `merged`. This covers landing after a lost push reply and the failed-holder survivors variants.
  - `next.ts` `reconcileBatch` unlanded discard branch: append `red` at the top of the discard block (covers both `batch.members.length > 0` and `=== 0` discards, `fresh !== undefined` only).
- D4. No append anywhere else: refused/stale/error phase calls throw before any append; restack writes no line; the `mergeTurn` stale-record discard (`fresh.state.batch?.attempt === recorded.attempt` cleanup) is outside the named recovery range and writes nothing; dissolved-batch throws write nothing.
- D5. `issues/log.jsonl`, `readLog`, `logMove` and all readers are untouched. `docs/guide/files.md` gains a section describing `issues/merge-attempts.jsonl` and each field.
- D6. New test file `tests/merge-attempts.test.ts` (new path, no `Test-Change` trailer needed) using `tests/helpers.ts` `fixture`/`cli`/`leaf`, `tests/fake-herdr.ts`, and the `batchFixture`/`advanceRemote` patterns from `tests/batch-merge.test.ts`.

## Read first

- `src/log.ts` — append and schema pattern to mirror.
- `src/state.ts` — `batchSchema` (add `started`), `withLock`.
- `src/phase.ts` — `batchPush` (green push, refused push, error push), `finishPush` (landed-verify, restack), `phaseCommand` (`check.fix` split and solo branches), `transition` `onCommitted`.
- `src/next.ts` — `reconcileBatch` lines ~875-941 (landed moves and unlanded discard), `mergeTurn` batch creation ~1031 and conflict rewrite ~1183.
- `src/batch.ts` — `attemptId`, `applyStack`, `restoreHolder`, `restoreMembers`.
- `tests/batch-merge.test.ts` — refused-push, reuse, and candidate-snapshot harness patterns.
- `tests/batch-dispatch.test.ts` — `next`-driven reconcile tests (landed candidate, failed published holder, unlanded discard) to copy for recovery criteria.
- `docs/guide/files.md` — doc target.

## Interface for dependents

`src/attempts.ts` exports `attemptOutcomeSchema`, `attemptRecordSchema`, `type Outcome`, `appendAttempt`. red-main-hold calls `appendAttempt(repo, holderSlug, batch, 'held')`; red-batch-culprit calls it with `'ejected', culprit`.

## Open limitations

- `mergeTurn`'s never-pushed stale-record discard writes no line (outside the design's named call sites); turn time for never-pushed attempts is unmeasured.
- Batches in flight at upgrade write `start` absent.

## Waves

### Wave 1 — U1 core writer and call sites

- Owns: `src/attempts.ts` (new), `src/state.ts` (`started`), `src/next.ts` (creation `started`, two `reconcileBatch` appends), `src/phase.ts` (four appends).
- Deliberate break to catch during implementation: append `merged` unconditionally in `batchPush` (ignoring `decision === 'reuse'`) must turn the reuse test red.

### Wave 2 — U2 tests, U3 docs (parallel)

- U2 owns: `tests/merge-attempts.test.ts`. Shared test resource: none (own temp fixtures via `fixture()`). Depends on U1.
- U3 owns: `docs/guide/files.md`. Depends on U1 only for final field names; no shared files with U2.

Docs checklist: `docs/guide/files.md` only (one new section); no agent skill or other guide page describes the merge-attempt file or its call sites.

## Done-criteria proof map

| Criterion | Proof | Catches | Size | Rerun when |
|---|---|---|---|---|
| 1. Green holder+2 members, one member via reconcile recovery → one `merged` line, both members listed, start < end | `merge-attempts.test.ts`: green `phase merged` for holder+2 asserts exactly one line with `outcome:"merged"`, `members` both slugs, `start < end`; second case: candidate landed, `next` reconcile asserts exactly one `merged` line | double-append, missing member, absent/wrong times | minutes | src/phase.ts, src/next.ts, src/attempts.ts change |
| 2. `red` solo, `split` batch, `reuse` at push | Three cases in `merge-attempts.test.ts`: solo `check.fix` → one `red` line; batch `check.fix` → one `split`; refused push → restack `decision:'reuse'` → next `merged` push → exactly one `reuse` line | wrong outcome, append at restack, append per member | minutes | same |
| 3. Unlanded batch discarded by recovery → `red` | `merge-attempts.test.ts`: candidate set, never lands; `next` discard asserts exactly one `red` line | missing line on discard, append on refused fetch early-return | minutes | src/next.ts changes |
| 4. `log.jsonl` unchanged | Pre-existing `issues/log.jsonl` bytes unchanged and every appended line parses as `logSchema` (logMove always appends one line per committed move); existing log assertions in `tests/phase.test.ts`, `tests/next.test.ts` keep passing | regression in log writer | seconds | src/log.ts, src/phase.ts changes |
| 5. Stale/refused phase call appends nothing | `merge-attempts.test.ts`: stale `--attempt` refusal and `merged` on non-holder assert `merge-attempts.jsonl` absent or unchanged | append-on-refusal | seconds | src/phase.ts changes |
| 6. files.md describes file and fields | Reviewer check + grep for `merge-attempts` and each field name in `docs/guide/files.md` | undocumented file | seconds | schema changes |
| 7. `checks` pass | `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, `bun test --changed="$AKROGON_BASE" --timeout=30000` | format/type/test regressions | minutes | any diff |

## Implementation notes

- 2026-10-10 double-append fix, refines D3/D4: batch records outlive the appending call — a merged or failed holder keeps `batch` with `candidate`, and the post-phase `mergeWake`/next `reconcileBatch` re-enters the landed and discard branches. Exactly-once needs `batch.recorded` (new optional field) persisted in `batchPush`, `finishPush`, and the failed-holder reconcile branch, plus reconcile landed/discard appends gated on `holderNow`/`fresh` phase `merge` and `batch.recorded !== true`. Reconcile's 'merged' append moved inside the `holderNow.state.phase === 'merge'` branch so a merged holder replay writes nothing.
- 2026-10-10 criterion-4 proof corrected: `logMove` always appends one line per committed move, so whole-file byte equality cannot hold; the check is pre-existing bytes unchanged plus appended lines parsing as `logSchema`.

## Credential check

`akrogon status merge-attempt-records` shows no `Missing:` lines; the design names no credentials. No blocker.
