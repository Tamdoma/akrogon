# Sub-brief U1: check-issue operator-only rule

## 1. Goal
Define the operator-only rule once, in `skills/check-issue/SKILL.md` Shared context (plan D1, D2, D3, D4).

## 2. Numbered acceptance criteria
1. A new paragraph directly after line 27 contains exactly the rule text in section 4 (done-criterion 1).
2. Line 27's existing text is unchanged and gains one appended sentence pointing to the rule (D4).
No test (section 5).

## 3. Read-first list
- `skills/check-issue/SKILL.md` lines 25-29.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces
Owned path: `skills/check-issue/SKILL.md`. Prerequisites: none. Shared test resource: none.

a. Append to the end of line 27 (after "ends the pass."), separated by one space:
`A finding whose fix needs operator access follows the operator-only rule below instead.`

b. Insert after line 27, with one blank line before and after, this paragraph as one line:
`An operator-only item is a finding whose fix needs something only the operator can grant (a permission, a token scope, a live-mutation authorization). The review seat records it under an \`Operator actions\` heading in \`review-<slot>.md\` under the \`leaf=\` folder, never as a Fix for the repair seat, with the exact operator command or action, what the seat tried, which credential or identity it used, and the observed error. An operator action that gates a done-criterion holds merge until it is resolved, so the seat's verdict is \`fix\`; one that gates none leaves the verdict to the other findings. The review seat never stops on an operator action, because one seat's \`failed\` ends the leaf before the peer's Fixes are repaired. The repair seat finishes every doable Fix first, then makes one stop naming every open operator action, the action first: \`akrogon phase <slug> failed --reason "<operator action first; see review-<slot>.md>" --slot <A|B>\`; with no doable Fix it stops at once.`

(Backslashes above are shell escaping; the file gets plain backticks.)

## 5. Do-not, reasons and exceptions

- Do not edit any other file or any other line. Reason: the other units of this wave own the other skill files, and the plan locks the scope (D4, D7). Exception: none; return a mismatch with evidence to A instead.
- Do not reword the existing own-step stop text. Reason: done-criterion 2 requires it unchanged byte for byte; a word-diff proves that. Exception: none.
- Do not add a test. Reason: akrogon rejects prose-wording tests (check-issue line 47, lesson 2026-10-01). Exception: none.
- Do not touch `issues/`. Reason: `akrogon phase` refuses issue files on the branch. Exception: none.

Restated: scope, stop text and no-test exclusions protect criterion 2 and the wave split; a needed change outside them is a mismatch returned to A.

## 6. Ordered steps
1. Edit `skills/check-issue/SKILL.md` per 4a and 4b (criteria 1, 2).
2. Run `git --no-pager diff --word-diff` and confirm line 27's old text shows no deletion.
3. Run the section 7 command, commit "operator-only-items u1: operator-only rule in check-issue".
Advisory size: 1 file, under 4 turns.

## 7. Commands
`AKROGON_BASE=22c447039b192f4caae6cad4d5b56092941d1bed bun test --changed="$AKROGON_BASE"`

## 8. Done-when, evidence and report

Done when the change is committed with one commit on the detached HEAD, `git status --porcelain` is empty, and the test command output is pasted. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
