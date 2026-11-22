# Sub-brief 1: merge-phase leaves uncounted; `capacity` wait reason

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/merge-seat-cap-u1` (created at commit d49b7bb85c8005765505d2145c4aa517185be7cb — work only here)

## 1. Goal

Plan decisions D1, D2, D3, D4, D5 (error text only) of `plan.md`: leaves in phase `merge` stop counting against `max_active`, and a dispatch refused for capacity records the wait reason `capacity`, listed as its own kind by `akrogon timing`.

## 2. Acceptance criteria

1. In `src/next.ts` `activeCount`, the `unfinished` predicate no longer counts a leaf whose `state.phase === 'merge'`; `merged` and `failed` remain excluded, every other phase keeps counting, and the `unknown`/`unreadable` terms are untouched. The one predicate is shared by the live-session branch, the refused-session branch and `seated`, so this is one edit.
2. In `src/next.ts` `dispatchLeaf`, the `if (allocated === null)` branch (only that call site, ~line 761) returns `end('capacity')` instead of `end('none')`. The `broadcastPass` `allocated === null` site (~line 1064) stays a bare `return` with no wait row; `seatCommand`'s site throws as before.
3. In `src/timing.ts`, `waitReasonSchema` gains the literal `'capacity'` before `'none'`; the enum otherwise unchanged.
4. In `src/timing-report.ts`, `waitOrder` gains `'capacity'` after `'merge_turn'`. No other code change: `WaitKind` derives from `WaitReason`, and `reasonAt`/`waitTotals`/`memberLine` need nothing else.
5. The `seatCommand` throw at ~line 1171 keeps reporting `max_active` and states that leaves waiting in merge do not count, e.g. `No free seat capacity: max_active ${global.max_active} reached (leaves waiting in merge are not counted)`.
6. These planned tests pass exactly as written (do not touch them):
   - `bun test tests/next.test.ts --timeout=30000 -t "waiting in merge does not count"` (2 tests)
   - `bun test tests/timing.test.ts --timeout=30000 -t "capacity waits"`
   - `bun test tests/timing-report.test.ts --timeout=30000 -t "a capacity wait lists under its own kind"`
   Currently all four fail (the behavior is missing); they must pass after your change.
7. `bun run typecheck` is clean.

## 3. Read-first list

- `src/next.ts` lines ~369-395 (`activeCount`, `unfinished`, `seated`), ~400-420 (`allocate`), ~640-670 (`dispatchLeaf` `end` helper), ~755-765 (the `allocated === null` site), ~1054-1075 (`broadcastPass`, do not touch), ~1164-1180 (`seatCommand`).
- `src/timing.ts` line 22 (`waitReasonSchema`), ~116-125 (`recordWait` dedup — read it, do not change it).
- `src/timing-report.ts` line 23-26 (`WaitKind`, `waitOrder`).
- `tests/next.test.ts` new tests at file end; `tests/timing.test.ts`, `tests/timing-report.test.ts` new tests at file end.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/next.ts`: `unfinished` also excludes `'merge'`; the `dispatchLeaf` `allocated === null` branch ends with `'capacity'`; `seatCommand` error text per criterion 5. Owned by this unit.
- `src/timing.ts`: `waitReasonSchema = z.enum(['prerequisite', 'parked', 'merge_turn', 'capacity', 'none'])`. Owned by this unit.
- `src/timing-report.ts`: `waitOrder: WaitKind[] = ['repo_pause', 'parked', 'prerequisite', 'merge_turn', 'capacity']`. Owned by this unit.
- Owned paths: `src/next.ts`, `src/timing.ts`, `src/timing-report.ts` only. No shared test resource with the other unit (it edits docs only). No prerequisite output from it.

## 5. Do-not, reasons and exceptions

- Do not edit any `tests/` file — tests are locked; a red or wrong planned test is a mismatch you return, not a fix. Exception: none.
- Do not touch `broadcastPass`, `park.ts`, `mergeTurn`, `reconcile`, or any other writer — only the two named sites. Exception: a revised brief from A.
- Do not add helpers, abstractions, comments or docstrings beyond the change. Exception: none.
- Do not run `git stash` in any form — worktrees share one stash. To set work aside: commit it as WIP, then before returning `git reset --soft d49b7bb85c8005765505d2145c4aa517185be7cb` and make the unit's one commit. Exception: none.
- Do not stop processes by name pattern (`pkill -f` etc.); stop a run with `akrogon stop-run <id>` only. Exception: none.
- Do not run `akrogon verify`, `bun test` without `-t`, or the full suite — only the commands in section 7. Exception: none.
- A mismatch means returning evidence (conflicting requirement, actual code, smallest brief correction), not changing scope. Exception: a revised brief from A authorizes it.

Reasons restated: tests are the leaf's locked proof; the two named call sites are the whole behavior surface; the stash is shared across worktrees; pattern kills hit other leaves' runs; scoped commands keep output attributable.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worker worktree (criterion 7 prerequisite).
2. Edit `src/next.ts`: `unfinished` predicate, `end('capacity')` at the `dispatchLeaf` site, `seatCommand` error text (criteria 1, 2, 5).
3. Edit `src/timing.ts` and `src/timing-report.ts` (criteria 3, 4).
4. Run the three targeted test commands (criterion 6) — expect all four tests green.
5. Run `bun run typecheck` (criterion 7).
6. Commit everything as ONE commit on top of d49b7bb85c8005765505d2145c4aa517185be7cb. Message example: `feat: merge-phase leaves stop counting toward max_active; capacity wait reason`. No `Test-Change:` trailer is needed — you change no test file.

Advisory size: 3 files, under 12 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile`
- `bun test tests/next.test.ts --timeout=30000 -t "waiting in merge does not count"`
- `bun test tests/timing.test.ts --timeout=30000 -t "capacity waits"`
- `bun test tests/timing-report.test.ts --timeout=30000 -t "a capacity wait lists under its own kind"`
- `bun run typecheck`

Keep output through `akrogon run-check --name <label> -- <cmd>` from the worktree and cite the `check <label>: <exit> <path>` lines. If `akrogon run-check` refuses inside a worker worktree, run the commands plainly and paste results.

## 8. Done-when, evidence and report

All acceptance criteria met, one commit exists on top of the creation commit, and your return includes the commit ID plus these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
