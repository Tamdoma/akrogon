# Opening map, slot A

Intake: Tamdoma/akrogon#95. Inspected at 4088a91 (main = origin/main, installed release identical), 2026-10-16.

## Surfaces that encode "only a guard retires"
- skills/lesson-rule.md:8 Retire clause.
- skills/learn-issues/SKILL.md:20-22 outcomes, :28 Applied form, :38 footer counts "guarded lines".
- skills/implement-issue/SKILL.md:33 "applying a lesson lands the running mechanical guard".
- skills/check-issue/SKILL.md:61 B accepts a LESSONS.md line removal only beside a running guard, else Fix. Not listed in the report. If left, a leaf retiring by removal gets a Fix from its own reviewer.
- skills/chart-issues/assets/shapes.md:289 (and SKILL.md:75) audit: a leaf owning a lesson-traced "complete guard" needs a retirement criterion.
- Prose: learnings/LESSONS.md:5 header, docs/guide/learn.md:18, skills/AREA.md:15, README.md:222, docs/guide/cheat.md:149.
- Code: src/lessons.ts:21 keys retirement on a history diff line starting `+Applied`; src/batch.ts:150 re-removes union-resurrected lines (`.gitattributes`: LESSONS.md merge=union); src/phase.ts:548 `merged --check` refuses a pushed range still holding a retired line. No code change is needed if every retire record keeps the `Applied` prefix.

## Forks

### X1 What counts as "stopped" for removal and loud failure
- Pick: three exits, each still "on every reachable path". Removal means the mechanism no longer exists anywhere reachable, cited by the deleting commit or the replacing file:line. Loud failure means the reader or writer refuses before any side effect, at the point of use, cited by file:line. Guard unchanged.
- Rejected: "the cited file was deleted" as enough. Many lessons describe a pattern (e.g. `z.string().min(1)`, `pkill -f`, `bun -e` argv), not one file. Deleting the cited file does not remove the pattern.
- Rejected: loud failure after the harm (an error after a write or push). It reports, it does not stop.
- Evidence: better-than-training, LESSONS.md lines 11, 23, 8 (pattern lessons); operator, framework check-retirement.md Taken 3a.1 (2026-10-16).
- Pitfall: an agent retires a pattern lesson because one site was deleted. Removed by keeping "every reachable path" wording and by check-issue:61 judging the same three exits.

### X2 Record format
- Pick: keep the `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` prefix for all exits, including transfer (`Applied <date> by transfer to <file:line>: ...`).
- Rejected: a new `Transferred` or `Removed` prefix. src/lessons.ts:21 would not see it, so a leaf retirement would lose the union-merge re-removal and the `merged --check` refusal. Needs a code change for no gain.
- Pitfall: none if the prefix stays.

### X3 Judgment-lesson transfer
- Pick: learn-issues gets a fourth outcome, Transfer, only for Stays lessons. It writes the note into the one live review step file that reaches the mechanism, removes the line and appends the Applied transfer line, all in the uncommitted diff. The operator's commit of that diff is the approval. Leaves never transfer. Checkable never transfers.
- Open sub-question: cross-repo. A framework lesson whose review step is an akrogon skill (check-issue, plan-issue) cannot be edited from the framework diff. Options: (a) transfer only to a review step file in the same repo, else the lesson stays and learn-issues prints a seed line for akrogon; (b) allow editing the installed akrogon skill. (b) edits a release copy and is lost. Pick (a).
- Pitfall: a note dropped into a step that never runs for that mechanism. Removed by naming the step's file:line and requiring that the step is reached on the path where the lesson's case happened (the report's "if never reached, stays").
- Pitfall: notes pile up in review skills, the same growth problem moved elsewhere. Cost of the option, unmeasured.

### X4 learn-issues outcome naming
- Pick: rename Guarded to Stopped (removed, loud, guarded) plus Transfer, Checkable, Stays. Footer counts follow.
- Alternative: keep Guarded and widen its meaning. Cheaper diff, but the word then lies for removal.

### X5 Route and split
- One outcome (one retire rule stated consistently), docs only, no inputs, grants, live runs or outside calls. Direct-route eligible with B named. Recommend direct.
- The framework sweep of 158 lines is the framework's own follow-up, off route here.

## Surprises
- check-issue:61 is a fourth single-exit site the report missed.
- The report expects learn-issues to approve transfers via "the uncommitted learn diff", which already exists: learn-issues leaves all edits uncommitted for operator review (SKILL.md:31). No new approval mechanism needed.
