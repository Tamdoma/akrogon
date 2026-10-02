# Plan: recovery-keeps-rounds

Debate: no. The plan comes straight from `brief.md` and `design.md` (Q2 2a).

## Decisions

- D1. In `commitMove` (`src/phase.ts:107-112`), remove only the `recorded.phase === 'failed' ? 0` arm. The result is `to === 'check.fix' && recorded.phase === 'check.review' ? recorded.fix_rounds + 1 : recorded.fix_rounds`. The increment condition and the cap at `src/phase.ts:248` stay as they are (`b-repair-phase` owns them).
- D2. Recovery still clears `done`, `verdict`, `prompted`, `prompted_at`, `delivery_error`, `attempts`, `failure`. Nothing else in `commitMove` changes.
- D3. Cap-failure proof: the existing scenario at `tests/phase.test.ts:92-112` (`review aggregates verdicts, rechecks only B, caps repairs and permits operator restart`) already reaches `failed` through the cap with `fix_rounds: 1`. Before recovery, add an assertion that the stored `failure.reason` is `fix rounds exhausted` and `fix_rounds` is 1. After `phase repair implement`, assert `fix_rounds: 1` in place of 0. The test checks only the stored count, not which move gets refused next, so it holds whether or not `b-repair-phase` has merged.
- D4. Generic recovery proof: rename the test at `tests/phase.test.ts:824` to `failed exits by command reset attempts and keep fix_rounds`. `stuck` (`fix_rounds: 3`) keeps 3 after `plan.synthesis`. Seed `still-stuck` with `fix_rounds: 2` and assert it keeps 2 after recovering straight to `check.fix`. That shows a recovery into `check.fix` neither resets nor increments the count.
- D5. Doc: in `docs/guide/phases.md:73`, add one sentence after "Recovery resets the recorded pass and delivery bookkeeping." It says recovery keeps the repair count (`fix_rounds`), so a leaf failed at the cap gets one more repair and a B-only re-check on each recovery.

## Read first

- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`
- `src/phase.ts` `commitMove` (around line 87) and the cap move (around line 240)
- `tests/phase.test.ts:95-120`, `:824-840`, `tests/helpers.ts` (`leaf`, `cli`, `readState`, `fakeHerdr`)
- `learnings/LESSONS.md` has no lesson about recovery or fix_rounds (no gap to report).

## Interfaces

`fix_rounds` stays a non-negative number in `state.yaml`. No schema change. Leaves that were already reset keep the value they have stored now.

## Checklist

### Wave 1

- U1. Recovery keeps fix_rounds (D1-D5)
  - Owns: `src/phase.ts`, `tests/phase.test.ts`, `docs/guide/phases.md`
  - Shared test resource: none (each test builds its own temporary fixture repo)
  - Depends on: none
  - Docs: `docs/guide/phases.md` (operator guide, D5). No agent doc changes. `skills/watch-issues/SKILL.md:34` already ties B-only review to `fix_rounds > 0`, and that stays true.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun when |
|---|---|---|---|---|
| 1 (cap failure keeps count) | `bun test tests/phase.test.ts -t "caps repairs"` | recovery after "fix rounds exhausted" sets `fix_rounds` back to 0, which lets A review its own repair again and refills the budget | seconds | `commitMove` or the cap move changes |
| 1 (any recovery keeps count) | `bun test tests/phase.test.ts -t "failed exits by command"` | recovery to `plan.synthesis` or `check.fix` resets or increments `fix_rounds` | seconds | `commitMove` changes |
| Repo checks | `bun run format`, `bun run typecheck`, `test_changed` with `AKROGON_BASE` | formatting or type breakage in the touched files | seconds | any edit |

Fail-first: run the edited tests before the D1 source edit and confirm they fail on the old reset (0 vs the expected 1/3/2).

## Notes for review

- The brief cites `docs/guide/phases.md:73` as saying recovery keeps the count. Today that line says only that recovery resets pass and delivery bookkeeping. D5 adds the sentence the brief describes.
- Merge overlap: `b-repair-phase` edits the same `fix_rounds` expression. The merge seat resolves it, as the design says.
- Known limit: leaves already reset by older recoveries keep their lower stored count. The design accepts this.
