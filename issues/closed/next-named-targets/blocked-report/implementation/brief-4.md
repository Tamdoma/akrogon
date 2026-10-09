# Brief U4: CLI tests

## 1. Goal

Prove C1-C8 at the CLI boundary per plan D7, D8. Update manual-silence expectations that the picked report intentionally changes.

## 2. Numbered acceptance criteria

1. Epic folder with ready plus dep-blocked plus input-blocked plus failed starts ready, prints three lines, exits 1.
2. Dep line names every unmerged dep with phase or parked, missing, unreadable in one leaf; merged open plus merged closed never appear and never block.
3. Input line names every missing input by kind, name, holder, never a value; leaf blocked by both reports deps only.
4. Failed picked reports failed plus phase recovery; merged picked completes with no line.
5. Same blocked leaf gives the same line by slug, one-leaf folder path, and multi-leaf folder path.
6. Bare `next` without event, `--all` inside, and `--all` outside report the same; target and `--all` stay manual with `HERDR_PANE_ID` or inherited `HERDR_PLUGIN_EVENT_JSON`.
7. Hook pass, `--resume`, and merge wake after `phase` print no wait line; a dependent started by a completion prints no wait line; unreadable still reports on an automatic path.
8. Merge turn, capacity, and busy seats never produce a line.
9. The three manual-silence tests now expect the picked report: `missing dependencies skip...` expects two skips, `next --all leaves a gapped leaf...` expects exit 1 with one skip, `next refuses unmerged dependencies...` `--all` branch expects exit 1 with two skips.

## 3. Read-first list

- `tests/next.test.ts` (skips 1157-1168, missing deps 1204, readiness helpers 3775-3795, gapped tests 3797-3875, dependent-still-blocked 695), `tests/helpers.ts` (fixture, cli, leaf, fakeHerdr), `tests/fake-herdr.ts`, `src/next.ts` (U3 picked paths).
- Pattern to copy: `missing dependencies skip their leaf while readable unmet dependencies wait and siblings dispatch` plus `readinessInput` plus `skips()`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

Chunks that must land first: U3. Paths owned: `tests/next.test.ts`. Shared test resource: none, each test builds its own fixture. Consumed output: U3 picked report in `src/next.ts` plus U1 labels.

- Append blocked-report tests at the end under `// blocked-report`, reusing `dispatchFixture`, `next`, `skips`, `database`, `leaf`, `readinessInput`, `configure`. Assert stderr JSON records plus exit codes plus herdr calls, never full prose. Cover criteria 1-8 with the smallest set; one test may prove several criteria. Update only the three tests in criterion 9, each with a brief-outcome reason. Show one deliberate red per new behavior by temporarily dropping one blocker or label, pasting the red output, then restoring green.

## 5. Do-not, reasons and exceptions

- Do not touch code or docs. Reason: U1 plus U3 own code, U2 owns docs. Exception: none.
- Do not change existing assertions except the three in criterion 9, and change each only because brief criteria 1-3 require picked manual reports. Reason: old silence contradicts the brief. Exception: none; anything else is a mismatch with evidence.
- Do not pick leaves by owner name. Reason: names belong to sibling `named-targets`. Exception: none; use slug, folder path, bare `next`, and `--all` only.
- Mismatch rule: return a mismatch with evidence to A instead of changing scope or an interface. Exception: a revised brief from A authorizing that change.
- Restated: stay in the owned test file, update only the three cited tests for the cited brief reason, avoid name targets, and mismatch rather than widen scope, unless A revises this brief.

## 6. Ordered steps

1. In `tests/next.test.ts`, append epic folder plus dep detail plus input detail tests for criteria 1-3.
2. In `tests/next.test.ts`, append failed plus merged plus same-line plus manual-forms tests for criteria 4-6.
3. In `tests/next.test.ts`, append automatic silence plus dependent-not-picked plus real-errors plus no-line tests for criteria 7-8.
4. In `tests/next.test.ts`, update the three tests in criterion 9 with picked expectations.
5. Show each deliberate red with temp code edits outside the owned file or temp test edits reverted before commit, paste red plus green, and leave the tree green.

Advisory size: 1 file, under 10 turns.

## 7. Commands

Run only this changed-test command from the worker worktree, after `bun install` there when `node_modules` is absent:

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-9 hold, only the owned file differs, red plus green outputs are pasted, and the changed-test command result is pasted. Scenarios use temporary repos with herdr replaced at one boundary and no real panes. No end-to-end artifact is required.

The worker commit ends with `Test-Change: tests/next.test.ts <added blocked-report cases and that no existing expectation changed except the three cited>` plus one `Test-Change:` line per updated old test naming the brief outcome, in the final trailer block.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
