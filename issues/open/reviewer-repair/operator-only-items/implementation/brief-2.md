# Sub-brief U2: implement-issue pointers

## 1. Goal
Point implement-issue to the operator-only rule without restating it (plan D4).

## 2. Numbered acceptance criteria
1. Line 33's existing text is unchanged and gains one appended sentence pointing to the rule (done-criterion 2).
2. The check.fix closing paragraph (line 75) gains one sentence ending the pass with the rule's one stop when operator actions remain (done-criterion 2).
No test (section 5).

## 3. Read-first list
- `skills/implement-issue/SKILL.md` lines 33-36 and 67-75.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces
Owned path: `skills/implement-issue/SKILL.md`. Prerequisites: none (the rule's location, check-issue Shared context, and heading `Operator actions` are fixed by plan D1). Shared test resource: none.

a. Append to the end of line 33 (after "ends the pass."), separated by one space:
`A review finding whose fix needs operator access follows the operator-only rule in check-issue Shared context.`

b. Insert a new paragraph line directly before line 75 ("Do required work for Fixes only; ..."), with one blank line before and after:
`When the review files list open items under \`Operator actions\`, check.fix repairs the doable Fixes and supplies their proof as below, then ends with the one \`failed\` stop of the operator-only rule in check-issue Shared context instead of \`check.review\`.`

(Backslashes above are shell escaping; the file gets plain backticks.)

## 5. Do-not, reasons and exceptions

- Do not edit any other file or any other line. Reason: the other units of this wave own the other skill files, and the plan locks the scope (D4, D7). Exception: none; return a mismatch with evidence to A instead.
- Do not reword the existing own-step stop text. Reason: done-criterion 2 requires it unchanged byte for byte; a word-diff proves that. Exception: none.
- Do not add a test. Reason: akrogon rejects prose-wording tests (check-issue line 47, lesson 2026-10-01). Exception: none.
- Do not touch `issues/`. Reason: `akrogon phase` refuses issue files on the branch. Exception: none.

Restated: scope, stop text and no-test exclusions protect criterion 2 and the wave split; a needed change outside them is a mismatch returned to A.

## 6. Ordered steps
1. Edit `skills/implement-issue/SKILL.md` per 4a and 4b (criteria 1, 2).
2. Run `git --no-pager diff --word-diff` and confirm line 33's old text shows no deletion.
3. Run the section 7 command, commit "operator-only-items u2: implement-issue pointers to operator-only rule".
Advisory size: 1 file, under 4 turns.

## 7. Commands
`AKROGON_BASE=22c447039b192f4caae6cad4d5b56092941d1bed bun test --changed="$AKROGON_BASE"`

## 8. Done-when, evidence and report

Done when the change is committed with one commit on the detached HEAD, `git status --porcelain` is empty, and the test command output is pasted. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
