# Brief 3 (unit U3): leaf-`solo` removal repairs in batch-merge/batch tests

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/batch-limit-repo-u3

## 1. Goal

Plan decision D5 for `tests/batch-merge.test.ts` and `tests/batch.test.ts`: remove/replace every leaf-level `State.solo` usage now that the per-leaf `solo` mark is gone, keep record-level `batch.solo` semantics, and assert the new `Batch.excluded` field where a stack-build conflict drops a member. Plan: /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/plan.md

## 2. Numbered acceptance criteria

Semantics already landed on this lane's base (read in `src/`):

- `State.solo` is removed; `readState` drops a stored `solo` key so old state.yaml files still parse.
- `Batch.excluded?: string[]`: a member conflicting during the mergeTurn stack build or the phase.ts restack is removed from `members` and appended to `excluded`; batch-record `solo` (holder-conflict only) unchanged.
- `State.batch_limit` (leaf) unchanged — post-split follower cap, cleared leaving merge.
- `commitMove` no longer carries a `solo` key; a leaf re-entering merge is a plain leaf.

Required repairs:

1. `grep -n '\.solo\b\|solo:' tests/batch-merge.test.ts tests/batch.test.ts` — every LEAF-level `readState(...).solo` assertion and `{ solo: true }` state extra is repaired; every RECORD-level `batch.solo` / `record.solo` / `batch!.solo` assertion stays untouched. Verify by context: `solo` on `State` = leaf (rewrite/remove); `solo` inside `batch`/`record`/`Batch` literals = record (keep).
2. Known sites in `tests/batch-merge.test.ts` (verify all, plus any the grep finds): line ~254 `stayed.solo` → delete; ~375 member `.solo` assertions after a split → delete (test name keeps "without solo marks" only if still meaningful — rename if it reads better as "without per-leaf marks" or keep name, judge); ~389 `state.solo` → delete; ~686 `dropped.solo` → assert `batch.excluded` contains that slug (restack member conflict now records it); ~713, ~765, ~847 `members[i].solo` → delete; ~1074 `dropped.solo` → `batch.excluded`; `soloFixture` (~124) builds a `Batch` record with `solo: true` — KEEP (record-level); the `{ solo: true }` extras passed to `leaf()`/`saveState` on leaf STATE are removed.
3. `tests/batch.test.ts` ~line 35 'stateSchema accepts a state with batch and solo': rename to reflect `excluded` + legacy-key handling — assert `stateSchema.parse` accepts a batch containing `excluded: ['x']`, and add a `readState`-level check (write a temp `state.yaml` containing `solo: true` plus a valid state, `readState` returns a State without `solo` and does not throw) proving stale keys still parse. Use `helpers.leaf()`/`yaml()`/`fixture()` as other tests do, or construct the parse directly — smallest code that proves it.
4. `bun test tests/batch-merge.test.ts tests/batch.test.ts` green; `bun run typecheck` clean.

## 3. Read-first list

- /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/plan.md (D3–D5, Notes)
- `tests/batch-merge.test.ts` lines 100–150 (`batchFixture`, `soloFixture`), 350–410 (split test), 660–730 and 1040–1160 (conflict/drop sites)
- `tests/batch.test.ts` lines 30–45
- `src/state.ts` `batchSchema`/`stateSchema`/`readState` (landed)
- `src/phase.ts` ~675–705 (restack records `excluded`)
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces

Owned paths: `tests/batch-merge.test.ts`, `tests/batch.test.ts`. Prerequisite landed: U1. Parallel worker U2 owns `tests/batch-dispatch.test.ts` and `tests/config.test.ts` — do not touch. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not edit `src/` — landed; a defect is a mismatch return. Exception: none.
- Do not touch other test files, helpers, docs or skills — other units' scope. Exception: none.
- Do not delete record-level `solo` assertions or the `soloFixture` — the holder-conflict solo record is preserved behavior. Exception: none.
- Do not leave `readState(...).solo` anywhere — typecheck fails on it.
- Return a mismatch with evidence rather than changing scope. Exception: a revised brief from A.

## 6. Ordered steps

1. `bun install`; run the grep, tabulate every site leaf vs record.
2. Repair each leaf site per criterion 2 (delete pure-presence asserts; `excluded` asserts at conflict sites).
3. Rework the `batch.test.ts` schema test (criterion 3).
4. `bun test` both files + `bun run typecheck` green.
5. Commit. Message ends with trailer block:
   `Test-Change: tests/batch-merge.test.ts plan batch-limit-repo: leaf solo mark replaced by per-attempt batch.excluded record`
   `Test-Change: tests/batch.test.ts plan batch-limit-repo: solo state key removed; added excluded parse and legacy-key drop case`

Advisory size: 2 files, under ~25 turns.

## 7. Commands

```sh
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/batch-merge.test.ts tests/batch.test.ts
bun run typecheck
```

## 8. Done-when, evidence and report

All four criteria hold, owned tests green, typecheck clean, one commit with the Test-Change trailers (return SHA). Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
