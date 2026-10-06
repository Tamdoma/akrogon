# Brief 7 (check.fix round 1): holder provenance, dirty-worktree safety, criterion-9 proof

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-batch-u7

## 1. Goal

Repair the three items B handed to A (see `review-B.md` §2026-10-06 "Handed to A"): B F2 holder contamination after member removal, A F2 dirty-worktree data loss in `reset --hard`, and the missing criterion-9 proof (carried member adds a package; restored member's solo run uses its own lockfile).

## 2. Defects being repaired

### R1 — holder contamination (B F2)

When members leave an applied stack (red `check.fix` dissolve, member-departure refusal in `batchPush`, restack member-conflict drop, restack holder-conflict), the holder branch/worktree keeps the member commits — the applied top. The next pass writes a fresh memberless record and the member code lands under the holder's solo push (proven: `member-file` on the remote while the member is still in `merge`).

Same class inside `restack`: a dropped member's commits stay reachable from the holder branch and are carried into the new stack (git rebase patch-id dedup hides it in the no-drop case, but a dropped member's patch is not in the new tips, so it is replayed into the holder range).

### R2 — dirty-worktree data loss (A F2)

`src/batch.ts` `move()` does `git -C <worktree> reset --hard` whenever `state.worktree` is set. Applied and restore paths wipe uncommitted work a waiting member's live pane may hold, and the same for the holder.

### R3 — criterion 9 has no proof

No test carries a package change through a batch; the report's claim was unsupported.

## 3. Required design (implement exactly)

D-A. Schema: `batchSchema` gains a required `holder: z.strictObject({ base: z.string(), head: z.string() })` — the holder's saved merge-base against `built_on` and its pre-batch head, recorded at write time in `mergePass`. Update every fixture literal (batch.test.ts schema tests, `batchFixture`/`soloFixture` in batch-merge.test.ts, ~4 literals in batch-dispatch.test.ts) to include it; strictObject makes missing/extra fields throw, so no silent old-shape records.

D-B. `src/batch.ts` `move()` gains dirty safety: when the target is a worktree and `git -C <wt> status --porcelain` is nonempty, do NOT `reset --hard`; instead `git update-ref refs/heads/<slug> <target>` and return a flag. New signatures:

```ts
export type MoveResult = { moved: 'worktree' | 'ref' | 'dirty-ref' };
// internal move returns MoveResult; the two public helpers surface dirty hits:
export async function applyStack(repo, top, members, holder): Promise<{ dirty: string[] }>;
export async function restoreMembers(repo, members): Promise<{ dirty: string[] }>;
```

D-C. `mergePass` apply stage (under the lock): preflight every to-be-reset worktree is clean BEFORE `applyStack` (run `git status --porcelain` on each member leaf worktree and the holder's — cheap, already inside lock; or call applyStack and use the returned `dirty` list — pick one rule and use it consistently):
- Dirty MEMBER: solo-mark its leaf (`saveState(..., solo: true)`), exclude it from apply and from the saved `members`, update-ref its branch back to `head` if already drifted. Its worktree files are untouched.
- Dirty HOLDER: restore members already moved this apply by `update-ref` to `head` (never `reset --hard` past dirt), `update-ref` the holder branch to `holder.head`, save the record `{...batch, applied: true, solo: true, members: []}`, prompt `solo`. B resolves the dirty worktree itself.
- Restores (`restoreDrifted`, dissolution, reconcile-not-landed) go through `restoreMembers`: dirty member → `update-ref` to `head`, keep dirty files, solo-mark it (it can never be re-carried with a stale worktree).

D-D. `phase.ts`:
- `batchPush` departure refusal and `check.fix` dissolve: after restoring members, also restore the holder to `record.holder.head` — `update-ref` when the worktree is dirty, else `reset --hard` — via a shared helper (`restoreHolder` in `src/batch.ts`).
- `restack`: holder range for the rebuild is `record.holder.head` for non-solo records and `git rev-parse refs/heads/<slug>` (current behavior) for `solo` records; each item `{base: builtOn, head: <head>}` — this drops member commits from the holder range mechanically, no patch-id reliance. Member-conflict drop and holder-conflict path: restore remaining members AND the holder to `holder.head` before writing `{...batch, applied: true, solo: true, members: []}` / continuing the loop; the rebuilt stack then holds the holder's own range only. Departed-member check under the apply lock already landed; keep it and add the dirty-worktree preflight to restack's apply too (dirty member → solo + drop + same attempt rebuild; dirty holder → `update-ref` to `holder.head`, `applied: true, solo: true, members: []`, print `fresh checks required rebase <slug> onto <builtOn>`).
- `mergePass` rebuild path (`applied:false` records): before writing the replacement record, restore the holder branch/worktree to the OLD record's `holder.head` (via `restoreHolder`) so the new `holder` fields never capture contaminated stack content. Members go through `restoreDrifted` as today.

D-E. Every "fresh memberless solo record" written after a removal uses `holder: { base: <builtOn>, head: <holder.head> }` provenance — i.e. the new record's holder fields describe the holder's own pre-batch range, never a stacked sha.

## 4. Acceptance criteria

1. Red `check.fix` on an applied membered batch: members restored + solo, `batch dissolved, merge solo`, and the holder branch/worktree equals `holder.head` — `git rev-list <holder.head>..<holder-tip>` after dissolve contains only holder commits; a following memberless `merged --check`/`merged` push puts no member file on the remote (B's probe scenario, now a test).
2. Member departure during `batchPush` recheck: holder restored to `holder.head`, remaining members restored, record cleared, no push.
3. Restack member-conflict drop: dropped member solo+restored, holder range contains no member commits (assert `git merge-base --is-ancestor <dropped old tip>` false of new top and `git cat-file` file absent).
4. Dirty member at apply: files preserved (`git status --porcelain` still shows them), leaf solo, excluded from record and push.
5. Dirty holder at apply: member branches restored to `head`, holder branch `update-ref`'d to `holder.head`, worktree files preserved, `solo` record, prompt says `solo`.
6. Dirty member at dissolve/restore: files preserved, branch back at `head`, leaf solo.
7. Criterion 9: new test — fixture repo gains `setup: 'bun install --frozen-lockfile'` + a `checks` entry that resolves a marker package; member branch adds `file:`-style local package + updated lockfile; the batch's single check run passes on the applied top (run the composed command from `akrogon config` inside the holder worktree, or `bun install --frozen-lockfile && <check>` directly); after dissolve/restore, run the same in the MEMBER worktree and assert it resolves the member's own lockfile (e.g. the marker package's version/path from the member's `bun.lock`, not the batch's). If a `file:` dep fixture is too heavy, use `bun install --frozen-lockfile` proving the worktree lockfile is honored — the mechanism (setup composes the worktree's own lockfile) is the criterion; document the choice.
8. All existing batch tests stay green; schema literal updates are mechanical (they gain `holder: {base, head}`).

## 5. Read-first list

- `src/batch.ts` (move/applyStack/restoreMembers/buildStack), `src/state.ts` (`batchSchema`), `src/next.ts` (`mergePass` apply block ~lines 990-1045, `restoreDrifted`, record write ~line 920), `src/phase.ts` (`batchPush`, `restack`, `check.fix` dissolve block, `memberEntries`, `mergeHead`), `tests/batch-merge.test.ts` (`batchFixture`, `soloFixture`, member-departure/dissolve/restack tests), `tests/batch-dispatch.test.ts` (record literals, dirty-adjacent tests), `tests/batch.test.ts` (schema tests), `tests/helpers.ts` (`fixture`, `yaml`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 6. Do-not

- Do not reopen B's repaired findings (empty ranges, same-pass wake, solo holder, cleanup retention, attempt/HEAD gate, notice once, departed-member restack) — they are landed and green; keep their behavior.
- Do not change `buildStack`'s empty-range or conflict semantics; restack calls it with `{base: builtOn, head: <own head>}` items, which works today.
- No weakening of criteria; no `issues/` files on the branch; no new deps.
- `Test-Change:` trailer on every commit touching an existing test file, citing the review finding (B F2 / A F2 / criterion 9) as source.
- Return a mismatch with evidence instead of diverging from section 3.

## 7. Ordered steps

Advisory: 5-7 files, under 45 turns.

1. Write the failing tests for criteria 1-6 first (extend `batch-merge.test.ts` and `batch-dispatch.test.ts`; the dirty-worktree ones need real dirty files in fixture worktrees).
2. Schema `holder` field + literal updates (expect fixture updates in the same commit as schema — cite A F2/B F2 in trailers only where an assertion actually changes; adding a required field to literals is mechanical, not an expectation change — still needs the trailer because the file path matches the rule).
3. `move()` dirty safety + `restoreHolder` helper + mergePass/phase.ts paths.
4. Criterion-9 test.
5. `AKROGON_BASE=… bun test --changed` + `bun test tests/batch-merge.test.ts tests/batch-dispatch.test.ts tests/batch.test.ts` + `bun x tsc --noEmit`.

## 8. Commands

`AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`

Run `bun install` first.

## 9. Done-when, evidence and report

Criteria 1-8 green; pasted outputs; each repaired finding shows fail-before/pass-after. Commit(s) on worker HEAD, return commit id(s).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
