# Brief-3: status marker (U3, wave 2)

## 1. Goal

Show paused repos in `akrogon status` without changing unpaused output. Plan D8, D9 for status, D11.

## 2. Numbered acceptance criteria

1. `status` prints a marker containing the substring `paused` beside each paused repo heading, including a repo with no open leaves.
2. `status --charts` shows the same marker beside paused repo headings.
3. Targeted `status <slug>` for a leaf in a paused repo prints a line with `paused` and the repo name.
4. Unpaused repos print as before. Leaf phases, blockers, merge queue and capacity are unchanged.
5. Missing `paused.yaml` means none paused. An invalid file makes `status` fail non-zero naming the full file path.
6. One deliberate break turns a new test red, for example removing the marker branch.

Smallest CLI-boundary set proving 1-6. Assert the `paused` substring presence or absence, exit codes and unchanged unpaused bytes. Never assert exact prose beyond the substring. New tests need no cited source.

## 3. Read-first list

- `src/status.ts` for board, charts and targeted leaf rendering to extend.
- `src/pause.ts` from U1 for `readPaused`, `tests/helpers.ts` for `fixture`, `cli` and `leaf`, `tests/status.test.ts` for output patterns.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

Wave 2, must land first: U1. Paths owned: `src/status.ts`, `tests/pause-status.test.ts`. Shared test resource: none, isolated fixtures only. Consumed output: U1 `src/pause.ts` helpers.

Changes:

- Read pause once per status run with `readPaused`. Missing is empty, invalid throws naming the file.
- Add the marker beside the repo heading in board, empty-repo, `--charts` and targeted leaf paths per D8. Keep unpaused bytes identical.
- Add `tests/pause-status.test.ts` for criteria 1-6.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `src/akrogon.ts`, guide docs or `README.md`. Other units own them.
- Do not mark unpaused repos. The design annotates paused repos only.
- Do not change phases, blockers, queue or capacity logic.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons stay attached: wave safety and locked design. The only exception is a revised brief from A.

## 6. Ordered steps

1. Write `tests/pause-status.test.ts` for criteria 1-5 first. Cover board, empty repo, charts, targeted leaf, unpaused unchanged, missing and invalid file. Run red.
2. Edit `src/status.ts` for criteria 1-5. Run green.
3. Show criterion 6 break, then restore green.
4. Run the brief changed-test command. Commit only owned paths.

Advisory size: about 2 files and under 12 turns.

## 7. Commands

Run only this changed-test command, with the supplied base:

`AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc bun test --changed=3e034dee43f0853446c2ba8f97bb72668ab213dc --timeout=30000`

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-6 pass with pasted results, and the commit contains only owned paths. Link each criterion to its test. Name limits and unverified criteria or say none.

A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file. A commit adding a case to an existing test file carries the same trailer naming what was added and that no existing expectation changed, citing no source. This unit adds only a new test file, so no trailer is expected unless it touches an old test file.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
