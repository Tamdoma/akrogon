# Plan: stacked-turn

## Decisions

- D1 **Record shape.** `batchSchema` (src/state.ts:40) gains `members: z.array(z.strictObject({slug, base, head, tip})).default([])`. `tip` extends the design's `{slug, base, head}` — door note-to-A-cleanup.md: reconcile's `git branch -d` (src/reconcile.ts:217) needs the member branch on its rebased tip after landing; members move to `tip` only after the push lands, so `head` stays the member's own pre-stack head and remains the red-skip key. `tip` is written `= head` at snapshot and replaced by the stacked tip at apply. Old `6640ab5^` keys not needed by criteria (`excluded`, `solo`) stay out.
- D2 **Stack order is holder-first.** `buildStack(repo, builtOn, holderHead, members?)` rebases the holder onto `builtOn` (unchanged branch), then each member in order via `rebase --onto <tip> <member.base> <member.head>`; a conflicting member is aborted and skipped, building continues. Returns `{ok:true, top, tips: Map<slug,string>}` or `{ok:false}` (only a holder conflict). Retired-lesson re-removal runs once at the end over every stacked range `{member.base, member.head}` + `{mergeBase(builtOn, holderHead), holderHead}`.
- D3 **Member branches never move before the push.** The push-time member check (C4) is `branchSha(member) === member.head`; making that true also means a red stack leaves member branches untouched and the red-skip key is the member's real head. After a green push — in `batchPush` (push exit 0), `finishPush`'s landed-verify branch (push raced but landed), and `reconcileBatch`'s landed path (crash recovery) — each recorded member still in `merge` is moved to `member.tip` with the existing `move()` in batch.ts (export it), then `commitMove(..., 'merged', 'B')`.
- D4 **Solo implies no members.** `top === undefined` ⇒ `members: []`. A membered holder's HEAD must equal `record.top` (`requireBatchTop` gets back the record-aware old check), so B cannot repair in place on a stack (C6/foreclosed F5); a memberless holder keeps the current descend-from check and repair rule.
- D5 **Red stack = record + restore holder + clear + restart holder-alone.** In `phase.ts` `phaseCommand`, `check.fix` on a record with `members.length > 0` (validated slot/attempt the same way): `git update-ref refs/heads/<holder> record.holder.head`, `appendAttempt(repo, slug, record, 'red', end)` where the line carries `members: [{slug, head}]` (object entries), `saveState` with `batch: undefined`, print `stack red; holder turn restarts alone`, then `onCommitted()` so the existing `finally` calls `mergeWake` → the holder rebuilds solo under a new attempt. Holder phase stays `merge`; no `check.fix`, no fix_round bump. `members: []` record → today's `transition` path unchanged ("red on the holder alone ends as today").
- D6 **Member snapshot.** At batch creation inside `mergeTurn` (src/next.ts:1026): candidates = `mergeQueue` order after the holder, minus candidates whose current head (`branchSha(slug) ?? builtOn`) appears in any red `merge-attempts.jsonl` line as an object member with `built_on ===` this turn's base. Recorded member: `{slug, base: sha === undefined || head === builtOn ? head : memberBase(builtOn, head), head, tip: head}`. Solo turn (`buildStack` `ok:false` or holder dirty at apply) ⇒ record `members: []`.
- D7 **Drift at push ⇒ refused → restack rebuilds.** In `batchPush` before the push: every recorded member must still exist, be `phase === 'merge'`, not `isStopped`, and `branchSha === member.head`; otherwise save the same refused record shape as non-ff (`candidate`, `applied: false`, tested cleared) and return `kind:'refused'` → `finishPush` → `restack`. `restack` re-snapshots members through the same picker (D6, new base, updated red-skip), rebases `record.members.length > 0 ? record.holder.head : current holder ref`, and sets `members: []` if it ends holder-alone.
- D8 **Apply-time drift ⇒ drop and rebuild.** In `mergeTurn`'s apply lock, re-check recorded members (same predicate as D7 minus `isStopped` is fine to include); dropped members → discard build, `continue` a `for (;;)` build loop mirroring `6640ab5^`'s rebuild; holder dirty/conflict ⇒ `applied: true`, `top: undefined`, `members: []` → `solo` prompt.
- D9 **Prompt context.** `mergeContext` (src/next.ts:1079): `attempt=<id> top=<sha>` gains ` members=<slug,...>` in stack order only when nonempty; `attempt=<id> solo` unchanged.
- D10 **Attempt history.** `attemptRecordSchema` (src/attempts.ts:24) gains `members: z.array(z.union([z.string(), z.object({slug: z.string(), head: z.string()})])).optional()` — old string-slug lines and lines without the key still parse. `appendAttempt` writes object entries `{slug, head}` when `batch.members` is nonempty, omits the key otherwise. New export `readAttempts(repo)` parses the file for the red-skip lookup.
- D11 **Foreclosed stays foreclosed.** No cap, split, culprit, `batch_limit`, parallel verify, or wait-to-fill anywhere in `src/` or the config schema (C7).
- D12 **Restack holder base.** With members recorded, `restack` first `update-ref`s `refs/heads/<holder>` to `record.holder.head` (the live ref holds the old stack's member commits, since D3 means only the holder ref carries the stack); with no members keep the current ref so B's repair commits survive — same as today.

## Read-first

- `docs/guide/merge.md`, `docs/guide/next.md` (:157), `docs/guide/phases.md` (:14), `docs/guide/state.md` (:52), `docs/guide/files.md` (:55-90) — docs that describe the merge turn (C6).
- `src/batch.ts` (whole file), `src/next.ts` :917-1100 (`reconcileBatch`, `mergeTurn`, `mergeContext`), `src/phase.ts` :500-758 (`mergeHead`, `requireBatchTop`, `batchCheck`, `batchPush`, `restack`, `finishPush`, `phaseCommand`), `src/state.ts` :40-62, `src/attempts.ts`, `src/turn.ts` `mergeQueue`, `src/stop.ts` `isStopped`.
- `git show 6640ab5^:src/batch.ts` (members, tips, `applyStack`, `move`), `6640ab5^:src/phase.ts` :497-850 (`memberEntries`, membered `requireBatchTop`/`batchCheck`/`batchPush`/`restack`), `6640ab5^:src/next.ts` :980-1300 (`reconcileBatch` member moves, `mergeTurn` rebuild loop). Copy only what the criteria need.
- `tests/batch.test.ts`, `tests/batch-merge.test.ts`, `tests/batch-dispatch.test.ts`, `tests/merge-attempts.test.ts` (`attemptLines`, `batchFixture`, `branchAt`), `tests/helpers.ts` (`fixture`, `leaf`, `cli`, `fakeHerdr`, `verified`, `greenReceipt`).
- `skills/merge-issue/SKILL.md` merge section; `src/AREA.md` merge/buildStack lines.

## Interfaces

- `buildStack(repo, builtOn, holderHead, members: {slug, base, head}[] = []): {ok:true, top, tips:Map<slug,string>} | {ok:false}` — src/batch.ts.
- `move(repo, slug, target, leaf?)` — exported from src/batch.ts (was module-private); `branchSha(repo, slug)` moves from src/next.ts to src/batch.ts (exported).
- `pickMembers(repo, global, leaves, builtOn): Promise<BatchMember[]>` — src/batch.ts; used by `mergeTurn` and `restack`. Reads red heads via `readAttempts(repo)` from src/attempts.ts.
- `readAttempts(repo): z.infer<typeof attemptRecordSchema>[]` — src/attempts.ts.
- Prompt: `merge-issue <slug> slot=B phase=merge leaf=<path> attempt=<id> top=<sha> members=<csv>` / `... attempt=<id> solo`.
- Red-stack `check.fix` prints exactly: `stack red; holder turn restarts alone`.

## Units and waves

| Unit | Owned paths | Wave | Notes |
|---|---|---|---|
| U1 stack mechanics | `src/state.ts`, `src/batch.ts`, `src/attempts.ts`, `src/next.ts`, `src/phase.ts` | 1 | All merge-turn code; single-owner serial work — touching next.ts and phase.ts in parallel would collide. |
| U2 operator docs | `skills/merge-issue/SKILL.md`, `src/AREA.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/phases.md`, `docs/guide/state.md`, `docs/guide/files.md` | 1 | Disjoint from U1; written against the pinned interface/output strings above. |

Each unit is independent (disjoint paths, no shared fixture); both run in one wave. Tests are already committed by planning; implementation runs them.

## Done-criteria → proof

| # | Criterion | Proof command | Catches | Size |
|---|---|---|---|---|
| 1 | stacked green lands every member in one push, prompt names members, trailers+lessons cover stack, completion owners fire | `akrogon run-check --name test -- bun test tests/batch-dispatch.test.ts -t 'clean waiting leaf stacks'` | stacking, push, member moves | minutes |
| 2 | conflicting member skipped; solo holder stacks nobody; stopped leaf never stacked; skipped leaf merges later | `akrogon run-check --name test -- bun test tests/batch-dispatch.test.ts -t 'conflicting member'` / `'stopped waiting'` / `'solo holder'` | snapshot filters | minutes |
| 3 | red stack: heads+based recorded, no leaf moves, holder-alone restart at once; same-base skip; re-stack after base move or head change; solo red ends as today | `bun test tests/batch-dispatch.test.ts -t 'red stack'` + `-t 'head change'` | D5/D6 | minutes |
| 4 | member head-changed / left-merge / stopped mid-verify refuses push and rebuilds | `bun test tests/batch-dispatch.test.ts -t 'drifted member'` | D7 | minutes |
| 5 | crash after push: reconcile lands every still-`merge` member once, skips moved | `bun test tests/batch-dispatch.test.ts -t 'reconcile moves'` | D3 reconcile path | minutes |
| 6 | skill + docs describe stacked turn | docs checklist below (manual in U2; review) | prose drift | seconds |
| 7 | no cap/split/culprit/batch_limit in `src/` or config schema | `bun test tests/batch.test.ts` (schema accepts members, rejects old keys) + `grep -rn 'batch_limit\|culprit' src/` empty | schema shape | seconds |
| 8 | repo `test`, `typecheck`, `format` pass | `akrogon verify` on committed head (leaf scope) | regressions | minutes |

No restart boundaries needed — test runs are minutes, not slow-run.

## Docs checklist (C6)

One line each: `skills/merge-issue/SKILL.md` (prompt `members=` form, no in-place repair on a membered stack, red stack `check.fix` behavior + `stack red` line, briefs of every stacked leaf, endings); `src/AREA.md` (`buildStack` member stacking, batch record members, reconcile landing members); `docs/guide/merge.md` (turn paragraph + push/red paragraphs); `docs/guide/next.md` :157 (turn stacks waiting leaves); `docs/guide/phases.md` :14 already says "one stack" — verify wording; `docs/guide/state.md` :52 (`members` field); `docs/guide/files.md` (`members` now object entries, still parses old string lines).

## Planned tests (red output recorded below)

- `tests/batch-dispatch.test.ts`
  - `'a clean waiting leaf stacks under the holder and lands with it in one push'` (C1)
  - `'a member that conflicts with the stack is skipped and merges in a later turn'` (C2)
  - `'a holder that cannot be rebased takes a solo turn with nothing stacked'` (C2)
  - `'a stopped waiting leaf is never stacked'` (C2)
  - `'a red stack records member heads, clears the batch and restarts the holder alone'` (C3)
  - `'a member whose head changed is stacked again on the same base'` (C3)
  - `'a drifted member refuses the push and the restack drops it'` (C4)
  - `'reconcile moves every still-merge stacked member to merged exactly once'` (C5)
  - helper `expectedPrompt` updated for `members=` when the record has members.
- `tests/batch.test.ts`: schema case now accepts `members: []` and member objects with `tip`, keeps rejecting `solo`, `excluded`, `batch_limit`.

## Red output (filled during planning)

See "Red proof" at the bottom.
