# Brief 1: recovery keeps fix_rounds

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/recovery-keeps-rounds-u1` (detached at 22c4470). Edit and commit only there.

## 1. Goal

A move out of `failed` keeps `fix_rounds` instead of setting it to 0, with no exception for a leaf failed by the repair cap (plan D1-D5). Recovery still clears pass and delivery bookkeeping as today.

## 2. Numbered acceptance criteria

1. In `tests/phase.test.ts`, test `review aggregates verdicts, rechecks only B, caps repairs and permits operator restart` (around lines 92-112): after the move that prints `moved failed`, assert the stored state has `failure.reason` `fix rounds exhausted` and `fix_rounds: 1`. After `phase repair implement`, assert `{ phase: 'implement', fix_rounds: 1 }` in place of `fix_rounds: 0`. (D3)
2. Test `failed exits by command reset attempts and allow check.fix` (around line 824): rename it to `failed exits by command reset attempts and keep fix_rounds`. `stuck` (seeded `fix_rounds: 3`) still has `fix_rounds: 3` after `plan.synthesis`, and attempts/done still reset. Seed `still-stuck` with `{ fix_rounds: 2 }` and assert `{ phase: 'check.fix', fix_rounds: 2 }` after the `check.fix` recovery. (D4)
3. Tests assert the stored count only, never which later move gets refused.
4. Before/after proof: the edited tests fail on the unchanged source (expected 1/3/2, received 0), then pass after the source edit.
5. `docs/guide/phases.md:73` gets one sentence after "Recovery resets the recorded pass and delivery bookkeeping." saying recovery keeps the repair count (`fix_rounds`), so a leaf failed at the cap gets one more repair and a B-only re-check on each recovery. (D5)

## 3. Read-first list

- `src/phase.ts` `commitMove` (around lines 87-112) and the cap move (around line 240-250)
- `tests/phase.test.ts:92-120` and `:824-840`, `tests/helpers.ts` (`leaf`, `cli`, `readState`)
- `docs/guide/phases.md:60-75`
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/phase.ts`: the `fix_rounds` field in `commitMove` becomes
  `to === 'check.fix' && recorded.phase === 'check.review' ? recorded.fix_rounds + 1 : recorded.fix_rounds`. Only the `recorded.phase === 'failed' ? 0` arm is removed. (D1, D2)
- `tests/phase.test.ts`: criteria 1-3.
- `docs/guide/phases.md`: criterion 5.
- `fix_rounds` stays a number in `state.yaml`. No schema change.
- Owned paths: those three files. Shared test resource: none. Depends on: none.

## 5. Do-not, reasons and exceptions

- Do not change the increment condition or the cap expression. The parallel leaf `b-repair-phase` owns them, and the merge seat resolves the overlap.
- Do not change any other field in `commitMove` (`done`, `verdict`, `prompted`, `attempts`, `failure`, busy fields). Recovery must still clear them.
- Do not add new test files or new tests. Extending the two existing tests is the cheapest proof.
- Do not edit `docs/guide/state.md` or any skill doc. They have no reset text.
- If the code or tests differ from this brief, return a mismatch with evidence instead of changing scope.

Reasons and exceptions restated: the cap and increment belong to `b-repair-phase`; recovery bookkeeping stays as-is; scope is three files. Exception: a revised brief from A.

## 6. Ordered steps

1. Edit the two tests (criteria 1-3). Run `bun test tests/phase.test.ts -t "caps repairs|failed exits by command"` and confirm red with 0 received. Save the output.
2. Edit `src/phase.ts` (criterion 4). Rerun the same command and confirm green.
3. Edit `docs/guide/phases.md` (criterion 5).
4. Run the changed-test command below. Commit the three files with a short message, no co-author.

Advisory size: 3 files, under 12 turns.

## 7. Commands

`AKROGON_BASE=22c447039b192f4caae6cad4d5b56092941d1bed bun test --changed="22c447039b192f4caae6cad4d5b56092941d1bed"`

Run `bun install` first if `node_modules` is missing.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold, red then green is pasted, and the changed-test command passes. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
