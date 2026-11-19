# Opening map brief, slot C

You are slot C, consultant to the akrogon chart door (slot A, terminal t126) in /home/ivan/Work/infra/akrogon. Work blind: do not read map-A.md, map-B.md, map-C.md or map-D.md under /home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/slots/ until told.

Reading rule (binds every consultant): read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text. The files each report names are the subject of the work, so reading them in full is allowed.

## Inputs

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/INTAKE.md.
- Session signposts, binding: /home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/forks/signposts.md (## Taken).
- Live surfaces at main (39e203a7): src/phase.ts (citedPaths, emptyCommitTrailerValues, requireTestChangeCitations, requireFrozenCitations) and its tests; skills/implement-issue/SKILL.md, worker-protocol.md, brief-template.md; skills/learn-issues/SKILL.md and the five identical lesson-rule.md copies under skills/*/; skills/chart-issues/assets/standing-design.md; src/ code that creates leaf or worker worktrees, if any. Framework checkout (read only): /home/ivan/Work/infra/tamdoma/framework, its learnings/LESSONS.md and the history files the reports cite, and commit 106ac8ce.
- Free local probes in a temp git repo are allowed and encouraged (for example: does a wrapped Test-Change trailer parse; is refs/stash shared across worktrees; does a worktree with its own config or GIT_DIR avoid it). Write nothing in the akrogon or framework repos.

## Task

Write a proportional territory map for one chart holding three independent issues (#141 stash in worker worktrees, #142 wrapped Test-Change trailer, #143 learn-issues exit for consumer judgment lessons). For each issue:

1. Does the report reproduce? Name the free probe you ran or the reading you did, and its result.
2. The material forks: questions whose answer changes what the leaf contains. Options, your pick and why, and what each option could break or invite later.
3. Practitioner questions a seasoned engineer would ask.
4. Pitfalls over the work's lifetime and what removes each (an option part, a door probe, a done-criterion, or an operator step).
5. How it is proven (cheapest sufficient test, signposts 6a), and whether the cited framework lesson could then retire under today's Retire rule.

Also: any dependency between the three that is real (output one consumes), not file overlap. Under 150 lines. Plain words.

## Return and report

Write to /home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/slots/map-C.md, then run:
hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/slots/map-C.md"
