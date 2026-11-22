# Brief: fork notes, consult-loop (slot B or C)

You are a consultant to a chart door (slot A). Write your own blind notes on one fork. You will not see A's or the other peer's notes until all finish.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Context you may use

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/INTAKE.md
- Locks: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/seed-decision.md `## Taken`, /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/signposts.md `## Taken`
- Fork: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/consult-loop.md (`## Question` and `### Carries` only)
- Related open forks: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/fix-and-resume.md and /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/config-and-naming.md are not written yet; their scope is in /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/slots/map-merged.md sections 2 and 3.
- Map: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/slots/map-merged.md
- Live surface as in your map, plus `hc --skill` (Talk, wait, and collect results).

## Task

For each question Q1-Q6 write notes in the five-part shape of /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md section "Blind peer exchange" (the paragraph that defines the returned peer file's five parts). Your own position, not a review of anyone. Keep it under 80 lines. Read-only: edit nothing outside your return file and start no agents.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/slots/consult-loop-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
