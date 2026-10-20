# Brief 1: delete member stacking from src/

## 1. Goal

Every merge turn lands the holder alone (operator 1a). Delete the member stacking code in `src/` per plan decisions D1 to D7. Keep every holder path working exactly as the memberless path works today.

## 2. Acceptance criteria

1. `src/` has no `pickMembers`, `redMemberHeads`, `BatchMember` or `batchMemberSchema`. `batchSchema` has no `members` key. `src/batch.ts` has no `members` token. `buildStack(repo, builtOn, holderHead, retirementHead = holderHead)` returns `{ ok: true; top } | { ok: false }`.
2. `readState`, given a `batch` whose `members` is exactly `[]`, parses as if the key were absent. Any other `members` value fails the strict parse. A schema failure is rethrown as `Error("Invalid state <abs>/state.yaml: <zod message>", { cause })`. Catch only `z.ZodError` and nothing else.
3. The prompt context is `attempt=<id> top=<sha>` or `attempt=<id> solo`, never `members=`.
4. A red `check.fix` on a held record always takes the existing `transition(... appendAttempt(red) ...)` path. No "stack red" output remains.
5. `appendAttempt` writes no `members`. `attemptRecordSchema.members` stays optional for old lines, with both forms. The timing `batch` event schema in `src/timing.ts` keeps `members` optional, and `mergeTurn` no longer writes it.
6. `bun run typecheck` passes, and so do the planned tests in section 7.

The planned tests already exist on the branch. You write and edit no test. If a planned test stays red once your code is correct, return a mismatch with the failing output.

## 3. Read first

- `/home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/plan.md` (D1 to D7 and the Interfaces section)
- `src/state.ts`, `src/batch.ts`, `src/attempts.ts`, `src/next.ts` lines 919-1160 (`reconcileBatch`, `mergeTurn`, `mergeContext`), `src/phase.ts` lines 505-850
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- Pattern to copy: the existing memberless branches in each function. Delete the member branches and keep the memberless ones.

## 4. Changes

- `src/state.ts`:
  - Delete `batchMemberSchema`, `BatchMember` and `batchSchema.members`.
  - In `readState`, build the parse input purely. Keep the existing top-level key filter. When `batch` is a plain object and `Array.isArray(batch.members) && batch.members.length === 0`, drop that key. Then wrap `stateSchema.parse` as in criterion 2.
- `src/batch.ts`:
  - Delete `pickMembers` and the imports only it used (`mergeQueue`, `readLog`, `redMemberHeads`, `BatchMember`, `GlobalConfig` if unused).
  - `StackResult` becomes `{ ok: true; top: string } | { ok: false }`.
  - Drop the `members` parameter and loop from `buildStack`. Its retired-lesson range is only `[{ base: await memberBase(repo, builtOn, retirementHead), head: retirementHead }]`.
  - `memberBase` stays.
- `src/attempts.ts`: delete `redMemberHeads`, and `appendAttempt` stops writing `members`.
- `src/next.ts`:
  - `mergeTurn`: no member snapshot and no `members` in the new `Batch` or the timing event. Call `buildStack(repo, current.built_on, current.holder.head)` once. Under the lock keep the existing fresh/attempt checks. The applied record is `{ ...fresh.state.batch, applied: true, top: staged.top }` when `staged.ok && applyTop(...)`, else `{ ...fresh.state.batch, applied: true }`. Remove the `'rebuild'` loop and the `kept` check.
  - `mergeContext`: drop `members=`.
  - `reconcileBatch`: remove the member `move` on the unlanded path. On the landed path remove the member loop, `moved`, `closable` and the whole second `withLock` block (it served members only). Holder dependents are already woken by the next pass.
  - Remove a parameter or import that becomes unused through these deletions (for example `global` on `reconcileBatch`, if unused) and update its callers.
- `src/phase.ts`:
  - `requireBatchTop`: HEAD must descend from `record.top`, which is the memberless rule. Keep the error text form `HEAD must descend from the recorded batch top ...`.
  - `batchCheck`: drop the member loop, and the retired range is `[record.holder]`.
  - `batchPush`: drop the drift check and member moves.
  - `restack`: the holder head is always `git rev-parse refs/heads/<slug>`. Call `buildStack(repo, builtOn, holderHead, record.holder.head)` with no member pick and no move back.
  - `finishPush`: drop the member moves.
  - `phaseCommand`: delete the `record.members.length > 0` check.fix branch.
  - Remove `global` from `restack` and `finishPush` if it becomes unused, and remove unused imports.

This unit owns only the `src/` files above. There is no prerequisite (A's fixture commit 1d1e652c is already in your HEAD). There is no shared test resource beyond temp repos.

## 5. Do-not

- Do not edit any file under `tests/` or any doc. Tests are locked after planning and docs are unit 2's. The exception is a revised brief from A.
- Do not change holder behavior, error texts beyond the member wording, the solo path, `--attempt` checks, `requireGreenReceipt`, lost-push recovery or `appendAttempt` red/merged lines. Those are the guards the existing tests hold.
- Do not add upgrade code for stacked records (operator 5a). The only allowed handling is the empty-list drop.
- Do not stop processes by pattern. Use `akrogon stop-run <id>`.
- Return a mismatch with evidence instead of changing scope or an interface. A revised brief from A is the only exception.

Reasons restated: tests and docs belong to A and unit 2. The holder paths are guarded by existing tests. 5a forbids upgrade code. Pattern kills cross leaves.

## 6. Steps

1. `bun install --frozen-lockfile` in your worktree.
2. Edit `src/state.ts` (criteria 1 and 2), then `src/batch.ts` and `src/attempts.ts` (criteria 1 and 5).
3. Edit `src/next.ts` (criterion 3) and `src/phase.ts` (criterion 4).
4. Run `bun run typecheck`, then `bunx prettier --check src`, then the section 7 commands. Fix until green.
5. Commit only your `src/` changes in one commit and return the commit id.

Advisory size: about 5 files and under 25 turns.

## 7. Commands

Run these in your worktree, each through `akrogon run-check --name <label> -- <cmd>`:
- `bun run typecheck`
- `bun test --timeout=30000 tests/solo-turns.test.ts -t 'no member stacking code remains in src|old attempt|non-empty or malformed'`
- `bun test --timeout=30000 tests/batch-dispatch.test.ts tests/batch-merge.test.ts tests/merge-attempts.test.ts tests/batch.test.ts tests/next.test.ts tests/phase.test.ts tests/timing.test.ts`

The `merge docs describe the holder alone` test is unit 2's and stays red for you. Ignore it.

## 8. Report

Paste each `check <label>: <exit> <path>` line, and link each criterion to its evidence.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
