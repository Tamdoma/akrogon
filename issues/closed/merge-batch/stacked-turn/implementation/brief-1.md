# Sub-brief 1: stacked merge turn (src)

## 1. Goal

Implement the stacked merge turn in `src/` per the plan's decisions D1–D12 (copied below, they are the contract). The merge holder's turn stacks every other unstopped eligible leaf in `merge`, in queue order, onto the holder; one verify and one fast-forward push lands the whole stack; a red stack records member heads and restarts the holder alone; a member whose head is red on the same base is skipped.

Plan decisions (contract):

- D1 `batchSchema` (src/state.ts) gains `members: z.array(z.strictObject({slug: z.string(), base: z.string(), head: z.string(), tip: z.string()})).default([])`. `tip` is written `= head` at snapshot and replaced by the stacked tip at apply. Export `BatchMember`.
- D2 `buildStack(repo, builtOn, holderHead, members: {slug, base, head}[] = [], retirementHead = holderHead)` in src/batch.ts: holder rebased first (unchanged), then each member via `git rebase --onto <tip> <member.base> <member.head>`; a conflicting member is `rebase --abort`ed and skipped (build continues, it is simply absent from `tips`). Returns `{ok: true, top, tips: Map<slug,string>} | {ok: false}` (false only on holder conflict). A member whose `head` is already an ancestor of the running tip is counted stacked with `tip` = running tip, no rebase. `removeRetiredLessons` runs once at the end over `stacked members' {base, head}` + `{base: memberBase(builtOn, retirementHead), head: retirementHead}`.
- D3 Member branches stay at `head` until the push lands. Only then each recorded member still `phase === 'merge'` is moved to `member.tip` with the existing `move()` (export it from batch.ts) and `commitMove(repo, leaf, leaf.state, 'merged', 'B')`, in three places: `batchPush` green path, `finishPush`'s landed-verify branch, and `reconcileBatch`'s landed path (crash recovery). Never move member branches on the red path; never `git branch -D` anywhere.
- D4 Solo implies `members: []`. With members nonempty `requireBatchTop` becomes the old record-aware check: `head === record.top` (message: `HEAD must equal the recorded batch top ${record.top}, found ${head}`); memberless keeps `isAncestor(worktree, record.top, head)` and its descend-from message. Signature `(worktree, record, head)`.
- D5 In `phaseCommand`, `check.fix` on a record with `members.length > 0` (after the existing slot/attempt validation): enforce required slot the way `transition` does (`requiredSlots(state.phase, state.fix_rounds).includes(slot)` else `A required --slot is missing or invalid`), then `git update-ref refs/heads/<holder> record.holder.head`, `appendAttempt(repo, slug, record, 'red', end)`, `saveState` with `batch: undefined`, `console.log('stack red; holder turn restarts alone')`, `onCommitted()`. Holder phase stays `merge`. `members: []` → existing `transition` path unchanged.
- D6 Member snapshot inside `mergeTurn`'s lock: `pickMembers(repo, global, leaves, builtOn)` (new export in batch.ts) = `mergeQueue(global, leaves, () => readLog(repo.root)).slice(1)` candidates, each `sha = await branchSha(slug)`, `head = sha ?? builtOn`, skipped when `redMemberHeads(repo, builtOn)` contains head; recorded `{slug, base: sha === undefined || head === builtOn ? head : await memberBase(repo, builtOn, head), head, tip: head}`. Move `branchSha` from next.ts to batch.ts and export. Timing event gets `members: next.members.map(m => m.slug)` only when nonempty.
- D7 `batchPush` member validation before the push: for every recorded member the leaf must exist, `phase === 'merge'`, `!isStopped(repo.name, member.slug)`, and `branchSha === member.head`. Any violation → save `{...record, candidate: head, applied: false, tested_top: undefined, tested_main: undefined, decision: undefined}` and return `{kind:'refused', record, candidate: head, end}` (same as non-fast-forward). `restack(repo, global, leaf, record)` (signature gains `global`; `finishPush` passes it through) with `record.members.length > 0`: `update-ref refs/heads/<holder> record.holder.head` first, `holderHead = record.holder.head`, `members = await pickMembers(repo, global, allLeaves(repo), builtOn)`, `buildStack(repo, builtOn, holderHead, members, record.holder.head)`, and the saved batch gets `built_on`/`holder: {base: builtOn, head: holderHead}` only when applied (as the old code did) plus `members` = built members with real tips, `members: []` whenever applied top is undefined.
- D8 `mergeTurn`'s apply lock re-validates recorded members (same predicate as D7); dropped members → discard the build, `continue` a `for (;;)` rebuild loop (mirroring `6640ab5^`). Holder conflict/dirty ⇒ `applied: true`, `top: undefined`, `members: []` → solo prompt (existing path).
- D9 `mergeContext`: `attempt=<id> top=<sha>` gains ` members=<slug,...>` in stack order only when `record.members.length > 0`; `solo` unchanged.
- D10 `attemptRecordSchema` gains `members: z.array(z.union([z.string(), z.strictObject({slug: z.string(), head: z.string()})])).optional()`. `appendAttempt` writes `{slug, head}` entries when `batch.members.length > 0`, omits the key otherwise. New exports `readAttempts(repo)` (parse `issues/merge-attempts.jsonl`, `[]` when absent) and `redMemberHeads(repo, builtOn): Set<string>` (red outcome, same `built_on`, object entries only).
- D11 Foreclosed: no cap/split/culprit/batch_limit anywhere.
- D12 In `reconcileBatch`'s landed path: `appendAttempt('merged')` once (existing `recorded` gate), member moves (D3) before holder handling, holder handled as today; collect moved leaves and after the lock `closeMergedTab` + `dispatchDependents` each (old code pattern). In the not-landed path with `batch.members.length > 0` and fresh leaf present: `update-ref refs/heads/<holder> batch.holder.head` before the existing red appendAttempt/clear.

## 2. Acceptance criteria

- `bun test tests/batch.test.ts` green (schema accepts `members` incl. `tip`, rejects `solo`/`excluded`/member without `tip`).
- `bun test tests/batch-dispatch.test.ts` green (stacked prompt with `members=`, one push lands all, skipped/conflicted/stopped members, red-stack restart + red-skip + head-change re-stack, drift refusal → rerun, reconcile member moves).
- `bun test tests/batch-merge.test.ts tests/merge-attempts.test.ts` green (existing behavior preserved).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/batch.ts` (whole file), `src/phase.ts` :490-758, `src/next.ts` :915-1100, `src/state.ts` :40-62, `src/attempts.ts`, `src/turn.ts` (`mergeQueue`), `src/stop.ts` (`isStopped`).
- `git show 6640ab5^:src/phase.ts` :497-850 and `git show 6640ab5^:src/next.ts` :980-1300 for the old member logic — copy only what the decisions need.
- `tests/batch-dispatch.test.ts` (the planned tests at the bottom), `tests/batch.test.ts` schema case, `tests/helpers.ts`.

## 4. Change list and needed interfaces

Owned paths (only these): `src/state.ts`, `src/batch.ts`, `src/attempts.ts`, `src/next.ts`, `src/phase.ts`. No test files — the planned tests are committed already and locked; a planned test red or wrong after correct implementation is a mismatch return to A, never a test edit.

Interfaces as decided: `buildStack(repo, builtOn, holderHead, members = [], retirementHead = holderHead)` → `{ok:true, top, tips:Map<slug,string>} | {ok:false}`; `move(repo, slug, target, leaf)` exported; `branchSha(repo, slug)` moved here, exported; `pickMembers(repo, global, leaves, builtOn): Promise<BatchMember[]>`; `readAttempts`, `redMemberHeads` in attempts.ts; `requireBatchTop(worktree, record, head)`; `restack(repo, global, leaf, record)`, `finishPush(repo, global, slug, ...)`; `mergeContext` unchanged signature.

Import graph stays acyclic: `batch.ts` may import `turn.ts` (`mergeQueue`), `attempts.ts`, `log.ts` (`readLog`), `state.ts`, `stop.ts`; `next.ts` already imports `phase.ts`; `phase.ts` must not import `next.ts`.

Watch for: `mergeQueue` already excludes stopped and ineligible leaves — do not re-filter eligibility; `appendAttempt` must write `members` on BOTH `merged` and `red` outcomes when nonempty; member `commitMove` slot is `'B'`; `allLeaves` inside locks may be stale after `commitMove` moves issue folders — refetch the holder before moving it; `check.fix --check` on a membered record keeps going through `batchCheck` (unchanged).

## 5. Do-not, reasons and exceptions

- No member-branch moves before a landed push (D3): the push-time check `branchSha === member.head` would misfire and `git branch -d` cleanup relies on the tip move happening only at landing. Exception: none.
- No `git branch -D`: it deletes the only guard against dropping unlanded work. Exception: none.
- No `excluded`, `solo` keys or `BatchMember.tip`-less records: the planned tests pin the schema. Exception: none.
- No in-place-repair window on a membered stack: `head === top` enforces it; don't add a repair branch. Exception: none.
- No cap/split/culprit/batch_limit/parallel-verify code (D11). Exception: none.
- No edits outside the owned paths; no test edits (planned tests locked; red → mismatch). No new files, no doc edits.
- A planned test whose expectation contradicts the locked design is a mismatch return with evidence, not a code workaround.

Restated: every exclusion above stands with its reason; the only exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. `src/state.ts`: `batchMemberSchema`, `members` on `batchSchema`, `BatchMember` export. Criterion: batch.test.ts schema case.
2. `src/attempts.ts`: schema union, `readAttempts`, `redMemberHeads`, `appendAttempt` member write.
3. `src/batch.ts`: export `move`, move+export `branchSha`, `pickMembers`, `buildStack` members loop + ranges.
4. `src/next.ts`: snapshot in `mergeTurn`, apply-time member validation + rebuild loop, `reconcileBatch` member moves + post-lock dispatch, `mergeContext` members, timing `members`.
5. `src/phase.ts`: `requireBatchTop` record-aware, `batchCheck` per-member original-range checks (`requireNoIssueFiles`/`requireTestChangeCitations`/`requireNonEmpty` over `member.base..member.head`, skipping `base === head`, then the existing whole-range checks) + `retiredLessonsPresent` ranges `[...members {base,head}, holder]`, `batchPush` member validation + green-path member moves, `restack` members, `finishPush` member moves on landed-verify, `phaseCommand` stacked `check.fix` path.
6. Run the commands below; repair red within the brief.

Advisory: ~5 files, under 40 turns.

## 7. Commands

In the worktree (cwd):

```sh
bun install --frozen-lockfile
bun test tests/batch.test.ts
bun test tests/batch-dispatch.test.ts
bun test tests/batch-merge.test.ts tests/merge-attempts.test.ts
bun run typecheck
```

## 8. Done-when, evidence and report

All planned tests green, the four commands pass, commit(s) on the detached HEAD with scoped messages (test files untouched, so no `Test-Change` trailer needed unless you find you must touch one — then it's a mismatch instead). Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
