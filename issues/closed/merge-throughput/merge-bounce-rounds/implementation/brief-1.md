# Brief 1: count merge bounces toward fix_rounds

## 1. Goal

Plan decisions D1–D4 (locked design 1a): every `merge -> check.fix` increments `fix_rounds`, and the existing repair cap applies to that origin so a merge leaf at the cap moves `failed` with the same outcome as a `check.repair` origin. B-only re-review is unchanged. `--red-on-base` holds and batch splits count nothing (no code change; asserted by test).

## 2. Numbered acceptance criteria

1. `phase <slug> check.fix` on a leaf in phase `merge` leaves `fix_rounds` one higher than before.
2. The same call on a merge leaf with `fix_rounds >=` the configured `fix_rounds` prints `moved failed` and records `failure: { cause: 'attempts', phase: 'merge', slot: 'B', reason: 'fix rounds exhausted' }` (delivery field as in the existing cap test).
3. A `--red-on-base` hold on a merge leaf with a batch record leaves `fix_rounds` unchanged.
4. Existing `check.repair -> check.fix` counting and cap assertions keep passing unchanged.
5. docs/guide/phases.md states merge `check.fix` bounces count toward `fix_rounds`; the `fix_rounds` bullet in docs/guide/setup.md names merge bounces.

## 3. Read-first list

- src/phase.ts — `commitMove` `fix_rounds` field (~line 151); the `capped` block inside `transition` (~lines 302-318)
- src/routing.ts — `routing['merge'].slots` is `['B']`; do not touch
- tests/phase.test.ts ~lines 100-137 — test 'review fix routes to check.repair, B hands to A, rechecks only B, caps handoffs and permits operator restart' containing the `conflict` and `capped` merge leaves; test 'fix cap records attempts failure' (~line 1183) is the failure-record pattern to copy
- tests/hold.test.ts ~lines 229-300 — the batch `--red-on-base` hold test
- tests/helpers.ts `leaf()`, `cli()`; tests/fake-herdr.ts `fakeHerdr(f)`
- docs/guide/phases.md ~line 108; docs/guide/setup.md ~line 60
- ponytail.md in the implement-issue skill folder

## 4. Change list and needed interfaces

- src/phase.ts `commitMove`: `recorded.phase === 'check.repair'` becomes `recorded.phase === 'check.repair' || recorded.phase === 'merge'`.
- src/phase.ts `transition` cap: `state.phase === 'check.repair'` becomes `state.phase === 'check.repair' || state.phase === 'merge'`; the failure literal `phase: 'check.repair'` becomes `phase: state.phase`. `slot: slot ?? required[0]` already resolves `B` for a merge-origin call.
- tests/phase.test.ts, in the repair-cap test: `conflict` merge leaf bounce assertion `fix_rounds` 0 → 1; `capped` merge leaf (`fix_rounds: 1`, config cap 1) expectation `moved check.fix` → `moved failed`, state `{ failure: { cause: 'attempts', phase: 'merge', slot: 'B', reason: 'fix rounds exhausted', delivery: 'shown' } }`, and pass `herdr.env` on that `cli` call (announceFailed throws without fake herdr). Cited source for changing both expectations: brief done-criteria 1 and 2.
- tests/hold.test.ts batch hold test: in the existing `saveState` set `fix_rounds: 1`, then assert `holderState.fix_rounds` is `1` after the hold (new assertions, no cited source needed).
- docs/guide/phases.md cap sentence: name merge `check.fix` bounces. docs/guide/setup.md `fix_rounds` bullet: same.

Owned paths: src/phase.ts, tests/phase.test.ts, tests/hold.test.ts, docs/guide/phases.md, docs/guide/setup.md. Shared test resource: none (temp-repo fixtures, fake herdr). Prerequisite units: none.

## 5. Do-not, reasons and exceptions

- No separate merge-bounce counter and no B-judged attribution: foreclosed by locked design 1a. Exception: none.
- No `fix_rounds` change on batch split, `--red-on-base`, merged push, or `failed -> check.fix` recovery: brief counts only the `merge` origin. Exception: none.
- Do not touch files outside the owned paths; if a requirement conflicts with real code or a locked decision, return a mismatch with evidence instead of widening scope. Exception: a revised brief from A authorizing the change.
- Do not change existing assertions beyond the two named (`conflict`, `capped`); the cited brief outcomes are the authority for those two changes. Exception: none.

Restated: the exclusions exist because scope is locked by the design and other merge-path transitions are deliberately not counted; the only exception is a revised brief from A.

## 6. Ordered steps

1. Write the test changes first (criterion 1, 2, 3): update the `conflict` and `capped` expectations in tests/phase.test.ts and add the `fix_rounds` set+assertion in tests/hold.test.ts. Run `bun test tests/phase.test.ts tests/hold.test.ts` and confirm the new expectations are red — that is the before proof.
2. Apply the two src/phase.ts edits.
3. Rerun both test files until green (criteria 1-4).
4. Edit the two doc lines (criterion 5).
5. Commit everything in one commit; the message ends with a `Test-Change:` trailer per changed old test file (see section 8).

Advisory size: 5 files, under 25 turns.

## 7. Commands

Run `bun install` first in this worktree, then the resolved changed-test command:

```bash
AKROGON_BASE=3fde73f7197f35ea17ba2ff06c0705c535f9f75e bun test --changed="$AKROGON_BASE" --timeout=30000
```

Use the single-file form `bun test tests/phase.test.ts tests/hold.test.ts` during step 1/3 iteration; the `--changed` command is the required final worker run.

## 8. Done-when, evidence and report

All five criteria green with pasted command results, one commit on the worktree HEAD carrying both `Test-Change:` trailers. For akrogon command work, tests use temporary repositories, real files/processes and fake herdr at the boundary — no real panes, GitHub or herdr socket. A commit changing an existing test file ends its message with `Test-Change: <exact path> <source and reason>` trailers in the final trailer block, here:

- `Test-Change: tests/phase.test.ts updated merge->check.fix expectations for brief criteria 1-2 (count and cap now apply to merge origin)`
- `Test-Change: tests/hold.test.ts added fix_rounds-set and unchanged-after-hold assertions; no existing expectation changed`

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
