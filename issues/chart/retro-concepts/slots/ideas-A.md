# Retro ideas for learn-issues: slot A

Operator, 2026-10-05: "one more thing, make sure to see if Matt Pockock's retro ideas are good material for the skill on what needs to be done. So you can put them in without mentioning him. But only if some of those ideas are good enough to be a part of the skill, in the context of what we're actually doing inside of akrogon."

## Fit (include)
I1. Mechanical test for "checkable" (source-retro-SKILL.md:19). A lesson is checkable only when its mistake is a fixed pattern a machine can match: a banned call, a schema or import shape, a file location, a command's exit or output. Anything needing judgment (cross-file consistency, "matches the surrounding style") stays. This gives the skill a concrete test instead of agent taste. Example: LESSONS.md:17 `.min(1)` is a fixed schema shape, checkable. LESSONS.md:7 (review by reading misses defects) is judgment, stays.
I2. A guard counts only when it runs (source-retro-SKILL.md:18). Before sorting a line as already guarded, confirm the guard is wired: it is called on the relevant path (command code, an `akrogon phase` guard, or a `checks` command), not only present in the repo. A check that exists but is unwired or broken makes the line checkable, with the gap named. Akrogon evidence: learnings/history/2026-10-02-bun-preload-default-timeout.md:3-6, a configured setting that passed the suite while not applying.
I3. No-op lessons get removed (source-retro-SKILL.md:21). A line whose mechanism no longer exists (the code, command or tool it names is gone) changes no behavior. Today's chart-open prune removed such lines; the three locked outcomes have no exit for them, so moving prune into learn-issues would silently lose it. Needs operator decision: a fourth outcome "obsolete: remove the line, date the history file with the evidence it is gone".

## Does not fit
- Judgment rules to the reviewer (:28-35): check-issue deliberately does not read lessons (check-issue/SKILL.md:45) and plans carry them into the checklist the reviewer judges. Routing lessons into review rules is a different change.
- Navigation pointers, tool economy, information access, AGENTS.md size (:17, :20, :22, :23): they come from reading a session's log, not from a lesson list.
- Severity ordering (:25): with 15 lines and three or four outcomes, grouping by outcome is enough.
