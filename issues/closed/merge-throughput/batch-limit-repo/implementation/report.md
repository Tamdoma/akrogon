# Report: batch-limit-repo

Base `2e78945`, head `6521517`. Four workers ran in two waves per plan; all commits cherry-picked onto the lane, all worker worktrees removed.

## Changed files and reasons

- `src/config.ts` — `repoSchema` gains `batch_limit: z.number().int().positive().default(4)`; printed by `akrogon config` via the existing spread (D1).
- `src/state.ts` — `batchSchema` gains `excluded: z.array(z.string()).optional()`; `stateSchema` `solo` key deleted; `readState` drops a stored `solo` key so pre-change `state.yaml` files still parse (D3/D4).
- `src/next.ts` — `mergeTurn` slices members at `min(repo.batch_limit - 1, holder.batch_limit ?? ∞)`; solo filter, `restoreDrifted` mark, member-conflict mark and the dead `batch.solo` dispatch removed; conflict rewrite appends `excluded` (D2–D4).
- `src/phase.ts` — `commitMove` `solo` carry and restack member-conflict `solo` write removed; restack rewrite appends `excluded` (D3/D4). Split (`batch_limit` leaf key) untouched.
- `tests/batch-dispatch.test.ts` — 3 new tests proving criteria 1, 2, 4 (cap default 3, cap/split limits, exclusion + re-eligibility); member-conflict test asserts `excluded: ['cc']`; leaf `.solo` usages removed.
- `tests/config.test.ts` — `batch_limit: 4` default + `: 2` override print asserts; refusal loop for `0`/`-1`/`1.5` asserting non-zero exit and `batch_limit` in stderr (criteria 3, 5).
- `tests/batch-merge.test.ts` — leaf `.solo` asserts deleted; two conflict-drop sites now assert `batch.excluded` contains the slug; record-level `batch.solo` and `soloFixture` kept (D5).
- `tests/batch.test.ts` — schema test renamed; `excluded` parse + legacy `solo` key-drop case (D5).
- `tests/phase.test.ts` — lane-side repair of an unowned regression: merge fixtures used leaf `solo: true` for serial turns; replaced with `batch_limit: 0`, and one leaf that must merge its own head carries a seeded applied `solo` batch record. Reason: `State.solo` removed; `readState` silently dropped the mark, so queued leaves batched and merged early.
- `docs/guide/setup.md`, `docs/guide/merge.md`, `docs/guide/state.md`, `skills/merge-issue/SKILL.md` — `batch_limit` documented (default 4, whole-stack count); member-conflict prose changed from persistent solo mark to per-attempt `excluded` (D7).
- `src/state.ts`, `tests/batch-dispatch.test.ts` — prettier rewraps from `bun run format`; `src/status.ts` format drift reverted per the 2026-10-08 lesson.

## Commands run

- `bun run format` — pass (leaf-file rewrites committed; `src/status.ts` drift reverted).
- `bun run typecheck` — pass, 0 errors.
- `bun test --timeout=30000` — 607 pass / 0 fail, 29 files, 41.7 s (minutes-size, recorded).
- `bun test --changed=$AKROGON_BASE --timeout=30000` — 486 pass / 0 fail, 14 files, 37.3 s.
- `bun src/akrogon.ts config` — prints `batch_limit: 4` (line 35).
- `bun test tests/phase.test.ts` — 57/0 after the lane fixture repair.

## Done-criteria

1. 6 queued, no `batch_limit` → holder + 3 members: `tests/batch-dispatch.test.ts` 'the default batch_limit caps carried members at three'.
2. `batch_limit: 1` → none; `: 2` + split 0 → none; `: 4` + split 1 → 1: 'batch_limit and a holder split limit cap carried members'.
3. 0/negative/non-integer refused naming key: `tests/config.test.ts` refusal cases.
4. Conflict member excluded once, eligible next attempt: 'a conflicted member is excluded from the attempt and eligible for the next batch' (`excluded: ['cc']`, dissolve via member `failed`, re-carried). Deliberate-break check: asserting 4 cap members went red, reverted.
5. `akrogon config` prints effective `batch_limit`; docs updated — verified above.
6. `checks` — all four commands green, results pasted.

## Known limitations

- `next --all` exits 1 while any `failed` leaf is present; the exclusion test asserts exit 1 with the leaf named in stderr for the rebuild pass (pre-existing behavior, not a defect).
- Dirty-member drops during apply are not recorded in `excluded` — deliberate scope line (transient condition, not a conflict); documented in plan D4.
- Worker-reported: none unverified beyond the above.

## Worker returns folded

- U1 `c53ed1a` — src changes; flagged the unowned `phase.test.ts` regression, repaired by A in `3fd07a9`.
- U4 `d456d48` — docs/skill prose.
- U2 `763abe8` — batch-dispatch + config tests.
- U3 `40f8eb4` — batch-merge + batch schema tests.
