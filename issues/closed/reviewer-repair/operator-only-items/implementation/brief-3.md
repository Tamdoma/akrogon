# Sub-brief U3: merge-issue pointer and skills area line

## 1. Goal
Point merge-issue and `skills/AREA.md` to the operator-only rule without restating it (plan D4, D5).

## 2. Numbered acceptance criteria
1. `skills/merge-issue/SKILL.md` line 27's existing text is unchanged and gains one sentence pointing to the rule (done-criterion 2).
2. `skills/AREA.md` line 23 gains one clause pointing to the rule; the file stays at most 40 lines with its four sections.
No test (section 5).

## 3. Read-first list
- `skills/merge-issue/SKILL.md` line 27, `skills/AREA.md`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces
Owned paths: `skills/merge-issue/SKILL.md`, `skills/AREA.md`. Prerequisites: none (rule location and heading fixed by plan D1). Shared test resource: none.

a. In `skills/merge-issue/SKILL.md` line 27, insert after "and ends the pass." and before "This stop covers only ...", separated by single spaces:
`A review finding whose fix needs operator access follows the operator-only rule in check-issue Shared context.`

b. In `skills/AREA.md` line 23, replace the final "." with:
`; a review finding that needs operator access goes under \`Operator actions\` by the check-issue rule, never as a Fix.`

(Backslashes above are shell escaping; the file gets plain backticks.)

## 5. Do-not, reasons and exceptions

- Do not edit any other file or any other line. Reason: the other units of this wave own the other skill files, and the plan locks the scope (D4, D7). Exception: none; return a mismatch with evidence to A instead.
- Do not reword the existing own-step stop text. Reason: done-criterion 2 requires it unchanged byte for byte; a word-diff proves that. Exception: none.
- Do not add a test. Reason: akrogon rejects prose-wording tests (check-issue line 47, lesson 2026-10-01). Exception: none.
- Do not touch `issues/`. Reason: `akrogon phase` refuses issue files on the branch. Exception: none.

Restated: scope, stop text and no-test exclusions protect criterion 2 and the wave split; a needed change outside them is a mismatch returned to A.

## 6. Ordered steps
1. Edit both files per 4a and 4b (criteria 1, 2).
2. Run `git --no-pager diff --word-diff` and confirm no old text shows deletion.
3. Run the section 7 command, commit "operator-only-items u3: merge-issue and area pointers to operator-only rule".
Advisory size: 2 files, under 8 turns.

## 7. Commands
`AKROGON_BASE=22c447039b192f4caae6cad4d5b56092941d1bed bun test --changed="$AKROGON_BASE"`

## 8. Done-when, evidence and report

Done when the change is committed with one commit on the detached HEAD, `git status --porcelain` is empty, and the test command output is pasted. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
