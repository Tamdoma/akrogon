# Brief: opening map, chart round-drawings, slot B

You are consultant slot B for the akrogon chart door (A is terminal t15). Map this chart's territory on your own. You will not see A's or the other consultant's map until all are done.

## Reading rule

Read process text by named section for this step: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source is allowed when the source is the subject of the work. Name sections, never line ranges.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/round-drawings/INTAKE.md: Tamdoma/akrogon#125. The operator asked for an ASCII drawing per option, placed under each question's options, and said it made UI choices much easier. Operator rule: drawings only where they make the decision much easier; every required round part stays. Reference image URL is in the intake.

## Live surface

- /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md, section "Operator questions and peer exchange" (round shape, register rules, the signposts light exception).
- /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md, section "Shared context" (rounds in printed chat text) and section "Autopilot" (A writes the full round in its pane).
- Examples of rounds with drawings, if any: grep /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels and /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel for fenced drawings in forks/ or slots/.
- Docs that describe rounds: /home/ivan/Work/infra/akrogon/docs/use/plan-work.md.

## Locks (the session's signposts, operator 2026-11-04)

/home/ivan/Work/infra/akrogon/issues/chart/round-drawings/forks/signposts.md, section "Taken": 1c written rules only (no test pins the round shape); 4a the whole family when it adds no parts (drawings for any option that differs in something visible, not only UI panels); 5a; 6a.

## Task

Write a proportional territory map: the material forks (each a question with two or three options, what each could break or invite later), the questions a practitioner would ask, and the pitfalls, each grounded in a surface you inspected. Propose the split. Keep it short: this is a small text change.

Do not edit any file except the return file. Do not plan or implement.

## Return

Write the map to /home/ivan/Work/infra/akrogon/issues/chart/round-drawings/slots/map-B.md, then run:

hc send t15 "done B: /home/ivan/Work/infra/akrogon/issues/chart/round-drawings/slots/map-B.md"
