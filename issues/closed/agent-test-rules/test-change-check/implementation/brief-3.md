# Brief 3: `--check` in README and merge guide

## 1. Goal

Operator docs show the `--check` flag and the Test-Change refusal, plan decisions D6 and D8. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/test-change-check-u3`.

## 2. Numbered acceptance criteria

1. `README.md` command-table phase row matches exactly `akrogon phase <slug> <phase> --slot <A|B> [--verdict <verdict>] [--reason <text>] [--check]` (escape `|` as `\|` inside the table cell, as the existing row does) and its effect text names the check-only mode (runs the move's guards without recording or moving; prints `ok` on success).
2. `docs/guide/merge.md` documents: every phase move checks that changed old test files each carry a `Test-Change: <path> <source and reason>` trailer in a commit's final trailer block (path rule defined in `src/test-files.ts`, inline code); the merge seat runs `akrogon phase <slug> merged --slot B --check` right before the push; a refusal names each uncited file and the trailer line to add, which a later commit — including an empty one — may carry.
3. `bun test tests/command-reference.test.ts tests/docs-links.test.ts` green (README row must satisfy the contract test).

## 3. Read-first list

- `README.md` command table (around :136).
- `docs/guide/merge.md` :1-30 (guard/push flow) — insert where the merge sequence is described.
- `tests/command-reference.test.ts` — how the row is parsed (`[^`]` backtick cell, `\|` escapes).
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `README.md`, `docs/guide/merge.md`. Shared literals (fixed by plan): contract string in criterion 1; merge call `akrogon phase <slug> merged --slot B --check`; trailer `Test-Change: <path> <source and reason>`; module `src/test-files.ts` (inline code, no markdown link). Match each file's existing voice: terse table cells in README, short guide paragraphs in merge.md.

## 5. Do-not, reasons and exceptions

- Do not edit code, tests, skills or `docs/guide/phases.md` (owned by the parallel test-rules leaf).
- Do not add markdown links to `src/test-files.ts` (docs-links checks links; inline code only).
- Do not copy the full path-rule list into prose; point to the module.
- Exceptions: none; a conflicting requirement returns a mismatch.

Restating: these exclusions keep one rule definition and avoid the parallel leaf's file; the exception is a mismatch return.

## 6. Ordered steps

1. Update the README command row (criterion 1).
2. Update `docs/guide/merge.md` (criterion 2) — one short paragraph near the merge sequence, not a rewrite.
3. Run `bun test tests/command-reference.test.ts tests/docs-links.test.ts`.
4. Commit with a normal message (no trailer needed — not a test file).

## 7. Commands

`bun test --changed=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 --timeout=30000`, plus the two test files named in criterion 3. Paste actual output.

## 8. Done-when, evidence and report

All three criteria met; tests in criterion 3 pass with pasted output.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
