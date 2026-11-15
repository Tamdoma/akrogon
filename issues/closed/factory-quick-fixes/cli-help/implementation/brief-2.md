# Brief: cli-help unit U2 — commands.md intro line

Worktree: /home/ivan/.akrogon/worktrees/akrogon/cli-help-u2

## 1. Goal

Plan decision D7: `docs/reference/commands.md` gains one sentence in its intro paragraph documenting `--help` behavior. The command table itself is untouched — `tests/command-reference.test.ts` parses rows and compares them to `src/akrogon.ts` `case` labels; a table change would break it.

## 2. Numbered acceptance criteria

1. The intro paragraph of `docs/reference/commands.md` states that `akrogon <verb> --help` prints the verb's declared flags on stdout and exits 0, that `akrogon --help` prints the verb list, and that an unknown flag exits 1 with one stderr line naming the flag and the verb's declared flags.
2. No table row is added, removed or reworded; no other doc file changes.

## 3. Read-first list

- `docs/reference/commands.md` — edit only the top intro paragraph.
- `tests/command-reference.test.ts` — read to confirm the table contract the doc must keep.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — working mode.

## 4. Change list and needed interfaces

One prose sentence (or two short ones) appended to the file's existing intro paragraph. Match the doc's plain style. Nothing else.

## 5. Do-not, reasons and exceptions

- No table changes — `command-reference.test.ts` asserts rows equal dispatched verbs and argument groups.
- No new sections, no examples, no other files.
- Return a mismatch instead of changing scope; the exception is a revised brief from A.
- Restated: one intro sentence only; return mismatches rather than re-scope.

## 6. Ordered steps

Advisory: 1 file, under 4 turns.

1. Read `docs/reference/commands.md` and `tests/command-reference.test.ts`.
2. Append the `--help` sentence to the intro paragraph.
3. Commit with message `docs: state the --help and unknown-flag behavior`.

## 7. Commands

No test commands; the docs check is `tests/command-reference.test.ts` and `tests/docs-links.test.ts`, which A runs at proof time.

## 8. Done-when, evidence and report

Criterion 1 and 2 hold; the commit ID is returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
