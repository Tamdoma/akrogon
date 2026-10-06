# Brief: merge-turn-order unit U6 — next.test.ts for holder dispatch and wake paths

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u6

## 1. Goal

Cover plan criteria 1, 3, 6, 7 and 8 (dispatch side) in `tests/next.test.ts`: only the merge-turn holder's seat B is prompted, waiting leaves keep tab/panes/slot, every holder-exit path wakes the next leaf without a manual `next`, and a committed move whose log append fails still wakes.

Code under test (landed): `dispatchLeaf` holder gate, `mergeWake` in `akrogon.ts` after committed `phase` moves, end-of-pass merge sweep in `nextCommand`, `merge_stamp` on `commitMove`.

## 2. Acceptance criteria

New cases in `tests/next.test.ts` using `fakeHerdr` (pane/prompt recording) and `leaf()` fixtures:

- AC1 Two eligible `merge` leaves `aa`/`bb` (`merge_stamp` controls order: `aa` earlier): `akrogon next` (repo sweep) records exactly one prompt, `merge-issue aa slot=B phase=merge leaf=<path>`, to `aa`'s B pane; `bb` gets no prompt and keeps its tab/panes (db.tabs/panes still contain bb's allocations; allocate only happens if bb has no tab — give bb a recorded `tab`+`pane` ids and pre-create matching fake panes in db so `ownsPane`/matches work; check how existing merge tests fixture tabs — follow the existing pattern in this file for a leaf with allocated panes).
- AC2 `bb` never holder when ineligible: `aa` hand_built or `bb` blocked-by an unmerged leaf → the other is prompted.
- AC3 All holder-exit paths prompt the next leaf's B with no manual `akrogon next` between moves: (a) `phase aa merged --slot B`, (b) `phase aa check.fix --slot B`, (c) `phase aa failed --reason x --slot B`, (d) capped prompt failure — `promptScript` failures on the holder's B pane across passes until `attempts` hits 3 → leaf fails and the same pass prompts `bb`, (e) operator `phase aa merged` from plain cli (no slot). After each, assert the next prompt in `db.prompts` targets `bb`'s pane. A second `akrogon next` afterwards adds no prompt for `bb` (B busy/`prompted` recorded) — assert prompt count stays.
- AC4 Post-commit failure still wakes (criterion 7): `mkdirSync(issues/log.jsonl)` then `phase aa merged` exits non-zero with `log append failed`/`committed` in stderr, yet `bb` was prompted (db.prompts). `rmSync` the dir after.
- AC5 A leaf re-entering `merge` (move out via `failed`, back via operator `phase x merge`) is queued behind two waiting leaves: prompt order after the next sweep is the two earlier leaves' order, not the returnee's; assert via which pane got prompts.
- AC6 Existing tests keep passing; rework only ones whose expectations contradict the holder rule (e.g. tests that prompt multiple `merge` leaves at once — search for leaves in `merge` phase across the file). A changed expectation must be justified by the holder rule and noted in the report.
- AC7 `bun test tests/next.test.ts` passes plus the changed-tests command.

## 3. Read-first

- `tests/next.test.ts` (the merge tests ~lines 561–1000 show the tab/pane fixture pattern), `tests/helpers.ts` (`leaf`, `cli`, `fakeHerdr`, `database` shape), `tests/fake-herdr.ts` (`prompts`, `promptScript`, `failPrompts`, pane fields), `src/next.ts` (`dispatchLeaf`, `mergeWake`, `nextCommand`), `src/phase.ts` (`MoveCommittedError`, `commitMove`), `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

- `tests/next.test.ts` only, plus `tests/helpers.ts`/`tests/fake-herdr.ts` if a small helper is needed (e.g. a db writer for pre-seeded panes — check whether tests already write the db file directly; follow that pattern first, edit helpers only if unavoidable).
- Merge-phase leaves need recorded `pane: {B: '<id>'}` plus a matching fake pane with `agent` set/idle for dispatch to prompt them; copy the exact pattern existing merge tests use (grep `phase: 'merge'` / `merge-issue` expectations in this file).

## 5. Do-not

- Do not edit `src/`. A red test against landed code is a mismatch return with evidence, not a fix.
- Do not weaken existing assertions; resequenced merges keep their original expectations.
- Do not assert prompt prose beyond the prompt text contract already used in this file (`merge-issue <slug> slot=B phase=merge leaf=<path>` is a literal command — asserting it is fine).
- Keep new cases in this file; do not create new test files.

Reasons restated: these tests prove the leaf's core behavioral criteria at the CLI boundary, which is where the contract lives.

## 6. Ordered steps

1. `bun install`; `git log --oneline -1`.
2. Read an existing merge dispatch test end-to-end to copy the fixture pattern.
3. Write AC1–AC5 cases, run `bun test tests/next.test.ts` until green.
4. Fix any AC6 collisions.
5. Run changed-tests command; commit with `Test-Change: tests/next.test.ts added merge-turn holder dispatch and wake coverage; no existing expectation weakened` trailer.

Advisory size: 1–2 files, under 40 turns.

## 7. Commands

- `bun test tests/next.test.ts`
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Done when AC1–AC7 hold and the commit exists. Report the commit id and any reworked existing tests.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
