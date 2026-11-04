# Brief: signposts angles, slot B

You are consultant slot B for the akrogon chart door (A is terminal t15). This is the session's signposts step: before the operator answers the session's general direction, each consultant adds the angles A might miss.

## Reading rule

Read process text by named section for this step: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source is allowed when the source is the subject of the work. Name sections, never line ranges.

## Input

The session's three handed charts, one GitHub report each (read each file's "Source" sections):

- /home/ivan/Work/infra/akrogon/issues/chart/round-drawings/INTAKE.md (Tamdoma/akrogon#125: drawings under round options)
- /home/ivan/Work/infra/akrogon/issues/chart/grant-run-count/INTAKE.md (Tamdoma/akrogon#126: paid runs past a grant's bound)
- /home/ivan/Work/infra/akrogon/issues/chart/proof-limits-handoff/INTAKE.md (Tamdoma/akrogon#127: handoff although a proof's limits left the criterion's property unproven)

What signposts are: /home/ivan/.claude/skills/chart-issues/assets/questions.md, the paragraph beginning "The signposts round is the one light exception", and /home/ivan/.claude/skills/chart-issues/SKILL.md section "Shared context", paragraph beginning "The signposts round sets the session's direction".

Mode: autopilot. The operator answers the signposts once; A answers every fork after, steered by them. The operator's standing values where signposts are silent: simplicity, function over form, removing over adding, systems thinking, speed and price.

## Task

Propose two to five signposts questions: general direction that changes several picks across these three charts and that evidence cannot settle (ranked priorities, hard limits, order or drop of the charts). Not technical choices that a fork round settles. For each: the question, two or three options, your recommended option with one reason, and which later picks across the charts it reshapes. Add one line on the chart order you would pick and why.

Do not edit any file except the return file. Do not chart, plan or implement.

## Return

Write your answer to /home/ivan/Work/infra/akrogon/issues/chart/round-drawings/slots/signposts-B.md, then run:

hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/round-drawings/slots/signposts-B.md"
