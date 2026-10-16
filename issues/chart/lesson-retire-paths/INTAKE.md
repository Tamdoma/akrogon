# Intake: lesson-retire-paths

## Scope
Destination akrogon. One chart: the lesson retire rule gains removal and loud refusal as exits beside a running guard, plus an operator-approved transfer for judgment lessons, stated the same way in every skill and guide that encodes it.

## Provenance
- GitHub: Tamdoma/akrogon#95

## Source: Tamdoma/akrogon#95
# Lesson rule retires a lesson only through a running guard: lessons whose mechanism was removed or now fails loudly at its reader have no retire path

Source: Tamdoma/akrogon#95
URL: https://github.com/Tamdoma/akrogon/issues/95

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-10-16 the framework's `learnings/LESSONS.md` holds 158 active lesson lines, and no file under `learnings/history/` carries an `Applied` line. The lesson rule's Retire clause, learn-issues' Guarded outcome and implement-issue's lesson sentence all retire a line only when a leaf delivers "a running mechanical guard covering a lesson's mechanism on every reachable path". A lesson whose mechanism no longer exists (the file, step or field it describes was deleted) or whose reader now stops loudly at the point of use has no retire path. learn-issues can only sort such a line as Stays or Checkable, so it stays active.

## Location

- `skills/lesson-rule.md:8` (Retire clause)
- `skills/learn-issues/SKILL.md:20-22` (Guarded, Checkable, Stays) and `:28` (the Applied line names a guard file:line)
- `skills/implement-issue/SKILL.md:33` (applying a lesson "lands the running mechanical guard")
- Consumer: Tamdoma/tamdoma-framework `learnings/LESSONS.md` and `learnings/history/`

## Reproduction

1. Pick a framework lesson whose cited script, field or step was later deleted from the code.
2. Run learn-issues on the framework.
3. No running guard covers a mechanism that no longer exists, so the line is sorted Stays or Checkable and is kept.

Frequency: every lesson of this kind, on every learn-issues pass.

## Expected behavior

From the operator decision recorded in the framework chart `issues/chart/agent-latitude/forks/check-retirement.md` (Taken 3a, 2026-10-16): a lesson line retires when a leaf stops its mechanism on every reachable path, by removing the mechanism, by a reader or writer that fails loudly at the point of use, or by a running guard. Its history file gets `Applied <date> by <file:line or commit>: <what stops it>`. A judgment-class (Stays) lesson may move to the one live review step that uses it only through operator approval of the uncommitted learn diff, recorded as a transfer and never as Guarded. A Checkable lesson never retires on a note. If that review step is never reached, the lesson stays.

## Urgency

Low to medium. Nothing breaks. The active list only grows (129 on 2026-10-08, 135 on 2026-10-09, 158 on 2026-10-16), and lines about code that no longer exists make it noisier. The framework plans one learn-issues sweep of all active lines after this rule changes, and that sweep waits on this report. Workaround: none, the lines stay active.

## Suspected cause

The Retire clause and the Guarded definition name a single exit, a running guard, so removal of the mechanism and loud failure at the point of use were never retire outcomes. The implement-issue sentence repeats the same single exit.
Whose view: both (operator decision, agent reading).
Files read: `skills/lesson-rule.md`, `skills/learn-issues/SKILL.md`, `skills/implement-issue/SKILL.md` in the akrogon workspace at 4088a91 (2026-10-16). The installed release `~/.akrogon/releases/4088a91ad3015c346dc56a9fd485827033e1c507` has identical lesson-rule and learn-issues files (`diff -q` empty).
Not inspected: akrogon's own `learnings/` for Applied lines, and how many of the 158 framework lessons cite a mechanism that is now gone (the planned sweep counts that). Would disprove: an existing retire path for removed mechanisms elsewhere in akrogon skills.
Related reports: Tamdoma/akrogon#73 (closed): lessons never feed back into checks because the only outlet is a manual learn-issues pass. That report is about the outlet. This one is about the retire criterion. Searched Tamdoma/akrogon, all states, limit 10: "lesson-rule Retire" (none), "learn-issues Guarded" (#73), "Applied lesson" (#73); filing account's reports since 2026-10-14: #91-#94, none related.

## Agent findings
- Single-exit sites at 4088a91 (A,B): skills/lesson-rule.md:8, skills/learn-issues/SKILL.md:20-22,28,38, skills/implement-issue/SKILL.md:33, skills/check-issue/SKILL.md:61, skills/chart-issues/assets/shapes.md:289 and skills/chart-issues/SKILL.md:75. check-issue:61 and the chart audit were not listed in the report.
- Prose sites (A,B): learnings/LESSONS.md:5, docs/guide/learn.md:18, skills/AREA.md:15, README.md:222, docs/guide/cheat.md:149.
- Code (A,B): src/lessons.ts:21 recognizes a retirement only by a history line starting `+Applied`; src/batch.ts:150 re-removes union-resurrected lines (.gitattributes sets LESSONS.md merge=union); src/phase.ts:548 `merged --check` refuses a range still holding a retired line. Keeping the `Applied` prefix for stopped mechanisms needs no code change.
- Earlier lock this intake revises: issues/chart/lesson-guards/forks/lesson-lifecycle.md, "applied = running mechanical guard" (handed off 2026-10-10).
- Framework count was 159 active lines in the inspected checkout, still no `Applied` line (B).
