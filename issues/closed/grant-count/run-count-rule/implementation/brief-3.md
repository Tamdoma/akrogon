# Sub-brief 3: chart assets placeholders and standing-design clause (unit U3)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/run-count-rule-u3 (detached HEAD 5499e3da; all file work happens there, never in the leaf checkout).

## 1. Goal

Prose edits implementing plan decisions D5 and D6 for leaf `run-count-rule`: update the `readiness.yaml` `bounds`/`stop_line` placeholders in `skills/chart-issues/assets/shapes.md`, and extend the recorded-output covering-grant clause in `skills/chart-issues/assets/standing-design.md`.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/assets/shapes.md` contains `every invocation that reaches a paid session, whatever its outcome` inside the `bounds:` placeholder and a `stop_line:` placeholder containing `never a repeat count`.
2. `skills/chart-issues/assets/standing-design.md` line 15 ends with the extended clause containing `repeat-count bound` and `still stops`.
3. Every other line of both files is unchanged (standing-design: only that one clause changes; shapes.md: only the two placeholder lines).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/chart-issues/assets/shapes.md` lines ~326-327, inside the `grants:` block of the `readiness.yaml` shape.
- `skills/chart-issues/assets/standing-design.md` line 15, which ends "...A fresh call runs only under a covering grant, never as a silent fallback, and otherwise the seat takes the operator-blocker stop."

## 4. Change list and needed interfaces

Paths this unit owns: the two asset files. No preceding-worker output.

- shapes.md line 326 becomes (keep the same indentation):
  `    bounds: <limits on use; each repeat bound names its unit and what consumes one in plain words, e.g. "at most 2 recorder invocations, counting every invocation that reaches a paid session, whatever its outcome"; a nested unit is its own bound>`
- shapes.md line 327 becomes:
  `    stop_line: <never-cross condition; never a repeat count>`
- standing-design.md line 15's final clause "A fresh call runs only under a covering grant, never as a silent fallback, and otherwise the seat takes the operator-blocker stop." becomes:
  "A fresh call runs only under a covering grant, never as a silent fallback, and otherwise the seat takes the operator-blocker stop; a call past a repeat-count bound warned under the seat rule is covered, while a call outside the grant still stops."

## 5. Do-not, reasons and exceptions

- Touch only the two named lines in each file; the rest of both files stays byte-identical; exception: none — off-list changes return a mismatch.
- Do not paraphrase the verbatim replacements; exception: none.
- One commit containing only these edits; exception: none.
- Conflicts with live file state are a mismatch to A; the exception is a revised brief from A.

Reasons and exceptions restated: stay inside the owned lines and verbatim texts; report conflicts as mismatch, fixed only by a revised brief from A.

## 6. Ordered steps

1. Read both target regions (criteria 1-3).
2. Replace the two shapes.md placeholder lines and the standing-design final clause.
3. Verify: `grep -c "every invocation that reaches a paid session, whatever its outcome" skills/chart-issues/assets/shapes.md` prints 1; `grep -nE "stop_line: <never-cross condition; never a repeat count>" skills/chart-issues/assets/shapes.md` prints the line; `grep -oE "A fresh call runs only under a covering grant[^.]*" skills/chart-issues/assets/standing-design.md | grep -c repeat` prints 1; `git status --porcelain` lists exactly the two files.
4. Commit as one commit, e.g. `chart assets: grant bound placeholders and warned-overrun coverage`; no `Test-Change` trailer needed.

Advisory size: 2 files, under 10 turns.

## 7. Commands

Prose only; no unit tests. A's criterion greps are the proof. Report the verification output.

## 8. Done-when, evidence and report

Done when both edits are applied, verification passes, the commit is made and its id is reported.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
