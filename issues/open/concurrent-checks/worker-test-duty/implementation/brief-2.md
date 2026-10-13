# Sub-brief 2: worker-test-duty unit 2 — check-issue proof sentence

## 1. Goal

Give check-issue the locked evidence rule (plan D4): output from a run outside the printed `checks` command can prove the specific done outcome it exercises but never replaces a required `checks` result.

## 2. Numbered acceptance criteria

1. `skills/check-issue/SKILL.md` `Failed `checks` commands always block` paragraph carries the one sentence: output from a run outside the printed `checks` command can prove the specific done outcome it exercises but never replaces a required `checks` result.
2. No other paragraph or file changes.
3. `bun test tests/red-docs.test.ts tests/docs-links.test.ts tests/base-run.test.ts` passes.

## 3. Read-first

- `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/worker-test-duty/plan.md` (D4)
- `skills/check-issue/SKILL.md` — the `Failed `checks` commands always block` paragraph (currently ~line 61) and the neighbouring B-checks paragraph (~line 55)
- `skills/check-issue/ponytail.md` (house style; copy its prose register)

## 4. Change list and needed interfaces

File owned: `skills/check-issue/SKILL.md`. No prerequisites; no shared resources.

Edit: append the sentence `Output from a run outside the printed `checks` command can prove the specific done outcome it exercises but never replaces a required `checks` result.` to the paragraph beginning `Failed `checks` commands always block unless every failing unit is known-red`, matching the file's prose style.

No interface changes; skill prose only.

## 5. Do-not, reasons and exceptions

- Do not touch any other file — the sibling unit owns implement-issue's files; no exception.
- Do not reword surrounding paragraphs or add validation machinery — the locked design is one sentence, no validator.
- Do not add tests — the plan adds none; return a mismatch instead if you believe the criterion needs one.
- Do not run the resolved `test_changed` command or `format`/`typecheck` — those are A's; run only section 7's commands.
- Return a mismatch with evidence rather than changing scope; the exception is a revised brief from A.

Reasons: the design caps this fix at one sentence in one file; broader edits collide with the sibling unit or exceed locked scope. Exceptions: only a revised brief authorizes different scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree (flock it: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`).
2. Apply the edit (criterion 1).
3. Run the targeted tests (criterion 3).
4. Commit the file on the detached HEAD; no `Test-Change:` trailer needed (no `src/test-files.ts`-matched file touched).

Advisory size: 1 file, under 6 turns.

## 7. Commands

Targeted tests for this unit: `bun test tests/red-docs.test.ts tests/docs-links.test.ts tests/base-run.test.ts` (these test files read the edited skill file).

## 8. Done-when, evidence and report

All three criteria hold; the targeted test command output is pasted; the commit ID is returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
