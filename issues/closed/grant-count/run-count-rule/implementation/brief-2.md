# Sub-brief 2: chart-issues Take grant paragraph (unit U2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/run-count-rule-u2 (detached HEAD 5499e3da; all file work happens there, never in the leaf checkout).

## 1. Goal

Prose edit implementing plan decision D4 for leaf `run-count-rule`: extend the `## Take` grant paragraph in `skills/chart-issues/SKILL.md` with the unit/renewal/door rules.

## 2. Numbered acceptance criteria

1. The paragraph beginning "Each leaf's `grants` records one scoped grant" contains the substrings `unit`, `consumes one`, `own bound`, `never restates`, `after <date or commit>`, `draws on`, `never warns and runs` — appended after its existing final sentence ending "needs new approval.".
2. Every other line of `skills/chart-issues/SKILL.md` is unchanged.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/chart-issues/SKILL.md` `## Take` section, the paragraph at line ~65 beginning "Each leaf's `grants` records one scoped grant during charting". It ends: "...larger effects or expiry needs new approval."

## 4. Change list and needed interfaces

Path this unit owns: `skills/chart-issues/SKILL.md` only. No preceding-worker output.

Append verbatim, continuing the same paragraph (one space after "needs new approval."):

> Each repeat bound names its unit and what consumes one in plain words (for example, "at most 2 recorder invocations, counting every invocation that reaches a paid session, whatever its outcome"), and a nested unit, such as sessions per invocation, is its own bound; `stop_line` never restates a repeat count. A renewal entry states its new total or "N more after <date or commit>", and the next count line names the entry it draws on. The door's charting probe counts against the leaf grant it runs under, and the door itself never warns and runs: every paid proof call still waits for operator approval.

## 5. Do-not, reasons and exceptions

- Do not touch any other line, paragraph or file: diff scope criterion; exception: none — off-list changes return a mismatch.
- Do not paraphrase the verbatim text or change the existing paragraph wording; exception: none.
- A sibling leaf (proof-coverage/coverage-audit) edits other paragraphs of this same file in its own worktree; do not "fix" anything there; exception: none.
- One commit containing only this edit; exception: none.
- Conflicts with live file state are a mismatch to A; the exception is a revised brief from A.

Reasons and exceptions restated: stay inside the owned path and verbatim text; report conflicts as mismatch, fixed only by a revised brief from A.

## 6. Ordered steps

1. Read the `## Take` grant paragraph (criterion 1).
2. Append the three sentences verbatim after "needs new approval.".
3. Verify: `awk "BEGIN{RS=\"\"} /Each leaf.s .grants. records one scoped grant/{print; exit}" skills/chart-issues/SKILL.md | grep -cE "never warns and runs|draws on|never restates"` prints 3; `git status --porcelain` lists exactly this file.
4. Commit as one commit, e.g. `chart-issues: grant bounds name units, renewals and door counting`; no `Test-Change` trailer needed.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Prose only; no unit tests. A's criterion grep is the proof. Report `git status` and the verification grep result.

## 8. Done-when, evidence and report

Done when the edit is applied, verification prints 3, the commit is made and its id is reported.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
