# Worker brief 3 — checks.md Known red and AREA.md verify text

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/nameless-base-red-u3` (detached at d534acd5). Text-only unit; `bun install --frozen-lockfile --backend=copyfile` before running the doc test.

## 1. Goal

`docs/reference/checks.md` and `src/AREA.md` state the changed known-red command rule: a red log that names no failed test is covered by a nameless red base entry of the same command, not automatically uncovered.

## 2. Numbered acceptance criteria

1. `docs/reference/checks.md` `## Known red` cover paragraph (~line 89): replace "A red command whose log names no failed test is uncovered." with the rule: a red command whose log names no failed test is covered when the base run's same command fails with a log that also names no failed test; it is uncovered when either side names failed tests the other lacks, or when the log is gone on either side (a gone log never covers).
2. The `verify known-red <sha>: fail` row of the `## Refusals and what to do` table (~line 148): its "What it means" cell no longer claims a red log naming no failed test is always a fail — e.g. "A head failure is not on the base, a red log names different failed tests than the base's, or a red log is gone."
3. `src/AREA.md` `src/verify.ts` paragraph, `requireGreenReceipt` tail: the "every red entry's failed test names also fail the same command on a linked base run" clause states that `(no test name)` head names are covered only by `(no test name)` base names of the same command and a `(log gone)` log never covers — keeping the blocked/base-exit-0 sentences.
4. No sentence anywhere in these files still says a red log that names no failed test is always uncovered.

## 3. Read-first list

- `docs/reference/checks.md` `## Known red` section (~lines 83–93) and the refusal table (~line 148).
- `src/AREA.md` `src/verify.ts` bullet (~line 17), the tail starting "`requireGreenReceipt` is the one gate".
- `src/verify.ts` `knownRedReceipt` (~lines 188–230) for the exact rule being documented.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `docs/reference/checks.md`: two edits (cover sentence, table row cell). Keep table formatting (pipe columns) intact.
- `src/AREA.md`: one edit inside the `requireGreenReceipt` tail of the `src/verify.ts` bullet. Keep the bullet's existing density and semicolon style; do not restructure the file — AREA.md keeps exactly its current sections and stays under 40 lines (it is already ~25).

Owned paths: `docs/reference/checks.md`, `src/AREA.md`. Shared test resource: none. Must land first: nothing (wave 1 of 1).

## 5. Do-not, reasons and exceptions

- Do not restructure either file or touch unrelated sentences — minimal diffs only.
- Do not touch `tests/docs-links.test.ts` — it asserts only the command names, which do not change.
- Do not touch any SKILL.md or `src/*.ts` besides `src/AREA.md` — other units own them.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Read the named regions and the `knownRedReceipt` code.
2. Apply the three edits.
3. Run the doc test command below.
4. Commit with message `docs: state the nameless known-red cover rule`.

Size: 2 files, under 10 turns.

## 7. Commands

`akrogon run-check --leaf /home/ivan/Work/infra/akrogon/issues/open/known-red-nameless/nameless-base-red --name worker3-docs -- bun test --timeout=30000 tests/docs-links.test.ts`

Run it in the worktree. Cite the `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Both files edited, doc test passes, `git status` clean, commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
