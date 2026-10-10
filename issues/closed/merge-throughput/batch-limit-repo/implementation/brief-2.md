# Brief 2 (unit U2): `batch_limit` proofs + member-exclusion tests in batch-dispatch/config

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/batch-limit-repo-u2

## 1. Goal

Plan decisions D5 and D6 for `tests/batch-dispatch.test.ts` and `tests/config.test.ts`: prove the `batch_limit` cap, config print and refusal, and rewrite leaf-`solo` expectations for the new per-attempt exclusion semantics. Plan: /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/plan.md

## 2. Numbered acceptance criteria

New behavior already implemented on this lane's base commit (worker reads it in `src/`):

- `RepoConfig.batch_limit: number`, default 4, `z.number().int().positive()`.
- `mergeTurn` member slice: `Math.min(repo.config.batch_limit - 1, fresh.state.batch_limit ?? Number.POSITIVE_INFINITY)` over the queue after the holder.
- `Batch.excluded?: string[]`; a member that conflicts while the stack builds is dropped from members, its slug appended to `excluded`, and NO per-leaf `solo` mark is written (the `State.solo` key is gone — `readState` drops it from stored files).
- `phase <member> failed` is never refused; when a carried member leaves merge, `phase <holder> merged` is refused, the batch dissolves and the record clears (see existing test 'a member leaving merge before merged refuses the push...' in `tests/batch-merge.test.ts`).

Tests to add:

1. `tests/batch-dispatch.test.ts` — 6 leaves in merge, `issues/config.yaml` without `batch_limit`: after `next --all`, `readState(holder).batch!.members` has exactly 3 slugs. Mirror the style of 'the holder gets a batch record...' (allocatedLeaf + commitFile + toMerge + saveDatabase clear + next).
2. Same file — three small cases in one or two tests: `batch_limit: 1` → 0 members; `batch_limit: 2` + holder `toMerge(..., { batch_limit: 0 })` → 0 members; `batch_limit: 4` + holder `{ batch_limit: 1 }` → 1 member. Write config overrides with `yaml(resolve(f.root, 'issues/config.yaml'), {...})` before `toMerge`/`next` (import `yaml` from helpers).
3. Same file — member exclusion + re-eligibility (criterion 4): holder `aa`, members `bb`, `cc` (merge order). `bb` deletes the fixture's root `file` (`git -C <bb worktree> rm file` + commit); `cc` edits `file` (write + commit); `aa` adds its own new file. `next --all`: build order bb then cc; cc's edit-vs-delete rebase onto bb's tip conflicts → assert `batch.excluded` contains `'cc'`, `batch.members` is `['bb']` only, `git rev-parse refs/heads/cc` equals its pre-batch head. Then `phase bb failed --reason stop` (exit 0), `phase aa merged --slot B --attempt <fresh attempt>` refused (code ≠ 0) → batch dissolved. `next --all` again: new batch on aa, assert `batch.members` contains `cc` (proves no persistent mark filtered it). Do NOT use identical-content or same-line edits for the conflict — modify-vs-delete is asymmetric and guarantees cc rebases cleanly onto main once bb is gone.
4. `tests/config.test.ts` — in the first test's `toMatchObject` block, assert `batch_limit: 4` prints by default; add `batch_limit: 2` to one repo config and assert `batch_limit: 2`. Add a case writing `batch_limit: 0`, `batch_limit: -1`, `batch_limit: 1.5` (each in turn or three expects) and assert `cli(f,['config']).code` non-zero with stderr containing `batch_limit` — mirror the existing `fix_rounds: 0`/`max_active` refusal pattern in that same test.
5. Existing-test repairs in `tests/batch-dispatch.test.ts` — remove every leaf-`State.solo` usage (typecheck fails on it): the member-conflict test (~line 123) asserts `batch.excluded` contains `'cc'` instead of `readState(cc.path).solo`; the rest of that test's flow (cc becomes holder, `batch.solo` record assertions) stays — `cc` still conflicts as holder once `bb`/`aa` content lands. `toMerge(..., { solo: true })` extras are deleted (the key no longer exists). `.solo` assertions on `readState(member.path)`/`bbState`/`stayed` etc. are deleted; where a test name mentions "solo" in the leaf-mark sense ("a member leaving merge... without solo marks" lives in the other file — yours: 'a solo leaf leaving merge and returning joins the next holder batch' ~585, 'solo-seat commits survive' ~665), rewrite to the remaining contract: leaf rejoins batches like any leaf / `toMerge` with `batch`-level `solo: true` record in state if the test's flow needs it. `batch.solo`, `record.solo`, `state.batch?.solo`, `batch!.solo` assertions are RECORD-level and stay untouched.
6. All touched `bun test` files green; `bun run typecheck` clean in the worktree (U1 landed — if a `.solo` error in `src/` appears, return a mismatch).

## 3. Read-first list

- /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/plan.md (D5, D6 + Notes)
- `tests/batch-dispatch.test.ts` lines 1–70 (fixture helpers: `allocatedLeaf`, `toMerge`, `commitFile`, `mergePrompts`, `saveDatabase`, `next`, `head`) and 86–190 (the two batch tests to mirror/repair)
- `tests/helpers.ts` (`leaf`, `yaml`, `cli`, `fixture`, `fakeHerdr`)
- `tests/config.test.ts` lines 7–62 (print + refusal pattern)
- `src/next.ts` ~1010–1045 and ~1170–1195 (new selection/exclusion code, landed)
- `src/state.ts` `batchSchema` (`excluded` field, landed)
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces

Owned paths: `tests/batch-dispatch.test.ts`, `tests/config.test.ts`. Prerequisite landed: U1 (`src/config.ts`, `src/state.ts`, `src/next.ts`, `src/phase.ts`) — verify `Batch.excluded` and `RepoConfig.batch_limit` exist; absent → mismatch. Parallel worker U3 owns `tests/batch-merge.test.ts` and `tests/batch.test.ts` — do not touch them. Shared test resource: none (each test builds its own temp repo).

New exports needed: none; tests import `yaml` from `./helpers`, `readState`/`saveState`/`State`/`Batch` from `../src/state`.

## 5. Do-not, reasons and exceptions

- Do not edit `src/` — landed code; a defect there is a mismatch return, not a fix. Exception: none.
- Do not edit `tests/batch-merge.test.ts`, `tests/batch.test.ts`, `tests/helpers.ts`, docs or skills — U3/U4 scope. Exception: none.
- Do not assert `readState(...).solo` anywhere — the key is removed; `bun run typecheck` fails on it. Exception: none.
- Do not weaken kept assertions to `toBeTruthy` where a value is knowable — kept record-level `solo` asserts stay exact.
- Return a mismatch with evidence rather than changing scope or interfaces. Exception: a revised brief from A.

## 6. Ordered steps

1. `bun install`; grep `\.solo\b` inside your two owned files and list every leaf-level site to repair (record-level stays).
2. Write the three new test blocks (criteria 1–3) — run each red first against the pre-U1 base? No: U1 landed; instead write the test, verify it passes, then deliberately break one thing (e.g. assert 4 members in the cap test once) to confirm the test catches the regression, revert.
3. Repair leaf-`solo` sites (criterion 5).
4. `tests/config.test.ts` additions (criterion 4).
5. `bun test tests/batch-dispatch.test.ts tests/config.test.ts` and `bun run typecheck` green.
6. Commit. The commit message MUST end with a final trailer block:
   `Test-Change: tests/batch-dispatch.test.ts plan batch-limit-repo: leaf solo mark replaced by per-attempt batch.excluded record`
   `Test-Change: tests/config.test.ts plan batch-limit-repo: added batch_limit print/refusal cases, no existing expectation changed`

Advisory size: 2 files, under ~30 turns.

## 7. Commands

```sh
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/batch-dispatch.test.ts tests/config.test.ts
bun run typecheck
```

## 8. Done-when, evidence and report

All six criteria hold, owned tests green, typecheck clean, one commit with the Test-Change trailers (return SHA). Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
