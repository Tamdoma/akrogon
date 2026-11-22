# Plan: failed-merge-resume

Scope: watch-consultants fix-and-config item 4 only — a leaf failed in `merge` whose `batch` holds `applied: true` and no `candidate` is rebased onto the new base when it is resumed, never dispatched on the stale attempt.

## Read-first

- `issues/open/watch-consultants/failed-merge-resume/brief.md`, `design.md` (leaf owns fix-and-config item 4; `commitMove` clear is the candidate fix; plan answers where the clear belongs).
- `src/phase.ts` `commitMove` (~line 190): `leavingFailed` keeps `{...recorded.batch, notified: undefined}` for every batch shape.
- `src/next.ts` `reconcileBatch` (~line 862) and `mergeTurn` (~line 922): `inMerge && !(applied === true && candidate !== undefined)` returns early, so an applied, candidate-less batch survives reconciliation and `dispatchMergeLeaf` sends B the stale `attempt`/`top` context.
- `src/state.ts` `batchSchema` (~line 65): `candidate` is the head sent to the push; absent before a push.
- `tests/batch-dispatch.test.ts`: hc dispatch fixture, `prompts`/`mergePrompts`/`attemptLines` helpers, and the criterion-2 test at ~line 271 (`a failed holder with a landed candidate is told to move back, then reconciles without run or push`).
- `src/leftovers.ts`: documents the failed-holder rule — the batch is kept until `akrogon phase <slug> merge`.
- `src/attempts.ts` `appendAttempt`: the `issues/merge-attempts.jsonl` row a reconcile clear would write for the stale attempt.

## Decisions

- D1 — clear the batch in `commitMove`, not `reconcileBatch`. When `leavingFailed` and `recorded.batch.candidate === undefined`, `after.batch` becomes `undefined`; when `candidate` is defined the record is kept exactly as today (`{...batch, notified: undefined}`). Reason: a candidate-less batch is an unfinished attempt with nothing pushed to settle, so the reconcile step's landed/unlanded adjudication has nothing to read. Rejected `reconcileBatch` (reach the stale shape by widening its early return to `record.applied !== true`): it would append a `red` row in `issues/merge-attempts.jsonl` naming the stale attempt id, which the done-criterion's "no prompt or attempt names the stale attempt or top" can be read to forbid; the `commitMove` clear discards the record like the existing discarded interrupted build (no ledger row) and satisfies the strictest reading. It also fixes the queue ordering and `run-check`/`verify --attempt` surfaces at once.
- D2 — keep candidate-holding batches unchanged. A `failed` holder whose push landed is reconciled by `reconcileBatch` without run or push (done-criterion 2, existing test); the clear condition is `candidate === undefined` only.
- D3 — the stale-attempt dispatch happens inside `akrogon phase <slug> merge` itself: every committed phase move runs `mergeWake` (`src/akrogon.ts:103-105`), which dispatches the stale context before `akrogon next` runs. The test captures prompts across both commands and resets the prompt log before the resume.
- D4 — the proof command for criterion 1 is `akrogon run-check --name <label> -- bun test --timeout=30000 --parallel=4 --no-isolate tests/batch-dispatch.test.ts`, matching the configured `test` check's runner flags. The red-first run is taken on the pre-fix tree; the leaf's own test must fail there.
- D5 — the resume flow in the test mirrors the criterion: real `next --all` builds a command-owned applied batch on the base tip, `seatOwned` hands it to seat B the way a land handoff does, `saveState` writes `phase: 'failed'` with a `blocked` failure record, `pushMain` advances `origin/main`, then `akrogon phase aa merge` and `akrogon next aa` run. Assertions read `state.yaml`, `git merge-base --is-ancestor`, the prompt log, and `issues/merge-attempts.jsonl`.
- D6 — `docs/reference/state-and-phases.md` gets one sentence in the `batch` paragraph: a batch without a `candidate` is dropped when the leaf leaves `failed`. No other doc is affected; `leftovers.ts`'s comment stays accurate (it describes the kept state while the leaf is in `failed`).

### Condition checks against done-criteria

Criterion 1 conditions, traced from where each value is made to its last use:

- K1 "rebased onto the new base": `batch.built_on` is written by `mergeTurn`'s fresh build from `localBase(repo)`; the stale record's `built_on` is the old tip. Case: assert `state.batch.built_on` equals the new `origin/main` tip and `git merge-base --is-ancestor <newTip> <top>` holds. Red at planning: the kept record keeps the old `built_on`, failing both.
- K2 "no prompt names the stale attempt or top": `dispatchMergeLeaf` sends `mergeContext(recorded)` built from the kept record. Case: filter all prompts across `phase` + `next` for `staleAttempt`/`staleTop`. Red at planning: the stale prompt `merge-issue aa slot=B phase=merge leaf=... attempt=<stale> top=<stale>` is delivered inside `phase aa merge`, failing the filter.
- K3 "no attempt names the stale attempt or top": `appendAttempt` ledger rows carry `attempt`, `built_on`, `tested_top`. Case: `issues/merge-attempts.jsonl` must not contain the stale id or top. Red at planning under D1's placement it holds; had the fix been placed in `reconcileBatch` this case fails on its `red` row — recorded as the placement discriminator, no separate red needed since D1 is the plan.
- K4 "moved failed -> merge with akrogon phase then dispatched with akrogon next": both commands must exit 0 with the leaf in `merge` on a fresh attempt. Case: assert `phase`/`next` exit codes, `phase === 'merge'`, `batch.attempt !== staleAttempt`, and after `seatOwned` + `next` the merge prompt equals `expectedPrompt` (fresh attempt + fresh top). Red at planning: the stale prompt already sent and the unchanged attempt fail this.
- K5 "fails on the base before the fix": the run in the criterion-test log below shows the test red on the unfixed tree. No temporary violation edit is needed — the violation is the base's existing behavior (the kept batch is itself the violation); a temporary edit could only reproduce what the base already does.
- K6 criterion 2 "landed candidate still moves back and reconciles without run or push": the clear condition reaches only `candidate === undefined`. Case: the existing test at tests/batch-dispatch.test.ts ~271 proves the kept-candidate path; it stays green. Red-discriminating coverage: a hypothetical clear-everything would fail this test — the existing test is the guard, no new case.

## Needed interfaces

- `commitMove(repo, leaf, recorded, to, slot, failure?, onCommitted?)` in `src/phase.ts` — the only edit site.
- Test helpers already in `tests/batch-dispatch.test.ts`: `dispatchFixture`, `allocatedLeaf`, `commitFile`, `head`, `toMerge`, `pushMain`, `resetPrompts`, `prompts`, `mergePrompts`, `expectedPrompt`, `seatOwned`, `remoteTip`, `next`, `cli`. New imports: none beyond what the file has (`readState`, `saveState`, `resolve`, `existsSync`, `readFileSync`, `z`, `run`).

## Checklist / waves

Serial-solo: the single wave holds one unit (the only touched product file is `src/phase.ts`; the test file is committed by this pass).

- Wave 1, unit U1 (slot A implements, no workers):
  - Owns: `src/phase.ts` (`commitMove` `after.batch` expression), `docs/reference/state-and-phases.md` (one clause), `plan.md`.
  - Change: `batch:` in `after` becomes — `recorded.batch === undefined || recorded.batch.candidate !== undefined` keeps today's shape (`leavingFailed ? {...recorded.batch, notified: undefined} : recorded.batch`); `leavingFailed` with `candidate === undefined` yields `batch: undefined`. Keep the single-expression form per repo style.
  - Docs: `state-and-phases.md` `batch` paragraph gains "a record with no `candidate` is dropped when the leaf leaves `failed`" (one clause); no agent skill text affected.
  - Verification: run the new test (green), `tests/batch-dispatch.test.ts` whole file (green), then `bun test` via run-check for the batch-affected files (`batch-dispatch`, `batch-merge`, `batch`, `green-merge`, `merge-attempts`, `phase`, `next`) plus typecheck.

## Criterion proofs

### Criterion 1 (red first)

- Boundary: real commands (`akrogon phase`, `akrogon next`) on the hc dispatch fixture; state, git refs, prompt log and attempts ledger read after.
- Before: leaf `failed` from `merge`, `batch {applied: true, owner: 'seat', top: <oldTip-descendant>, candidate: undefined}`, `origin/main` then gains a commit.
- After: `phase aa merge` + `next aa` leave `batch.attempt` fresh, `built_on = <newTip>`, `top` a descendant of `<newTip>`; no prompt and no `merge-attempts.jsonl` row names `staleAttempt` or `staleTop`.
- Failure caught: B dispatched on the stale attempt/top (pre-fix), or a ledger row naming the stale attempt (alternative placement).
- Command: `akrogon run-check --name plan-test-c1 -- bun test --timeout=30000 --parallel=4 --no-isolate tests/batch-dispatch.test.ts`
- Size: minutes. Rerun trigger: any change to `src/phase.ts` `commitMove`, `src/next.ts` `reconcileBatch`/`mergeTurn`, or the batch schema.

### Criterion 2

- Existing test `a failed holder with a landed candidate is told to move back, then reconciles without run or push` in the same file and command as above; unchanged, must stay green.
- Size: minutes (same run). Rerun trigger: any change to `commitMove`'s keep-path or `reconcileBatch`.

## Open design questions answered

- "Whether the clear belongs in `commitMove` or `reconcileBatch`": `commitMove`, per D1 — every other `batch` reader checked (`batchPush`/`restack`/`landPush`/`batchGuards`/`landClaim`/`landGates`/`batchCheck`/`recordTested` in `phase.ts`; `reconcileBatch`, `mergeTurn`, `mergeQueue` in `next.ts`/`turn.ts`; `status.ts` land display, `run-check.ts` attempt stamp, `verify.ts` attempt resolution, `stop.ts` slice keep, `reconcile.ts` worktree keep, `leftovers.ts` listing, `timing.ts`/`attempts.ts` writers): with the record cleared the leaf is an ordinary `merge` leaf — `mergeTurn` builds a fresh batch; `merged`/`check.fix`/`land` paths that read a record are unreachable or refuse cleanly; a dropped record produces no `verify --attempt` hit and no kept-worktree exception, which is correct because the worktree is still the leaf's own worktree (kept by `state.worktree`, not `state.batch`).

## Credentials

`akrogon status failed-merge-resume` shows `env_names: []`, no `Missing:` lines; the design names no variables. No paid or live launches are needed — proof is the bun test suite.

## Test run records

- `check plan-test-c1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/watch-consultants/failed-merge-resume/implementation/check-plan-test-c1-red-1795285429058-250788.log` — intended red on the pre-fix tree: `expect(state.batch?.attempt).not.toBe(staleAttempt)` fails with `Expected: not "560cbb7e-9887-4b93-af99-d71add74b341"` — the applied, candidate-less batch survives `commitMove`'s `failed -> merge` and `mergeTurn` dispatches on it. K1/K2/K4 all break on that one record. 25 pass, 1 fail, criterion-2 test green.
