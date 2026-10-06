# Brief: merge-turn-order unit U7 — status.test.ts for TURN column

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u7

## 1. Goal

Cover plan criteria 2 and 9 in `tests/status.test.ts`: `akrogon status` names the merge holder and each waiting leaf's place, orders unstamped leaves by their last `to: merge` log record, and marks `no merge record` last.

Code under test (landed): TURN column in `src/status.ts`, `mergeQueue` ordering in `src/turn.ts` (stamp → last `to: merge` log ts → slug; no record last).

## 2. Acceptance criteria

New cases in `tests/status.test.ts`:

- AC1 With `merge` leaves where `aa` is stamped earlier than `bb`: the rendered table shows `holder` in `aa`'s TURN cell and `2` in `bb`'s.
- AC2 Two `merge` leaves with no `merge_stamp` but `issues/log.jsonl` entries `{"ts":...,"repo":"repo","slug":"<s>","from":"check.review","to":"merge","slot":"B","attempts":{"A":0,"B":0},"fix_rounds":0,"verdict":{},"head":"<sha>","diff":"","session":null}` (check `src/log.ts` `logSchema` for the exact required fields and reuse the real shape): the earlier `ts` leaf gets the smaller place; a third `merge` leaf with neither stamp nor log record is placed last and its cell contains `no merge record`.
- AC3 An ineligible `merge` leaf (e.g. `hand_built: true`) and non-`merge` leaves show an empty TURN cell.
- AC4 Existing status tests still pass; adjust only expectations the new column breaks (e.g. exact-row assertions — append the TURN cell) and note them in the report.
- AC5 `bun test tests/status.test.ts` passes plus the changed-tests command.

## 3. Read-first

- `tests/status.test.ts` (fixture patterns, how rows are asserted), `tests/helpers.ts` (`leaf`, `cli`, `fixture`), `src/status.ts` (TURN column, `render`), `src/log.ts` (`logSchema` exact fields), `src/turn.ts`, `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

- `tests/status.test.ts` only. Write `issues/log.jsonl` directly in the fixture root for AC2 (the file does not exist by default; `readLog` returns `[]` when absent).

## 5. Do-not

- Do not assert exact full-row strings where a cell-level or substring check suffices (prose-coupling lesson); literal `holder`, place numbers and `no merge record` are the contract and may be asserted.
- Do not edit `src/`; a red test against landed code is a mismatch return with evidence.
- Do not create new test files.

Reasons restated: status output is an operator-facing contract; assert the semantics (holder, place, marker) not cosmetic layout.

## 6. Ordered steps

1. `bun install`; `git log --oneline -1`.
2. Read `src/status.ts` and one existing row-assertion test.
3. Write AC1–AC3 cases; run `bun test tests/status.test.ts` until green; fix AC4 collisions.
4. Run changed-tests command; commit with `Test-Change: tests/status.test.ts added TURN column coverage; no existing expectation weakened` trailer.

Advisory size: 1 file, under 25 turns.

## 7. Commands

- `bun test tests/status.test.ts`
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Done when AC1–AC5 hold and the commit exists. Report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
