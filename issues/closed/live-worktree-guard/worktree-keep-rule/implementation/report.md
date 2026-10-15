# Report: worktree-keep-rule

## Base and head

- Base: `fb60ccd` (`AKROGON_BASE` after refresh; the `kept-status` leftovers-command merge)
- Committed head: `310c23c`
- Refresh: branch rebased onto `origin/main` at implement start; prior base `9800d9e` → new base `fb60ccd`, prior head `eeb580e` → `4302a75` (same test commit, new id). A second refresh after the last commit was a no-op (already on tip).

## Changed files and reasons

- `src/reconcile.ts` (`bbd7698`, worker u1 `88557a3`) — D1–D6: porcelain parsed once into `Map<path, {head, branch?, locked}>`; lock keeps `locked worktree (<reason>)` in the per-leaf loop and the candidate sweep before every leaf/kind/fallthrough rule; `unmanaged worktree` fallthrough for registered worktrees that are no leaf slug or scratch kind; `removeWorktree` records `{path, head, rule, branch?}` into `removedWorktrees`; `keptReportSchema` gains optional `removed`, `writeKept`/`writeKeptReport` widened, `readRemoved` added.
- `src/reconcile.ts` (`8b7624b`) — repair: `git worktree prune` stays gated on all removals, not only registered-worktree removals; `rmSync`'d scratch dirs can contain inner worktrees whose stale registrations only that pass clears (caught by `closed tab scratch deletes merged folder and prunes inner worktree`).
- `skills/chart-issues/SKILL.md` (`2f9772f`, worker u2 `52025f7`) — D7: direct worktree created `git worktree add --lock --reason "<chart-folder> direct"`, unlock before landing removal, on abandon, and before lifecycle handoff.
- `README.md` (`267ec97`) — reconcile paragraph now describes the keep-first rule and the removal record.
- `tests/keep-rule.test.ts` (`4302a75`, `d27b01b`, `310c23c`) — criterion tests T1–T3 + leftovers listings; formatting commit.
- `tests/reconcile.test.ts` (`4302a75`) — two variant expectations rewritten to `unmanaged worktree` per brief criterion 1 (`Test-Change:` trailer).

## Worker returns

- u1 (`88557a3` → `bbd7698`): report clean, both targeted commands green. `check test: 0 implementation/check-test-1792102656861-1990199.log`, `check typecheck: 0 implementation/check-typecheck-1792102661024-2016562.log`.
- u2 (`52025f7` → `2f9772f`): four prose edits verified in diff; its `bunx prettier --check skills/chart-issues` failed on pre-existing drift outside the configured `format` scope (`skills/chart-issues/scripts`), confirmed identical at HEAD — left as-is.

## Commands run and proof results

| Command | Head | Result | Artifact |
| --- | --- | --- | --- |
| `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts tests/reconcile.test.ts` | base (pre-code) | red, 5 planned fails | `check test: 1 implementation/check-test-1792102399755-1708315.log` |
| same | `bbd7698` (u1 landed) | green, 34/34 | `check test: 0 implementation/check-test-1792102698841-2067665.log` |
| `akrogon verify` | `267ec97` | red — `closed tab scratch deletes merged folder and prunes inner worktree` | `verify test: 1 implementation/check-test-1792102835248-2109487.log` |
| `bun test tests/next.test.ts -t "closed tab scratch deletes merged folder"` | `8b7624b` | green | `check test: 0 implementation/check-test-1792102846840-2602881.log` |
| `bun test tests/keep-rule.test.ts tests/reconcile.test.ts tests/next.test.ts` | `8b7624b` | green, 269/269 | `check test: 0 implementation/check-test-1792102902571-2605957.log` |
| `akrogon verify` | `8b7624b` | red — format check on `tests/keep-rule.test.ts` | `verify format: 1 implementation/check-format-1792103030970-3644831.log` |
| `akrogon verify` | `310c23c` | **green** (894 tests, typecheck, format) | `verify test: 0 implementation/check-test-1792103263669-4093539.log`, `verify typecheck: 0 implementation/check-typecheck-1792103265558-4093539.log` |

## Criterion proofs

1. Unmanaged registered worktrees stay through `next --all` and `tab_closed`, listed `unmanaged worktree` — proven green by `tests/keep-rule.test.ts` T1 and the two rewritten `reconcile.test.ts` variant tests (run `check-test-1792102698841`, re-confirmed `check-test-1792103263669` on `310c23c`).
2. Locked worktrees stay whatever the name, reason naming the lock reason — T2 green (same runs), asserting all five names and the literal `akrogon leftovers` lock-reason listing.
3. Scratch kinds keep existing removals — existing `reconcile.test.ts`/`next.test.ts` suite green on `310c23c` (894/894), including verify/batch/worker removal cases; post-unlock removals asserted inside T2.
4. `removed` records with path/branch/head/rule, empty on quiet passes, old reports still read — T3 green (same runs).
5. Direct-route lock/unlock prose — `skills/chart-issues/SKILL.md` diff `2f9772f`; no test by design (prose only).

## check.fix repair (2026-10-16)

Handed to A: review-B F1 — criteria 2 and 4 lacked the deliberate-break captures the design requires. Existing T2/T3 and the planned command sufficed; no new test, machinery or expectation change.

- Criterion 2 break: removed the candidate-loop `row.locked` keep in `src/reconcile.ts` (uncommitted). `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts -t "locked worktrees stay"` → red: locked scratch copies reported raw `fatal: cannot remove a locked working tree…` and `keep-holder-x` fell to `unmanaged worktree`. `check test: 1 implementation/check-test-1792103450820-645901.log`. Restored via `git checkout`.
- Criterion 4 break: dropped `removedWorktrees.push` in `removeWorktree` (uncommitted). `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts -t "reconcile report records"` → red: report `removed` came back `[]` after real removals. `check test: 1 implementation/check-test-1792103461423-652311.log`. Restored via `git checkout`.
- Post-restore green: `bun test tests/keep-rule.test.ts tests/reconcile.test.ts` → 34/34, `check test: 0 implementation/check-test-1792103468732-654273.log` on head `310c23c`.
- `akrogon verify` on `310c23c`: green receipt `8c74a762-70ae-4ea5-96c8-7c7a414e93cf` (tree `c78e61b5`, unchanged; reused).
- No commits this pass — repairs were temporary breaks only; reviewed head unchanged at `310c23c`.

## Known limitations

- A lock taken between the pass's porcelain read and `git worktree remove` is refused by git itself and lands as a kept entry with git's stderr reason — acceptable backstop, not the `locked worktree` reason.
- `readRemoved` returns the parsed record list; `akrogon leftovers` displays kept entries only — removed records live in the report JSON for a person to read, per decision 3's scope.

## Unverified criteria

None.
