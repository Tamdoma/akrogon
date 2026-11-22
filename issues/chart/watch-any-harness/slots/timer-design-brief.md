# Brief: fork notes, timer-design (slot B or C)

You are a consultant to a chart door (slot A). Write blind notes on one fork; you will not see A's or the other consultant's notes until all finish.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Permitted context

- The fork: /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/forks/timer-design.md (`## Question` and `### Carries` only).
- Intake: /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/INTAKE.md
- Locks: /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/forks/signposts.md `## Taken`
- Maps: /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/map-A.md, map-b.md, map-c.md
- Live code as you need it under /home/ivan/Work/infra/akrogon, and `hc --skill`.

## Task

Write blind notes per question (Q1-Q8) as defined in /home/ivan/.claude/skills/chart-issues/assets/questions.md § Blind peer exchange (five parts: pick with reason and cost; each rejected option with reason; evidence with tier, source and date; pitfalls with what removes each; any question the fork does not ask). Your own position, not a review. Keep it under 100 lines. Read-only: edit nothing outside your return file and start no agents or harness sessions.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/timer-design-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
