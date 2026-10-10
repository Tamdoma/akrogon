# Brief: guard-retires-lesson

## What
A lesson leaves the active list through the leaf that fully guards it, and the removal survives merge.
- Retirement rule, added to the shared lesson rule file lesson-write-rule creates: the leaf that delivers a running mechanical guard covering the lesson's mechanism on every reachable path removes the lesson's line from `learnings/LESSONS.md` and appends `Applied <YYYY-MM-DD> by <guard file:line>: <what it enforces>` to its history file, in its own diff. Leaves that touch the lesson without fully guarding it keep the line. Report closure, duplicate or rejection never removes a line.
- Chart door: when a handed-off leaf owns the complete guard for a lesson its sources trace to (a source seed whose body names a lesson history path), its brief carries that retirement as a done-criterion; the handoff audit refuses such a leaf without it.
- Review: check-issue accepts a removal only when the guard runs on every reachable path; an uncalled or partial guard with a removal is a Fix.
- Merge: before push, in both merge modes, every lesson whose history gained an Applied entry in the pushed range has no line in `LESSONS.md`; a line the `merge=union` attribute brought back is removed again. In top mode B commits nothing, so the step sits where the stack is built or checked.

Consumes from lesson-write-rule: the shared rule file, which this leaf extends with the retirement rule. Consumes from seed-owner-routing (through lesson-write-rule): seed bodies that name the lesson history path.

Owned files: the shared lesson rule file (retirement section), the applying half of `skills/implement-issue/SKILL.md:31`, `skills/chart-issues/SKILL.md` handoff text and `skills/chart-issues/assets/shapes.md` audit, `skills/check-issue/SKILL.md` review bar for removals, `skills/merge-issue/SKILL.md`, and command code on the merge path (`src/batch.ts`, `src/phase.ts`) if the top-mode step needs it, the retirement lines of `docs/guide/learn.md`.

## Why
Tamdoma/akrogon#73. The existing outlets are `implement-issue:31` (applying removes a line, rarely used) and operator-run /learn-issues, which the operator will not rely on. A removal is also lost today: with `learnings/LESSONS.md merge=union`, a rebase onto a main that added a neighbouring lesson line keeps the removed line (reproduced 2026-10-10, forks/draft-review-repairs.md).

## Done-criteria
1. The chart door's handoff audit refuses a leaf that owns the complete guard for a source lesson but lacks the retirement criterion naming its history path; a leaf that only touches the lesson is not required to retire it.
2. A leaf that retires a lesson and merges, solo or in a stack top, onto a main that added a lesson line next to the retired one leaves the pushed `learnings/LESSONS.md` without the retired line and with the new one.
3. Review treats a removal backed by an uncalled or partial guard as a Fix.
4. No step removes a lesson line on report closure, duplicate or rejection.
5. A fresh agent that did not write the change, given only the shipped chart-issues text, shapes and the shared rule file, drafts a brief for a lesson-sourced guard leaf and for a lesson-touching non-guard leaf; the report records its output and the subagent used; the first carries the retirement criterion, the second does not.
6. `docs/guide/learn.md` describes retirement by the guard leaf, a sweep by meaning finds no line naming /learn-issues as the only way lessons leave, and every relative link in the edited skill and guide pages resolves.
